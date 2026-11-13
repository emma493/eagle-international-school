import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Register the virtual font filesystem so pdfmake can embed fonts
(pdfMake as any).vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;

export interface TerminalReportData {
  student_name: string;
  admission_no: string;
  class_name: string;
  department: string;
  academic_year: string;
  term: string;
  school_name: string;
  school_motto?: string;
  days_present: number;
  total_days: number;
  conduct: string;
  attitude: string;
  interest: string;
  class_teacher_remarks: string;
  headmaster_remarks: string;
  is_published: number;
  subjects: Array<{
    subject_name: string;
    class_score: number;
    exam_score: number;
    total: number;
    grade: string;
    rank: number;
  }>;
  overall_total: number;
  overall_average: number;
  class_position: number;
  generated_at: string;
}

/**
 * Build a pdfmake document definition for a Terminal Report (A4, portrait).
 */
export function buildTerminalReportPDF(data: TerminalReportData) {
  const attendancePercent = data.total_days > 0
    ? ((data.days_present / data.total_days) * 100).toFixed(1)
    : "0.0";

  const subjectRows = data.subjects.map((s) => [
    s.subject_name,
    s.class_score.toString(),
    s.exam_score.toString(),
    s.total.toString(),
    s.grade,
    s.rank.toString(),
  ]);

  return {
    pageSize: "A4",
    pageMargins: [40, 60, 40, 60],
    header: [
      {
        text: data.school_name,
        alignment: "center",
        bold: true,
        fontSize: 16,
        color: "#1877F2",
      },
      {
        text: data.school_motto || "A place to grow, learn, and lead.",
        alignment: "center",
        fontSize: 9,
        italic: true,
        color: "#65676B",
      },
      {
        text: `Terminal Report — ${data.academic_year} ${data.term}`,
        alignment: "center",
        bold: true,
        fontSize: 11,
        margin: [0, 10, 0, 0],
      },
      {
        text: `${data.class_name} (${data.department})`,
        alignment: "center",
        fontSize: 10,
        color: "#65676B",
      },
    ],
    footer: [
      {
        text: `Generated on ${data.generated_at} — Page ${pageNumber} of ${totalPages}`,
        alignment: "center",
        fontSize: 8,
        color: "#65676B",
      },
    ],
    content: [
      // Student info block
      {
        columns: [
          {
            width: "50%",
            text: [
              { text: "Student Name: ", bold: true }, data.student_name, "\n",
              { text: "Admission No.: ", bold: true }, data.admission_no, "\n",
              { text: "Class: ", bold: true }, `${data.class_name} — ${data.department}`, "\n",
            ],
          },
          {
            width: "50%",
            text: [
              { text: "Academic Year: ", bold: true }, data.academic_year, "\n",
              { text: "Term: ", bold: true }, data.term, "\n",
              { text: "Attendance: ", bold: true }, `${data.days_present} / ${data.total_days} days (${attendancePercent}%)`, "\n",
            ],
            alignment: "right",
          },
        ],
        margin: [0, 20, 0, 20],
      },
      // Subjects table
      {
        table: {
          headerRows: 1,
          widths: ["*", 60, 60, 60, 60, 60],
          body: [
            [
              { text: "Subject", bold: true },
              { text: "Class (50)", bold: true },
              { text: "Exam (50)", bold: true },
              { text: "Total (100)", bold: true },
              { text: "Grade", bold: true },
              { text: "Rank", bold: true },
            ],
            ...subjectRows,
          ],
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 20],
      },
      // Overall results
      {
        columns: [
          {
            width: "50%",
            text: [
              { text: "Overall Total: ", bold: true }, data.overall_total.toString(), "\n",
              { text: "Overall Average: ", bold: true }, data.overall_average.toFixed(2), "\n",
              { text: "Class Position: ", bold: true }, `${data.class_position} of class`, "\n",
            ],
          },
          {
            width: "50%",
            text: [
              { text: "Conduct: ", bold: true }, data.conduct, "\n",
              { text: "Attitude: ", bold: true }, data.attitude, "\n",
              { text: "Interest: ", bold: true }, data.interest, "\n",
            ],
            alignment: "right",
          },
        ],
        margin: [0, 0, 0, 30],
      },
      // Remarks
      {
        text: "Remarks",
        bold: true,
        fontSize: 11,
        color: "#1877F2",
        margin: [0, 0, 0, 8],
      },
      {
        text: [
          { text: "Class Teacher: ", bold: true }, data.class_teacher_remarks || "No remarks", "\n",
          { text: "Headmaster: ", bold: true }, data.headmaster_remarks || "No remarks", "\n",
        ],
      },
      {
        text: data.is_published === 1
          ? "This report has been published by the Headmaster."
          : "This is a draft report — not yet published.",
        italic: true,
        fontSize: 9,
        color: data.is_published === 1 ? "#1E7B34" : "#8A6100",
        margin: [0, 15, 0, 0],
      },
    ],
    styles: {},
  } as any;
}

/**
 * Generate a Terminal Report PDF and trigger download.
 */
export async function downloadTerminalReportPDF(data: TerminalReportData, filename?: string) {
  const docDefinition = buildTerminalReportPDF(data);
  const fileName = filename || `TerminalReport_${data.admission_no}_${data.academic_year}_${data.term}.pdf`;

  pdfMake.createPdf(docDefinition).download(fileName);
}

/**
 * Open Terminal Report PDF in a new tab (for preview).
 */
export async function openTerminalReportPDF(data: TerminalReportData) {
  const docDefinition = buildTerminalReportPDF(data);
  pdfMake.createPdf(docDefinition).open();
}
