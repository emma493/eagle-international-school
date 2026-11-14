import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TerminalReportPDF, TerminalReportPDFProps } from "@/components/reports/TerminalReportPDF";
import { StatusPill } from "@/components/ui/StatusPill";
import { useToast } from "@/hooks/useToast";
import { downloadTerminalReportPDF } from "@/lib/pdfmake";

export default function HeadmasterTerminalReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchReports();
    fetchSchoolSettings();
  }, []);

  const fetchSchoolSettings = async () => {
    try {
      const res = await apiRequest("/api/school-settings");
      const data = await res.json();
      setSchoolSettings(data.settings);
    } catch (err: any) {
      // Non-fatal
    }
  };

  const fetchReports = async () => {
    try {
      const res = await apiRequest("/api/terminal-reports?is_published=0");
      const data = await res.json();
      setReports(data.reports);
    } catch (err: any) {
      showToast("error", "Failed to load reports", err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectReport = (report: any) => {
    setSelectedReport(report);
    // In production, fetch assessments for this student+term
    setSubjects([]);
  };

  const publishReport = async () => {
    if (!selectedReport) return;
    setPublishing(true);
    try {
      await apiRequest(`/api/terminal-reports/${selectedReport.id}/publish`, {
        method: "POST",
      });
      showToast("success", "Report Published", "Parent can now download the report");
      setSelectedReport(null);
      await fetchReports();
    } catch (err: any) {
      showToast("error", "Failed to publish", err.message);
    } finally {
      setPublishing(false);
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
      school_name: schoolSettings?.school_name || "Eagle International School",
      school_motto: schoolSettings?.motto || "A place to grow, learn, and lead.",
    };

    downloadTerminalReportPDF(reportData, undefined, schoolSettings?.logo_url, schoolSettings?.headmaster_signature_url);
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
            <h1 className="text-display font-bold text-text-primary sentence-case">Terminal Reports</h1>
            <p className="text-text-secondary">
              Review, add remarks, and publish end-of-term report PDFs for parents.
            </p>
          </div>
          <Button variant="primary">Generate Draft Report</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report list */}
          <div className="lg:col-span-2">
            <div className="card p-6 shadow-card mb-6">
              <h3 className="text-text-primary font-semibold text-sm mb-4 sentence-case">Draft Reports Awaiting Publication</h3>
              <div className="space-y-3">
                {reports.length === 0 ? (
                  <div className="text-center py-8 text-text-secondary">
                    No draft reports found. Generate draft reports from the Teacher portal first.
                  </div>
                ) : (
                  reports.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => selectReport(r)}
                      className={`p-4 border border-divider rounded-input cursor-pointer hover:bg-neutral-hover transition-colors ${
                        selectedReport?.id === r.id ? "border-brand-blue bg-brand-blue-tint" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-text-primary">{r.student_name}</div>
                          <div className="text-text-secondary text-xs">{r.admission_no}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-text-primary font-medium">{r.academic_year}</div>
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

          {/* Report detail + publish */}
          <div className="lg:col-span-1">
            {selectedReport ? (
              <div className="space-y-6">
                <div className="card p-6 shadow-card">
                  <h3 className="text-text-primary font-semibold text-sm mb-4 sentence-case">
                    {selectedReport.student_name}
                  </h3>
                  <p className="text-text-secondary text-xs mb-4">
                    {selectedReport.admission_no} &bull; {selectedReport.class_name} &bull;
                    {selectedReport.academic_year} {selectedReport.term}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-text-secondary text-xs font-semibold mb-1 block sentence-case">Headmaster Remarks</label>
                      <textarea
                        value={selectedReport.headmaster_remarks || ""}
                        onChange={(e) => {
                          apiRequest(`/api/terminal-reports/${selectedReport.id}`, {
                            method: "PUT",
                            body: JSON.stringify({ headmaster_remarks: e.target.value }),
                          });
                        }}
                        className="w-full h-9 px-4 text-body border border-border-input rounded-input bg-card text-text-primary focus:border-brand-blue focus:ring-2 ring-brand-blue/20 focus:outline-none"
                        placeholder="Add headmaster remarks…"
                      />
                    </div>

                    <div className="pt-4 border-t border-divider">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Actions</span>
                      </div>
                      <Button
                        variant="success"
                        fullWidth
                        disabled={publishing}
                        onClick={publishReport}
                        className="mb-3"
                      >
                        {publishing ? "Publishing…" : "Publish Report"}
                      </Button>
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={generatePDF}
                        className="mb-3"
                      >
                        Generate PDF
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => setSelectedReport(null)}
                      >
                        Back to List
                      </Button>
                    </div>
                  </div>
                </div>

                <TerminalReportPDF
                  report={selectedReport}
                  subjects={subjects}
                  onDownload={generatePDF}
                  onOpen={() => {
                    // Open in new tab
                  }}
                />
              </div>
            ) : (
              <div className="card p-8 shadow-card text-center">
                <p className="text-text-secondary text-sm">
                  Select a draft report from the list to review and publish.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
