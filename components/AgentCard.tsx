import Link from "next/link";

import type { Agent } from "@/lib/types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getStatusTone(status: Agent["status"]) {
  switch (status) {
    case "live":
      return "border-[var(--accent)] text-[var(--accent)] bg-[rgba(0,255,136,0.08)]";
    case "deploying":
      return "border-[var(--warning)] text-[var(--warning)] bg-[rgba(255,184,0,0.08)]";
    case "processing":
      return "border-[var(--warning)] text-[var(--warning)] bg-[rgba(255,184,0,0.08)]";
    case "error":
      return "border-[var(--danger)] text-[var(--danger)] bg-[rgba(255,51,102,0.08)]";
    default:
      return "border-[var(--border)] text-[var(--muted)] bg-[var(--bg)]";
  }
}

type AgentCardProps = {
  agent: Agent;
};

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Link
      href={`/dashboard/${agent.id}`}
      className="group block border border-[var(--border)] bg-[rgba(20,20,20,0.86)] p-4 backdrop-blur-md transition-colors duration-150 hover:border-[var(--accent)] hover:bg-[rgba(20,20,20,0.92)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate font-mono text-sm uppercase tracking-[0.18em] text-[var(--text)]">
            {agent.name}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
            {agent.description ?? "Autonomous service agent"}
          </p>
        </div>
        <span
          className={`shrink-0 border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${getStatusTone(agent.status)}`}
        >
          {agent.status}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Price
          </p>
          <p className="mt-1 font-mono text-sm text-[var(--text)]">
            {formatCurrency(agent.price_usdc)}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Revenue
          </p>
          <p className="mt-1 font-mono text-sm text-[var(--accent)]">
            {formatCurrency(agent.total_revenue)}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Orders
          </p>
          <p className="mt-1 font-mono text-sm text-[var(--text)]">
            {agent.orders_completed}
          </p>
        </div>
      </div>
    </Link>
  );
}
