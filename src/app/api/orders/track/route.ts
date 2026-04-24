import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, message: "Order ID is required." }, { status: 400 });
  }

  try {
    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [
          { id },
          { reference: id },
        ],
      },
      include: { product: true },
    });

    if (!transaction) {
      return NextResponse.json({ success: false, message: "Order not found. Please check your Order ID." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: transaction.id,
        productName: transaction.product.name,
        network: transaction.product.name,
        size: "—",
        amount: transaction.amount,
        phone: transaction.recipientNumber,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
    });
  } catch (err) {
    console.error("Track order error:", err);
    return NextResponse.json({ success: false, message: "Server error. Please try again." }, { status: 500 });
  }
}
