const MARKETPLACE_NAMES = {
  ATVPDKIKX0DER: "United States",
  A2EUQ1WTGCTBG2: "Canada",
  A1AM78C64UM0Y8: "Mexico",
};

export const marketplaceName = (id) => MARKETPLACE_NAMES[id] ?? id;

// The OAuth callback redirects back to /portal/amazon with ?connected=1 or ?error=<code>.
export function parseConnectReturn(search) {
  const params = new URLSearchParams(search);
  if (params.get("connected") === "1") return { kind: "connected" };
  const error = params.get("error");
  return error ? { kind: "error", code: error } : null;
}

export const CONNECT_ERROR_CODES = ["missing_params", "invalid_state", "no_refresh_token", "exchange_failed"];

export const connectErrorKey = (code) =>
  `amazon.errors.${CONNECT_ERROR_CODES.includes(code) ? code : "exchange_failed"}`;

export const CONNECTION_STATUS_STYLE = {
  active: "bg-emerald-50 text-emerald-700",
  revoked: "bg-gray-100 text-gray-600",
  error: "bg-red-50 text-red-700",
};
