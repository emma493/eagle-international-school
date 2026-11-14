import React, { useEffect, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { apiJson } from "@/lib/api";
import { auth } from "@/firebase/config";
import { useLiveSignal } from "@/hooks/useLiveSignal";
import { NAV } from "@/components/layout/nav";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Icon } from "@/components/ui/icons";

export default function TeacherPage() {
  const [cash, setCash] = useState<number | null>(null);
  const load = useCallback(() => { apiJson("/api/dashboard").then((d) => setCash(d.cash_in_hand)).catch(() => {}); }, []);
  useEffect(load, [load]);
  useLiveSignal(auth.currentUser ? `teacher_${auth.currentUser.uid}` : null, load);
  return (
    <PageContainer size="narrow">
      <PageHeader title="Teacher portal" />
      <div className="card mb-4 p-5 shadow-card">
        <p className="text-meta font-semibold text-text-secondary">Cash in hand to reconcile</p>
        <p className="text-display font-bold tabular-nums text-brand-blue">GHS {cash == null ? "—" : cash.toFixed(2)}</p>
        <p className="text-meta text-text-secondary">Hand this to the headmaster to clear it.</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {NAV.teacher.slice(1).map((i) => (
          <Link key={i.path} to={i.path} className="btn-secondary inline-flex items-center justify-center gap-2 text-center">
            <Icon name={i.icon} size={20} /> {i.label}
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
