import { describe, expect, it } from "vitest";
import { groupOrders, parseCsv } from "./csv";

describe("parseCsv", () => {
  it("handles quotes, escaped quotes, embedded commas/newlines and CRLF", () => {
    const rows = parseCsv('\uFEFFName,Note\r\n#1,"a, ""b""\nc"\r\n\r\n#2,plain\r\n');
    expect(rows).toEqual([
      { name: "#1", note: 'a, "b"\nc' },
      { name: "#2", note: "plain" },
    ]);
  });
});

describe("groupOrders", () => {
  it("groups a Shopify export by order and reads shipping from the first row", () => {
    const csv = [
      "Name,Lineitem quantity,Lineitem sku,Shipping Name,Shipping Address1,Shipping City,Shipping Province,Shipping Zip,Shipping Country",
      "#1001,2,TSHIRT-M,Ana Diaz,1 Main St,Hayward,CA,94545,US",
      "#1001,1,MUG,,,,,,",
      "#1001,1,TSHIRT-M,,,,,,",
      "#1002,3,MUG,Luis Paz,9 Elm Ave,Oakland,CA,94601,US",
    ].join("\n");
    expect(groupOrders(parseCsv(csv))).toEqual([
      {
        external_ref: "#1001",
        recipient_name: "Ana Diaz",
        ship_to: "1 Main St\nHayward, CA 94545\nUS",
        lines: [{ sku: "TSHIRT-M", qty: 3 }, { sku: "MUG", qty: 1 }],
      },
      {
        external_ref: "#1002",
        recipient_name: "Luis Paz",
        ship_to: "9 Elm Ave\nOakland, CA 94601\nUS",
        lines: [{ sku: "MUG", qty: 3 }],
      },
    ]);
  });

  it("understands TikTok Shop column names", () => {
    const csv = "Order ID,Seller SKU,Quantity,Recipient,Address Line 1,City,State,Zipcode,Country\n577,CAP,1,Eva,2 Oak,Fremont,CA,94536,US";
    const [order] = groupOrders(parseCsv(csv));
    expect(order).toMatchObject({ external_ref: "577", recipient_name: "Eva", lines: [{ sku: "CAP", qty: 1 }] });
  });
});
