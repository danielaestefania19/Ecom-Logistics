import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STRINGS } from "./strings";

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  );

const sourceFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return sourceFiles(p);
    return /\.jsx?$/.test(name) && !name.includes(".test.") ? [p] : [];
  });

describe("portal strings", () => {
  const en = flatten(STRINGS.en).sort();
  const es = flatten(STRINGS.es).sort();

  it("has the same keys in English and Spanish", () => {
    expect(es).toEqual(en);
  });

  it("defines every literal key passed to t()", () => {
    const keys = new Set(en);
    const missing = [];
    for (const file of sourceFiles(fileURLToPath(new URL(".", import.meta.url)))) {
      const src = readFileSync(file, "utf8");
      for (const [, key] of src.matchAll(/\bt\(\s*"([a-zA-Z0-9_.]+)"/g)) {
        if (!keys.has(key)) missing.push(`${key} (${file.split("/portal/")[1]})`);
      }
    }
    expect(missing).toEqual([]);
  });
});
