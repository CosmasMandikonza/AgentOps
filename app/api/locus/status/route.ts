import { NextRequest, NextResponse } from "next/server";

import {
  getLocusControlSnapshot,
  setConfiguredLocusMode,
  type LocusControlMode,
} from "@/lib/locus-control";
import { locusClient } from "@/lib/locus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function buildStatusResponse() {
  const status = await locusClient.testConnection();
  const control = getLocusControlSnapshot();
  const baseResponse = {
    mode: status.mode,
    network: "base" as const,
    lastUpdatedAt: new Date().toISOString(),
    modeUpdatedAt: control.updatedAt,
  } as const;

  if (status.mode === "mock") {
    return {
      success: true as const,
      data: {
        ...baseResponse,
        connected: false,
        walletAddress: status.wallet_address,
      },
    };
  }

  if (status.connected) {
    return {
      success: true as const,
      data: {
        ...baseResponse,
        connected: true,
        balance: status.balance,
        walletAddress: status.wallet_address,
      },
    };
  }

  return {
    success: false as const,
    error: status.error ?? "Unable to load live Locus status",
    data: {
      ...baseResponse,
      connected: false,
      walletAddress: status.wallet_address,
    },
  };
}

export async function GET() {
  return NextResponse.json(await buildStatusResponse());
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      mode?: LocusControlMode;
    };

    if (body.mode !== "live" && body.mode !== "mock") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid mode",
        },
        { status: 400 },
      );
    }

    setConfiguredLocusMode(body.mode);

    return NextResponse.json(await buildStatusResponse());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update Locus mode";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
