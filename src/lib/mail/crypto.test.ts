import { afterEach, describe, expect, it } from "vitest";

import { decryptCredential, encryptCredential } from "./crypto";

const originalKey = process.env.MAIL_CREDENTIAL_KEY;

afterEach(() => { process.env.MAIL_CREDENTIAL_KEY = originalKey; });

describe("mail credential encryption", () => {
  it("round trips without exposing the credential and rejects modified ciphertext", () => {
    process.env.MAIL_CREDENTIAL_KEY = "b".repeat(64);
    const encrypted = encryptCredential("mail-client-password");
    expect(encrypted).not.toContain("mail-client-password");
    expect(decryptCredential(encrypted)).toBe("mail-client-password");
    const parts = encrypted.split(".");
    parts[3] = parts[3].slice(0, -1) + (parts[3].endsWith("A") ? "B" : "A");
    expect(() => decryptCredential(parts.join("."))).toThrow();
  });
});
