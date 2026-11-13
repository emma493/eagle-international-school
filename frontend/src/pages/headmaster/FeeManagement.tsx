import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";

const CATEGORY_LABELS: Record<string, string> = {
  school_fees: "School Fees",
  printing_fees: "Printing Fees",
  books: "Books",
  canteen: "Canteen",
  dues: "Dues",
};

const STATUS_COLORS: Record<string, string> = {
  paid: "text-success-green",
  partial: "text-warning-amber",
  owing: "text-alert-red",
};

export default function FeeManagementPage() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    student_id: "",
    academic_year: "",
    term: "",
    category: "school_fees" as const,
    description: "",
    amount_billed: "",
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const res = await apiRequest("/api/fee-ledger");
      const data = await res.json();
      setLedger(data.ledger);
    } catch (err: any) {
      showToast("error", "Failed to load fee ledger", err.message);
    } finally {
      setLoading(false);
    }
  };

  const issueFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest("/api/fee-ledger", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          amount_billed: parseFloat(form.amount_billed) || 0,
        }),
      });
      showToast("success", "Fee issued", "Fee added to student ledger successfully");
      setForm({
        student_id: "",
        academic_year: "",
        term: "",
        category: "school_fees",
        description: "",
        amount_billed: "",
      });
      await fetchLedger();
    } catch (err: any) {
      showToast("error", "Failed to issue fee", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const recordPayment = async (ledgerId: string, studentId: string) => {
    const amount = window.prompt("Enter payment amount (GHS):");
    if (!amount || isNaN(parseFloat(amount))) return;

    setSubmitting(true);
    try {
      await apiRequest("/api/fee-payments", {
        method: "POST",
        body: JSON.stringify({
          student_id: studentId,
          ledger_id: ledgerId,
          amount: parseFloat(amount),
          payment_source: "cash",
          recorded_by: "headmaster_uid",
        }),
      });
      showToast("success", "Payment recorded", "Payment applied to fee ledger");
      await fetchLedger();
    } catch (err: any) {
      showToast("error", "Failed to record payment", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: "badge badge-good",
      partial: "badge badge-attention",
      owing: "badge badge-problem",
    };
    return <span className={colors[status] || "badge badge-info"}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="bg-neutral-page min-h-screen p-4">
        <div className="card p-6 shadow-card text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading fee ledger…</p>
        </div>
      </div>
    );
  }

  const totalOwing = ledger
    .filter((l) => l.status === "owing")
    .reduce((sum, l) => sum + (l.amount_billed - (l.amount_paid || 0)), 0);

  return (
    <div className="bg-neutral-page min-h-screen p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-28 font-bold text-text-primary sentence-case">Fee Management</h1>
            <p className="text-text-secondary">
              Issue fees (school fees, printing fees, books, canteen, dues) and record payments.
            </p>
          </div>
          <Button variant="primary">Issue New Fee</Button>
        </div>

        {/* Issue fee form */}
        <div className="card p-6 shadow-card mb-8">
          <h3 className="text-text-primary font-600 text-sm mb-4 sentence-case">Issue New Fee</h3>
          <form onSubmit={issueFee} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Input
              label="Student ID"
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
              placeholder="Student ID"
              required
            />
            <Input
              label="Academic Year"
              value={form.academic_year}
              onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
              placeholder="e.g. 2025-2026"
              required
            />
            <Input
              label="Term"
              value={form.term}
              onChange={(e) => setForm({ ...form, term: e.target.value })}
              placeholder="e.g. Term 1"
              required
            />
            <div className="flex flex-col">
              <label className="text-text-secondary text-xs font-500 mb-1 sentence-case">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full h-52 px-4 text-17 border border-border-input rounded-input bg-card text-text-primary focus:border-brand-blue focus:ring-2 ring-brand-blue/20 focus:outline-none"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Term 1 Tuition"
              required
            />
            <Input
              label="Amount (GHS)"
              type="number"
              value={form.amount_billed}
              onChange={(e) => setForm({ ...form, amount_billed: e.target.value })}
              required
            />
            <div className="lg:col-span-2">
              <Button variant="primary" fullWidth disabled={submitting} type="submit">
                {submitting ? "Issuing…" : "Issue Fee"}
              </Button>
            </div>
          </form>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-5 shadow-card">
            <p className="text-text-secondary text-xs font-600 mb-1 uppercase tracking-wider">Total Entries</p>
            <p className="text-3xl font-bold text-text-primary">{ledger.length}</p>
          </div>
          <div className="card p-5 shadow-card">
            <p className="text-text-secondary text-xs font-600 mb-1 uppercase tracking-wider">Total Owing</p>
            <p className="text-3xl font-bold text-alert-red">GHS {totalOwing.toFixed(2)}</p>
          </div>
          <div className="card p-5 shadow-card">
            <p className="text-text-secondary text-xs font-600 mb-1 uppercase tracking-wider">Paid</p>
            <p className="text-3xl font-bold text-success-green">
              {ledger.filter((l) => l.status === "paid").length}
            </p>
          </div>
        </div>

        {/* Ledger table */}
        <div className="card p-6 shadow-card overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider">
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider">Student</th>
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider">Category</th>
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider">Description</th>
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider text-right">Billed</th>
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider text-right">Paid</th>
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider text-center">Status</th>
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((entry) => (
                <tr key={entry.id} className="border-b border-divider/50 hover:bg-neutral-hover transition-colors">
                  <td className="py-4 text-text-primary">
                    <div className="font-500">{entry.student_name}</div>
                    <div className="text-text-secondary text-xs">{entry.admission_no}</div>
                  </td>
                  <td className="py-4 text-text-secondary text-sm sentence-case">
                    {CATEGORY_LABELS[entry.category] || entry.category}
                  </td>
                  <td className="py-4 text-text-secondary text-sm">{entry.description}</td>
                  <td className="py-4 text-text-primary text-right font-500">
                    GHS {parseFloat(entry.amount_billed).toFixed(2)}
                  </td>
                  <td className="py-4 text-text-secondary text-right">
                    GHS {parseFloat(entry.amount_paid || 0).toFixed(2)}
                  </td>
                  <td className="py-4 text-center">{getStatusBadge(entry.status)}</td>
                  <td className="py-4 text-right">
                    {entry.status !== "paid" ? (
                      <Button
                        variant="secondary"
                        className="text-xs h-32 px-3"
                        onClick={() => recordPayment(entry.id, entry.student_id)}
                      >
                        Record Payment
                      </Button>
                    ) : (
                      <span className="text-text-secondary text-xs">Paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
