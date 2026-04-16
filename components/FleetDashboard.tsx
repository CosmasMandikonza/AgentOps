import { AgentCard } from "@/components/AgentCard";
import type { Agent, FleetStats } from "@/lib/types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

type FleetDashboardProps = {
  agents: Agent[];
  stats: FleetStats;
};

export function FleetDashboard({ agents, stats }: FleetDashboardProps) {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Agents
          </p>
          <p className="mt-3 font-mono text-2xl text-[var(--text)]">
            {stats.total_agents}
          </p>
        </div>
        <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Revenue
          </p>
          <p className="mt-3 font-mono text-2xl text-[var(--accent)]">
            {formatCurrency(stats.total_revenue)}
          </p>
        </div>
        <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Costs
          </p>
          <p className="mt-3 font-mono text-2xl text-[var(--danger)]">
            {formatCurrency(stats.total_costs)}
          </p>
        </div>
        <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Profit
          </p>
          <p className="mt-3 font-mono text-2xl text-[var(--text)]">
            {formatCurrency(stats.total_profit)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </section>
  );
}
