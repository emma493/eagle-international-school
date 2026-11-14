import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { apiJson } from "@/lib/api";
import { useLiveSignal } from "@/hooks/useLiveSignal";

import { Icon } from "@/components/ui/icons";
import { PageContainer } from "@/components/layout/PageContainer";
const CAT: Record<string, string> = { school_fees: "School fees", printing_fees: "Printing fees", books: "Books", canteen: "Canteen", dues: "Dues" };
const money = (n: number) => `GHS ${Number(n || 0).toFixed(2)}`;

export default function ParentPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [child, setChild] = useState<any>(null);
  const [sheet, setSheet] = useState(false);
  const [o, setO] = useState<any>(null);
  const [tab, setTab] = useState<"balance" | "attendance" | "books" | "canteen">("balance");

  useEffect(() => { apiJson("/api/parent/children").then((r) => { setChildren(r.children); setChild(r.children[0] || null); }).catch(() => {}); }, []);
  const load = useCallback(() => { if (child) apiJson(`/api/parent/overview/${child.id}`).then(setO).catch(() => {}); }, [child]);
  useEffect(load, [load]);
  useLiveSignal(child ? `student_${child.id}` : null, load); // zero-refresh updates

  if (!child) return (
    <PageContainer size="narrow">
      <h1 className="sr-only">My child</h1>
      <p className="text-text-secondary">No children are linked to this account yet. Please contact the school.</p>
    </PageContainer>
  );
  const tabs: [typeof tab, string][] = [["balance", "Balance"], ["attendance", "Attendance"], ["books", "Books"], ["canteen", "Canteen"]];

  return (
    <PageContainer size="narrow">
      <h1 className="sr-only">My child</h1>
      <button onClick={() => children.length > 1 && setSheet(true)} className="card p-3 shadow-card w-full flex items-center gap-3 mb-4 text-left">
        <div className="w-10 h-10 rounded-full bg-neutral-secondary overflow-hidden flex-shrink-0">{child.photo_url && <img src={child.photo_url} className="w-full h-full object-cover" alt="" />}</div>
        <div className="flex-1"><p className="font-semibold text-sm flex items-center gap-1">{child.full_name}{children.length > 1 && <Icon name="chevron-down" size={16} />}</p><p className="text-text-secondary text-xs">{child.class_name} • {child.admission_no}</p></div>
      </button>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card p-4 shadow-card"><p className="text-text-secondary text-xs font-semibold">Total debt</p><p className="text-2xl font-bold text-status-problem-text">{o ? money(o.total_debt) : "—"}</p></div>
        <div className="card p-4 shadow-card"><p className="text-text-secondary text-xs font-semibold">Surplus credit</p><p className="text-2xl font-bold text-success-green">{o ? money(o.surplus_credit) : "—"}</p></div>
      </div>
      <div className="flex gap-2 mb-3 overflow-x-auto">{tabs.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={tab === k ? "btn-primary h-9 px-4 text-xs" : "btn-secondary h-9 px-4 text-xs"}>{l}</button>)}</div>
      <div className="card p-4 shadow-card mb-4 text-sm">
        {!o ? "Loading…" : tab === "balance" ? (<>
          {Object.keys(o.by_category).length === 0 ? <p className="text-text-secondary">Nothing owing. Thank you!</p> :
            Object.entries(o.by_category).map(([k, v]: any) => <div key={k} className="flex justify-between py-2 border-b border-divider"><span>{CAT[k] || k}</span><b>{money(v)}</b></div>)}
          <p className="text-text-secondary text-xs mt-3">Surplus credit can only be applied by the headmaster, with your consent.</p></>)
        : tab === "attendance" ? (o.attendance.length ? o.attendance.map((a: any) => <div key={a.date} className="flex justify-between py-2 border-b border-divider"><span>{a.date}</span><span>{a.status}{a.canteen_credit_awarded ? " (+GHS credit)" : ""}</span></div>) : <p className="text-text-secondary">No attendance recorded yet.</p>)
        : tab === "books" ? (o.books.length ? o.books.map((b: any) => <div key={b.id} className="flex justify-between py-2 border-b border-divider"><span>{b.description}</span><span>{b.status}</span></div>) : <p className="text-text-secondary">No books issued.</p>)
        : (<><p>Prepaid until: <b>{o.canteen_paid_until || "not prepaid"}</b></p><p className="text-text-secondary text-xs mt-2">Absent prepaid days are credited back to your surplus.</p></>)}
      </div>
      <div className="card p-4 shadow-card"><h3 className="font-semibold text-sm mb-2">Terminal reports</h3>
        {o?.reports?.length ? <Link to="/parent/terminal-reports" className="btn-primary w-full text-center">View {o.reports.length} published report(s)</Link> : <p className="text-text-secondary text-xs">No published reports yet.</p>}</div>
      {sheet && <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setSheet(false)}>
        <div className="bg-card w-full rounded-t-2xl p-4" onClick={(e) => e.stopPropagation()}><p className="font-semibold mb-2">Switch child</p>
          {children.map((c) => <button key={c.id} className="w-full text-left p-3 rounded-input hover:bg-neutral-hover" onClick={() => { setChild(c); setO(null); setSheet(false); }}>{c.full_name} <span className="text-text-secondary text-xs">• {c.class_name}</span></button>)}</div></div>}
    </PageContainer>
  );
}
