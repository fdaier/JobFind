import { describe, expect, it } from "vitest";

import { createMockJobs } from "./mock-data";
import { createSeedCompanies, getCompanyCities, getCompanyTier, isJobApplied, resolveCompanyId } from "./company-pool";

describe("company pool", () => {
  const companies = createSeedCompanies();

  it("merges explicit aliases while keeping a company-wide city list", () => {
    const alibabaId = resolveCompanyId("阿里巴巴", companies);
    expect(resolveCompanyId("阿里", companies)).toBe(alibabaId);
    const alibaba = companies.find((company) => company.id === alibabaId);
    expect(alibaba).toBeDefined();
    expect(getCompanyTier(alibaba!)).toBe("tier_1");
    expect(getCompanyCities(alibaba!)).toEqual(expect.arrayContaining(["beijing", "hangzhou", "chengdu"]));
  });

  it("does not use a partial-name match as a binding", () => {
    expect(resolveCompanyId("腾讯云", companies)).not.toBe(resolveCompanyId("腾讯", companies));
  });

  it("treats a job outside 待投递 as submitted", () => {
    const [submitted, , , , pending] = createMockJobs(new Date("2026-09-16T08:00:00.000Z"));
    expect(isJobApplied(submitted)).toBe(true);
    expect(isJobApplied(pending)).toBe(false);
  });
});
