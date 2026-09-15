"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft, Building2, Pencil, Plus, Settings2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useJobfindStore } from "@/hooks/use-jobfind-store";
import { COMPANY_CITY_LABELS, COMPANY_TIER_LABELS, getCompanyCities, getCompanyTier, isJobApplied, type Company, type CompanyCity, type CompanyPoolView, type CompanyTier } from "@/lib/company-pool";
import { JOB_STAGE_LABELS } from "@/lib/job-stages";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "unapplied" | "applied";

const cities = Object.keys(COMPANY_CITY_LABELS) as CompanyCity[];
const tiers = Object.keys(COMPANY_TIER_LABELS) as CompanyTier[];

function companyMatches(company: Company, query: string): boolean {
  const normalized = query.trim().toLocaleLowerCase("zh-CN");
  return !normalized || [company.name, ...company.aliases].some((item) => item.toLocaleLowerCase("zh-CN").includes(normalized));
}

function CompanyEditor({ company, onDone }: { company?: Company; onDone: () => void }) {
  const { addCompany, updateCompany } = useJobfindStore();
  const [name, setName] = useState(company?.name ?? "");
  const [aliases, setAliases] = useState(company?.aliases.join("，") ?? "");
  const [tier, setTier] = useState<CompanyTier>(company ? getCompanyTier(company) : "tier_3");
  const [selectedCities, setSelectedCities] = useState<CompanyCity[]>(company ? getCompanyCities(company) : []);

  const toggleCity = (city: CompanyCity) => setSelectedCities((current) => current.includes(city) ? current.filter((item) => item !== city) : [...current, city]);
  const save = () => {
    const nextName = name.trim();
    if (!nextName || selectedCities.length === 0) return;
    const next = {
      name: nextName,
      aliases: aliases.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean),
      tags: { ...(company?.tags ?? {}), city: selectedCities, tier: [tier] },
      archived: company?.archived,
    };
    if (company) updateCompany(company.id, next); else addCompany(next);
    onDone();
  };

  return <div className="space-y-4 py-1">
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-1.5 text-sm font-medium">正式名称<Input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：阿里巴巴" /></label>
      <label className="space-y-1.5 text-sm font-medium">主梯队<select value={tier} onChange={(event) => setTier(event.target.value as CompanyTier)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">{tiers.map((item) => <option key={item} value={item}>{COMPANY_TIER_LABELS[item]}</option>)}</select></label>
    </div>
    <label className="block space-y-1.5 text-sm font-medium">别名 <span className="font-normal text-slate-500">（逗号分隔）</span><Input value={aliases} onChange={(event) => setAliases(event.target.value)} placeholder="例如：阿里，Alibaba" /></label>
    <fieldset className="space-y-2"><legend className="text-sm font-medium">覆盖城市</legend><div className="flex flex-wrap gap-2">{cities.map((city) => <label key={city} className="flex cursor-pointer items-center gap-1.5 rounded-md border border-white/60 bg-white/35 px-2.5 py-1.5 text-sm text-slate-700"><input type="checkbox" checked={selectedCities.includes(city)} onChange={() => toggleCity(city)} />{COMPANY_CITY_LABELS[city]}</label>)}</div></fieldset>
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onDone}>取消</Button><Button type="button" disabled={!name.trim() || selectedCities.length === 0} onClick={save}>保存</Button></div>
  </div>;
}

