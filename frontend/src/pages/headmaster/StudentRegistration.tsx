import React, { useState } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";

export default function StudentRegistrationPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    admission_no: "",
    dob: "",
    gender: "",
    class_id: "",
    medical_notes: "",
    blood_group: "",
    address_gps: "",
    pickup_contacts_json: "[]",
  });
  const { showToast } = useToast();

  const registerStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest("/api/students", {
        method: "POST",
        body: JSON.stringify(form),
      });
      showToast("success", "Student registered", `${form.full_name} added successfully`);
      setForm({ full_name: "", admission_no: "", dob: "", gender: "", class_id: "", medical_notes: "", blood_group: "", address_gps: "", pickup_contacts_json: "[]" });
    } catch (err: any) {
      showToast("error", "Failed to register student", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-page min-h-screen p-8 lg:p-12">
      <div className="max-w-xl mx-auto">
        <div className="card p-8 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold">
              S
            </div>
            <h2 className="text-28 font-bold text-text-primary sentence-case">Student Registration</h2>
          </div>
          <p className="text-text-secondary mb-6">
            Register a new student with full guardian and medical data. Admission number auto-generates as SCH-YYYY-XXXX.
          </p>

          <form onSubmit={registerStudent} className="space-y-4">
            <Input
              label="Full Name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
            <Input
              label="Admission Number"
              value={form.admission_no}
              onChange={(e) => setForm({ ...form, admission_no: e.target.value })}
              placeholder="e.g. SCH-2026-0001"
              required
            />
            <Input
              label="Date of Birth"
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-text-secondary text-xs font-500 mb-1 sentence-case">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full h-52 px-4 text-17 border border-border-input rounded-input bg-card text-text-primary focus:border-brand-blue focus:ring-2 ring-brand-blue/20 focus:outline-none"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-text-secondary text-xs font-500 mb-1 sentence-case">Class</label>
                <Input
                  value={form.class_id}
                  onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                  placeholder="Class ID"
                  required
                />
              </div>
            </div>
            <Input
              label="Blood Group"
              value={form.blood_group}
              onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
              placeholder="e.g. O+"
            />
            <Input
              label="Medical / Allergy Notes"
              value={form.medical_notes}
              onChange={(e) => setForm({ ...form, medical_notes: e.target.value })}
              placeholder="e.g. Penicillin allergy"
            />
            <Input
              label="GhanaPost GPS Address"
              value={form.address_gps}
              onChange={(e) => setForm({ ...form, address_gps: e.target.value })}
              placeholder="e.g. GA-123-4567"
            />
            <Input
              label="Authorized Pickup Contacts (JSON)"
              value={form.pickup_contacts_json}
              onChange={(e) => setForm({ ...form, pickup_contacts_json: e.target.value })}
              placeholder='[{"name": "Auntie Ama", "relation": "Aunt", "phone": "024XXXXXXX"}]'
            />

            <Button variant="primary" fullWidth disabled={loading} type="submit">
              {loading ? "Registering…" : "Register Student"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-brand-blue-tint rounded-input border border-brand-blue/20">
            <p className="text-brand-blue text-sm font-500 sentence-case mb-2">
              Sibling linking
            </p>
            <p className="text-text-secondary text-sm leading-relaxed">
              When registering, search existing guardians by phone number first to link siblings to one parent login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
