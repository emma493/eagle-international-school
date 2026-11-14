import React, { useState, useEffect } from "react";
import { apiRequest, saveOrQueue, getStudentsCached } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";

import { Icon } from "@/components/ui/icons";
type AttendanceStatus = "present" | "absent" | "late" | "excused";

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
};

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    fetchStudents();
    fetchExistingAttendance(today);
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

  const fetchExistingAttendance = async (d: string) => {
    try {
      const res = await apiRequest(`/api/attendance?date=${d}`);
      const data = await res.json();
      const byStudent: Record<string, AttendanceStatus> = {};
      data.attendance.forEach((a: any) => {
        byStudent[a.student_id] = a.status;
      });
      setAttendance(byStudent);
    } catch (err: any) {
      // Non-fatal — no existing attendance yet
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const submitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const outs = await Promise.all(Object.entries(attendance).map(([studentId, status]) =>
        saveOrQueue("POST", "/api/attendance", { student_id: studentId, date, status })));
      const queued = outs.filter((o) => o.queued).length;
      showToast("success", queued ? "Saved offline" : "Attendance saved", queued ? `${queued} entries will sync when you are back online` : "Daily attendance recorded successfully");
    } catch (err: any) {
      showToast("error", "Failed to save attendance", err.message);
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

  const presentCount = Object.values(attendance).filter((s) => s === "present").length;
  const absentCount = Object.values(attendance).filter((s) => s === "absent").length;
  const lateCount = Object.values(attendance).filter((s) => s === "late").length;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 shadow-card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-blue-tint text-brand-blue rounded-full flex items-center justify-center"><Icon name="calendar-check" size={20} /></div>
            <h2 className="text-display font-bold text-text-primary sentence-case">Daily Attendance</h2>
          </div>
          <p className="text-text-secondary">
            Mark present / absent / late for your assigned students. Marking a student
            <strong className="text-alert-red">Absent</strong> on a prepaid canteen day automatically
            awards <strong className="text-success-green">GHS 2.0 credit</strong> to their surplus balance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card p-5 shadow-card">
            <p className="text-text-secondary text-xs font-semibold mb-1 uppercase tracking-wider">Present</p>
            <p className="text-3xl font-bold text-success-green">{presentCount}</p>
          </div>
          <div className="card p-5 shadow-card">
            <p className="text-text-secondary text-xs font-semibold mb-1 uppercase tracking-wider">Absent</p>
            <p className="text-3xl font-bold text-alert-red">{absentCount}</p>
          </div>
          <div className="card p-5 shadow-card">
            <p className="text-text-secondary text-xs font-semibold mb-1 uppercase tracking-wider">Late</p>
            <p className="text-3xl font-bold text-warning-amber">{lateCount}</p>
          </div>
        </div>

        <form onSubmit={submitAttendance} className="card p-6 shadow-card">
          <div className="flex items-center gap-4 mb-6">
            <label className="text-text-primary font-medium text-sm sentence-case">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-input px-4 text-body-lg border border-border-input rounded-input bg-card text-text-primary focus:border-brand-blue focus:ring-2 ring-brand-blue/20 focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-divider">
                  <th className="pb-3 text-text-secondary text-xs font-semibold uppercase tracking-wider">Student</th>
                  <th className="pb-3 text-text-secondary text-xs font-semibold uppercase tracking-wider">Admission No.</th>
                  <th className="pb-3 text-text-secondary text-xs font-semibold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-divider/50 hover:bg-neutral-hover transition-colors">
                    <td className="py-4 text-text-primary">{s.full_name}</td>
                    <td className="py-4 text-text-secondary text-sm">{s.admission_no}</td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        {["present", "absent", "late", "excused"].map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleStatusChange(s.id, status as AttendanceStatus)}
                            className={`px-3 py-1.5 text-xs rounded border ${
                              attendance[s.id] === status
                                ? "bg-brand-blue text-white border-brand-blue"
                                : "bg-card text-text-secondary border-border-input hover:bg-neutral-hover"
                            }`}
                          >
                            {STATUS_LABELS[status as AttendanceStatus]}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Button variant="primary" fullWidth disabled={submitting} type="submit">
              {submitting ? "Saving…" : "Save Attendance"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
