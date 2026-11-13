import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const { showToast } = useToast();

  const fetchAssignments = async () => {
    try {
      const res = await apiRequest("/api/teacher-assignments");
      const data = await res.json();
      setAssignments(data.assignments);
    } catch (err: any) {
      showToast("error", "Failed to load assignments", err.message);
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/api/teacher-assignments", {
        method: "POST",
        body: JSON.stringify({ teacher_id: teacherId, class_id: classId, subject_id: subjectId || undefined }),
      });
      showToast("success", "Assignment created", "Teacher assigned successfully");
      setTeacherId("");
      setClassId("");
      setSubjectId("");
      await fetchAssignments();
    } catch (err: any) {
      showToast("error", "Failed to create assignment", err.message);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <div className="bg-neutral-page min-h-screen p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 shadow-card mb-8">
          <h2 className="text-28 font-bold text-text-primary mb-6 sentence-case">Teacher Assignments</h2>
          <p className="text-text-secondary mb-4">
            Assign teachers to classes. Primary teachers handle all subjects; JHS teachers handle specific class-subject pairs (GES/NaCCA model).
          </p>

          <form onSubmit={createAssignment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Input
              label="Teacher ID"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              placeholder="Firebase UID"
            />
            <Input
              label="Class ID"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              placeholder="Class ID"
            />
            <Input
              label="Subject ID (optional for Primary)"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              placeholder="Subject ID"
            />
            <Button type="submit" className="w-full">Assign</Button>
          </form>
        </div>

        <div className="card p-6 shadow-card overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider">
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider">Teacher</th>
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider">Class</th>
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider">Subject</th>
                <th className="pb-3 text-text-secondary text-xs font-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-text-secondary">
                    Loading assignments…
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-text-secondary">
                    No assignments found. Create your first assignment above.
                  </td>
                </tr>
              ) : (
                assignments.map((a) => (
                  <tr key={a.id} className="border-b border-divider/50 hover:bg-neutral-hover transition-colors">
                    <td className="py-4 text-text-primary">{a.teacher_name || a.teacher_id}</td>
                    <td className="py-4 text-text-primary">{a.class_name}</td>
                    <td className="py-4 text-text-secondary">{a.subject_name || "All subjects (Primary)"}</td>
                    <td className="py-4 text-right">
                      <Button variant="secondary" className="text-xs h-32 px-3">
                        Remove
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
