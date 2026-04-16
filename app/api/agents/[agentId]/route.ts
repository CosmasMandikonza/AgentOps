import { NextResponse } from "next/server";

import { store } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  const agent = store.getAgent(agentId);

  if (!agent) {
    return NextResponse.json(
      {
        success: false,
        error: "Agent not found",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      agent,
      deploymentProof: store.getDeploymentProof(agentId),
    },
  });
}
