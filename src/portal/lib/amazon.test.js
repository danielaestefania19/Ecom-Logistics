import { describe, expect, it } from "vitest";
import { connectErrorKey, marketplaceName, parseConnectReturn } from "./amazon";

describe("parseConnectReturn", () => {
  it("detects a successful connection", () => {
    expect(parseConnectReturn("?connected=1")).toEqual({ kind: "connected" });
  });

  it("returns the error code from a failed callback", () => {
    expect(parseConnectReturn("?error=invalid_state")).toEqual({ kind: "error", code: "invalid_state" });
  });

  it("ignores unrelated query strings", () => {
    expect(parseConnectReturn("")).toBeNull();
    expect(parseConnectReturn("?connected=0")).toBeNull();
  });
});

describe("connectErrorKey", () => {
  it("maps known codes and falls back for unknown ones", () => {
    expect(connectErrorKey("invalid_state")).toBe("amazon.errors.invalid_state");
    expect(connectErrorKey("whatever")).toBe("amazon.errors.exchange_failed");
  });
});

describe("marketplaceName", () => {
  it("names the North America marketplaces and passes unknown ids through", () => {
    expect(marketplaceName("ATVPDKIKX0DER")).toBe("United States");
    expect(marketplaceName("XYZ")).toBe("XYZ");
  });
});
