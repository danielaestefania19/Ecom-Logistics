import { describe, expect, it } from "vitest";
import { estimateMonth, estimateOrder, invoiceLines, volumeDiscount } from "./estimate";

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

describe("invoiceLines", () => {
  const labels = { prep_standard: "Prep", case_receiving: "Cases" };

  it("bills prepped units, then counted, then expected", () => {
    const lines = invoiceLines(
      {
        type: "prep",
        total_cases: 2,
        pallets: 0,
        order_items: [
          { expected_qty: 100, received_qty: 98, prepped_qty: 97 },
          { expected_qty: 50, received_qty: 0, prepped_qty: 0 },
          { expected_qty: 10, received_qty: null, prepped_qty: 0 },
        ],
      },
      labels,
    );
    expect(lines).toEqual([
      { description: "Prep", quantity: 107, unit_amount: 70 },
      { description: "Cases", quantity: 2, unit_amount: 300 },
    ]);
  });

  it("leaves prep off 3PL inbound orders", () => {
    const lines = invoiceLines({ type: "3pl", total_cases: 3, order_items: [{ expected_qty: 40 }] }, labels);
    expect(lines.map((l) => l.description)).toEqual(["Cases"]);
  });
});

describe("estimateMonth", () => {
  it("prices pick & pack per order plus monthly storage", () => {
    const est = estimateMonth({
      shippedPackagings: ["small_medium_box", "small_medium_box", "poly_mailer"],
      bins: 2,
      pallets: 1,
    });
    // 2×2.50 + 1×1.60 + 2×10 + 1×45
    expect(est.orders).toBe(3);
    expect(est.total).toBe(71.6);
  });

  it("applies the volume tier by monthly order count", () => {
    const est = estimateMonth({ shippedPackagings: Array(600).fill("large_box") });
    expect(est.lines[0].rate).toBe(3.15);
  });
});
