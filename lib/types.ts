export type AgentStatus =
  | "deploying"
  | "live"
  | "processing"
  | "error"
  | "paused";

export type OrderStatus =
  | "pending"
  | "paid"
  | "fulfilling"
  | "escalated"
  | "completed"
  | "failed";

export type TransactionType =
  | "CHECKOUT_RECEIVED"
  | "API_CALL"
  | "TASK_ESCALATED"
  | "CARD_PURCHASE"
  | "TRANSFER_OUT";

export type JsonObject = Record<string, unknown>;

export interface Agent {
  id: string;
  name: string;
  service_type: string;
  description: string | null;
  price_usdc: number;
  budget_cap: number;
  status: AgentStatus;
  storefront_url: string | null;
  total_revenue: number;
  total_costs: number;
  orders_completed: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  agent_id: string;
  customer_email: string | null;
  status: OrderStatus;
  revenue: number;
  total_costs: number;
  net_profit: number;
  input_data: JsonObject;
  deliverable_url: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Transaction {
  id: string;
  order_id: string;
  agent_id: string;
  type: TransactionType;
  description: string | null;
  amount: number;
  provider: string | null;
  locus_tx_id: string | null;
  metadata: JsonObject;
  created_at: string;
}

export interface FleetStats {
  total_agents: number;
  total_revenue: number;
  total_costs: number;
  total_profit: number;
  total_orders: number;
}

export interface DeploymentProof {
  agentId: string;
  deploymentId: string;
  provider: "build_with_locus";
  status: string;
  startedAt: string;
  updatedAt: string;
  liveUrl: string | null;
  real_locus_call: true;
}
