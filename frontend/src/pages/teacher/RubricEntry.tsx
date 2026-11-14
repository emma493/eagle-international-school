import React, { useState, useEffect } from "react";
import { apiRequest, saveOrQueue, getStudentsCached } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";

import { Icon } from "@/components/ui/icons";
const COMPETENCIES = [
  "Listening & Speaking",
  "Reading",
  "Writing",
  "Number Work",
  "Creative Activities",
  "Environmental Activities",
  "Religious Education",
  "Hygiene & Nutrition",
  "Movement & Creative Activities",
  "Social & Emotional Development",
];

export default function RubricEntryPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [rubrics, setRubrics] = useState<Record<string, Record<string, number>>>({});
  const [academicYear, setAcademicYear] = useState("");
  const [term, setTerm] = useState("");
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

  const saveRubrics = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const promises: Promise<any>[] = [];
      Object.entries(rubrics).forEach(([studentId, competencyScores]) => {
        Object.entries(competencyScores).forEach(([competency, rating]) => {
          promises.push(
            saveOrQueue("POST", "/api/rubric-scores", {
              student_id: studentId,
              academic_year: academicYear,
              term: term,
              competency,
              rating,
            })
          );
        });
      });
      await Promise.all(promises);
      showToast("success", "Rubric scores saved", "Competency rubrics saved successfully");
      setRubrics({});
    } catch (err: any) {
      showToast("error", "Failed to save rubric scores", err.message);
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
      <div className="max-w-6xl mx-auto">
        <div className="card p-6 shadow-card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-blue-tint text-brand-blue rounded-full flex items-center justify-center"><Icon name="clipboard-list" size={20} /></div>
            <h2 className="text-display font-bold text-text-primary sentence-case">Creche/KG Rubric Entry</h2>
          </div>
          <p className="text-text-secondary mb-6">
            Rate each competency on a 1–4 scale: 1 = Always, 2 = Sometimes, 3 = Needs Help, 4 = Not Yet Observed.
          </p>
        </div>

        <form onSubmit={saveRubrics} className="card p-6 shadow-card">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
            </div>

            {students.map((student) => (
              <div key={student.id} className="border border-divider rounded-input p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-text-primary">{student.full_name}</div>
                    <div className="text-text-secondary text-xs">{student.admission_no}</div>
                  </div>
                  <span className="text-brand-blue font-medium text-sm">{student.admission_no}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {COMPETENCIES.map((competency) => (
                    <div key={competency} className="flex flex-col items-center gap-2 p-2 bg-neutral-hover rounded-input">
                      <span className="text-xs text-text-secondary text-center leading-tight">{competency}</span>
                      <select
                        value={rubrics[student.id]?.[competency] || ""}
                        onChange={(e) =>
                          setRubrics({
                            ...rubrics,
                            [student.id]: {
                              ...rubrics[student.id],
                              [competency]: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full h-10 px-2 text-sm border border-border-input rounded bg-card text-text-primary focus:border-brand-blue focus:ring-2 ring-brand-blue/20 focus:outline-none"
                      >
                        <option value="">—</option>
                        {[1, 2, 3, 4].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-6">
              <Button variant="primary" fullWidth disabled={submitting} type="submit">
                {submitting ? "Saving…" : "Save Rubric Scores"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
