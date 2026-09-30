import { decryptCredential, encryptCredential } from "@/lib/mail/crypto";
import { scan163Batch, verify163Connection } from "@/lib/mail/imap";
import { authorizedMailUser, mailDatabase } from "@/lib/mail/supabase-server";

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
    const { data, error } = await mailDatabase().from("mail_connections").select("address, connected_at").eq("user_id", user.id).maybeSingle();
    if (error) throw error;
    return response({ connected: Boolean(data), address: data ? maskedAddress(data.address) : null, connectedAt: data?.connected_at ?? null });
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
      const { error } = await database.from("mail_connections").upsert({
        user_id: user.id, address, credential_ciphertext: encryptCredential(credential), updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      return response({ connected: true, address: maskedAddress(address) });
    }
    if (action === "disconnect") {
      const { error: clearError } = await database.from("mail_scan_batches").delete().eq("user_id", user.id);
      if (clearError) throw clearError;
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
    return response({ error: "未知操作" }, 400);
  } catch {
    return response({ error: "邮箱服务暂时不可用" }, 503);
  }
}
