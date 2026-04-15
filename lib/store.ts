import { mockAgents, mockOrders, mockTransactions } from "@/lib/mock-data";
import type {
  Agent,
  DeploymentProof,
  FleetStats,
  Order,
  Transaction,
} from "@/lib/types";

type StoreState = {
  agents: Map<string, Agent>;
  orders: Map<string, Order>;
  transactions: Map<string, Transaction>;
  deploymentProofs: Map<string, DeploymentProof>;
};

type GlobalStore = typeof globalThis & {
  __agentOpsStore?: StoreState;
};

function clone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function createInitialState(): StoreState {
  return {
    agents: new Map(mockAgents.map((agent) => [agent.id, clone(agent)])),
    orders: new Map(mockOrders.map((order) => [order.id, clone(order)])),
    transactions: new Map(
      mockTransactions.map((transaction) => [transaction.id, clone(transaction)]),
    ),
    deploymentProofs: new Map(),
  };
}

function getState(): StoreState {
  const globalStore = globalThis as GlobalStore;

  if (!globalStore.__agentOpsStore) {
    globalStore.__agentOpsStore = createInitialState();
  }

  return globalStore.__agentOpsStore;
}

function compareDescendingByDate(left: string, right: string) {
  return new Date(right).getTime() - new Date(left).getTime();
}

function compareAscendingByDate(left: string, right: string) {
  return new Date(left).getTime() - new Date(right).getTime();
}

function createAgentId() {
  return crypto.randomUUID();
}

function createOrderId() {
  return crypto.randomUUID();
}

function createTransactionId() {
  return crypto.randomUUID();
}

function buildStorefrontUrl(id: string) {
  return `/store/${id}`;
}

export const store = {
  getAgents(): Agent[] {
    return Array.from(getState().agents.values())
      .sort((left, right) =>
        compareDescendingByDate(left.created_at, right.created_at),
      )
      .map((agent) => clone(agent));
  },

  getAgent(id: string): Agent | null {
    const agent = getState().agents.get(id);
    return agent ? clone(agent) : null;
  },

  createAgent(data: Partial<Agent>): Agent {
    const now = new Date().toISOString();
    const id = data.id ?? createAgentId();
    const nextAgent: Agent = {
      id,
      name: data.name ?? "Untitled Agent",
      service_type: data.service_type ?? "custom_service",
      description: data.description ?? null,
      price_usdc: data.price_usdc ?? 0,
      budget_cap: data.budget_cap ?? 0,
      status: data.status ?? "deploying",
      storefront_url: data.storefront_url ?? buildStorefrontUrl(id),
      total_revenue: data.total_revenue ?? 0,
      total_costs: data.total_costs ?? 0,
      orders_completed: data.orders_completed ?? 0,
      created_at: data.created_at ?? now,
      updated_at: data.updated_at ?? now,
    };

    getState().agents.set(nextAgent.id, clone(nextAgent));

    return clone(nextAgent);
  },

  updateAgent(id: string, updates: Partial<Agent>): Agent {
    const currentAgent = getState().agents.get(id);

    if (!currentAgent) {
      throw new Error(`Agent ${id} not found`);
    }

    const nextAgent: Agent = {
      ...currentAgent,
      ...updates,
      id: currentAgent.id,
      updated_at: updates.updated_at ?? new Date().toISOString(),
    };

    getState().agents.set(id, clone(nextAgent));

    return clone(nextAgent);
  },

  getOrders(agentId?: string): Order[] {
    return Array.from(getState().orders.values())
      .filter((order) => !agentId || order.agent_id === agentId)
      .sort((left, right) =>
        compareDescendingByDate(left.created_at, right.created_at),
      )
      .map((order) => clone(order));
  },

  getOrder(id: string): Order | null {
    const order = getState().orders.get(id);
    return order ? clone(order) : null;
  },

  createOrder(data: Partial<Order>): Order {
    const now = new Date().toISOString();
    const nextOrder: Order = {
      id: data.id ?? createOrderId(),
      agent_id: data.agent_id ?? "",
      customer_email: data.customer_email ?? null,
      status: data.status ?? "pending",
      revenue: data.revenue ?? 0,
      total_costs: data.total_costs ?? 0,
      net_profit: data.net_profit ?? 0,
      input_data: data.input_data ?? {},
      deliverable_url: data.deliverable_url ?? null,
      created_at: data.created_at ?? now,
      completed_at: data.completed_at ?? null,
    };

    getState().orders.set(nextOrder.id, clone(nextOrder));

    return clone(nextOrder);
  },

  updateOrder(id: string, updates: Partial<Order>): Order {
    const currentOrder = getState().orders.get(id);

    if (!currentOrder) {
      throw new Error(`Order ${id} not found`);
    }

    const nextOrder: Order = {
      ...currentOrder,
      ...updates,
      id: currentOrder.id,
    };

    getState().orders.set(id, clone(nextOrder));

    return clone(nextOrder);
  },

  getTransactions(agentId?: string, orderId?: string): Transaction[] {
    return Array.from(getState().transactions.values())
      .filter((transaction) => {
        if (agentId && transaction.agent_id !== agentId) {
          return false;
        }

        if (orderId && transaction.order_id !== orderId) {
          return false;
        }

        return true;
      })
      .sort((left, right) =>
        compareAscendingByDate(left.created_at, right.created_at),
      )
      .map((transaction) => clone(transaction));
  },

  createTransaction(data: Partial<Transaction>): Transaction {
    const nextTransaction: Transaction = {
      id: data.id ?? createTransactionId(),
      order_id: data.order_id ?? "",
      agent_id: data.agent_id ?? "",
      type: data.type ?? "API_CALL",
      description: data.description ?? null,
      amount: data.amount ?? 0,
      provider: data.provider ?? null,
      locus_tx_id: data.locus_tx_id ?? null,
      metadata: data.metadata ?? {},
      created_at: data.created_at ?? new Date().toISOString(),
    };

    getState().transactions.set(nextTransaction.id, clone(nextTransaction));

    return clone(nextTransaction);
  },

  getFleetStats(): FleetStats {
    const agents = Array.from(getState().agents.values());
    const orders = Array.from(getState().orders.values());
    const totalRevenue = agents.reduce(
      (sum, agent) => sum + agent.total_revenue,
      0,
    );
    const totalCosts = agents.reduce((sum, agent) => sum + agent.total_costs, 0);

    return {
      total_agents: agents.length,
      total_revenue: totalRevenue,
      total_costs: totalCosts,
      total_profit: totalRevenue - totalCosts,
      total_orders: orders.length,
    };
  },

  getDeploymentProof(agentId: string): DeploymentProof | null {
    const proof = getState().deploymentProofs.get(agentId);
    return proof ? clone(proof) : null;
  },

  saveDeploymentProof(proof: DeploymentProof): DeploymentProof {
    getState().deploymentProofs.set(proof.agentId, clone(proof));
    return clone(proof);
  },

  reset() {
    const globalStore = globalThis as GlobalStore;
    globalStore.__agentOpsStore = createInitialState();
  },
};
