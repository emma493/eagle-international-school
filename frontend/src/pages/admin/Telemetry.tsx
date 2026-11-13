import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";

export default function TelemetryPage() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/telemetry")
      .then((res) => res.json())
      .then((data) => {
        setTelemetry(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-neutral-page min-h-screen p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="card p-8 shadow-card mb-8">
          <h2 className="text-28 font-bold text-text-primary mb-6 sentence-case">Infrastructure Telemetry</h2>
          <p className="text-text-secondary">
            Live database storage size, row counts, API latency, and error logs.
          </p>
        </div>

        {loading ? (
          <div className="card p-8 shadow-card text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading telemetry…</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card p-6 shadow-card">
                <p className="text-text-secondary text-xs font-600 mb-1 uppercase tracking-wider">Database Storage</p>
                <p className="text-3xl font-bold text-brand-blue">{telemetry?.storage_size_mb || "—"} MB</p>
              </div>
              <div className="card p-6 shadow-card">
                <p className="text-text-secondary text-xs font-600 mb-1 uppercase tracking-wider">Row Counts</p>
                <p className="text-3xl font-bold text-brand-blue">{telemetry?.row_count || "—"}</p>
              </div>
              <div className="card p-6 shadow-card">
                <p className="text-text-secondary text-xs font-600 mb-1 uppercase tracking-wider">API Latency</p>
                <p className="text-3xl font-bold text-brand-blue">{telemetry?.api_latency_ms || "—"} ms</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6 shadow-card">
                <h3 className="text-text-primary font-600 text-sm mb-4 sentence-case">Recent Error Logs</h3>
                <div className="space-y-3">
                  {(telemetry?.error_logs || []).map((log: any, i: number) => (
                    <div key={i} className="p-3 bg-status-problem-bg rounded-input border border-status-problem-text/20">
                      <p className="text-status-problem-text text-sm font-500">{log.message}</p>
                      <p className="text-text-secondary text-xs">{log.timestamp}</p>
                    </div>
                  ))}
                  {(telemetry?.error_logs || []).length === 0 && (
                    <p className="text-success-green text-sm font-500">No recent errors</p>
                  )}
                </div>
              </div>

              <div className="card p-6 shadow-card">
                <h3 className="text-text-primary font-600 text-sm mb-4 sentence-case">System Controls</h3>
                <div className="space-y-4">
                  <button className="btn-secondary w-full text-xs h-40">
                    Toggle Maintenance Mode
                  </button>
                  <button className="btn-secondary w-full text-xs h-40">
                    Emergency Account Recovery
                  </button>
                  <button className="btn-secondary w-full text-xs h-40">
                    Refresh Telemetry
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
