import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("RootLayout", () => {
  it("suppresses hydration warnings on the body element", () => {
    const source = readFileSync(join(__dirname, "layout.tsx"), "utf8");

    expect(source).toMatch(/<body[^>]*suppressHydrationWarning/);
  });
});
