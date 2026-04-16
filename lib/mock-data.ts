import type { Agent, Order, Transaction } from "@/lib/types";

const now = new Date();

function minutesAgo(minutes: number) {
  return new Date(now.getTime() - minutes * 60 * 1000).toISOString();
}

export const mockAgents: Agent[] = [
  {
    id: "agent_landing_page_audit",
    name: "Landing Page Audit",
    service_type: "landing_page_audit",
    description:
      "Conversion-focused landing page teardown with competitor benchmarks and a clear action plan.",
    price_usdc: 15,
    budget_cap: 6,
    status: "live",
    storefront_url: "/store/agent_landing_page_audit",
    total_revenue: 45,
    total_costs: 3.2,
    orders_completed: 3,
    created_at: minutesAgo(240),
    updated_at: minutesAgo(4),
  },
  {
    id: "agent_competitor_intel",
    name: "Competitor Intel Report",
    service_type: "competitor_intel",
    description:
      "Fast competitor intelligence with positioning, pricing, and whitespace analysis.",
    price_usdc: 20,
    budget_cap: 8,
    status: "deploying",
    storefront_url: "/store/agent_competitor_intel",
    total_revenue: 20,
    total_costs: 1.15,
    orders_completed: 1,
    created_at: minutesAgo(180),
    updated_at: minutesAgo(12),
  },
];

export const mockOrders: Order[] = [
  {
    id: "order_demo_1",
    agent_id: "agent_landing_page_audit",
    customer_email: "team@example.com",
    status: "completed",
    revenue: 15,
    total_costs: 1.07,
    net_profit: 13.93,
    input_data: {
      url: "https://example.com",
    },
    deliverable_url: null,
    created_at: minutesAgo(90),
    completed_at: minutesAgo(82),
  },
  {
    id: "order_demo_2",
    agent_id: "agent_competitor_intel",
    customer_email: "ops@example.com",
    status: "paid",
    revenue: 20,
    total_costs: 0,
    net_profit: 20,
    input_data: {
      url: "https://example.org",
    },
    deliverable_url: null,
    created_at: minutesAgo(22),
    completed_at: null,
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: "tx_demo_1",
    order_id: "order_demo_1",
    agent_id: "agent_landing_page_audit",
    type: "CHECKOUT_RECEIVED",
    description: "Customer payment received",
    amount: 15,
    provider: "locus_checkout",
    locus_tx_id: "demo_checkout_1",
    metadata: {
      real_locus_call: false,
    },
    created_at: minutesAgo(89),
  },
  {
    id: "tx_demo_2",
    order_id: "order_demo_1",
    agent_id: "agent_landing_page_audit",
    type: "API_CALL",
    description: "Competitor SERP scan",
    amount: -0.12,
    provider: "exa",
    locus_tx_id: "demo_search_1",
    metadata: {
      real_locus_call: false,
    },
    created_at: minutesAgo(88),
  },
  {
    id: "tx_demo_3",
    order_id: "order_demo_1",
    agent_id: "agent_landing_page_audit",
    type: "API_CALL",
    description: "Screenshot capture",
    amount: -0.15,
    provider: "firecrawl",
    locus_tx_id: "demo_screenshot_1",
    metadata: {
      real_locus_call: false,
    },
    created_at: minutesAgo(87),
  },
  {
    id: "tx_demo_4",
    order_id: "order_demo_2",
    agent_id: "agent_competitor_intel",
    type: "CHECKOUT_RECEIVED",
    description: "Customer payment received",
    amount: 20,
    provider: "locus_checkout",
    locus_tx_id: "demo_checkout_2",
    metadata: {
      real_locus_call: false,
    },
    created_at: minutesAgo(21),
  },
];
