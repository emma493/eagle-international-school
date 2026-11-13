import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";

const PLAN_OPTIONS: { value: "1_day" | "1_week" | "1_month"; label: string; amount: number; days: number }[] = [
  { value: "1_day", label: "1 Day", amount: 20, days: 1 },
  { value: "1_week", label: "1 Week", amount: 100, days: 5 },
  { value: "1_month", label: "1 Month", amount: 400, days: 20 },
];

export default function CanteenCollectionPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"1_day" | "1_week" | "1_month" | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cashInHand, setCashInHand] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    fetchStudents();
    fetchPendingTotal();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await apiRequest("/api/students");
      const data = await res.json();
      setStudents(data.students);
    } catch (err: any) {
      showToast("error", "Failed to load students", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingTotal = async () => {
    try {
      const res = await apiRequest("/api/canteen-collections/reconcile/pending");
      const data = await res.json();
      setCashInHand(data.pending?.total_amount || 0);
    } catch {
      // Non-fatal
    }
  };

  const selectStudent = (student: any) => {
    setSelectedStudent(student);
    setSelectedPlan(null);
  };

  const selectPlan = (plan: "1_day" | "1_week" | "1_month") => {
    setSelectedPlan(plan);
  };

  const collectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedPlan) return;

    setSubmitting(true);
    try {
      const plan = PLAN_OPTIONS.find((p) => p.value === selectedPlan)!;
      const recordedBy = "teacher_uid"; // In production, from auth context

      await apiRequest("/api/canteen-collections", {
        method: "POST",
        body: JSON.stringify({
          student_id: selectedStudent.id,
          teacher_id: recordedBy,
          plan_type: selectedPlan,
          days_covered: plan.days,
          amount: plan.amount,
        }),
      });

      showToast("success", "Collection recorded", `GHS ${plan.amount} collected from ${selectedStudent.full_name}`);
      setSelectedPlan(null);
      await fetchPendingTotal();
    } catch (err: any) {
      showToast("error", "Failed to record collection", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-neutral-page min-h-screen p-4">
        <div className="card p-6 shadow-card text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading students…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-page min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 shadow-card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold">
              C
            </div>
            <h2 className="text-28 font-bold text-text-primary sentence-case">Canteen Collection</h2>
          </div>
          <p className="text-text-secondary">
            Collect canteen payments from students. Daily rate: <strong className="text-brand-blue">GHS 20.00/day</strong>.
            All collections show as <strong className="text-warning-amber">pending</strong> until reconciled by the Headmaster.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student selection */}
          <div className="lg:col-span-1">
            <div className="card p-5 shadow-card mb-6">
              <h3 className="text-text-primary font-600 text-sm mb-4 sentence-case">Select Student</h3>
              <div className="space-y-3">
                {students.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectStudent(s)}
                    className={`w-full text-left p-3 rounded-input border ${
                      selectedStudent?.id === s.id
                        ? "border-brand-blue bg-brand-blue-tint text-brand-blue font-600"
                        : "border-border-input text-text-secondary hover:bg-neutral-hover"
                      } sentence-case`}
                  >
                    <div className="font-500 text-text-primary">{s.full_name}</div>
                    <div className="text-text-secondary text-xs">{s.admission_no}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Plan selection */}
          <div className="lg:col-span-1">
            <div className="card p-5 shadow-card mb-6">
              <h3 className="text-text-primary font-600 text-sm mb-4 sentence-case">Select Plan</h3>
              <div className="space-y-3">
                {PLAN_OPTIONS.map((plan) => (
                  <button
                    key={plan.value}
                    onClick={() => selectPlan(plan.value)}
                    className={`w-full text-left p-4 rounded-input border ${
                      selectedPlan === plan.value
                        ? "border-brand-blue bg-brand-blue-tint text-brand-blue font-600"
                        : "border-border-input text-text-secondary hover:bg-neutral-hover"
                      }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-500 text-text-primary">{plan.label} ({plan.days} days)</span>
                      <span className="font-bold text-brand-blue">GHS {plan.amount}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cash in hand */}
          <div className="lg:col-span-1">
            <div className="card p-6 shadow-card mb-6">
              <h3 className="text-text-primary font-600 text-sm mb-4 sentence-case">Cash in Hand</h3>
              <p className="text-3xl font-bold text-brand-blue mb-2">GHS {cashInHand}</p>
              <p className="text-text-secondary text-xs">
                Pending reconciliation with Headmaster
              </p>
              <div className="mt-4">
                <Button variant="secondary" fullWidth className="text-xs h-40">
                  Mark as Reconciled
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Collection form */}
        {selectedStudent && selectedPlan && (
          <div className="card p-6 shadow-card mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-text-primary font-600 text-sm sentence-case">Confirm Collection</h3>
                <p className="text-text-secondary text-sm">
                  {selectedStudent.full_name} &bull; {selectedStudent.admission_no}
                </p>
              </div>
              <div className="text-right">
                <p className="text-text-secondary text-xs">Plan</p>
                <p className="text-2xl font-bold text-brand-blue">
                  GHS {PLAN_OPTIONS.find((p) => p.value === selectedPlan)?.amount}
                </p>
              </div>
            </div>

            <form onSubmit={collectPayment}>
              <Button variant="success" fullWidth disabled={submitting} type="submit">
                {submitting ? "Collecting…" : "Collect Payment"}
              </Button>
              <Button
                variant="secondary"
                fullWidth
                className="mt-3"
                onClick={() => setSelectedPlan(null)}
              >
                Cancel
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
