import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const deposits = await prisma.deposit.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    take: 500,
  });

  return NextResponse.json({ success: true, deposits });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const amount = Number(body?.amount || 0);
    const method = String(body?.method || "Momo").trim();
    const reference = body?.reference ? String(body.reference).trim() : null;
    const createdAt = body?.createdAt ? new Date(body.createdAt) : undefined;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid amount is required." },
        { status: 400 },
      );
    }

    const email = session.user?.email?.toLowerCase();
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Session email is required." },
        { status: 400 },
      );
    }

    const adminUser = await prisma.user.findUnique({ where: { email } });
    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Admin user record not found." },
        { status: 404 },
      );
    }

    const deposit = await prisma.deposit.create({
      data: {
        userId: adminUser.id,
        amount,
        method: method || "Momo",
        status: "COMPLETED",
        reference: reference || `DEP-${Date.now()}`,
        ...(createdAt ? { createdAt } : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, deposit });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create deposit." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const id = String(body?.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Deposit id is required." },
        { status: 400 },
      );
    }

    await prisma.deposit.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete deposit." },
      { status: 500 },
    );
  }
}
