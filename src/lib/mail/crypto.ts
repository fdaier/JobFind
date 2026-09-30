import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function encryptionKey(): Buffer {
  const value = process.env.MAIL_CREDENTIAL_KEY;
  if (!value || !/^[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error("MAIL_CREDENTIAL_KEY is missing or invalid");
  }
  return Buffer.from(value, "hex");
}

export function encryptCredential(credential: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const payload = Buffer.concat([cipher.update(credential, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), payload.toString("base64url")].join(".");
}

export function decryptCredential(value: string): string {
  const [version, ivText, tagText, payloadText] = value.split(".");
  if (version !== "v1" || !ivText || !tagText || !payloadText) throw new Error("Invalid encrypted credential");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(payloadText, "base64url")), decipher.final()]).toString("utf8");
}
