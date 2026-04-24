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

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      description: true,
      inStock: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, products });
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
    const name = String(body?.name || "").trim();
    const category = String(body?.category || "DATA").trim();
    const description = String(body?.description || "").trim();
    const price = Number(body?.price || 0);
    const inStock = body?.inStock !== false;

    if (!name || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and valid price are required.",
        },
        { status: 400 },
      );
    }

    const exists = await prisma.product.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, message: "Product already exists." },
        { status: 409 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        category: category || "DATA",
        description: description || null,
        price,
        inStock,
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        price: true,
        inStock: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create product." },
      { status: 500 },
    );
  }
}
