import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const limit = Math.min(
    Number(req.nextUrl.searchParams.get("limit") || 100),
    500,
  );

  const transactions = await prisma.transaction.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return NextResponse.json({ success: true, transactions });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const ids = Array.isArray(body?.ids)
      ? body.ids.filter((id: unknown) => typeof id === "string")
      : [];
    const all = Boolean(body?.all);

    if (all) {
      const result = await prisma.transaction.deleteMany({});
      return NextResponse.json({ success: true, deleted: result.count });
    }

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "No transaction ids provided." },
        { status: 400 },
      );
    }

    const result = await prisma.transaction.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true, deleted: result.count });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete transactions." },
      { status: 500 },
    );
  }
}
