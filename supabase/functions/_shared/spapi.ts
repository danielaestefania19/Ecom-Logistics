import { adminClient } from "./http.ts";

const LWA_URL = "https://api.amazon.com/auth/o2/token";
// North America endpoint; marketplace IDs below live in this region.
const SPAPI_BASE = Deno.env.get("SPAPI_BASE_URL") ?? "https://sellingpartnerapi-na.amazon.com";

export const MARKETPLACES = { US: "ATVPDKIKX0DER", CA: "A2EUQ1WTGCTBG2", MX: "A1AM78C64UM0Y8" } as const;

export class SpApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

type LwaTokens = { access_token: string; refresh_token?: string; expires_in: number };

async function lwaRequest(params: Record<string, string>): Promise<LwaTokens> {
  const res = await fetch(LWA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      ...params,
      client_id: Deno.env.get("LWA_CLIENT_ID") ?? "",
      client_secret: Deno.env.get("LWA_CLIENT_SECRET") ?? "",
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new SpApiError(res.status, body?.error_description ?? body?.error ?? "LWA request failed", body);
  return body as LwaTokens;
}

export const exchangeAuthCode = (code: string) =>
  lwaRequest({ grant_type: "authorization_code", code });

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

export async function getAccessToken(connectionId: string): Promise<string> {
  const cached = tokenCache.get(connectionId);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const admin = adminClient();
  const { data: refreshToken, error } = await admin.rpc("amazon_get_refresh_token", { p_connection: connectionId });
  if (error || !refreshToken) throw new SpApiError(404, "No refresh token for this connection");

  try {
    const tokens = await lwaRequest({ grant_type: "refresh_token", refresh_token: refreshToken });
    tokenCache.set(connectionId, { token: tokens.access_token, expiresAt: Date.now() + tokens.expires_in * 1000 });
    return tokens.access_token;
  } catch (err) {
    // invalid_grant means the seller revoked the authorization in Seller Central.
    const revoked = (err as SpApiError).body && (err as { body: { error?: string } }).body.error === "invalid_grant";
    await admin
      .from("amazon_connections")
      .update({ status: revoked ? "revoked" : "error", last_error: (err as Error).message })
      .eq("id", connectionId);
    throw err;
  }
}

export type SpApiRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export async function spapiFetch<T = unknown>(connectionId: string, path: string, opts: SpApiRequest = {}): Promise<T> {
  const url = new URL(path, SPAPI_BASE);
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v === undefined) continue;
    url.searchParams.set(k, Array.isArray(v) ? v.join(",") : v);
  }

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      method: opts.method ?? "GET",
      headers: {
        "x-amz-access-token": await getAccessToken(connectionId),
        "Content-Type": "application/json",
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });

    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
      continue;
    }

    const body = await res.json().catch(() => ({}));
    if (res.status === 401) tokenCache.delete(connectionId);
    if (!res.ok) {
      const msg = body?.errors?.[0]?.message ?? `SP-API ${res.status}`;
      throw new SpApiError(res.status, msg, body);
    }
    return body as T;
  }
}
