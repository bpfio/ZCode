import {
  createSharedZCodeCredentialStore,
  SHARED_ZCODE_CREDENTIAL_KEYS,
  type SharedZCodeCredentialStore,
} from "@zcode/adapters";
import { resolveRuntimeZCodeEndpointOrigin, type EnvRecord } from "@zcode/shared";

export interface CodingPlanCredentials {
  activeProvider: "zai" | "bigmodel";
  accessToken: string;
  zcodeJwt?: string;
  endpointOrigin: string;
}

export class CodingPlanClient {
  private credentialStore: SharedZCodeCredentialStore;
  private env: EnvRecord;

  constructor(env: EnvRecord = process.env) {
    this.env = env;
    this.credentialStore = createSharedZCodeCredentialStore({ env: this.env });
  }

  async resolveCredentials(): Promise<CodingPlanCredentials> {
    const activeProvider = (await this.credentialStore.load(
      SHARED_ZCODE_CREDENTIAL_KEYS.activeProvider,
    )) as "zai" | "bigmodel" | null;

    const zcodeJwt =
      (await this.credentialStore.load(SHARED_ZCODE_CREDENTIAL_KEYS.zcodeJwtToken)) ?? undefined;

    let accessToken: string | null = null;
    if (activeProvider === "bigmodel") {
      accessToken = await this.credentialStore.load(
        SHARED_ZCODE_CREDENTIAL_KEYS.bigmodelAccessToken,
      );
    } else {
      accessToken = await this.credentialStore.load(SHARED_ZCODE_CREDENTIAL_KEYS.zaiAccessToken);
    }

    if (!accessToken && !zcodeJwt) {
      throw new Error(
        "No active ZCode authentication found. Please run 'zcode login' to authenticate.",
      );
    }

    const endpointOrigin = resolveRuntimeZCodeEndpointOrigin(this.env);

    return {
      activeProvider: activeProvider ?? "zai",
      accessToken: accessToken ?? zcodeJwt ?? "",
      zcodeJwt,
      endpointOrigin,
    };
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const creds = await this.resolveCredentials();
    const url = `${creds.endpointOrigin}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${creds.accessToken}`,
      ...(creds.zcodeJwt ? { "X-ZCode-Authorization": `Bearer ${creds.zcodeJwt}` } : {}),
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `HTTP ${response.status} ${response.statusText}`;
      try {
        const json = JSON.parse(errorText);
        errorMsg = json.msg || json.message || errorMsg;
      } catch {
        if (errorText) errorMsg += `: ${errorText.slice(0, 200)}`;
      }
      throw new Error(errorMsg);
    }

    const data = (await response.json()) as T;
    return data;
  }

  // --- TASK-01: Quota Reset ---
  async getResetStatus(): Promise<any> {
    return this.request("/api/v1/coding-plan/reset/status", { method: "GET" });
  }

  async requestResetOpportunity(preferredProviderId: string = "bigmodel"): Promise<any> {
    return this.request("/api/v1/coding-plan/reset/opportunity", {
      method: "POST",
      body: JSON.stringify({ preferredProviderId }),
    });
  }

  async useReset(
    resetType: "FIVE_HOUR" | "WEEK",
    preferredProviderId: string = "bigmodel",
  ): Promise<any> {
    const idempotencyKey = `reset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return this.request("/api/v1/coding-plan/reset/use", {
      method: "POST",
      body: JSON.stringify({
        reset_type: resetType,
        preferredProviderId,
        idempotency_key: idempotencyKey,
      }),
    });
  }

  // --- TASK-04: Quota & Credits Monitor ---
  async getQuotaLimits(): Promise<any> {
    return this.request("/api/monitor/usage/quota/limit", { method: "GET" });
  }

  async getCreditUsageDetail(): Promise<any> {
    return this.request("/api/monitor/credit-usage/usage-detail", { method: "GET" });
  }

  // --- TASK-03: Claim Free Plans ---
  async getClaimPreview(): Promise<any> {
    return this.request("/api/v1/zcode-plan/billing/preview", { method: "GET" });
  }

  async claimPlan(planId: string): Promise<any> {
    return this.request("/api/v1/zcode-plan/billing/claim", {
      method: "POST",
      body: JSON.stringify({ plan_id: planId }),
    });
  }

  // --- TASK-02: Speedup (Highspeed Card) ---
  async drawSpeedupCard(family: "bigmodel" | "zai" = "bigmodel"): Promise<any> {
    return this.request("/api/v1/highspeed/draw", {
      method: "POST",
      body: JSON.stringify({ family }),
    });
  }

  // --- TASK-05: Off-Peak Idle Queue ---
  async getOffPeakStatus(): Promise<any> {
    return this.request("/api/v1/off-peak/ticket/status", { method: "GET" });
  }

  async requestOffPeakTicket(): Promise<any> {
    return this.request("/api/v1/off-peak/ticket", { method: "POST" });
  }

  // --- TASK-06: Marketing Touch Offers ---
  async getOffers(): Promise<any> {
    return this.request("/api/v1/marketing/touch", { method: "GET" });
  }

  async claimOffer(touchId: string, actionType: string = "CLAIM"): Promise<any> {
    return this.request("/api/v1/marketing/touch/action", {
      method: "POST",
      body: JSON.stringify({ touch_id: touchId, action: actionType }),
    });
  }

  // --- TASK-09: Enterprise Team ---
  async getTeamPricing(): Promise<any> {
    return this.request("/api/biz/subscription/enterprise/v2/pricing", { method: "GET" });
  }

  async getTeamBalance(): Promise<any> {
    return this.request("/api/biz/subscription/enterprise/v2/balance", { method: "GET" });
  }

  // --- TASK-10: Web Share ---
  async createShare(shareData: any): Promise<any> {
    return this.request("/api/v1/shares", {
      method: "POST",
      body: JSON.stringify(shareData),
    });
  }
}
