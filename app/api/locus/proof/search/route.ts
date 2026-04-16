import { NextResponse } from "next/server";

import { locusClient } from "@/lib/locus";
import { runLiveFulfillmentProof } from "@/lib/locus-proof";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    if (!locusClient.isLive()) {
      return NextResponse.json(
        {
          success: false,
          error: "Locus Control is in DEMO mode. Switch to LIVE to run this proof.",
        },
        { status: 409 },
      );
    }

    const result = await runLiveFulfillmentProof("search");

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          details: {
            mode: locusClient.getMode(),
            provider: "exa",
          },
        },
        { status: 502 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to run live search proof";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
