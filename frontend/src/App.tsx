import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import HeadmasterPage from "./pages/HeadmasterPage";
import TeacherPage from "./pages/TeacherPage";
import ParentPage from "./pages/ParentPage";
import { ToastContainer } from "./components/ui/ToastContainer";
import MaintenanceScreen from "./pages/MaintenanceScreen";
import { Button } from "./components/ui/Button";
import { StatusScreen } from "./components/shared/StatusScreen";
import SplashScreen from "./components/shared/SplashScreen";
import NotificationPrompt from "./components/sync/NotificationPrompt";
import { NotFoundOrForbidden, SessionExpiredScreen } from "./pages/StatusPages";

// Admin sub-pages
import BrandingPage from "./pages/admin/Branding";
import TelemetryPage from "./pages/admin/Telemetry";
import AccountsPage from "./pages/AccountsPage";

// Headmaster sub-pages
import ClassesPage from "./pages/headmaster/Classes";
import SubjectsPage from "./pages/headmaster/Subjects";
import TeacherAssignmentsPage from "./pages/headmaster/TeacherAssignments";
import StudentRegistrationPage from "./pages/headmaster/StudentRegistration";
import AcademicSettingsPage from "./pages/headmaster/AcademicSettings";
import FeeManagementPage from "./pages/headmaster/FeeManagement";
import CanteenReconciliationPage from "./pages/headmaster/CanteenReconciliation";
import HeadmasterTerminalReportsPage from "./pages/headmaster/TerminalReports";

// Teacher sub-pages
import AttendancePage from "./pages/teacher/Attendance";
import CanteenCollectionPage from "./pages/teacher/CanteenCollection";
import TeacherTerminalReportsPage from "./pages/teacher/TerminalReports";
import AssessmentsPage from "./pages/teacher/Assessments";
import RubricEntryPage from "./pages/teacher/RubricEntry";

// Parent sub-pages
import BalancePage from "./pages/parent/Balance";
import ParentTerminalReportsPage from "./pages/parent/TerminalReports";

import AppShell from "./components/layout/AppShell";
import { NotificationsProvider } from "./hooks/NotificationsContext";

// Shared pages
import ProfilePage from "./pages/ProfilePage";
import StudentProfilePage from "./pages/StudentProfilePage";

// Dev-only visual review page. The DEV check is replaced at build time, so production bundles drop it.
const Styleguide = import.meta.env.DEV ? lazy(() => import("./pages/Styleguide")) : null;
const styleguideRoute = Styleguide ? (
  <Route path="/__styleguide" element={<Suspense fallback={null}><Styleguide /></Suspense>} />
) : null;

function App() {
  const { user, loading, role, maintenance, signOut, sessionExpired } = useAuth();

  const protectedRoutes: Record<string, string> = {
    admin: "/admin",
    headmaster: "/headmaster",
    teacher: "/teacher",
    parent: "/parent",
  };

  if (loading) return <SplashScreen />;

  if (!user) {
    return (
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={sessionExpired ? <SessionExpiredScreen /> : <LoginPage />} />
          {styleguideRoute}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Signed in, but the token carries no valid role (and the worker could not be reached to say why).
  if (!role) {
    return (
      <StatusScreen
        tone="attention"
        icon="user"
        title="Account not ready"
        description="Your account has no role yet. Please contact the school office."
        actions={<Button variant="secondary" fullWidth onClick={signOut}>Sign out</Button>}
      />
    );
  }

  if (maintenance && role !== "admin") return <MaintenanceScreen />;

  const targetPath = protectedRoutes[role || ""] || "/login";

  const headmasterRoutes = (
    <>
      <Route path="/headmaster" element={<HeadmasterPage />} />
      <Route path="/headmaster/classes" element={<ClassesPage />} />
      <Route path="/headmaster/subjects" element={<SubjectsPage />} />
      <Route path="/headmaster/teacher-assignments" element={<TeacherAssignmentsPage />} />
      <Route path="/headmaster/students" element={<StudentRegistrationPage />} />
      <Route path="/headmaster/academic-settings" element={<AcademicSettingsPage />} />
      <Route path="/headmaster/fee-management" element={<FeeManagementPage />} />
      <Route path="/headmaster/canteen-reconciliation" element={<CanteenReconciliationPage />} />
      <Route path="/headmaster/accounts" element={<AccountsPage roles={["teacher", "parent"]} title="Teachers & parents" />} />
      <Route path="/headmaster/students/:studentId" element={<StudentProfilePage />} />
      <Route path="/headmaster/terminal-reports" element={<HeadmasterTerminalReportsPage />} />
    </>
  );

  const teacherRoutes = (
    <>
      <Route path="/teacher" element={<TeacherPage />} />
      <Route path="/teacher/students/:studentId" element={<StudentProfilePage />} />
      <Route path="/teacher/attendance" element={<AttendancePage />} />
      <Route path="/teacher/canteen-collection" element={<CanteenCollectionPage />} />
      <Route path="/teacher/terminal-reports" element={<TeacherTerminalReportsPage />} />
      <Route path="/teacher/assessments" element={<AssessmentsPage />} />
      <Route path="/teacher/rubric-entry" element={<RubricEntryPage />} />
    </>
  );

  const parentRoutes = (
    <>
      <Route path="/parent" element={<ParentPage />} />
      <Route path="/parent/balance" element={<BalancePage />} />
      <Route path="/parent/terminal-reports" element={<ParentTerminalReportsPage />} />
    </>
  );

  const allRoutes = (
    <>
      <Route path="/" element={<Navigate to={targetPath} replace />} />
      <Route path="/login" element={<Navigate to={targetPath} replace />} />

      {role === "admin" && (
        <>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/branding" element={<BrandingPage />} />
          <Route path="/admin/telemetry" element={<TelemetryPage />} />
        </>
      )}
      {role === "admin" && <Route path="/admin/accounts" element={<AccountsPage roles={["headmaster", "teacher", "admin"]} title="Accounts & emergency recovery" />} />}

      <Route path="/profile" element={<ProfilePage />} />
      {styleguideRoute}

      {role === "headmaster" && headmasterRoutes}
      {role === "teacher" && teacherRoutes}
      {role === "parent" && parentRoutes}
      <Route path="*" element={<NotFoundOrForbidden />} />
    </>
  );

  return (
    <BrowserRouter>
      <ToastContainer />
      <NotificationPrompt />
      <NotificationsProvider>
        <AppShell>
          <Routes>{allRoutes}</Routes>
        </AppShell>
      </NotificationsProvider>
    </BrowserRouter>
  );
}

export default App;
