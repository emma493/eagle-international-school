import React, { useState } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";

export default function AcademicSettingsPage() {
  const [settings, setSettings] = useState<any>({
    current_academic_year: "",
    current_term: "",
    next_reopening_date: "",
    canteen_daily_rate: 20.00,
    grading_format: "numeric",
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest("/api/school-settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      showToast("success", "Settings saved", "Academic settings updated successfully");
    } catch (err: any) {
      showToast("error", "Failed to save settings", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-page min-h-screen p-8 lg:p-12">
      <div className="max-w-lg mx-auto">
        <div className="card p-8 shadow-card">
          <h2 className="text-28 font-bold text-text-primary mb-6 sentence-case">Academic Settings</h2>
          <p className="text-text-secondary mb-6">
            Configure term dates, canteen rate (default GHS 20/day), and grading format for Eagle International School.
          </p>

          <form onSubmit={saveSettings} className="space-y-4">
            <Input
              label="Academic Year"
              value={settings.current_academic_year}
              onChange={(e) => setSettings({ ...settings, current_academic_year: e.target.value })}
              placeholder="e.g. 2025-2026"
              required
            />
            <Input
              label="Current Term"
              value={settings.current_term}
              onChange={(e) => setSettings({ ...settings, current_term: e.target.value })}
              placeholder="e.g. Term 1"
              required
            />
            <Input
              label="Next Reopening Date"
              type="date"
              value={settings.next_reopening_date}
              onChange={(e) => setSettings({ ...settings, next_reopening_date: e.target.value })}
            />
            <Input
              label="Canteen Daily Rate (GHS)"
              type="number"
              value={String(settings.canteen_daily_rate)}
              onChange={(e) => setSettings({ ...settings, canteen_daily_rate: parseFloat(e.target.value) || 20 })}
              placeholder="20"
            />
            <div className="flex flex-col">
              <label className="text-text-secondary text-xs font-500 mb-1 sentence-case">Grading Format</label>
              <select
                value={settings.grading_format}
                onChange={(e) => setSettings({ ...settings, grading_format: e.target.value })}
                className="w-full h-52 px-4 text-17 border border-border-input rounded-input bg-card text-text-primary focus:border-brand-blue focus:ring-2 ring-brand-blue/20 focus:outline-none"
              >
                <option value="numeric">Numeric (1–9)</option>
                <option value="letter">Letter (A–F)</option>
              </select>
            </div>

            <Button variant="primary" fullWidth disabled={loading} type="submit">
              {loading ? "Saving…" : "Save Settings"}
            </Button>
          </form>
        </div>

        <div className="mt-6 card p-6 shadow-card">
          <h3 className="text-text-primary font-600 text-sm mb-4 sentence-case">GES / NaCCA Structure</h3>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>• Creche / Nursery / KG: Competency & developmental rubrics</p>
            <p>• Lower & Upper Primary (Basic 1–6): One class teacher manages all subjects</p>
            <p>• JHS (JHS 1–3): Form Master + Subject Teachers per class-subject pair</p>
            <p>• Terminal Report: Total = Class Score (50%) + Exam Score (50%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
