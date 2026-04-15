import { NextRequest, NextResponse } from "next/server";

import { locusClient } from "@/lib/locus";
import { store } from "@/lib/store";
import type { Agent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SpawnAgentRequestBody = Pick<
  Agent,
  "name" | "service_type" | "description" | "price_usdc" | "budget_cap"
>;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<SpawnAgentRequestBody>;

    if (
      !body.name ||
      !body.service_type ||
      typeof body.price_usdc !== "number" ||
      typeof body.budget_cap !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required agent fields",
        },
        { status: 400 },
      );
    }

    if (!locusClient.isLive()) {
      const agent = store.createAgent({
        name: body.name,
        service_type: body.service_type,
        description: body.description ?? null,
        price_usdc: body.price_usdc,
        budget_cap: body.budget_cap,
        status: "deploying",
      });

      setTimeout(() => {
        try {
          store.updateAgent(agent.id, {
            status: "live",
          });
        } catch (error) {
          console.error("Failed to flip agent to live", error);
        }
      }, 3000);

      return NextResponse.json({
        success: true,
        agent,
      });
    }

    const agentId = crypto.randomUUID();
    const startedAt = new Date().toISOString();
    const deployment = await locusClient.build.deploy({
      name: body.name,
    });

    if (deployment.error || !deployment.deployment_id) {
      return NextResponse.json(
        {
          success: false,
          error: deployment.error ?? "Build proof unavailable",
          details: deployment.details,
        },
        {
          status: deployment.status === "unavailable" ? 409 : 502,
        },
      );
    }

    const agent = store.createAgent({
      id: agentId,
      name: body.name,
      service_type: body.service_type,
      description: body.description ?? null,
      price_usdc: body.price_usdc,
      budget_cap: body.budget_cap,
      status: deployment.status === "healthy" ? "live" : "deploying",
      storefront_url: deployment.url || `/store/${agentId}`,
      created_at: startedAt,
      updated_at: startedAt,
    });

    store.saveDeploymentProof({
      agentId: agent.id,
      deploymentId: deployment.deployment_id,
      provider: "build_with_locus",
      status: deployment.status,
      startedAt,
      updatedAt: startedAt,
      liveUrl: deployment.url || null,
      real_locus_call: true,
    });

    return NextResponse.json({
      success: true,
      agent,
      deployment: {
        deploymentId: deployment.deployment_id,
        status: deployment.status,
        liveUrl: deployment.url || undefined,
        startedAt,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to spawn agent";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
