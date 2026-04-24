import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { fulfillDataOrder } from "@/lib/data-fulfillment";

type TransactionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

const TransactionStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

type PaystackCustomer = {
  email?: string;
};

type PaystackData = {
  reference: string;
  amount: number;
  status: string;
  metadata?: Record<string, unknown>;
  customer?: PaystackCustomer;
};

type CheckoutMetadata = {
  customer_email?: string;
  productId?: string;
  size?: string;
  phone_number?: string;
  customer_name?: string;
};

export type ProcessPaymentResult = {
  success: boolean;
  orderId?: string;
  reference: string;
  status?: string;
  providerReference?: string;
  message: string;
};

async function ensureCheckoutUser(email: string, name?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const password = await bcrypt.hash(`guest-${email}-${Date.now()}`, 10);
  return prisma.user.create({
    data: {
      email,
      name: name || "Guest User",
      password,
      role: "USER",
    },
  });
}

export async function processVerifiedPaystackCharge(
  paystack: PaystackData,
): Promise<ProcessPaymentResult> {
  const metadata = (paystack?.metadata || {}) as CheckoutMetadata;
  const reference = String(paystack.reference || "").trim();
  const email = String(
    metadata.customer_email || paystack?.customer?.email || "",
  )
    .trim()
    .toLowerCase();
  const productId = String(metadata.productId || "").trim();
  const size = String(metadata.size || "").trim();
  const recipientNumber = String(metadata.phone_number || "").trim();

  if (!reference || !email || !productId || !size || !recipientNumber) {
    return {
      success: false,
      reference,
      message:
        "Missing required metadata (reference, customer_email, productId, size, phone_number).",
    };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return {
      success: false,
      reference,
      message: "Purchased product was not found.",
    };
  }

  const user = await ensureCheckoutUser(
    email,
    String(metadata.customer_name || ""),
  );
  const amount = Number(paystack.amount || 0) / 100;

  let transaction = await prisma.transaction.findUnique({
    where: { reference },
  });

  // Retry-safe idempotency: if already fulfilled, return cached success.
  if (transaction?.status === TransactionStatus.COMPLETED) {
    return {
      success: true,
      orderId: transaction.id,
      reference,
      status: transaction.status,
      message: "Transaction already processed.",
    };
  }

  if (!transaction) {
    transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        productId: product.id,
        amount,
        recipientNumber,
        status: TransactionStatus.PROCESSING,
        reference,
      },
    });
  }

  // If another worker is already processing this very recently, avoid duplicate provision calls.
  const secondsSinceUpdate =
    (Date.now() - new Date(transaction.updatedAt).getTime()) / 1000;
  if (
    transaction.status === TransactionStatus.PROCESSING &&
    secondsSinceUpdate < 30
  ) {
    return {
      success: true,
      orderId: transaction.id,
      reference,
      status: transaction.status,
      message: "Transaction is currently processing.",
    };
  }

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: TransactionStatus.PROCESSING },
  });

  const fulfillment = await fulfillDataOrder({
    productId: product.id,
    amount,
    recipientNumber,
    reference,
  });

  const finalStatus = fulfillment.success
    ? TransactionStatus.COMPLETED
    : TransactionStatus.FAILED;

  const updated = await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: finalStatus },
  });

  return {
    success: true,
    orderId: updated.id,
    reference,
    status: updated.status,
    providerReference: fulfillment.providerReference,
    message: fulfillment.message,
  };
}
