import React, { useState, useEffect } from "react";
import { apiRequest, saveOrQueue } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TerminalReportPDF, TerminalReportPDFProps } from "@/components/reports/TerminalReportPDF";
import { downloadTerminalReportPDF } from "@/lib/pdfmake";
import { StatusPill } from "@/components/ui/StatusPill";
import { useToast } from "@/hooks/useToast";

export default function TeacherTerminalReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const [newReport, setNewReport] = useState({
    student_id: "",
    class_id: "",
    academic_year: "",
    term: "",
    days_present: "",
    total_days: "",
    conduct: "",
    attitude: "",
    interest: "",
    class_teacher_remarks: "",
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await apiRequest("/api/terminal-reports");
      const data = await res.json();
      setReports(data.reports);
    } catch (err: any) {
      showToast("error", "Failed to load reports", err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const out = await saveOrQueue("POST", "/api/terminal-reports", {
        ...newReport,
        days_present: parseInt(newReport.days_present) || 0,
        total_days: parseInt(newReport.total_days) || 0,
      });
      showToast("success", out.queued ? "Saved offline" : "Draft saved", out.queued ? "Will sync when online" : "Report draft saved");
      setNewReport({
        student_id: "",
        class_id: "",
        academic_year: "",
        term: "",
        days_present: "",
        total_days: "",
        conduct: "",
        attitude: "",
        interest: "",
        class_teacher_remarks: "",
      });
      await fetchReports();
    } catch (err: any) {
      showToast("error", "Failed to save draft", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDF = () => {
    if (!selectedReport) return;

    const reportData: TerminalReportPDFProps["report"] = {
      id: selectedReport.id,
      student_name: selectedReport.student_name,
      admission_no: selectedReport.admission_no,
      class_name: selectedReport.class_name,
      department: selectedReport.department,
      academic_year: selectedReport.academic_year,
      term: selectedReport.term,
      days_present: selectedReport.days_present,
      total_days: selectedReport.total_days,
      conduct: selectedReport.conduct || "Good",
      attitude: selectedReport.attitude || "Good",
      interest: selectedReport.interest || "Good",
      class_teacher_remarks: selectedReport.class_teacher_remarks || "",
      headmaster_remarks: selectedReport.headmaster_remarks || "",
      is_published: selectedReport.is_published,
      subjects: subjects.map((s) => ({
        subject_name: s.subject_name || "Subject",
        class_score: s.class_score || 0,
        exam_score: s.exam_score || 0,
        total: (s.class_score || 0) + (s.exam_score || 0),
        grade: s.grade || "—",
        rank: s.rank || 0,
      })),
      overall_total: subjects.reduce((sum, s) => sum + ((s.class_score || 0) + (s.exam_score || 0)), 0),
      overall_average:
        subjects.length > 0
          ? subjects.reduce((sum, s) => sum + ((s.class_score || 0) + (s.exam_score || 0)), 0) /
            subjects.length
          : 0,
      class_position: 1,
      generated_at: new Date().toLocaleDateString(),
      school_name: "Eagle International School",
    };

    downloadTerminalReportPDF(reportData);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="card p-6 shadow-card text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading reports…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-display font-bold text-text-primary sentence-case">Examination & Terminal Reports</h1>
            <p className="text-text-secondary">
              Enter class scores (50%) and exam scores (50%), attendance, conduct, and remarks.
              Generate draft PDF reports offline.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Draft entry form */}
          <div className="lg:col-span-2">
            <div className="card p-6 shadow-card mb-6">
              <h3 className="text-text-primary font-semibold text-sm mb-4 sentence-case">Draft Report Entry</h3>
              <form onSubmit={saveDraft} className="space-y-4">
                <Input
                  label="Student ID"
                  value={newReport.student_id}
                  onChange={(e) => setNewReport({ ...newReport, student_id: e.target.value })}
                  required
                />
                <Input
                  label="Class ID"
                  value={newReport.class_id}
                  onChange={(e) => setNewReport({ ...newReport, class_id: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Academic Year"
                    value={newReport.academic_year}
                    onChange={(e) => setNewReport({ ...newReport, academic_year: e.target.value })}
                    placeholder="e.g. 2025-2026"
                    required
                  />
                  <Input
                    label="Term"
                    value={newReport.term}
                    onChange={(e) => setNewReport({ ...newReport, term: e.target.value })}
                    placeholder="e.g. Term 1"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Days Present"
                    type="number"
                    value={newReport.days_present}
                    onChange={(e) => setNewReport({ ...newReport, days_present: e.target.value })}
                    required
                  />
                  <Input
                    label="Total Days"
                    type="number"
                    value={newReport.total_days}
                    onChange={(e) => setNewReport({ ...newReport, total_days: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Conduct"
                    value={newReport.conduct}
                    onChange={(e) => setNewReport({ ...newReport, conduct: e.target.value })}
                  />
                  <Input
                    label="Attitude"
                    value={newReport.attitude}
                    onChange={(e) => setNewReport({ ...newReport, attitude: e.target.value })}
                  />
                  <Input
                    label="Interest"
                    value={newReport.interest}
                    onChange={(e) => setNewReport({ ...newReport, interest: e.target.value })}
                  />
                </div>
                <Input
                  label="Class Teacher Remarks"
                  value={newReport.class_teacher_remarks}
                  onChange={(e) => setNewReport({ ...newReport, class_teacher_remarks: e.target.value })}
                  rows={3}
                />
                <Button variant="primary" fullWidth disabled={submitting} type="submit">
                  {submitting ? "Saving…" : "Save Draft Report"}
                </Button>
              </form>
            </div>

            {/* Existing reports list */}
            <div className="card p-6 shadow-card">
              <h3 className="text-text-primary font-semibold text-sm mb-4 sentence-case">My Reports</h3>
              <div className="space-y-3">
                {reports.length === 0 ? (
                  <div className="text-center py-6 text-text-secondary">
                    No reports yet. Create your first draft above.
                  </div>
                ) : (
                  reports.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedReport(r)}
                      className={`p-4 border border-divider rounded-input cursor-pointer hover:bg-neutral-hover transition-colors ${
                        selectedReport?.id === r.id ? "border-brand-blue bg-brand-blue-tint" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-text-primary">{r.student_name}</div>
                        <div className="text-right">
                          <div className="text-text-secondary text-xs">{r.academic_year}</div>
                          <div className="text-text-secondary text-xs">{r.term}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <StatusPill variant="info" label={r.class_name} />
                        <StatusPill status={r.is_published === 1 ? "published" : "draft"} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Report detail + PDF */}
          <div className="lg:col-span-1">
            {selectedReport ? (
              <div className="space-y-6">
                <div className="card p-6 shadow-card">
                  <h3 className="text-text-primary font-semibold text-sm mb-4 sentence-case">
                    {selectedReport.student_name}
                  </h3>
                  <p className="text-text-secondary text-xs mb-4">
                    {selectedReport.admission_no} &bull; {selectedReport.class_name}
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary text-sm">Days Present</span>
                      <span className="text-text-primary font-medium text-sm">{selectedReport.days_present}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary text-sm">Total Days</span>
                      <span className="text-text-primary font-medium text-sm">{selectedReport.total_days}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary text-sm">Conduct</span>
                      <span className="text-text-primary font-medium text-sm">{selectedReport.conduct}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary text-sm">Attitude</span>
                      <span className="text-text-primary font-medium text-sm">{selectedReport.attitude}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary text-sm">Interest</span>
                      <span className="text-text-primary font-medium text-sm">{selectedReport.interest}</span>
                    </div>
                  </div>
                </div>

                <TerminalReportPDF
                  report={selectedReport}
                  subjects={subjects}
                  onDownload={generatePDF}
                  onOpen={() => {}}
                />
              </div>
            ) : (
              <div className="card p-8 shadow-card text-center">
                <p className="text-text-secondary text-sm">
                  Select a report from the list to view details and generate PDF.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
