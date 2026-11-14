import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DocumentIcon } from "@/components/ui/icons";
import { downloadTerminalReportPDF } from "@/lib/pdfmake";
import { StatusPill } from "@/components/ui/StatusPill";
import { useToast } from "@/hooks/useToast";

export default function ParentTerminalReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // In production, filter by parent's linked children
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await apiRequest("/api/terminal-reports?is_published=1");
      const data = await res.json();
      setReports(data.reports);
    } catch (err: any) {
      showToast("error", "Failed to load reports", err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (report: any) => {
    const reportData = {
      student_name: report.student_name,
      admission_no: report.admission_no,
      class_name: report.class_name,
      department: report.department,
      academic_year: report.academic_year,
      term: report.term,
      days_present: report.days_present,
      total_days: report.total_days,
      conduct: report.conduct || "Good",
      attitude: report.attitude || "Good",
      interest: report.interest || "Good",
      class_teacher_remarks: report.class_teacher_remarks || "",
      headmaster_remarks: report.headmaster_remarks || "",
      is_published: report.is_published,
      subjects: [],
      overall_total: 0,
      overall_average: 0,
      class_position: 0,
      generated_at: new Date().toLocaleDateString(),
      school_name: "Eagle International School",
    };

    downloadTerminalReportPDF(reportData as any);
    showToast("success", "Downloading", `${report.student_name}'s report PDF`);
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
      <div className="max-w-xl mx-auto">
        <div className="card p-5 shadow-card mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-blue-tint text-brand-blue rounded-full flex items-center justify-center">
              <DocumentIcon />
            </div>
            <h2 className="text-title font-bold text-text-primary sentence-case">Terminal Reports</h2>
          </div>
          <p className="text-text-secondary text-sm">
            Download your child's published end-of-term report PDFs.
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="card p-8 shadow-card text-center">
            <div className="text-4xl mb-4"><DocumentIcon /></div>
            <p className="text-text-secondary text-sm">
              No published reports available yet. Reports appear here once the Headmaster publishes them.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="card p-5 shadow-card border border-divider"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-text-primary">{report.student_name}</div>
                    <div className="text-text-secondary text-xs">{report.admission_no}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-text-secondary text-xs">{report.academic_year}</div>
                    <div className="text-text-secondary text-xs">{report.term}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <StatusPill status="published" />
                  <span className="text-text-secondary text-xs">
                    {report.class_name} &bull; {report.department}
                  </span>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => downloadPDF(report)}
                  className="text-xs h-10"
                >
                  Download PDF
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
