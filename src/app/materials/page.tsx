"use client";

import React from "react";

import { PageHeader } from "@/components/layout/page-header";
import { MaterialList } from "@/components/materials/material-list";

export default function MaterialsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="材料中心"
        description="Agent 会把材料版本、绑定岗位和缺口放在一起看，优先补齐最影响推进的材料。"
      />
      <MaterialList />
    </div>
  );
}
