import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { transactionId } = await req.json();
    if (!transactionId || typeof transactionId !== "string") {
      return NextResponse.json(
        { success: false, message: "Transaction ID is required." },
        { status: 400 },
      );
    }

    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!tx) {
      return NextResponse.json(
        { success: false, message: "Transaction not found." },
        { status: 404 },
      );
    }

    if (tx.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        transaction: tx,
      });
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json({ success: true, transaction: updated });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to resolve transaction." },
      { status: 500 },
    );
  }
}
