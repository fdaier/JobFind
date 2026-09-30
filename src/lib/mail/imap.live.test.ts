import { expect, it } from "vitest";

import { scan163Batch } from "./imap";

const address = process.env.JOBFIND_MAIL_ADDRESS;
const credential = process.env.JOBFIND_MAIL_PASS;

it.skipIf(!address || !credential)("scans a real 163 inbox using its actual UIDs", async () => {
  const batch = await scan163Batch(address!, credential!, 1);
  expect(batch.processed).toBeGreaterThan(0);
  expect(batch.totalMessages).toBeGreaterThanOrEqual(batch.processed);
  expect(Object.values(batch.categories).reduce((sum, value) => sum + value, 0)).toBe(batch.processed);
  expect(batch.nextUid).toBeGreaterThan(1);
}, 60_000);
