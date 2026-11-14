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
  school_logo_url?: string;
  headmaster_signature_url?: string;
  days_present: number;
  total_days: number;
  conduct: string;
  attitude: string;
  interest: string;
  class_teacher_remarks: string;
  headmaster_remarks: string;
  is_published: number;
  grading_format?: "numeric" | "letter";
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

/** Compute GES grade (1-9 numeric or A-F letter) from a 0-100 score. */
export function computeGrade(score: number, format: "numeric" | "letter" = "numeric"): string | number {
  if (format === "letter") {
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    if (score >= 45) return "E";
    if (score >= 40) return "F";
    return "G";
  }
  // Numeric 1-9
  if (score >= 80) return 1;
  if (score >= 70) return 2;
  if (score >= 60) return 3;
  if (score >= 50) return 4;
  if (score >= 45) return 5;
  if (score >= 40) return 6;
  if (score >= 35) return 7;
  if (score >= 30) return 8;
  return 9;
}

/**
 * Build a pdfmake document definition for a Terminal Report (A4, portrait).
 */
export function buildTerminalReportPDF(data: TerminalReportData) {
  const attendancePercent = data.total_days > 0
    ? ((data.days_present / data.total_days) * 100).toFixed(1)
    : "0.0";

  // Compute grades if not provided, using the school's grading format
  const gradingFormat = data.grading_format || "numeric";
  const subjectsWithGrades = data.subjects.map((s, idx) => ({
    ...s,
    total: (s.class_score || 0) + (s.exam_score || 0),
    grade: s.grade || computeGrade((s.class_score || 0) + (s.exam_score || 0), gradingFormat),
    rank: s.rank || idx + 1,
  }));

  const subjectRows = subjectsWithGrades.map((s) => [
    s.subject_name,
    s.class_score.toString(),
    s.exam_score.toString(),
    s.total.toString(),
    String(s.grade),
    String(s.rank),
  ]);

  // Build header with optional school logo
  const headerContent: any[] = [
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
  ];

  // If school logo exists, add it as an image in the header
  if (data.school_logo_url) {
    headerContent.unshift({
      image: data.school_logo_url,
      width: 60,
      height: 60,
      alignment: "center",
      margin: [0, 0, 0, 10],
    });
  }

  return {
    pageSize: "A4",
    pageMargins: [40, 60, 40, 60],
    header: headerContent,
    footer: (pageNumber: number, totalPages: number) => [
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
              { text: "Overall Total: ", bold: true }, subjectsWithGrades.reduce((sum, s) => sum + s.total, 0).toString(), "\n",
              { text: "Overall Average: ", bold: true }, (subjectsWithGrades.reduce((sum, s) => sum + s.total, 0) / subjectsWithGrades.length).toFixed(2), "\n",
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
      // Headmaster signature
      {
        columns: [
          {
            width: "50%",
            text: [
              { text: "_________________________", alignment: "center", fontSize: 10 },
              { text: "Headmaster Signature", alignment: "center", fontSize: 9, color: "#65676B" },
            ],
          },
          {
            width: "50%",
            text: data.headmaster_signature_url
              ? [
                  { image: data.headmaster_signature_url, width: 80, height: 30, alignment: "center" },
                  { text: "Headmaster", alignment: "center", fontSize: 9, color: "#65676B" },
                ]
              : [
                  { text: "_________________________", alignment: "center", fontSize: 10 },
                  { text: "Headmaster", alignment: "center", fontSize: 9, color: "#65676B" },
                ],
          },
        ],
        margin: [0, 20, 0, 0],
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
export async function downloadTerminalReportPDF(data: TerminalReportData, filename?: string, schoolLogoUrl?: string, headmasterSignatureUrl?: string) {
  const docDefinition = buildTerminalReportPDF({
    ...data,
    school_logo_url: schoolLogoUrl,
    headmaster_signature_url: headmasterSignatureUrl,
  });
  const fileName = filename || `TerminalReport_${data.admission_no}_${data.academic_year}_${data.term}.pdf`;

  pdfMake.createPdf(docDefinition).download(fileName);
}

/**
 * Open Terminal Report PDF in a new tab (for preview).
 */
export async function openTerminalReportPDF(data: TerminalReportData, schoolLogoUrl?: string, headmasterSignatureUrl?: string) {
  const docDefinition = buildTerminalReportPDF({
    ...data,
    school_logo_url: schoolLogoUrl,
    headmaster_signature_url: headmasterSignatureUrl,
  });
  pdfMake.createPdf(docDefinition).open();
}
