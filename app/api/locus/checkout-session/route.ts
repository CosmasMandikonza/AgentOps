import { NextResponse } from "next/server";

import { locusClient } from "@/lib/locus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    if (!locusClient.isLive()) {
      return NextResponse.json(
        {
          success: false,
          error: "Live mode is not enabled",
        },
        { status: 409 },
      );
    }

    const amount = "1.00";
    const description = "AgentOps live test";

    const session = await locusClient.checkout.createSession({
      amount,
      currency: "USDC",
      description,
    });

    if (session.error || !session.session_id || !session.checkout_url) {
      return NextResponse.json(
        {
          success: false,
          error: session.error ?? "Unable to create live checkout session",
          details: {
            amount,
            description,
            mode: session.mode,
          },
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.session_id,
        checkoutUrl: session.checkout_url,
        createdAt: new Date().toISOString(),
        status: session.status ?? "created",
        amount: session.amount ?? amount,
        currency: session.currency ?? "USDC",
        expiresAt: session.expires_at,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create live checkout session";

    return NextResponse.json(
      {
        success: false,
        error: message,
        details: {
          amount: "1.00",
          description: "AgentOps live test",
        },
      },
      { status: 500 },
    );
  }
}
