import { NextRequest, NextResponse } from "next/server";
import { processVerifiedPaystackCharge } from "@/lib/paystack-processing";

const PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify";

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

    const { reference } = await req.json();
    if (!reference || typeof reference !== "string") {
      return NextResponse.json(
        { success: false, message: "Payment reference is required." },
        { status: 400 },
      );
    }

    const paystackRes = await fetch(
      `${PAYSTACK_VERIFY_URL}/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      },
    );

    const data = await paystackRes.json();
    if (!paystackRes.ok || !data?.status || data?.data?.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Payment verification failed.",
        },
        { status: 400 },
      );
    }

    const result = await processVerifiedPaystackCharge(data.data);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      order_id: result.orderId,
      reference: result.reference,
      status: result.status,
      providerReference: result.providerReference,
      message: result.message,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Payment verification failed." },
      { status: 500 },
    );
  }
}
