import "server-only";

import { getConfiguredLocusMode } from "@/lib/locus-control";

type SupportedCurrency = "USDC";
type WrappedApiProvider = "search" | "crawl" | "screenshot" | "claude" | "maps";
type TaskType = "written_content" | "graphic_design";
type TaskTurnaround = "1_day" | "3_day" | "7_day";
type LocusMode = "live" | "mock";

interface LocusClientOptions {
  apiKey?: string;
  baseUrl?: string;
  mockMode?: boolean;
}

interface LocusResultMeta {
  error?: string;
  mode: LocusMode;
}

interface WalletBalanceResponse extends LocusResultMeta {
  balance: number;
  currency: string;
  wallet_address: string;
}

interface CheckoutCreateSessionParams {
  amount?: number | string;
  currency: SupportedCurrency;
  description: string;
  successUrl?: string;
  cancelUrl?: string;
  webhookUrl?: string;
  success_url?: string;
  cancel_url?: string;
  webhook_url?: string;
  metadata?: Record<string, unknown>;
}

interface CheckoutCreateSessionResponse extends LocusResultMeta {
  checkout_url: string;
  session_id: string;
  amount?: string;
  currency?: string;
  status?: string;
  expires_at?: string;
}

interface CheckoutSessionResponse extends LocusResultMeta {
  session_id: string;
  status: string;
  checkout_url?: string;
  payment_tx_hash?: string;
  payer_address?: string;
  paid_at?: string;
  expires_at?: string;
}

interface WrappedResult<T = unknown> extends LocusResultMeta {
  data: T | null;
  endpoint: string;
  response_preview: string;
  http_status?: number;
  cost?: number;
}

interface WrappedExaSearchParams {
  query: string;
  numResults?: number;
}

interface WrappedScreenshotParams {
  url: string;
  format?: string;
}

interface WrappedApiCallParams {
  provider: WrappedApiProvider;
  endpoint: string;
  params: Record<string, unknown>;
}

interface WrappedApiCallResponse<T = unknown> extends LocusResultMeta {
  data: T;
  cost: number;
  status?: string;
  approval_url?: string;
  pending_approval_id?: string;
  http_status?: number;
}

interface CreateTaskParams {
  type: TaskType;
  description: string;
  attachments: string[];
  turnaround: TaskTurnaround;
}

interface CreateTaskResponse extends LocusResultMeta {
  task_id: string;
  status: string;
  estimated_cost: number;
}

interface CreateCardAccountResponse extends LocusResultMeta {
  account_id: string;
}

interface CreateCardParams {
  amount: number;
  purpose: string;
}

interface CreateCardResponse extends LocusResultMeta {
  card_id: string;
  last_four: string;
  balance: number;
}

interface BuildDeployParams {
  name: string;
  repo?: string;
  branch?: string;
  region?: string;
  env_vars?: Record<string, string>;
}

interface BuildDeployResponse extends LocusResultMeta {
  deployment_id: string;
  url: string;
  status: string;
  details?: Record<string, unknown>;
}

interface TestConnectionResponse extends LocusResultMeta {
  connected: boolean;
  balance: number;
  network: "base";
  wallet_address?: string;
}

interface LocusEnvelope<T> {
  success?: boolean;
  data?: T;
  result?: T;
  error?: string;
  message?: string;
}

interface LocusHttpResponse<T = unknown> {
  body: T;
  headers: Headers;
  status: number;
  url: string;
  rawBody: string;
}

const DEFAULT_BASE_URL = "https://beta-api.paywithlocus.com";
const DEFAULT_BUILD_API_BASE_URL = "https://api.buildwithlocus.com";

