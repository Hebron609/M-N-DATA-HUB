import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

async function ensureUser(email: string, name?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const password = await bcrypt.hash(`manual-${email}-${Date.now()}`, 10);
  return prisma.user.create({
    data: {
      email,
      name: name || "Manual Customer",
      password,
      role: "USER",
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const productId = String(body?.productId || "").trim();
    const recipientNumber = String(body?.recipientNumber || "").trim();
    const amount = Number(body?.amount || 0);
    const customerEmail = String(body?.customerEmail || "")
      .trim()
      .toLowerCase();
    const customerName = String(body?.customerName || "").trim();
    const reference = String(body?.reference || `MANUAL-${Date.now()}`).trim();

    if (
      !productId ||
      !recipientNumber ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !customerEmail
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Selected product not found." },
        { status: 404 },
      );
    }

    const existing = await prisma.transaction.findUnique({
      where: { reference },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Reference already exists." },
        { status: 409 },
      );
    }

    const user = await ensureUser(customerEmail, customerName);

    const tx = await prisma.transaction.create({
      data: {
        userId: user.id,
        productId,
        amount,
        recipientNumber,
        status: "COMPLETED",
        reference,
      },
      include: {
        product: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, transaction: tx });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to add manual transaction." },
      { status: 500 },
    );
  }
}
