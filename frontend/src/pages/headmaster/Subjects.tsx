import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [deptGroup, setDeptGroup] = useState("");
  const { showToast } = useToast();

  const fetchSubjects = async () => {
    try {
      const res = await apiRequest("/api/subjects");
      const data = await res.json();
      setSubjects(data.subjects);
    } catch (err: any) {
      showToast("error", "Failed to load subjects", err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/api/subjects", {
        method: "POST",
        body: JSON.stringify({ name, department_group: deptGroup }),
      });
      showToast("success", "Subject created", `${name} added successfully`);
      setName("");
      setDeptGroup("");
      await fetchSubjects();
    } catch (err: any) {
      showToast("error", "Failed to create subject", err.message);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const DEPT_GROUPS = ["EarlyYears", "Primary", "JHS"];

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="card p-6 shadow-card mb-8">
          <h2 className="text-display font-bold text-text-primary mb-6 sentence-case">Subject Management</h2>
          <p className="text-text-secondary mb-4">
            Manage subjects by department group (EarlyYears, Primary, JHS) per GES/NaCCA structure.
          </p>

          <form onSubmit={createSubject} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <Input
              label="Subject Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mathematics"
            />
            <div className="flex flex-col">
              <label className="text-text-secondary text-xs font-medium mb-1 sentence-case">Department Group</label>
              <select
                value={deptGroup}
                onChange={(e) => setDeptGroup(e.target.value)}
                className="w-full h-input px-4 text-body-lg border border-border-input rounded-input bg-card text-text-primary focus:border-brand-blue focus:ring-2 ring-brand-blue/20 focus:outline-none"
              >
                {DEPT_GROUPS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full">Create Subject</Button>
          </form>
        </div>

        <div className="card p-6 shadow-card overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider">
                <th className="pb-3 text-text-secondary text-xs font-semibold uppercase tracking-wider">Subject</th>
                <th className="pb-3 text-text-secondary text-xs font-semibold uppercase tracking-wider">Department Group</th>
                <th className="pb-3 text-text-secondary text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-text-secondary">
                    Loading subjects…
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-text-secondary">
                    No subjects found. Create your first subject above.
                  </td>
                </tr>
              ) : (
                subjects.map((subj) => (
                  <tr key={subj.id} className="border-b border-divider/50 hover:bg-neutral-hover transition-colors">
                    <td className="py-4 text-text-primary">{subj.name}</td>
                    <td className="py-4 text-text-secondary">{subj.department_group}</td>
                    <td className="py-4 text-right">
                      <Button variant="secondary" className="text-xs h-9 px-3">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
