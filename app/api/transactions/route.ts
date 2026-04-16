import { NextRequest, NextResponse } from "next/server";

import { store } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get("agentId") ?? undefined;
  const orderId = request.nextUrl.searchParams.get("orderId") ?? undefined;

  return NextResponse.json({
    success: true,
    data: {
      transactions: store.getTransactions(agentId, orderId),
    },
  });
}
