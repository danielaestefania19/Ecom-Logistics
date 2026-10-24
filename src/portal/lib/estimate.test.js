import { describe, expect, it } from "vitest";
import { estimateOrder, volumeDiscount } from "./estimate";

describe("volumeDiscount", () => {
  it("follows the public tiers", () => {
    expect(volumeDiscount(500)).toBe(0);
    expect(volumeDiscount(501)).toBe(0.1);
    expect(volumeDiscount(1499)).toBe(0.1);
    expect(volumeDiscount(1500)).toBe(0.15);
  });
});

describe("estimateOrder", () => {
  it("prices a typical small order (N&M SHOP style)", () => {
    const est = estimateOrder({
      items: [
        { expected_qty: 200, prep_type: "polybag" },
        { expected_qty: 118, prep_type: "standard" },
      ],
      totalCases: 28,
      pallets: 1,
      extras: ["pallet"],
    });
    // 118×0.70 + 200×0.95 + 28×3 + 1×15 + 1×20
    expect(est.units).toBe(318);
    expect(est.total).toBe(391.6);
  });

  it("applies the floored tier rate like the pricing page", () => {
    expect(estimateOrder({ items: [{ expected_qty: 600 }] }).lines[0].rate).toBe(0.63);
    expect(estimateOrder({ items: [{ expected_qty: 1500 }] }).lines[0].rate).toBe(0.59);
    expect(estimateOrder({ items: [{ expected_qty: 1500 }] }).total).toBe(885);
  });

  it("charges per-unit extras on total units and pallet extras at least once", () => {
    const est = estimateOrder({ items: [{ expected_qty: 10 }], extras: ["coupon_insert", "pallet_wrap"] });
    expect(est.lines.map((l) => l.key)).toEqual(["prep_standard", "pallet_wrap", "coupon_insert"]);
    expect(est.total).toBe(10 * 0.7 + 20 + 10 * 0.5);
  });

  it("ignores empty or invalid quantities", () => {
    expect(estimateOrder({ items: [{ expected_qty: "" }, { expected_qty: -3 }] })).toMatchObject({ units: 0, total: 0 });
  });
});
