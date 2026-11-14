import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dept, setDept] = useState("");
  const [name, setName] = useState("");
  const { showToast } = useToast();

  const fetchClasses = async () => {
    try {
      const res = await apiRequest("/api/classes");
      const data = await res.json();
      setClasses(data.classes);
    } catch (err: any) {
      showToast("error", "Failed to load classes", err.message);
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/api/classes", {
        method: "POST",
        body: JSON.stringify({ department: dept, name }),
      });
      showToast("success", "Class created", `${name} added successfully`);
      setDept("");
      setName("");
      await fetchClasses();
    } catch (err: any) {
      showToast("error", "Failed to create class", err.message);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-display font-bold text-text-primary sentence-case">Class Management</h1>
            <p className="text-text-secondary">
              Manage classes across Creche, Nursery, KG, Lower Primary, Upper Primary, and JHS departments.
            </p>
          </div>
          <Button variant="primary">Add New Class</Button>
        </div>

        <form onSubmit={createClass} className="card p-6 shadow-card mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Input
            label="Department"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            placeholder="e.g. JHS"
          />
          <Input
            label="Class Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. JHS 1A"
          />
          <Button type="submit" className="w-full">Create</Button>
        </form>

        <div className="card p-6 shadow-card overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider">
                <th className="pb-3 text-text-secondary text-xs font-semibold uppercase tracking-wider">Department</th>
                <th className="pb-3 text-text-secondary text-xs font-semibold uppercase tracking-wider">Class Name</th>
                <th className="pb-3 text-text-secondary text-xs font-semibold uppercase tracking-wider">Form Master</th>
                <th className="pb-3 text-text-secondary text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-text-secondary">
                    Loading classes…
                  </td>
                </tr>
              ) : classes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-text-secondary">
                    No classes found. Create your first class above.
                  </td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <tr key={cls.id} className="border-b border-divider/50 hover:bg-neutral-hover transition-colors">
                    <td className="py-4 text-text-primary font-medium">{cls.department}</td>
                    <td className="py-4 text-text-primary">{cls.name}</td>
                    <td className="py-4 text-text-secondary">{cls.form_master_id || "Not assigned"}</td>
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
