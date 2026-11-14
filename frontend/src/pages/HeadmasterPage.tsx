import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiJson } from "@/lib/api";
import { NAV } from "@/components/layout/nav";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { Icon } from "@/components/ui/icons";

export default function HeadmasterPage() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { apiJson("/api/dashboard").then(setD).catch(() => {}); }, []);
  const money = (n?: number) => (n == null ? "—" : `GHS ${n.toFixed(2)}`);
  const stats: [string, string | number, string][] = [
    ["Students", d?.students ?? "—", ""],
    ["Teachers", d?.teachers ?? "—", ""],
    ["Fees owing", money(d?.fees_owing), "text-status-problem-text"],
    ["Cash to reconcile", money(d?.cash_to_reconcile), "text-brand-blue"],
  ];
  return (
    <PageContainer>
      <PageHeader title="Headmaster portal" subtitle="School operations for Eagle International School" />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, tone]) => (
          <div key={label} className="card p-5 shadow-card">
            <p className="mb-1 text-meta font-semibold text-text-secondary">{label}</p>
            <p className={`text-display font-bold tabular-nums ${tone}`}>{value}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Quick actions">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NAV.headmaster.slice(1).map((i) => (
            <Link key={i.path} to={i.path} className="btn-secondary inline-flex items-center justify-center gap-2 text-center">
              <Icon name={i.icon} size={20} /> {i.label}
            </Link>
          ))}
        </div>
      </SectionCard>
    </PageContainer>
  );
}
