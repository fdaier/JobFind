import { decryptCredential, encryptCredential } from "@/lib/mail/crypto";
import { scan163Batch, verify163Connection } from "@/lib/mail/imap";
import { authorizedMailUser, mailDatabase } from "@/lib/mail/supabase-server";
import { isJobStage } from "@/lib/job-stages";
import type { MailCategory, MailObservation } from "@/lib/mail/analysis";

export const runtime = "nodejs";
export const maxDuration = 60;

function response(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function maskedAddress(address: string) {
  const [name, domain] = address.split("@");
  return `${name.slice(0, 2)}***@${domain}`;
}

export async function GET(request: Request) {
  try {
    const user = await authorizedMailUser(request);
    if (!user) return response({ error: "请先登录" }, 401);
    const database = mailDatabase();
    const { data, error } = await database.from("mail_connections").select("address, connected_at").eq("user_id", user.id).maybeSingle();
    if (error) throw error;
    if (!data) return response({ connected: false, address: null, connectedAt: null, observations: [], decisions: [], processed: 0, oversized: 0, categories: {} });
    const [batchesResult, decisionsResult] = await Promise.all([
      database.from("mail_scan_batches").select("uid_validity,uid_start,processed,oversized,categories,observations,scanned_at").eq("user_id", user.id).order("scanned_at", { ascending: true }),
      database.from("mail_review_decisions").select("uid_validity,uid,status,job_id,target_stage").eq("user_id", user.id),
    ]);
    if (batchesResult.error || decisionsResult.error) throw batchesResult.error ?? decisionsResult.error;
    const categories: Record<MailCategory, number> = { assessment: 0, written_test: 0, interview: 0, offer: 0, rejection: 0, application: 0, recruitment_other: 0, other: 0 };
    const observations = new Map<string, MailObservation & { uidValidity: string }>();
    let processed = 0;
    let oversized = 0;
    for (const batch of batchesResult.data ?? []) {
      processed += batch.processed;
      oversized += batch.oversized;
      for (const category of Object.keys(categories) as MailCategory[]) categories[category] += Number(batch.categories?.[category] ?? 0);
      for (const mail of (batch.observations ?? []) as MailObservation[]) observations.set(`${batch.uid_validity}:${mail.uid}`, { ...mail, uidValidity: batch.uid_validity });
    }
    return response({ connected: true, address: maskedAddress(data.address), connectedAt: data.connected_at, observations: [...observations.values()], decisions: (decisionsResult.data ?? []).map((item) => ({ uidValidity: item.uid_validity, uid: item.uid, status: item.status, jobId: item.job_id, targetStage: item.target_stage })), processed, oversized, categories });
  } catch {
    return response({ error: "邮箱服务暂时不可用" }, 503);
  }
}

export async function POST(request: Request) {
  try {
    const user = await authorizedMailUser(request);
    if (!user) return response({ error: "请先登录" }, 401);
    const input = await request.json().catch(() => null);
    if (!input || typeof input !== "object") return response({ error: "请求格式无效" }, 400);
    const action = input.action;
    const database = mailDatabase();
    if (action === "connect") {
      const address = String(input.address ?? "").trim().toLowerCase();
      const credential = String(input.credential ?? "").trim();
      if (!/^[^\s@]+@163\.com$/.test(address) || !credential || credential.length > 256) {
        return response({ error: "请输入 163 邮箱和客户端授权密码" }, 400);
      }
      try { await verify163Connection(address, credential); }
      catch { return response({ error: "连接失败。请检查 IMAP 已开启、授权密码正确，并稍后重试" }, 400); }
      const { error: clearError } = await database.from("mail_scan_batches").delete().eq("user_id", user.id);
      if (clearError) throw clearError;
      const { error: decisionsError } = await database.from("mail_review_decisions").delete().eq("user_id", user.id);
      if (decisionsError) throw decisionsError;
      const { error } = await database.from("mail_connections").upsert({
        user_id: user.id, address, credential_ciphertext: encryptCredential(credential), updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      return response({ connected: true, address: maskedAddress(address) });
    }
    if (action === "disconnect") {
      const { error: clearError } = await database.from("mail_scan_batches").delete().eq("user_id", user.id);
      if (clearError) throw clearError;
      const { error: decisionsError } = await database.from("mail_review_decisions").delete().eq("user_id", user.id);
      if (decisionsError) throw decisionsError;
      const { error } = await database.from("mail_connections").delete().eq("user_id", user.id);
      if (error) throw error;
      return response({ connected: false });
    }
    if (action === "scan") {
      const cursor = Number(input.cursor);
      if (!Number.isSafeInteger(cursor) || cursor < 1) return response({ error: "扫描位置无效" }, 400);
      const { data, error } = await database.from("mail_connections").select("address, credential_ciphertext").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      if (!data) return response({ error: "请先连接邮箱" }, 409);
      try {
        const batch = await scan163Batch(data.address, decryptCredential(data.credential_ciphertext), cursor);
        const { error: saveError } = await database.from("mail_scan_batches").upsert({
          user_id: user.id,
          uid_validity: batch.uidValidity,
          uid_start: cursor,
          uid_next: batch.nextUid,
          processed: batch.processed,
          oversized: batch.oversized,
          categories: batch.categories,
          observations: batch.observations,
          scanned_at: new Date().toISOString(),
        });
        if (saveError) throw saveError;
        return response(batch);
      }
      catch { return response({ error: "读取邮件失败。请检查连接状态并重试" }, 502); }
    }
    if (action === "decision") {
      const uidValidity = String(input.uidValidity ?? "");
      const uid = Number(input.uid);
      const status = input.status;
      const jobId = typeof input.jobId === "string" ? input.jobId.trim() : null;
      const targetStage = input.targetStage;
      if (!/^\d{1,30}$/.test(uidValidity) || !Number.isSafeInteger(uid) || uid < 1 || (status !== "applied" && status !== "ignored")) return response({ error: "处理决定无效" }, 400);
      if (status === "applied" && (!jobId || jobId.length > 128 || !isJobStage(targetStage))) return response({ error: "请选择岗位和目标阶段" }, 400);
      const { data: batches, error: batchError } = await database.from("mail_scan_batches").select("observations").eq("user_id", user.id).eq("uid_validity", uidValidity);
      if (batchError) throw batchError;
      if (!(batches ?? []).some((batch) => (batch.observations as MailObservation[]).some((item) => item.uid === uid))) return response({ error: "找不到这封邮件，请重新扫描" }, 404);
      const { error } = await database.from("mail_review_decisions").upsert({
        user_id: user.id, uid_validity: uidValidity, uid, status,
        job_id: status === "applied" ? jobId : null,
        target_stage: status === "applied" ? targetStage : null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      return response({ saved: true });
    }
    return response({ error: "未知操作" }, 400);
  } catch {
    return response({ error: "邮箱服务暂时不可用" }, 503);
  }
}
