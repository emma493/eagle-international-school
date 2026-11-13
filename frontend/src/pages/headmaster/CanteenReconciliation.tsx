import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";

export default function CanteenReconciliationPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCollections();
    fetchPendingTotal();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await apiRequest("/api/canteen-collections?reconciliation_status=pending");
      const data = await res.json();
      setCollections(data.collections);
    } catch (err: any) {
      showToast("error", "Failed to load collections", err.message);
    } finally {
      setLoading(false);
  };

  const fetchPendingTotal = async () => {
    try {
      const res = await apiRequest("/api/canteen-collections/reconcile/pending");
      const data = await res.json();
      setPendingTotal(data.pending?.total_amount || 0);
    } catch {
      // Non-fatal
    }
  };

  const reconcileCollection = async (id: string) => {
    setReconciling(true);
    try {
      await apiRequest(`/api/canteen-collections/${id}/reconcile`, {
        method: "PUT",
        body: JSON.stringify({ reconciled_by: "headmaster_uid" }),
      });
      showToast("success", "Reconciled", "Cash received and collection locked");
      await fetchCollections();
      await fetchPendingTotal();
    } catch (err: any) {
      showToast("error", "Failed to reconcile", err.message);
    } finally {
      setReconciling(false);
    }
  };

  const reconcileAll = async () => {
    setReconciling(true);
    try {
      for (const c of collections) {
        await apiRequest(`/api/canteen-collections/${c.id}/reconcile`, {
          method: "PUT",
          body: JSON.stringify({ reconciled_by: "headmaster_uid" }),
        });
      }
      showToast("success", "All Reconciled", `${collections.length} collections confirmed`);
      await fetchCollections();
      await fetchPendingTotal();
    } catch (err: any) {
      showToast("error", "Failed to reconcile all", err.message);
    } finally {
      setReconciling(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-neutral-page min-h-screen p-4">
        <div className="card p-6 shadow-card text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading collections…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-page min-h-screen p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 shadow-card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold">
              R
            </div>
            <h2 className="text-28 font-bold text-text-primary sentence-case">Canteen Reconciliation</h2>
          </div>
          <p className="text-text-secondary">
            Teachers hand over physical cash for pending canteen collections. Review each batch and confirm cash received.
            Once reconciled, records are locked and cannot be modified.
          </p>
        </div>

        {/* Pending total */}
        <div className="card p-6 shadow-card mb-8 bg-brand-blue-tint border border-brand-blue/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-xs font-600 uppercase tracking-wider mb-1">Total Cash to Reconcile</p>
              <p className="text-3xl font-bold text-brand-blue">GHS {pendingTotal.toFixed(2)}</p>
            </div>
            <div className="flex gap-3">
              {collections.length > 0 ? (
                <Button variant="primary" fullWidth disabled={reconciling} onClick={reconcileAll}>
                  {reconciling ? "Reconciling…" : "Confirm All Cash Received"}
                </Button>
              ) : (
                <Button variant="secondary" fullWidth disabled>
                  No Pending Collections
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Collections table */}
        <div className="card p-6 shadow-card overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider">
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider">Student</th>
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider">Teacher</th>
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider">Plan</th>
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider text-right">Amount</th>
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider">Days Covered</th>
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {collections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-text-secondary">
                    No pending canteen collections. All caught up!
                  </td>
                </tr>
              ) : (
                collections.map((c) => (
                  <tr key={c.id} className="border-b border-divider/50 hover:bg-neutral-hover transition-colors">
                    <td className="py-4 text-text-primary">
                      <div className="font-500">{c.student_name}</div>
                      <div className="text-text-secondary text-xs">{c.admission_no}</div>
                    </td>
                    <td className="py-4 text-text-secondary">{c.teacher_name}</td>
                    <td className="py-4 text-text-secondary">{c.plan_type.replace("_", " ").toUpperCase()}</td>
                    <td className="py-4 text-text-primary text-right font-500">
                      GHS {parseFloat(c.amount).toFixed(2)}
                    </td>
                    <td className="py-4 text-text-secondary text-center">{c.days_covered} days</td>
                    <td className="py-4 text-right">
                      <Button
                        variant="secondary"
                        className="text-xs h-32 px-3"
                        onClick={() => reconcileCollection(c.id)}
                        disabled={reconciling}
                      >
                        Confirm Cash Received
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Credit offset info */}
        <div className="mt-8 card p-6 shadow-card">
          <h3 className="text-text-primary font-600 text-sm mb-4 sentence-case">Surplus Credit Offset</h3>
          <p className="text-text-secondary text-sm mb-4">
            Only the Headmaster can apply a student's Surplus Credit (from absent prepaid canteen days)
            toward a fee debt, after obtaining parent consent.
          </p>
          <div className="bg-neutral-hover rounded-input p-4">
            <p className="text-text-secondary text-xs font-600 uppercase tracking-wider mb-2">Coming Soon</p>
            <p className="text-text-secondary text-sm">
              Credit offset interface will allow Headmaster to select a student, view their surplus credit
              balance, and apply it toward an outstanding fee ledger item.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
