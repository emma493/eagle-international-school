import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import HeadmasterPage from "./pages/HeadmasterPage";
import TeacherPage from "./pages/TeacherPage";
import ParentPage from "./pages/ParentPage";
import { ToastContainer } from "./components/ui/ToastContainer";

// Admin sub-pages
import BrandingPage from "./pages/admin/Branding";
import TelemetryPage from "./pages/admin/Telemetry";
import StaffCreationPage from "./pages/admin/StaffCreation";

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

// Parent sub-pages
import BalancePage from "./pages/parent/Balance";
import ParentTerminalReportsPage from "./pages/parent/TerminalReports";

import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import BottomTabBar from "./components/layout/BottomTabBar";

const isMobile = () => window.innerWidth < 900;

function App() {
  const { user, loading, role } = useAuth();

  const protectedRoutes: Record<string, string> = {
    admin: "/admin",
    headmaster: "/headmaster",
    teacher: "/teacher",
    parent: "/parent",
  };

  if (loading) {
    return (
      <div className="bg-neutral-page min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  const targetPath = protectedRoutes[role || ""] || "/login";
  const isMobileView = isMobile();

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
      <Route path="/headmaster/terminal-reports" element={<HeadmasterTerminalReportsPage />} />
    </>
  );

  const teacherRoutes = (
    <>
      <Route path="/teacher" element={<TeacherPage />} />
      <Route path="/teacher/attendance" element={<AttendancePage />} />
      <Route path="/teacher/canteen-collection" element={<CanteenCollectionPage />} />
      <Route path="/teacher/terminal-reports" element={<TeacherTerminalReportsPage />} />
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

      {/* Admin routes */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/branding" element={<BrandingPage />} />
      <Route path="/admin/telemetry" element={<TelemetryPage />} />
      <Route path="/admin/staff-creation" element={<StaffCreationPage />} />

      {headmasterRoutes}
      {teacherRoutes}
      {parentRoutes}
    </>
  );

  return (
    <BrowserRouter>
      <ToastContainer />
      {isMobileView ? (
        // Mobile layout: top bar + bottom tab bar
        <div className="min-h-screen flex flex-col pt-56 pb-14">
          <TopBar onMenuClick={() => {}} />
          <Routes>{allRoutes}</Routes>
          <BottomTabBar />
        </div>
      ) : (
        // Desktop layout: sidebar + content
        <div className="min-h-screen flex">
          <Sidebar onToggle={() => {}} />
          <div className="flex-1 flex flex-col pt-16 pl-280 lg:pl-0 lg:pt-16 lg:pr-12 lg:pb-8">
            <TopBar onMenuClick={() => {}} />
            <div className="flex-1 overflow-x-auto">
              <Routes>{allRoutes}</Routes>
            </div>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
