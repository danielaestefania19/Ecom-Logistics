import { describe, expect, it } from "vitest";
import { matchFnsku, matchPick, matchReceiving, normalizeCode } from "./scan";

const items = [
  { id: "a", sku: "TEE-M", fnsku: "X001ABC" },
  { id: "b", sku: "MUG", fnsku: "X002DEF" },
  { id: "c", sku: "BUNDLE-2X1", fnsku: "X003GHI" },
];
const aliases = [{ code: "012345678905", sku: "TEE-M" }];

describe("normalizeCode", () => {
  it("trims, uppercases and drops inner spaces from scanner input", () => {
    expect(normalizeCode(" x001 abc \n")).toBe("X001ABC");
  });
});

describe("matchReceiving", () => {
  it("matches by FNSKU, learned UPC or SKU", () => {
    expect(matchReceiving("X002DEF", items, aliases)?.id).toBe("b");
    expect(matchReceiving("012345678905", items, aliases)?.id).toBe("a");
    expect(matchReceiving("MUG", items, aliases)?.id).toBe("b");
  });
  it("returns null for unknown codes so the user can teach it", () => {
    expect(matchReceiving("999", items, aliases)).toBeNull();
  });
});

describe("matchFnsku", () => {
  it("accepts the FNSKU label, including bundle labels", () => {
    expect(matchFnsku("X003GHI", items, aliases).item.id).toBe("c");
  });
  it("flags a product UPC/SKU as a missing FNSKU label", () => {
    expect(matchFnsku("012345678905", items, aliases)).toEqual({ error: "notFnsku", item: items[0] });
    expect(matchFnsku("MUG", items, aliases).error).toBe("notFnsku");
  });
  it("rejects codes that belong to nothing on the order", () => {
    expect(matchFnsku("X999", items, aliases)).toEqual({ error: "unknown" });
  });
});

describe("matchPick", () => {
  const lines = [
    { id: "l1", products: { sku: "TEE-M", barcode: "012345678905" } },
    { id: "l2", products: { sku: "MUG", barcode: null } },
  ];
  it("matches by product barcode, SKU or learned alias", () => {
    expect(matchPick("012345678905", lines)?.id).toBe("l1");
    expect(matchPick("MUG", lines)?.id).toBe("l2");
    expect(matchPick("777", lines, [{ code: "777", sku: "MUG" }])?.id).toBe("l2");
    expect(matchPick("888", lines)).toBeNull();
  });
});
