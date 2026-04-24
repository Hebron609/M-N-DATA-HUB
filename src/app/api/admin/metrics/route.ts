import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const [transactions, deposits] = await Promise.all([
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: true, user: true },
      take: 2000,
    }),
    prisma.deposit.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
    }),
  ]);

  const completed = transactions.filter((t) => t.status === "COMPLETED");
  const totalRevenue = completed.reduce((sum, t) => sum + t.amount, 0);
  const estimatedProfit = completed.reduce((sum, t) => sum + t.amount * 0.1, 0);
  const totalOrders = transactions.length;

  const activeUsers = new Set(
    transactions
      .filter(
        (t) => Date.now() - t.createdAt.getTime() <= 30 * 24 * 60 * 60 * 1000,
      )
      .map((t) => t.userId),
  ).size;

  const totalDeposits = deposits
    .filter((d) => d.status === "COMPLETED")
    .reduce((sum, d) => sum + d.amount, 0);

  const today = new Date();
  const daily = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    const label = date.toLocaleDateString("en-US", { weekday: "short" });

    const dayCompleted = completed.filter((t) => sameDay(t.createdAt, date));
    return {
      day: label,
      revenue: dayCompleted.reduce((sum, t) => sum + t.amount, 0),
      orders: dayCompleted.length,
      profit: dayCompleted.reduce((sum, t) => sum + t.amount * 0.1, 0),
    };
  });

  const networkCounts = completed.reduce<Record<string, number>>((acc, t) => {
    const network = t.product?.category || "Unknown";
    acc[network] = (acc[network] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    success: true,
    metrics: {
      totalRevenue,
      totalOrders,
      activeUsers,
      totalDeposits,
      estimatedProfit,
      networkCounts,
      daily,
    },
  });
}
