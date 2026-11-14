import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/dexie/db";
import { apiRequest } from "@/lib/api";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/icons";

interface StudentBasics {
  id: string;
  full_name: string;
  admission_no: string;
  class_name?: string;
  department?: string;
  photo_url?: string;
  status?: string;
}

/**
 * Landing page for global search results. Shows the basics from the device cache straight away
 * (so it opens offline) and refreshes them from the server when online. The full profile
 * (guardians, fees, attendance, reports, health) is built in the headmaster portal phase.
 */
export default function StudentProfilePage() {
  const { studentId = "" } = useParams();
  const { role } = useAuth();
  const [student, setStudent] = useState<StudentBasics | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    let alive = true;
    setState("loading");
    setStudent(null);
    (async () => {
      let found = false;
      try {
        const cached = (await db.students.get(studentId)) as StudentBasics | undefined;
        if (cached && alive) { setStudent(cached); setState("ready"); found = true; }
      } catch { /* cache unavailable */ }
      if (navigator.onLine) {
        try {
          const res = await apiRequest(`/api/students/${encodeURIComponent(studentId)}`);
          if (res.ok) {
            const body = await res.json();
            if (alive && body?.student) { setStudent(body.student); setState("ready"); found = true; }
          }
        } catch { /* offline or unreachable: keep the cached copy */ }
      }
      if (alive && !found) setState("missing");
    })();
    return () => { alive = false; };
  }, [studentId]);

  const listPath = role === "teacher" ? "/teacher" : "/headmaster/students";
  const listLabel = role === "teacher" ? "Home" : "Students";

  if (state === "loading") return <PageSkeleton />;

  if (state === "missing" || !student) {
    return (
      <PageContainer size="narrow">
        <PageHeader title="Student not found" breadcrumbs={[{ label: listLabel, to: listPath }, { label: "Student" }]} />
        <SectionCard>
          <div className="flex flex-col items-center gap-2 py-6 text-center text-text-secondary">
            <Icon name="info" size={24} />
            <p className="text-body">This student is not saved on this device, or you do not have access. Connect to the internet and search again.</p>
          </div>
        </SectionCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title={student.full_name} breadcrumbs={[{ label: listLabel, to: listPath }, { label: student.full_name }]} />
      <SectionCard>
        <div className="flex items-center gap-4">
          <Avatar name={student.full_name} src={student.photo_url} size={80} />
          <dl className="min-w-0 text-body">
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-text-secondary">Student ID</dt>
              <dd className="font-semibold text-text-primary">{student.admission_no}</dd>
            </div>
            {student.class_name && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-text-secondary">Class</dt>
                <dd className="font-semibold text-text-primary">{student.class_name}</dd>
              </div>
            )}
          </dl>
        </div>
      </SectionCard>
    </PageContainer>
  );
}
