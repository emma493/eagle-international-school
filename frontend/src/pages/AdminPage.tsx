import React from "react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default function AdminPage() {
  const cards = [
    ["School branding", "Name, logo, motto, theme colours and maintenance mode.", "/admin/branding", "Configure branding"],
    ["Infrastructure telemetry", "Live Turso storage, row counts and API latency.", "/admin/telemetry", "Open telemetry"],
    ["Accounts & recovery", "Create staff and run emergency password resets.", "/admin/accounts", "Manage accounts"],
  ];
  return (
    <PageContainer>
      <PageHeader title="Admin console" subtitle="System engineering for Eagle International School. School income and parent contacts are not shown here." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map(([t, p, to, b]) => (
          <div key={t} className="card p-6 shadow-card">
            <h2 className="mb-2 text-body-lg font-bold text-text-primary">{t}</h2>
            <p className="mb-4 text-meta text-text-secondary">{p}</p>
            <Link to={to} className="btn-primary inline-flex w-full items-center justify-center text-center">{b}</Link>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
