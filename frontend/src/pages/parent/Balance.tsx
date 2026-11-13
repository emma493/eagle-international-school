import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";

export default function ParentBalancePage() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [balances, setBalances] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // In production, fetch linked children from parent_students table
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      // Mock data — in production, fetch from /api/parent/children
      const mockChildren = [
        {
          id: "stu_1",
          full_name: "Ama Mensah",
          admission_no: "SCH-2026-0001",
          class_name: "Basic 4",
          photo_url: null,
        },
        {
          id: "stu_2",
          full_name: "Kofi Mensah",
          admission_no: "SCH-2026-0002",
          class_name: "JHS 1A",
          photo_url: null,
        },
      ];
      setChildren(mockChildren);
      if (mockChildren.length > 0) {
        setSelectedChild(mockChildren[0]);
        fetchBalances(mockChildren[0].id);
      }
    } catch (err: any) {
      showToast("error", "Failed to load children", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async (childId: string) => {
    try {
      // In production, fetch from /api/parent/balance/:childId
      const mockBalances = {
        total_debt: 450.00,
        surplus_credit: 60.00,
        breakdown: [
          { category: "school_fees", description: "Term 1 Tuition", amount: 300.00, status: "partial" },
          { category: "printing_fees", description: "Exam Papers", amount: 50.00, status: "owing" },
          { category: "books", description: "Mathematics Textbook", amount: 100.00, status: "owing" },
        ],
        recent_activity: [
          { type: "payment", title: "Fee Payment", body: "GHS 100.00 paid toward Term 1 Tuition", created_at: "2 hours ago" },
          { type: "credit", title: "Surplus Credit", body: "+GHS 20.00 credit (Ama absent on prepaid canteen day)", created_at: "1 day ago" },
        ],
      };
      setBalances(mockBalances);
    } catch (err: any) {
      showToast("error", "Failed to load balances", err.message);
    }
  };

  const formatMoney = (amount: number) => `GHS ${amount.toFixed(2)}`;

  if (loading) {
    return (
      <div className="bg-neutral-page min-h-screen p-4">
        <div className="card p-6 shadow-card text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading balances…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-page min-h-screen p-4 lg:p-6">
      <div className="max-w-xl mx-auto">
        <div className="card p-5 shadow-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold">
                P
              </div>
              <h2 className="text-20 font-bold text-text-primary sentence-case">Parent Balance</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-secondary text-xs">Select Child</span>
              <select
                value={selectedChild?.id || ""}
                onChange={(e) => {
                  const child = children.find((c) => c.id === e.target.value);
                  if (child) {
                    setSelectedChild(child);
                    fetchBalances(child.id);
                  }
                }}
                className="w-full h-10 px-3 text-sm border border-border-input rounded-input bg-card text-text-primary focus:border-brand-blue focus:ring-2 ring-brand-blue/20 focus:outline-none"
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.class_name})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-text-secondary text-sm">
            Connected to <strong className="text-brand-blue">Eagle International School</strong>
          </p>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="card p-5 shadow-card">
            <p className="text-text-secondary text-xs font-600 mb-1 uppercase tracking-wider">Total Debt</p>
            <p className="text-3xl font-bold text-alert-red">
              {balances ? formatMoney(balances.total_debt) : "—"}
            </p>
            <p className="text-text-secondary text-xs">
              Itemized: fees, printing, books, canteen, dues
            </p>
          </div>
          <div className="card p-5 shadow-card">
            <p className="text-text-secondary text-xs font-600 mb-1 uppercase tracking-wider">Surplus Credit</p>
            <p className="text-3xl font-bold text-success-green">
              {balances ? formatMoney(balances.surplus_credit) : "—"}
            </p>
            <p className="text-text-secondary text-xs">
              From absent prepaid canteen days
            </p>
          </div>
        </div>

        {/* Debt breakdown */}
        <div className="card p-5 shadow-card mb-6">
          <h3 className="text-text-primary font-600 text-sm mb-4 sentence-case">Debt Breakdown</h3>
          <div className="space-y-3">
            {(balances?.breakdown || []).map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 border border-divider rounded-input">
                <div className="flex items-center gap-3">
                  <span className="text-text-secondary text-sm">{item.description}</span>
                </div>
                <div className="text-right">
                  <div className="text-text-primary font-500 text-sm">{formatMoney(item.amount)}</div>
                  <span
                    className={`badge text-[10px] px-2 py-1 ${
                      item.status === "paid"
                        ? "badge-good"
                        : item.status === "partial"
                        ? "badge-attention"
                        : "badge-problem"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card p-5 shadow-card">
          <h3 className="text-text-primary font-600 text-sm mb-4 sentence-case">Recent Activity</h3>
          <div className="space-y-3">
            {(balances?.recent_activity || []).map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 border border-divider rounded-input">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                  item.type === "payment"
                    ? "bg-success-green text-white"
                    : item.type === "credit"
                    ? "bg-brand-blue text-white"
                    : "bg-neutral-secondary text-text-primary"
                }`}>
                  {item.type === "payment" ? "💰" : item.type === "credit" ? "➕" : "ℹ️"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-text-primary font-500 text-sm">{item.title}</div>
                  <div className="text-text-secondary text-xs">{item.body}</div>
                  <div className="text-text-secondary text-[10px] mt-0.5">{item.created_at}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
