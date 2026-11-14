import React, { useState, useEffect } from "react";
import { apiRequest, saveOrQueue, getStudentsCached } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";

import { Icon } from "@/components/ui/icons";
export default function AssessmentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, { class_score: string; exam_score: string }>>({});
  const [academicYear, setAcademicYear] = useState("");
  const [term, setTerm] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setStudents(await getStudentsCached());
    } catch (err: any) {
      showToast("error", "Failed to load students", err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveScores = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const promises = Object.entries(scores).map(([studentId, s]) =>
        saveOrQueue("POST", "/api/assessments", {
          student_id: studentId,
          class_id: "", // will be filled from student record if needed
          subject_id: subjectId,
          academic_year: academicYear,
          term: term,
          class_score: parseFloat(s.class_score) || 0,
          exam_score: parseFloat(s.exam_score) || 0,
        })
      );
      await Promise.all(promises);
      showToast("success", "Scores saved", "Assessment scores saved successfully");
      setScores({});
    } catch (err: any) {
      showToast("error", "Failed to save scores", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="card p-6 shadow-card text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading students…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="card p-6 shadow-card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-blue-tint text-brand-blue rounded-full flex items-center justify-center"><Icon name="bar-chart" size={20} /></div>
            <h2 className="text-display font-bold text-text-primary sentence-case">Assessment Scores</h2>
          </div>
          <p className="text-text-secondary mb-6">
            Enter Class Score (50%) and Exam Score (50%) for each subject. Total = 100%.
          </p>
        </div>

        <form onSubmit={saveScores} className="card p-6 shadow-card mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Input
              label="Academic Year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g. 2025-2026"
              required
            />
            <Input
              label="Term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. Term 1"
              required
            />
            <Input
              label="Subject ID"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              placeholder="Subject ID"
              required
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-divider">
                  <th className="pb-3 text-text-secondary text-xs font-semibold uppercase tracking-wider">Student</th>
                  <th className="pb-3 text-text-secondary text-xs font-semibold uppercase tracking-wider">Admission No.</th>
                  <th className="pb-3 text-text-secondary text-xs font-semibold uppercase tracking-wider text-right">Class Score (50)</th>
                  <th className="pb-3 text-text-secondary text-xs font-semibold uppercase tracking-wider text-right">Exam Score (50)</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-divider/50 hover:bg-neutral-hover transition-colors">
                    <td className="py-4 text-text-primary">{s.full_name}</td>
                    <td className="py-4 text-text-secondary text-sm">{s.admission_no}</td>
                    <td className="py-4 text-right">
                      <Input
                        value={scores[s.id]?.class_score || ""}
                        onChange={(e) => setScores({ ...scores, [s.id]: { ...scores[s.id], class_score: e.target.value } })}
                        placeholder="0-50"
                        className="text-right w-24 text-sm"
                      />
                    </td>
                    <td className="py-4 text-right">
                      <Input
                        value={scores[s.id]?.exam_score || ""}
                        onChange={(e) => setScores({ ...scores, [s.id]: { ...scores[s.id], exam_score: e.target.value } })}
                        placeholder="0-50"
                        className="text-right w-24 text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Button variant="primary" fullWidth disabled={submitting} type="submit">
              {submitting ? "Saving…" : "Save Scores"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
