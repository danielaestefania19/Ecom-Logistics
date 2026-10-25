import { describe, expect, it } from "vitest";
import { needsAttention, whatsappLink } from "./leads";

const NOW = new Date("2026-10-25T12:00:00Z").getTime();
const hoursAgo = (h) => new Date(NOW - h * 3600 * 1000).toISOString();

describe("needsAttention", () => {
  it("flags open leads with no contact after 48h", () => {
    expect(needsAttention({ status: "new", created_at: hoursAgo(49) }, NOW)).toBe(true);
    expect(needsAttention({ status: "new", created_at: hoursAgo(47) }, NOW)).toBe(false);
  });

  it("does not flag contacted leads unless a follow-up is overdue", () => {
    const base = { status: "contacted", created_at: hoursAgo(200), last_contacted_at: hoursAgo(100) };
    expect(needsAttention(base, NOW)).toBe(false);
    expect(needsAttention({ ...base, next_follow_up_at: hoursAgo(1) }, NOW)).toBe(true);
    expect(needsAttention({ ...base, next_follow_up_at: hoursAgo(-24) }, NOW)).toBe(false);
  });

  it("never flags closed leads", () => {
    expect(needsAttention({ status: "lost", created_at: hoursAgo(500) }, NOW)).toBe(false);
    expect(needsAttention({ status: "won", created_at: hoursAgo(500) }, NOW)).toBe(false);
  });
});

describe("whatsappLink", () => {
  it("adds the US country code to 10-digit numbers", () => {
    expect(whatsappLink("(510) 377-6068")).toBe("https://wa.me/15103776068");
    expect(whatsappLink("+54 247 768 5754")).toBe("https://wa.me/542477685754");
    expect(whatsappLink("")).toBeNull();
  });
});