export function CompanyPoolDialog() {
  const {
    companies,
    jobs,
    updateCompany,
    isCompanyPoolOpen,
    companyPoolSelectedCompanyId,
    dismissCompanyPool,
    setCompanyPoolSelectedCompanyId,
    openCompanyPoolJob,
  } = useJobfindStore();
  const [view, setView] = useState<CompanyPoolView>("city");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [manageMode, setManageMode] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | "new" | null>(null);

  const activeCompanies = useMemo(() => companies.filter((company) => !company.archived), [companies]);
  const jobsByCompany = useMemo(() => new Map(activeCompanies.map((company) => [company.id, jobs.filter((job) => job.companyId === company.id)])), [activeCompanies, jobs]);
  const selectedCompany = activeCompanies.find((company) => company.id === companyPoolSelectedCompanyId) ?? null;
  const selectedAppliedJobs = selectedCompany ? (jobsByCompany.get(selectedCompany.id) ?? []).filter(isJobApplied) : [];

  const visibleCompanies = activeCompanies.filter((company) => {
    const applied = (jobsByCompany.get(company.id) ?? []).some(isJobApplied);
    return companyMatches(company, query) && (status === "all" || status === (applied ? "applied" : "unapplied"));
  });

  const groups = useMemo(() => {
    if (view === "tier") return tiers.map((tier) => ({ key: tier, label: COMPANY_TIER_LABELS[tier], companies: visibleCompanies.filter((company) => getCompanyTier(company) === tier) })).filter((group) => group.companies.length > 0);
    return cities.map((city) => ({ key: city, label: COMPANY_CITY_LABELS[city], companies: visibleCompanies.filter((company) => getCompanyCities(company).includes(city)) })).filter((group) => group.companies.length > 0);
  }, [view, visibleCompanies]);

  const close = () => { setManageMode(false); setEditingCompanyId(null); dismissCompanyPool(); };

  const openJob = (jobId: string) => { openCompanyPoolJob(jobId); };

  return <Dialog open={isCompanyPoolOpen} onOpenChange={(nextOpen) => !nextOpen && close()}>
    <DialogContent className="!flex h-[min(46rem,calc(100dvh-2rem))] max-w-[calc(100%-2rem)] flex-col overflow-hidden p-0 sm:max-w-5xl">
      <DialogHeader className="shrink-0 border-b border-white/60 px-6 py-5 pr-14">
        <div className="flex items-center justify-between gap-3">
          <div>
            <DialogTitle className="flex items-center gap-2"><Building2 className="size-5 text-slate-600" />公司池</DialogTitle>
            <DialogDescription className="mt-1">浏览目标公司；投递状态仅供识别，不代表需要全部投递。</DialogDescription>
          </div>
          {!selectedCompany && !manageMode ? <Button type="button" variant="outline" size="sm" onClick={() => setManageMode(true)}><Settings2 className="size-3.5" />管理名单</Button> : <Button type="button" variant="ghost" size="sm" onClick={() => { setCompanyPoolSelectedCompanyId(null); setManageMode(false); setEditingCompanyId(null); }}><ArrowLeft className="size-3.5" />返回名单</Button>}
        </div>
      </DialogHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {selectedCompany ? <section className="space-y-5">
          <div><h3 className="text-lg font-semibold text-slate-950">{selectedCompany.name}</h3><div className="mt-2 flex flex-wrap gap-2"><Badge variant="outline">{COMPANY_TIER_LABELS[getCompanyTier(selectedCompany)]}</Badge>{getCompanyCities(selectedCompany).map((city) => <Badge key={city} variant="outline">{COMPANY_CITY_LABELS[city]}</Badge>)}</div></div>
          <div><h4 className="text-sm font-semibold text-slate-950">已投递岗位</h4>{selectedAppliedJobs.length ? <div className="mt-3 space-y-2">{selectedAppliedJobs.map((job) => <button key={job.id} type="button" onClick={() => openJob(job.id)} className="flex w-full items-center justify-between rounded-lg border border-white/60 bg-white/36 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-white/60 hover:shadow-[0_12px_24px_rgba(74,66,94,0.08)]"><span><span className="block text-sm font-medium text-slate-950">{job.position}</span><span className="mt-0.5 block text-xs text-slate-500">{job.appliedDate ? `投递于 ${job.appliedDate.slice(0, 10)}` : "已进入投递流程"}</span></span><Badge variant="outline">{JOB_STAGE_LABELS[job.stage]}</Badge></button>)}</div> : <p className="mt-3 text-sm text-slate-500">还没有已投递岗位。</p>}</div>
        </section> : manageMode ? <section className="space-y-4">
          {editingCompanyId !== null ? <CompanyEditor company={editingCompanyId === "new" ? undefined : activeCompanies.find((company) => company.id === editingCompanyId)} onDone={() => setEditingCompanyId(null)} /> : <>
            <div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold text-slate-950">维护公司名单</h3><p className="mt-1 text-xs text-slate-500">修改别名不会改写已录入的岗位名称。</p></div><Button type="button" size="sm" onClick={() => setEditingCompanyId("new")}><Plus className="size-3.5" />新增公司</Button></div>
            <div className="space-y-2">{activeCompanies.map((company) => <div key={company.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/55 bg-white/30 px-3 py-2.5"><div className="min-w-0"><p className="text-sm font-medium text-slate-950">{company.name}</p><p className="truncate text-xs text-slate-500">{COMPANY_TIER_LABELS[getCompanyTier(company)]} · {getCompanyCities(company).map((city) => COMPANY_CITY_LABELS[city]).join("、")}{company.aliases.length ? ` · 别名：${company.aliases.join("、")}` : ""}</p></div><div className="flex shrink-0 gap-1"><Button type="button" variant="ghost" size="icon-xs" aria-label={`编辑 ${company.name}`} onClick={() => setEditingCompanyId(company.id)}><Pencil className="size-3.5" /></Button><Button type="button" variant="ghost" size="sm" className="text-slate-500" onClick={() => updateCompany(company.id, { archived: true })}>归档</Button></div></div>)}</div>
          </>}</section> : <>
          <div className="flex flex-col gap-3 border-b border-white/55 pb-4 sm:flex-row sm:items-center">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索公司或别名" className="bg-white/45 sm:max-w-xs" />
            <div role="group" aria-label="公司池分组" className="flex rounded-lg border border-white/60 bg-white/30 p-1">{([['city', '按地区'], ['tier', '按梯队']] as const).map(([value, label]) => <Button key={value} type="button" size="sm" variant={view === value ? "default" : "ghost"} className={view === value ? "bg-slate-950 shadow-none" : "text-slate-600"} onClick={() => setView(value)}>{label}</Button>)}</div>
            <div role="group" aria-label="公司投递状态" className="flex rounded-lg border border-white/60 bg-white/30 p-1">{([['all', '全部'], ['unapplied', '未投递'], ['applied', '已投递']] as const).map(([value, label]) => <Button key={value} type="button" size="sm" variant={status === value ? "default" : "ghost"} className={status === value ? "bg-slate-950 shadow-none" : "text-slate-600"} onClick={() => setStatus(value)}>{label}</Button>)}</div>
          </div>
          <TooltipProvider delayDuration={500}><div className="space-y-6 pt-5">{groups.map((group) => <section key={group.key}><h3 className="text-sm font-semibold text-slate-800">{group.label}</h3><div className="mt-3 flex flex-wrap gap-2">{group.companies.map((company) => {
            const linkedJobs = jobsByCompany.get(company.id) ?? [];
            const applied = linkedJobs.some(isJobApplied);
            const secondaryTags = view === "city" ? [COMPANY_TIER_LABELS[getCompanyTier(company)]] : getCompanyCities(company).map((city) => COMPANY_CITY_LABELS[city]);
            const content = <><span>{company.name}</span><span className={cn("text-[10px]", applied ? "text-white/70" : "text-slate-500")}>{secondaryTags.join(" · ")}</span></>;
            return <Tooltip key={company.id}><TooltipTrigger asChild>{applied ? <button type="button" onClick={() => setCompanyPoolSelectedCompanyId(company.id)} className="company-pool-chip company-pool-chip-applied">{content}</button> : <span className="company-pool-chip company-pool-chip-unapplied">{content}</span>}</TooltipTrigger><TooltipContent sideOffset={8}><p>{company.name} · {applied ? "已投递" : "未投递"}</p><p className="mt-1 text-white/70">{linkedJobs.length ? `${linkedJobs.length} 个已记录岗位` : "暂未记录岗位"}</p></TooltipContent></Tooltip>;
          })}</div></section>)}{groups.length === 0 ? <p className="py-12 text-center text-sm text-slate-500">没有匹配的公司。</p> : null}</div></TooltipProvider>
        </>}
      </div>
    </DialogContent>
  </Dialog>;
}
