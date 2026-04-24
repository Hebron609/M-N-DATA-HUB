import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

function toSSE(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function snapshot() {
  const transactions = await prisma.transaction.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  const totalRevenue = transactions
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0);

  const statusCounts = transactions.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  return {
    transactions,
    summary: {
      totalRevenue,
      totalOrders: transactions.length,
      statusCounts,
    },
  };
}

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return new Response(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(toSSE("ready", { ok: true }));

      let lastPayload = "";
      while (!req.signal.aborted) {
        const data = await snapshot();
        const serialized = JSON.stringify(data);

        if (serialized !== lastPayload) {
          controller.enqueue(toSSE("transactions", data));
          lastPayload = serialized;
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      controller.close();
    },
    cancel() {
      // Stream closes automatically when the browser disconnects.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
