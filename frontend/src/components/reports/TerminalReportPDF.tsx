import React from "react";
import { downloadTerminalReportPDF, openTerminalReportPDF } from "@/lib/pdfmake";
import { Button } from "@/components/ui/Button";

export interface TerminalReportPDFProps {
  report: any;
  subjects: any[];
  onDownload: () => void;
  onOpen: () => void;
}

export function TerminalReportPDF({ report, subjects, onDownload, onOpen }: TerminalReportPDFProps) {
  return (
    <div className="card p-6 shadow-card">
      <h3 className="text-text-primary font-600 text-sm mb-4 sentence-case">Terminal Report PDF</h3>
      <p className="text-text-secondary text-xs mb-6">
        Generate a crisp, high-resolution A4 vector Terminal Report PDF directly in the browser.
        Works 100% offline — zero cloud PDF storage needed.
      </p>

      <div className="flex gap-3">
        <Button
          variant="primary"
          fullWidth
          onClick={onOpen}
        >
          📄 Preview PDF
        </Button>
        <Button
          variant="success"
          fullWidth
          onClick={onDownload}
        >
          ⬇️ Download PDF
        </Button>
      </div>

      <div className="mt-6 p-4 bg-brand-blue-tint rounded-input border border-brand-blue/20">
        <p className="text-brand-blue text-sm font-500 sentence-case mb-2">Offline-First</p>
        <p className="text-text-secondary text-sm leading-relaxed">
          The PDF is generated client-side using pdfmake. No server round-trip is required,
          so parents can download reports even when offline (after initial load).
        </p>
      </div>
    </div>
  );
}