const API_COSTS: Record<WrappedApiProvider, number> = {
  search: 0.12,
  crawl: 0.14,
  screenshot: 0.15,
  claude: 0.08,
  maps: 0.1,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function truncateForDisplay(value: string, maxLength = 48) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 3)}...`;
}

function getString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function getNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function readPath(value: unknown, path: string) {
  const segments = path.split(".");
  let current: unknown = value;

  for (const segment of segments) {
    if (Array.isArray(current)) {
      const index = Number(segment);

      if (!Number.isInteger(index)) {
        return undefined;
      }

      current = current[index];
      continue;
    }

    if (!isObject(current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

function pickString(value: unknown, paths: string[]) {
  for (const path of paths) {
    const candidate = readPath(value, path);
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return "";
}

function pickNumber(value: unknown, paths: string[]) {
  for (const path of paths) {
    const candidate = readPath(value, path);
    const parsed = getNumber(candidate);
    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
}

function formatCheckoutAmount(amount: number | string | undefined) {
  if (typeof amount === "string" && amount.trim().length > 0) {
    const parsed = Number(amount);

    if (Number.isFinite(parsed)) {
      return parsed.toFixed(2);
    }

    return amount.trim();
  }

  if (typeof amount === "number" && Number.isFinite(amount)) {
    return amount.toFixed(2);
  }

  return "0.00";
}

export class LocusClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly buildApiBaseUrl: string;
  private readonly defaultMode: LocusMode;
  private readonly fixedMode?: LocusMode;

  constructor(options: LocusClientOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.LOCUS_API_KEY;
    this.baseUrl = options.baseUrl ?? process.env.LOCUS_API_BASE ?? DEFAULT_BASE_URL;
    this.buildApiBaseUrl =
      process.env.LOCUS_BUILD_API_BASE ?? DEFAULT_BUILD_API_BASE_URL;
    this.defaultMode =
      options.mockMode !== undefined
        ? options.mockMode
          ? "mock"
          : "live"
        : process.env.LOCUS_MOCK_MODE === "true"
          ? "mock"
          : "live";
    this.fixedMode = options.mockMode !== undefined ? this.defaultMode : undefined;
  }

  getMode(): LocusMode {
    return this.fixedMode ?? getConfiguredLocusMode(this.defaultMode);
  }

  isLive() {
    return this.getMode() === "live";
  }

  readonly wallet = {
    getBalance: async () => {
      console.log(`[LOCUS ${this.isLive() ? "LIVE" : "MOCK"}] wallet.getBalance called`);

      if (!this.isLive()) {
        return this.mockWalletBalance();
      }

      if (!this.apiKey) {
        const fallback = this.mockWalletBalance();
        const message = "Missing LOCUS_API_KEY";
        console.error("[LOCUS ERROR] wallet.getBalance:", message);

        return {
          ...fallback,
          mode: "live",
          error: message,
        } satisfies WalletBalanceResponse;
      }

      try {
        const response = await this.requestConfirmed("/api/pay/balance", {
          method: "GET",
        });
        const payload = this.unwrapResponse<Record<string, unknown>>(response.body);

        return {
          balance:
            pickNumber(payload, [
              "usdc_balance",
              "balance",
              "availableBalance",
              "available_balance",
              "wallet.balance",
            ]) ?? 0,
          currency: pickString(payload, ["currency", "wallet.currency"]) || "USDC",
          wallet_address:
            pickString(payload, [
              "wallet_address",
              "walletAddress",
              "address",
              "wallet.address",
            ]) || "unavailable",
          mode: "live",
        } satisfies WalletBalanceResponse;
      } catch (error) {
        const fallback = this.mockWalletBalance();
        const message = this.getErrorMessage(error);
        console.error("[LOCUS ERROR] wallet.getBalance:", error);

        return {
          ...fallback,
          mode: "live",
          error: message,
        } satisfies WalletBalanceResponse;
      }
    },
  };

  readonly checkout = {
    createSession: async (params: CheckoutCreateSessionParams) => {
      console.log(
        `[LOCUS ${this.isLive() ? "LIVE" : "MOCK"}] checkout.createSession called`,
      );

      if (!this.isLive()) {
        return this.mockCheckoutSession(params);
      }

      if (!this.apiKey) {
        const fallback = this.mockCheckoutSession(params);
        const message = "Missing LOCUS_API_KEY";
        console.error("[LOCUS ERROR] checkout.createSession:", message);

        return {
          ...fallback,
          mode: "live",
          error: message,
        } satisfies CheckoutCreateSessionResponse;
      }

      try {
        const formattedAmount = formatCheckoutAmount(params.amount);
        const response = await this.requestConfirmed("/api/checkout/sessions", {
          method: "POST",
          okStatuses: [200, 201],
          body: {
            amount: formattedAmount,
            description: params.description,
            currency: "USDC",
          },
        });
        const payload = this.unwrapResponse<Record<string, unknown>>(response.body);
        const sessionId = pickString(payload, [
          "id",
          "sessionId",
          "session_id",
          "session.id",
          "checkoutSession.id",
        ]);
        const checkoutUrl = pickString(payload, [
          "checkoutUrl",
          "checkout_url",
          "url",
          "session.url",
          "session.checkoutUrl",
          "checkoutSession.url",
        ]);
        const payloadAmount =
          pickString(payload, ["amount", "pricing.amount"]) ||
          (() => {
            const numericAmount = pickNumber(payload, ["amount", "pricing.amount"]);
            return numericAmount !== null ? numericAmount.toFixed(2) : "";
          })();
        const currency =
          pickString(payload, ["currency", "pricing.currency"]) || "USDC";
        const status =
          pickString(payload, ["status", "session.status"]) || "created";
        const expiresAt =
          pickString(payload, ["expiresAt", "expires_at", "session.expiresAt"]) ||
          undefined;

        if (!sessionId || !checkoutUrl) {
          throw new Error(
            "Locus checkout session response did not include a session id or checkout URL.",
          );
        }

        return {
          checkout_url: checkoutUrl,
          session_id: sessionId,
          amount: payloadAmount || formattedAmount,
          currency,
          status,
          expires_at: expiresAt,
          mode: "live",
        } satisfies CheckoutCreateSessionResponse;
      } catch (error) {
        const fallback = this.mockCheckoutSession(params);
        const message = this.getErrorMessage(error);
        console.error("[LOCUS ERROR] checkout.createSession:", error);

        return {
          ...fallback,
          mode: "live",
          error: message,
        } satisfies CheckoutCreateSessionResponse;
      }
    },
    getSession: async (sessionId: string) => {
      console.log(
        `[LOCUS ${this.isLive() ? "LIVE" : "MOCK"}] checkout.getSession called`,
      );

      if (!this.isLive()) {
        return this.mockCheckoutSessionStatus(sessionId);
      }

      if (!this.apiKey) {
        const fallback = this.mockCheckoutSessionStatus(sessionId);
        const message = "Missing LOCUS_API_KEY";
        console.error("[LOCUS ERROR] checkout.getSession:", message);

        return {
          ...fallback,
          mode: "live",
          error: message,
        } satisfies CheckoutSessionResponse;
      }

      try {
        const response = await this.requestConfirmed(
          `/api/checkout/sessions/${encodeURIComponent(sessionId)}`,
          {
            method: "GET",
          },
        );
        const payload = this.unwrapResponse<Record<string, unknown>>(response.body);

        return {
          session_id:
            pickString(payload, [
              "id",
              "sessionId",
              "session_id",
              "session.id",
            ]) || sessionId,
          status:
            pickString(payload, [
              "status",
              "paymentStatus",
              "sessionStatus",
              "checkoutSession.status",
            ]) || "pending",
          checkout_url:
            pickString(payload, [
              "checkoutUrl",
              "checkout_url",
              "url",
              "session.url",
              "checkoutSession.url",
            ]) || undefined,
          payment_tx_hash:
            pickString(payload, [
              "paymentTxHash",
              "payment_tx_hash",
              "payment.txHash",
            ]) || undefined,
          payer_address:
            pickString(payload, [
              "payerAddress",
              "payer_address",
              "payment.payerAddress",
            ]) || undefined,
          paid_at:
            pickString(payload, ["paidAt", "paid_at", "payment.paidAt"]) ||
            undefined,
          expires_at:
            pickString(payload, [
              "expiresAt",
              "expires_at",
              "checkoutSession.expiresAt",
            ]) || undefined,
          mode: "live",
        } satisfies CheckoutSessionResponse;
      } catch (error) {
        const fallback = this.mockCheckoutSessionStatus(sessionId);
        const message = this.getErrorMessage(error);
        console.error("[LOCUS ERROR] checkout.getSession:", error);

        return {
          ...fallback,
          mode: "live",
          error: message,
        } satisfies CheckoutSessionResponse;
      }
    },
  };

  readonly wrapped = {
    exaSearch: (params: WrappedExaSearchParams) =>
      this.requestWrapped(
        "wrapped.exaSearch",
        "/api/wrapped/exa/search",
        {
          query: params.query,
          numResults: params.numResults ?? 5,
        },
        () => this.getMockApiData({
          provider: "search",
          endpoint: "search",
          params: {
            query: params.query,
          },
        }),
      ),
    screenshot: (params: WrappedScreenshotParams) =>
      this.requestWrapped(
        "wrapped.screenshot",
        "/api/wrapped/firecrawl/scrape",
        {
          url: params.url,
          formats: ["screenshot"],
        },
        () => this.getMockApiData({
          provider: "screenshot",
          endpoint: "screenshot",
          params: {
            url: params.url,
            format: params.format ?? "png",
          },
        }),
      ),
  };

  readonly apis = {
    call: <T = unknown>(params: WrappedApiCallParams) =>
      Promise.resolve(this.mockApiCall<T>(params)),
  };

  readonly tasks = {
    create: (params: CreateTaskParams) =>
      this.run(
        "tasks.create",
        () => this.mockTask(params),
        async () => {
          throw new Error(
            "Live task creation is disabled until Locus publishes a confirmed beta REST endpoint for it.",
          );
        },
        (result) => result.estimated_cost,
      ),
  };

  readonly cards = {
    createAccount: () =>
      this.run(
        "cards.createAccount",
        (): CreateCardAccountResponse => ({
          account_id: `mock_account_${crypto.randomUUID()}`,
          mode: "mock",
        }),
        async () => {
          throw new Error(
            "Live card account creation is disabled until Locus publishes a confirmed beta REST endpoint for it.",
          );
        },
      ),
    create: (params: CreateCardParams) =>
      this.run(
        "cards.create",
        () => this.mockCard(params),
        async () => {
          throw new Error(
            "Live card creation is disabled until Locus publishes a confirmed beta REST endpoint for it.",
          );
        },
      ),
  };

  readonly build = {
    deploy: async (params: BuildDeployParams) => {
      console.log(`[LOCUS ${this.isLive() ? "LIVE" : "MOCK"}] build.deploy called`);

      if (!this.isLive()) {
        return this.mockDeployment(params);
      }

      if (!this.apiKey) {
        const message = "Missing LOCUS_API_KEY";
        console.error("[LOCUS ERROR] build.deploy:", message);

        return {
          deployment_id: "",
          url: "",
          status: "unavailable",
          mode: "live",
          error: message,
        } satisfies BuildDeployResponse;
      }

      const repo = params.repo ?? process.env.LOCUS_BUILD_REPO;
      const branch = params.branch ?? process.env.LOCUS_BUILD_BRANCH;

      if (!repo) {
        const message =
          "Build proof unavailable: configure LOCUS_BUILD_REPO with a real GitHub owner/repo.";
        console.error("[LOCUS ERROR] build.deploy:", message);

        return {
          deployment_id: "",
          url: "",
          status: "unavailable",
          mode: "live",
          error: message,
        } satisfies BuildDeployResponse;
      }

      try {
        const token = await this.exchangeBuildToken();
        const response = await this.performBuildRequest("/v1/projects/from-repo", {
          method: "POST",
          body: {
            name: params.name,
            repo,
            ...(branch ? { branch } : {}),
            ...(params.region ? { region: params.region } : {}),
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (![200, 201].includes(response.status)) {
          throw new Error(
            `Build deploy failed with status ${response.status}: ${this.stringifyError(response.body)}`,
          );
        }

        const payload = this.unwrapResponse<Record<string, unknown>>(response.body);
        const deploymentId = pickString(payload, [
          "deployments.0.id",
          "deployment.id",
        ]);
        const status =
          pickString(payload, [
            "deployments.0.status",
            "services.0.deploymentStatus",
            "status",
          ]) || "deploying";
        const url =
          pickString(payload, ["services.0.url", "service.url", "url"]) || "";

        if (!deploymentId) {
          throw new Error(
            "Build deployment response did not include a deployment id.",
          );
        }

        return {
          deployment_id: deploymentId,
          url,
          status,
          details: {
            projectId: pickString(payload, ["project.id"]) || undefined,
            serviceId: pickString(payload, ["services.0.id"]) || undefined,
            repo,
            branch: branch || undefined,
          },
          mode: "live",
        } satisfies BuildDeployResponse;
      } catch (error) {
        const message = this.getErrorMessage(error);
        console.error("[LOCUS ERROR] build.deploy:", error);

        return {
          deployment_id: "",
          url: "",
          status: "failed",
          mode: "live",
          error: message,
        } satisfies BuildDeployResponse;
      }
    },
  };

  async testConnection(): Promise<TestConnectionResponse> {
    console.log(`[LOCUS ${this.isLive() ? "LIVE" : "MOCK"}] testConnection called`);

    if (!this.isLive()) {
      const balance = this.mockWalletBalance();

      return {
        connected: false,
        balance: balance.balance,
        mode: "mock",
        network: "base",
        wallet_address: balance.wallet_address,
      };
    }

    const balance = await this.wallet.getBalance();

    return {
      connected: !balance.error && balance.mode === "live",
      balance: !balance.error ? balance.balance : 0,
      mode: "live",
      network: "base",
      wallet_address: balance.wallet_address,
      error: balance.error,
    };
  }

  private async requestWrapped<T>(
    method: string,
    path: string,
    body: Record<string, unknown>,
    getMockData: () => unknown,
  ): Promise<WrappedResult<T>> {
    console.log(`[LOCUS ${this.isLive() ? "LIVE" : "MOCK"}] ${method} called`);

    if (!this.isLive()) {
      return {
        data: getMockData() as T,
        endpoint: path,
        response_preview: "<mock>",
        mode: "mock",
      };
    }

    if (!this.apiKey) {
      const message = "Missing LOCUS_API_KEY";
      console.error(`[LOCUS ERROR] ${method}:`, message);
      return {
        data: null,
        endpoint: path,
        response_preview: "",
        mode: "live",
        error: message,
      };
    }

    try {
      const response = await this.performRequest(path, {
        method: "POST",
        body,
      });
      const payload = this.unwrapResponse<T>(response.body);

      if (response.status !== 200) {
        return {
          data: null,
          endpoint: path,
          response_preview: response.rawBody.slice(0, 500),
          http_status: response.status,
          mode: "live",
          error: `Locus wrapped request failed with status ${response.status}`,
        };
      }

      const cost = this.extractCost(response);

      if (typeof cost === "number") {
        console.log(`[LOCUS COST] ${method}: $${cost.toFixed(2)}`);
      }

      return {
        data: payload,
        endpoint: path,
        response_preview: response.rawBody.slice(0, 500),
        http_status: response.status,
        cost,
        mode: "live",
      };
    } catch (error) {
      const message = this.getErrorMessage(error);
      console.error(`[LOCUS ERROR] ${method}:`, error);
      return {
        data: null,
        endpoint: path,
        response_preview: "",
        mode: "live",
        error: message,
      };
    }
  }

  private async run<T extends LocusResultMeta>(
    method: string,
    getMockValue: () => T,
    runLive: () => Promise<T>,
    getCost?: (result: T) => number | undefined,
  ): Promise<T> {
    console.log(`[LOCUS ${this.isLive() ? "LIVE" : "MOCK"}] ${method} called`);

    if (!this.isLive()) {
      return getMockValue();
    }

    if (!this.apiKey) {
      const fallback = getMockValue();
      const message = "Missing LOCUS_API_KEY";
      console.error(`[LOCUS ERROR] ${method}:`, message);
      return {
        ...fallback,
        error: message,
      };
    }

    try {
      const result = await runLive();
      const cost = getCost?.(result);

      if (typeof cost === "number") {
        console.log(`[LOCUS COST] ${method}: $${cost.toFixed(2)}`);
      }

      return result;
    } catch (error) {
      const fallback = getMockValue();
      const message = this.getErrorMessage(error);
      console.error(`[LOCUS ERROR] ${method}:`, error);
      return {
        ...fallback,
        error: message,
      };
    }
  }

  private buildUrl(path: string) {
    return this.buildExternalUrl(this.baseUrl, path);
  }

  private buildExternalUrl(baseUrl: string, path: string) {
    const normalizedBase = baseUrl.replace(/\/+$/g, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  }

  private async performJsonRequest(
    url: string,
    init: {
      method?: "GET" | "POST";
      body?: object;
      headers?: Record<string, string>;
    } = {},
  ): Promise<LocusHttpResponse> {
    let response: Response;
    try {
      response = await fetch(url, {
        method: init.method ?? "GET",
        headers: {
          "Content-Type": "application/json",
          ...init.headers,
        },
        body: init.body ? JSON.stringify(init.body) : undefined,
        cache: "no-store",
      });
    } catch (error) {
      console.error(`[LOCUS REQUEST FAILED] ${url}:`, error);
      throw error instanceof Error ? error : new Error("Unknown Locus request error");
    }

    const rawBody = await response.text();
    const bodyPreview = rawBody.length > 0 ? rawBody.slice(0, 500) : "<empty>";
    console.log(`[LOCUS HTTP] ${url}`);
    console.log(`[LOCUS STATUS] ${response.status}`);
    console.log(`[LOCUS BODY] ${bodyPreview}`);

    const parsedBody = this.parseRawBody(rawBody, response.headers.get("content-type"));

    return {
      body: parsedBody,
      headers: response.headers,
      status: response.status,
      url,
      rawBody,
    };
  }

  private async performRequest(
    path: string,
    init: {
      method?: "GET" | "POST";
      body?: object;
    } = {},
  ): Promise<LocusHttpResponse> {
    return this.performJsonRequest(this.buildUrl(path), {
      method: init.method,
      body: init.body,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }

  private async performBuildRequest(
    path: string,
    init: {
      method?: "GET" | "POST";
      body?: object;
      headers?: Record<string, string>;
    } = {},
  ): Promise<LocusHttpResponse> {
    return this.performJsonRequest(
      this.buildExternalUrl(this.buildApiBaseUrl, path),
      init,
    );
  }

  private async requestConfirmed(
    path: string,
    init: {
      method?: "GET" | "POST";
      body?: object;
      okStatuses?: number[];
    } = {},
  ): Promise<LocusHttpResponse> {
    const response = await this.performRequest(path, init);
    const okStatuses = init.okStatuses ?? [200];

    if (!okStatuses.includes(response.status)) {
      throw new Error(
        `Locus request failed with status ${response.status}: ${this.stringifyError(response.body)}`,
      );
    }

    return response;
  }

  private async exchangeBuildToken() {
    const response = await this.performBuildRequest("/v1/auth/exchange", {
      method: "POST",
      body: {
        apiKey: this.apiKey,
      },
    });

    if (![200, 201].includes(response.status)) {
      throw new Error(
        `Build auth exchange failed with status ${response.status}: ${this.stringifyError(response.body)}`,
      );
    }

    const payload = this.unwrapResponse<Record<string, unknown>>(response.body);
    const token = pickString(payload, ["token", "jwt"]);

    if (!token) {
      throw new Error("Build auth exchange did not return a token.");
    }

    return token;
  }

  private parseRawBody(rawBody: string, contentType: string | null): unknown {
    if (rawBody.length === 0) {
      return {};
    }

    if (contentType?.includes("application/json")) {
      try {
        return JSON.parse(rawBody) as unknown;
      } catch {
        return rawBody;
      }
    }

    try {
      return JSON.parse(rawBody) as unknown;
    } catch {
      return rawBody;
    }
  }

  private unwrapResponse<T>(rawBody: unknown): T {
    if (isObject(rawBody)) {
      const envelope = rawBody as LocusEnvelope<T>;

      if (envelope.data !== undefined) {
        return envelope.data;
      }

      if (envelope.result !== undefined) {
        return envelope.result;
      }
    }

    return rawBody as T;
  }

  private getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Unknown Locus error";
  }

  private stringifyError(value: unknown) {
    if (typeof value === "string") {
      return value;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "Unserializable error payload";
    }
  }

  private extractCost(response: LocusHttpResponse) {
    const headerKeys = [
      "x-locus-cost-usdc",
      "x-locus-estimated-cost-usdc",
      "x-cost-usdc",
      "x-estimated-cost-usdc",
      "x-cost",
      "cost-usdc",
    ];

    for (const headerKey of headerKeys) {
      const headerValue = response.headers.get(headerKey);
      const parsedValue = headerValue ? Number(headerValue) : Number.NaN;

      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }

    return (
      pickNumber(response.body, [
        "cost",
        "usd_cost",
        "usdc_cost",
        "estimated_cost",
        "estimated_cost_usdc",
        "cost_usdc",
      ]) ?? undefined
    );
  }

  private mockWalletBalance(): WalletBalanceResponse {
    return {
      balance: 186.42,
      currency: "USDC",
      wallet_address: "0xA93F6B1C2D4E5F67890123456789ABCDEF123456",
      mode: "mock",
    };
  }

  private mockCheckoutSession(
    params: CheckoutCreateSessionParams,
  ): CheckoutCreateSessionResponse {
    const sessionId = `mock_${crypto.randomUUID()}`;
    const formattedAmount = formatCheckoutAmount(params.amount);

    return {
      checkout_url: `/mock-checkout?session=${sessionId}&amount=${formattedAmount}`,
      session_id: sessionId,
      mode: "mock",
    };
  }

  private mockCheckoutSessionStatus(sessionId: string): CheckoutSessionResponse {
    return {
      session_id: sessionId,
      status: "pending",
      checkout_url: `/mock-checkout?session=${sessionId}`,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      mode: "mock",
    };
  }

  private mockApiCall<T>(params: WrappedApiCallParams): WrappedApiCallResponse<T> {
    const data = this.getMockApiData(params) as T;

    return {
      data,
      cost: API_COSTS[params.provider],
      mode: "mock",
    };
  }

  private getMockApiData(params: WrappedApiCallParams): unknown {
    switch (params.provider) {
      case "search": {
        const query = getString(params.params.query, "market research");

        return {
          query,
          results: [
            {
              title: "Competitor Alpha",
              url: "https://competitor-alpha.example",
              snippet:
                "High-converting landing page with tighter headline-value alignment.",
            },
            {
              title: "Competitor Bravo",
              url: "https://competitor-bravo.example",
              snippet:
                "Strong CTA placement and trust signals above the fold.",
            },
            {
              title: "Competitor Delta",
              url: "https://competitor-delta.example",
              snippet:
                "Premium positioning with concise benefits and cleaner pricing anchors.",
            },
          ],
          summary: `Search scan completed for ${truncateForDisplay(query)}.`,
        };
      }
      case "crawl": {
        const url = getString(params.params.url, "https://example.com");

        return {
          url,
          pages_crawled: 4,
          key_findings: [
            "Hero messaging is clear but undersells differentiation.",
            "Primary CTA lacks urgency compared with category leaders.",
            "Proof elements are present but arrive too late in the scroll.",
          ],
          extracted_text:
            "Headline, subhead, CTA, proof block, pricing anchor, FAQ summary.",
        };
      }
      case "screenshot": {
        const url = getString(params.params.url, "https://example.com");

        return {
          screenshot: `data:image/png;base64,${Buffer.from(
            `mock-screenshot:${slugify(url)}`,
          ).toString("base64")}`,
          metadata: {
            title: "Example Domain",
            statusCode: 200,
          },
        };
      }
      case "claude": {
        const prompt = getString(params.params.prompt, "Analysis prompt");

        return {
          report: [
            "AgentOps Analysis",
            "",
            "The page communicates value, but the offer framing is too generic for cold traffic.",
            "Top recommendation: rewrite the hero to emphasize outcome and shorten the distance to proof.",
            "Second recommendation: increase CTA contrast and tighten supporting copy.",
            "Third recommendation: move credibility markers closer to the first decision point.",
            "",
            `Prompt reference: ${truncateForDisplay(prompt, 80)}`,
          ].join("\n"),
          quality_score: 0.68,
          reasoning:
            "The draft is informative but would benefit from a human polish pass if margin allows.",
        };
      }
      case "maps":
        return {
          locations: [
            {
              name: "Competitor HQ",
              city: "Austin",
              rating: 4.7,
            },
          ],
        };
      default:
        return {
          message: "Mock data unavailable for provider",
        };
    }
  }

  private mockTask(params: CreateTaskParams): CreateTaskResponse {
    const estimatedCost = params.turnaround === "1_day" ? 2 : 2;

    return {
      task_id: `mock_task_${crypto.randomUUID()}`,
      status: "pending",
      estimated_cost: estimatedCost,
      mode: "mock",
    };
  }

  private mockCard(params: CreateCardParams): CreateCardResponse {
    return {
      card_id: `mock_card_${crypto.randomUUID()}`,
      last_four: "4242",
      balance: params.amount,
      mode: "mock",
    };
  }

  private mockDeployment(params: BuildDeployParams): BuildDeployResponse {
    return {
      deployment_id: `mock_deploy_${crypto.randomUUID()}`,
      url: `https://${slugify(params.name || "agentops-service")}.locus.build`,
      status: "deploying",
      mode: "mock",
    };
  }
}

export type {
  BuildDeployParams,
  BuildDeployResponse,
  CheckoutCreateSessionParams,
  CheckoutCreateSessionResponse,
  CheckoutSessionResponse,
  CreateCardAccountResponse,
  CreateCardParams,
  CreateCardResponse,
  CreateTaskParams,
  CreateTaskResponse,
  LocusClientOptions,
  SupportedCurrency,
  TaskTurnaround,
  TaskType,
  TestConnectionResponse,
  WalletBalanceResponse,
  WrappedExaSearchParams,
  WrappedApiCallParams,
  WrappedApiCallResponse,
  WrappedApiProvider,
  WrappedResult,
  WrappedScreenshotParams,
};

export const locusClient = new LocusClient();
