import React, { useState } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";

export default function StaffCreationPage() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const createStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const staffData: any = {};
      for (const [key, value] of formData.entries()) {
        staffData[key] = value;
      }

      // Create Firebase Auth user + Turso record via worker
      const res = await apiRequest("/api/admin/staff", {
        method: "POST",
        body: JSON.stringify(staffData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create staff account");
      }

      showToast("success", "Staff created", "Account created successfully");
      e.currentTarget.reset();
    } catch (err: any) {
      showToast("error", "Failed to create staff", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-page min-h-screen p-8 lg:p-12">
      <div className="max-w-lg mx-auto">
        <div className="card p-8 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold">
              S
            </div>
            <h2 className="text-28 font-bold text-text-primary sentence-case">Create Staff Account</h2>
          </div>
          <p className="text-text-secondary mb-6">
            Bootstrap the initial Headmaster and staff accounts. The Admin portal creates the first Headmaster
            who then manages the rest of the school.
          </p>

          <form onSubmit={createStaff} className="space-y-4">
            <Input
              label="Full Name"
              name="full_name"
              placeholder="e.g. Mr. Kwame Asare"
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="e.g. headmaster@school.edu.gh"
              required
            />
            <Input
              label="Phone Number"
              name="phone"
              placeholder="e.g. 024XXXXXXX"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              required
            />
            <div className="space-y-2">
              <label className="block text-text-secondary text-xs font-500 mb-1 sentence-case">Role</label>
              <select
                name="role"
                className="w-full h-52 px-4 text-17 border border-border-input rounded-input bg-card text-text-primary focus:border-brand-blue focus:ring-2 ring-brand-blue/20 focus:outline-none"
              >
                <option value="headmaster">Headmaster</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
              </select>
            </div>

            <Button variant="primary" fullWidth disabled={loading} type="submit">
              {loading ? "Creating…" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-brand-blue-tint rounded-input border border-brand-blue/20">
            <p className="text-brand-blue text-sm font-500 sentence-case mb-2">
              Privacy boundary
            </p>
            <p className="text-text-secondary text-sm leading-relaxed">
              The admin console does not display school income figures or private parent contact lists.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
