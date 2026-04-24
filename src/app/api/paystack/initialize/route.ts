import { NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/lib/products-data";

const PAYSTACK_BASE_URL = "https://api.paystack.co/transaction/initialize";
const PAYSTACK_FEE_RATE = 0.0195;

function parseCurrency(value: string) {
  const parsed = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function getChargeBreakdown(baseAmount: number) {
  const basePesewas = Math.round(baseAmount * 100);
  const grossPesewas = Math.ceil(basePesewas / (1 - PAYSTACK_FEE_RATE));
  const feePesewas = Math.max(0, grossPesewas - basePesewas);

  return {
    feeGhs: feePesewas / 100,
    grossGhs: grossPesewas / 100,
    grossPesewas,
  };
}

function getPaystackSecret() {
  return (
    process.env.PAYSTACK_LIVE_SECRET_KEY ||
    process.env.PAYSTACK_SECRET_KEY ||
    process.env.PAYSTACK_TEST_SECRET_KEY
  );
}

export async function POST(req: NextRequest) {
  try {
    const secret = getPaystackSecret();
    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Paystack secret key is not configured." },
        { status: 500 },
      );
    }

    const body = await req.json();
    const email = String(body?.email || "")
      .trim()
      .toLowerCase();
    const customerName = String(body?.customer_name || body?.name || "").trim();
    const productId = String(body?.productId || "").trim();
    const size = String(body?.size || "").trim();
    const phoneNumber = String(body?.phone_number || body?.phone || "")
      .trim()
      .replace(/\s+/g, "");
    const notes = String(body?.notes || "").trim();
    const callbackUrl = body?.callback_url
      ? String(body.callback_url)
      : undefined;
    const product = productId ? getProduct(productId) : null;
    const priceText = size && product ? product.prices[size] : null;
    const baseAmount = priceText ? parseCurrency(priceText) : null;
    const metadata = {
      productId,
      productName: product?.name || "",
      size,
      network: product?.network || "",
      customer_name: customerName,
      customer_email: email,
      phone_number: phoneNumber,
      notes,
    };

    if (
      !email ||
      !email.includes("@") ||
      !product ||
      !size ||
      !phoneNumber ||
      !baseAmount ||
      baseAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid checkout selection or customer details.",
        },
        { status: 400 },
      );
    }

    if (!product.sizes.includes(size)) {
      return NextResponse.json(
        { success: false, message: "Selected package size is invalid." },
        { status: 400 },
      );
    }

    const breakdown = getChargeBreakdown(baseAmount);

    const paystackRes = await fetch(PAYSTACK_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(breakdown.grossPesewas),
        currency: "GHS",
        channels: ["mobile_money", "card", "bank_transfer", "ussd"],
        ...(callbackUrl ? { callback_url: callbackUrl } : {}),
        metadata,
      }),
    });

    const data = await paystackRes.json();

    if (!paystackRes.ok || !data?.status) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Failed to initialize payment.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      reference: data.data.reference,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      quote: {
        baseAmount,
        feeAmount: breakdown.feeGhs,
        totalAmount: breakdown.grossGhs,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Payment initialization failed." },
      { status: 500 },
    );
  }
}
