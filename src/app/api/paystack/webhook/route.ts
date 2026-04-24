import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { processVerifiedPaystackCharge } from "@/lib/paystack-processing";

function getPaystackSecret() {
  return (
    process.env.PAYSTACK_LIVE_SECRET_KEY ||
    process.env.PAYSTACK_SECRET_KEY ||
    process.env.PAYSTACK_TEST_SECRET_KEY
  );
}

function verifySignature(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");

  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature || "", "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const secret = getPaystackSecret();
  if (!secret) {
    return NextResponse.json(
      { success: false, message: "Paystack secret key is not configured." },
      { status: 500 },
    );
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json(
      { success: false, message: "Invalid webhook signature." },
      { status: 401 },
    );
  }

  try {
    const payload = JSON.parse(rawBody);
    if (payload?.event !== "charge.success" || !payload?.data) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const result = await processVerifiedPaystackCharge(payload.data);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      reference: result.reference,
      order_id: result.orderId,
      status: result.status,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Webhook processing failed." },
      { status: 500 },
    );
  }
}
