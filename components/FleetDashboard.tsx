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
          <article
            key={agent.id}
            className="border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-mono text-sm uppercase tracking-[0.18em] text-[var(--text)]">
                  {agent.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {agent.description ?? "Autonomous service agent"}
                </p>
              </div>
              <span className="border border-[var(--border)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
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
          </article>
        ))}
      </div>
    </section>
  );
}
