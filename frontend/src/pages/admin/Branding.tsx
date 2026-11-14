import React, { useState } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";

export default function BrandingPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchSettings = async () => {
    try {
      const res = await apiRequest("/api/school-settings");
      const data = await res.json();
      setSettings(data.settings);
    } catch (err: any) {
      showToast("error", "Failed to load settings", err.message);
    }
  };

  const saveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const updates: any = {};
      for (const [key, value] of formData.entries()) {
        updates[key] = value;
      }
      await apiRequest("/api/school-settings", {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      showToast("success", "Settings updated", "School branding saved successfully");
      await fetchSettings();
    } catch (err: any) {
      showToast("error", "Failed to save settings", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return (
      <div className="p-4 md:p-6">
        <div className="card p-8 shadow-card max-w-md mx-auto">
          <h2 className="text-display font-bold text-text-primary mb-6 sentence-case">School Branding</h2>
          <p className="text-text-secondary text-sm">Loading settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 shadow-card mb-8">
          <h2 className="text-display font-bold text-text-primary mb-6 sentence-case">School Branding</h2>
          <p className="text-text-secondary mb-6">
            Manage global branding for Eagle International School. Changes apply across all portals.
          </p>

          <form onSubmit={saveSettings} className="space-y-6">
            <Input
              label="School Name"
              value={settings.school_name || ""}
              onChange={(e) => {
                const s = { ...settings, school_name: e.target.value };
                setSettings(s);
              }}
            />
            <Input
              label="Motto"
              value={settings.motto || ""}
              onChange={(e) => {
                const s = { ...settings, motto: e.target.value };
                setSettings(s);
              }}
            />
            <Input
              label="Address"
              value={settings.address || ""}
              onChange={(e) => {
                const s = { ...settings, address: e.target.value };
                setSettings(s);
              }}
            />
            <Input
              label="Logo URL (Cloudinary)"
              value={settings.logo_url || ""}
              onChange={(e) => {
                const s = { ...settings, logo_url: e.target.value };
                setSettings(s);
              }}
            />
            <Input
              label="Headmaster Signature URL"
              value={settings.headmaster_signature_url || ""}
              onChange={(e) => {
                const s = { ...settings, headmaster_signature_url: e.target.value };
                setSettings(s);
              }}
            />

            <Button variant="primary" fullWidth disabled={loading} type="submit">
              {loading ? "Saving…" : "Save Branding"}
            </Button>
          </form>
        </div>

        <div className="card p-6 shadow-card">
          <h3 className="text-text-primary font-semibold text-sm mb-4 sentence-case">Current Settings</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">School Name</span>
              <span className="text-text-primary font-medium sentence-case">{settings.school_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Academic Year</span>
              <span className="text-text-primary font-medium">{settings.current_academic_year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Current Term</span>
              <span className="text-text-primary font-medium">{settings.current_term}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Canteen Daily Rate</span>
              <span className="text-text-primary font-medium">GHS {settings.canteen_daily_rate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Grading Format</span>
              <span className="text-text-primary font-medium">{settings.grading_format}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Maintenance Mode</span>
              <span className={`font-medium ${settings.maintenance_mode ? "text-alert-red" : "text-success-green"}`}>
                {settings.maintenance_mode ? "ON" : "OFF"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
