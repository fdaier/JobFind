"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Inbox, Mail, RefreshCw, ShieldCheck, X } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mailAuthClient } from "@/lib/mail/supabase-browser";
import type { MailCategory, MailObservation } from "@/lib/mail/analysis";

type ScanBatch = {
  nextUid: number;
  uidNext: number;
  processed: number;
  oversized: number;
  categories: Record<MailCategory, number>;
  observations: MailObservation[];
};

const CATEGORY_LABELS: Record<MailCategory, string> = {
  assessment: "测评", written_test: "笔试", interview: "面试", offer: "录用", rejection: "未通过",
  application: "投递回执", recruitment_other: "其他招聘信息", other: "其他邮件",
};
const CATEGORY_ORDER: MailCategory[] = ["assessment", "written_test", "interview", "offer", "rejection", "application", "recruitment_other", "other"];

function emptyCounts(): Record<MailCategory, number> {
  return { assessment: 0, written_test: 0, interview: 0, offer: 0, rejection: 0, application: 0, recruitment_other: 0, other: 0 };
}

function displayDate(value: string | null) {
  return value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "时间未知";
}

export default function MailPage() {
  const auth = useMemo(() => mailAuthClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [credential, setCredential] = useState("");
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [working, setWorking] = useState(false);
  const [scanRunning, setScanRunning] = useState(false);
  const [notice, setNotice] = useState("");
  const [cursor, setCursor] = useState(1);
  const [uidNext, setUidNext] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [oversized, setOversized] = useState(0);
  const [counts, setCounts] = useState(emptyCounts);
  const [observations, setObservations] = useState<MailObservation[]>([]);
  const stopped = useRef(false);

  useEffect(() => {
    if (!auth) { setCheckingAuth(false); return; }
    let active = true;
    const callbackCode = new URLSearchParams(window.location.search).get("code");
    const initialize = async () => {
      if (callbackCode) {
        const { error } = await auth.auth.exchangeCodeForSession(callbackCode);
        if (error && active) setNotice("登录链接无效或已过期，请重新获取。 ");
        window.history.replaceState({}, "", window.location.pathname);
      }
      const { data } = await auth.auth.getSession();
      if (active) { setSession(data.session); setCheckingAuth(false); }
    };
    void initialize();
    const { data } = auth.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [auth]);

  const request = useCallback(async <T,>(method: "GET" | "POST", action?: Record<string, unknown>): Promise<T> => {
    if (!auth) throw new Error("邮箱服务尚未配置");
    const { data } = await auth.auth.getSession();
    if (!data.session) throw new Error("登录已过期，请重新登录");
    const response = await fetch("/api/mail", {
      method,
      headers: { Authorization: `Bearer ${data.session.access_token}`, ...(action ? { "Content-Type": "application/json" } : {}) },
      body: action ? JSON.stringify(action) : undefined,
      cache: "no-store",
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "请求失败");
    return result as T;
  }, [auth]);

  useEffect(() => {
    if (!session) { setConnectedAddress(null); return; }
    let active = true;
    setCheckingConnection(true);
    request<{ connected: boolean; address: string | null }>("GET")
      .then((result) => { if (active) setConnectedAddress(result.connected ? result.address : null); })
      .catch((error) => { if (active) setNotice(error instanceof Error ? error.message : "连接状态读取失败"); })
      .finally(() => { if (active) setCheckingConnection(false); });
    return () => { active = false; };
  }, [request, session]);

  async function sendLoginLink() {
    if (!auth || !email.trim()) return;
    setWorking(true); setNotice("");
    const { error } = await auth.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/mail` } });
    setNotice(error ? "登录邮件发送失败。当前请使用你的 Supabase 团队账号邮箱。" : "登录链接已发到你的邮箱，请在当前浏览器打开。 ");
    setWorking(false);
  }

  async function connectMailbox() {
    setWorking(true); setNotice("");
    try {
      const result = await request<{ address: string }>("POST", { action: "connect", address, credential });
      setConnectedAddress(result.address);
      setCredential("");
      setNotice("163 邮箱连接成功。现在可以扫描全部收件箱邮件。 ");
    } catch (error) { setNotice(error instanceof Error ? error.message : "连接失败"); }
    setWorking(false);
  }

  async function disconnectMailbox() {
    if (!window.confirm("断开 163 邮箱并删除保存的客户端授权密码？")) return;
    stopped.current = true;
    setWorking(true); setNotice("");
    try {
      await request("POST", { action: "disconnect" });
      setConnectedAddress(null); setObservations([]); setCounts(emptyCounts()); setCursor(1); setUidNext(0); setProcessed(0);
      setNotice("邮箱已断开，服务端授权密码已删除。 ");
    } catch (error) { setNotice(error instanceof Error ? error.message : "断开失败"); }
    setWorking(false);
  }

  async function scanAll(reset: boolean) {
    stopped.current = false;
    setScanRunning(true); setNotice("");
    let next = reset ? 1 : cursor;
    if (reset) { setCounts(emptyCounts()); setObservations([]); setProcessed(0); setOversized(0); setUidNext(0); setCursor(1); }
    try {
      while (!stopped.current) {
        const batch = await request<ScanBatch>("POST", { action: "scan", cursor: next });
        setUidNext(batch.uidNext);
        setProcessed((value) => value + batch.processed);
        setOversized((value) => value + batch.oversized);
        setCounts((value) => {
          const updated = { ...value };
          for (const category of CATEGORY_ORDER) updated[category] += batch.categories[category] ?? 0;
          return updated;
        });
        setObservations((value) => [...value, ...batch.observations]);
        next = batch.nextUid;
        setCursor(next);
        if (next >= batch.uidNext) { setNotice("全量扫描完成。下面是邮件类型与招聘通知样本。 "); break; }
      }
    } catch (error) { setNotice(error instanceof Error ? error.message : "扫描中断，可继续扫描"); }
    setScanRunning(false);
  }

  const topDomains = useMemo(() => {
    const map = new Map<string, number>();
    for (const observation of observations) if (observation.senderDomain) map.set(observation.senderDomain, (map.get(observation.senderDomain) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [observations]);

  return <div className="mx-auto w-full max-w-5xl space-y-8 pb-12">
    <header className="border-b border-slate-200/70 pb-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600"><Inbox className="size-4" /> JobFind · 邮件</div>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">状态收件箱</h1>
      <p className="mt-2 text-sm text-slate-600">连接 163 邮箱并扫描收件箱，先了解招聘通知的真实写法。</p>
    </header>

    {!auth ? <section className="border-b border-slate-200/70 pb-6 text-sm text-slate-600">邮箱服务尚未配置，现有看板仍可照常使用。</section> : checkingAuth ? <p className="text-sm text-slate-600">正在检查登录状态…</p> : !session ?
      <section className="max-w-xl space-y-4 border-b border-slate-200/70 pb-8">
        <div className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="size-5 text-indigo-600" />先登录 JobFind</div>
        <p className="text-sm text-slate-600">当前试用版请使用你加入 Supabase 团队的账号邮箱接收登录链接。登录后再连接要扫描的 163 邮箱。</p>
        <div className="flex flex-col gap-2 sm:flex-row"><Input aria-label="登录邮箱" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="你的邮箱地址" /><Button disabled={working || !email.trim()} onClick={sendLoginLink}>发送登录链接</Button></div>
      </section> : <>
      <section className="border-b border-slate-200/70 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-semibold">163 邮箱连接</h2><p className="mt-1 text-sm text-slate-600">已登录 {session.user.email}</p></div>
          <Button variant="ghost" size="sm" onClick={() => auth.auth.signOut()}>退出登录</Button>
        </div>
        {checkingConnection ? <p className="mt-5 text-sm text-slate-500">正在读取连接状态…</p> : connectedAddress ?
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-emerald-900"><CheckCircle2 className="size-4" />已连接 {connectedAddress}</div>
            <Button variant="ghost" size="sm" disabled={working || scanRunning} onClick={disconnectMailbox}><X className="size-4" />断开</Button>
          </div> : <div className="mt-5 space-y-4">
            <p className="max-w-2xl text-sm leading-6 text-slate-600">先在 163 邮箱网页端开启 IMAP 并生成“客户端授权密码”，然后填在这里。请勿输入网页端登录密码。授权密码只在连接时提交，页面不会回显。</p>
            <div className="grid max-w-2xl gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className="space-y-1.5 text-sm font-medium">163 邮箱地址<Input type="email" autoComplete="email" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="name@163.com" /></label>
              <label className="space-y-1.5 text-sm font-medium">客户端授权密码<Input type="password" autoComplete="off" value={credential} onChange={(event) => setCredential(event.target.value)} /></label>
              <Button disabled={working || !address || !credential} onClick={connectMailbox}>{working ? "连接中…" : "连接邮箱"}</Button>
            </div>
          </div>}
      </section>

      {connectedAddress ? <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h2 className="text-lg font-semibold">邮件样式扫描</h2><p className="mt-1 text-sm text-slate-600">从收件箱第一封开始分批读取，包含已读邮件；不会修改邮件状态。大于 1 MB 的邮件只分析标题。</p></div>
          <div className="flex gap-2">
            {scanRunning ? <Button variant="outline" onClick={() => { stopped.current = true; }}>暂停</Button> : <Button onClick={() => void scanAll(cursor === 1)}><RefreshCw className="size-4" />{cursor > 1 && cursor < uidNext ? "继续扫描" : "扫描全部邮件"}</Button>}
          </div>
        </div>
        {(processed > 0 || scanRunning) ? <>
          <div className="border-y border-slate-200/70 py-4 text-sm text-slate-600" aria-live="polite">
            已扫描 <strong className="text-slate-950">{processed}</strong> 封 · UID 进度 {Math.min(cursor, uidNext)} / {uidNext || "…"}{oversized ? ` · ${oversized} 封大邮件仅检查标题` : ""}
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {CATEGORY_ORDER.map((category) => <div key={category} className="border-b border-slate-200/70 py-2"><div className="text-xs text-slate-500">{CATEGORY_LABELS[category]}</div><div className="mt-1 text-2xl font-semibold tabular-nums">{counts[category]}</div></div>)}
          </div>
          <div className="border-t border-slate-200/70 pt-5"><h3 className="font-semibold">招聘邮件常见发件域名</h3><p className="mt-2 text-sm text-slate-600">{topDomains.length ? topDomains.map(([domain, count]) => `${domain}（${count}）`).join("、") : "扫描后显示"}</p></div>
          <div className="border-t border-slate-200/70 pt-5"><h3 className="font-semibold">候选招聘邮件</h3><p className="mt-1 text-xs text-slate-500">仅展示主题和简短文字摘要，完整正文不会保存到 JobFind。</p>
            <div className="mt-3 divide-y divide-slate-200/70">
              {observations.slice(0, 200).map((item) => <div key={item.uid} className="grid gap-1 py-3 text-sm sm:grid-cols-[6rem_1fr] sm:gap-4"><span className="font-medium text-indigo-700">{CATEGORY_LABELS[item.category]}</span><div className="min-w-0"><p className="font-medium text-slate-900">{item.subject || "无主题"}</p><p className="mt-1 text-xs text-slate-500">{item.senderDomain || item.sender} · {displayDate(item.date)}</p>{item.snippet ? <p className="mt-1 truncate text-xs text-slate-600">{item.snippet}</p> : null}</div></div>)}
            </div>
            {observations.length > 200 ? <p className="mt-3 text-xs text-slate-500">共识别 {observations.length} 封候选邮件，页面展示前 200 封。</p> : null}
          </div>
        </> : null}
      </section> : null}
    </>}
    {notice ? <p className="flex items-center gap-2 rounded-md bg-white/55 px-3 py-2 text-sm text-slate-700" role="status"><Mail className="size-4 shrink-0" />{notice}</p> : null}
  </div>;
}
