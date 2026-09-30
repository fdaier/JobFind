import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

import { classifyMail, sanitizeSnippet, senderDomain, type MailCategory, type MailObservation } from "./analysis";

const MAX_SOURCE_BYTES = 1024 * 1024;
const BATCH_UID_RANGE = 50;

function clientFor(address: string, credential: string) {
  return new ImapFlow({
    host: "imap.163.com",
    port: 993,
    secure: true,
    auth: { user: address, pass: credential },
    logger: false,
    disableAutoIdle: true,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    tls: { rejectUnauthorized: true },
  });
}

export async function verify163Connection(address: string, credential: string): Promise<void> {
  const client = clientFor(address, credential);
  try {
    await client.connect();
    await client.mailboxOpen("INBOX", { readOnly: true });
  } finally {
    if (client.usable) await client.logout().catch(() => client.close());
    else client.close();
  }
}

export interface MailScanBatch {
  uidValidity: string;
  nextUid: number;
  uidNext: number;
  processed: number;
  oversized: number;
  categories: Record<MailCategory, number>;
  observations: MailObservation[];
}

export async function scan163Batch(address: string, credential: string, cursor: number): Promise<MailScanBatch> {
  const client = clientFor(address, credential);
  try {
    await client.connect();
    const mailbox = await client.mailboxOpen("INBOX", { readOnly: true });
    const uidNext = mailbox.uidNext;
    const start = Math.max(1, Math.min(Math.floor(cursor), uidNext));
    const end = Math.min(start + BATCH_UID_RANGE - 1, uidNext - 1);
    const categories: Record<MailCategory, number> = { assessment: 0, written_test: 0, interview: 0, offer: 0, rejection: 0, application: 0, recruitment_other: 0, other: 0 };
    const observations: MailObservation[] = [];
    let processed = 0;
    let oversized = 0;
    if (end >= start) {
      // Fetch metadata first so large attachments never enter the parser.
      const messages = [];
      for await (const message of client.fetch(`${start}:${end}`, { uid: true, envelope: true, size: true }, { uid: true })) messages.push(message);
      for (const message of messages) {
        processed += 1;
        const subject = message.envelope?.subject?.slice(0, 300) ?? "";
        const sender = message.envelope?.from?.[0]?.address?.slice(0, 254) ?? "";
        let body = "";
        if ((message.size ?? 0) > MAX_SOURCE_BYTES) {
          oversized += 1;
        } else {
          const full = await client.fetchOne(String(message.uid), { source: true }, { uid: true });
          if (full && full.source) {
            const parsed = await simpleParser(full.source, { skipHtmlToText: false, skipTextToHtml: true });
            body = parsed.text ?? "";
          }
        }
        const category = classifyMail(subject, body);
        categories[category] += 1;
        if (category !== "other") observations.push({
          uid: message.uid,
          date: message.envelope?.date ? new Date(message.envelope.date).toISOString() : null,
          sender,
          senderDomain: senderDomain(sender),
          subject,
          category,
          snippet: sanitizeSnippet(body).slice(0, 180),
        });
      }
    }
    return { uidValidity: mailbox.uidValidity.toString(), nextUid: Math.min(end + 1, uidNext), uidNext, processed, oversized, categories, observations };
  } finally {
    if (client.usable) await client.logout().catch(() => client.close());
    else client.close();
  }
}
