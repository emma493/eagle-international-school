import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import authRoutes from "./routes/auth";
import syncRoutes from "./routes/sync";
import healthRoutes from "./routes/health";
import classesRoutes from "./routes/classes";
import subjectsRoutes from "./routes/subjects";
import teacherAssignmentsRoutes from "./routes/teacherAssignments";
import studentsRoutes from "./routes/students";
import schoolSettingsRoutes from "./routes/schoolSettings";
import adminStaffRoutes from "./routes/adminStaff";
import feeLedgerRoutes from "./routes/feeLedger";
import feePaymentsRoutes from "./routes/feePayments";
import canteenCollectionsRoutes from "./routes/canteenCollections";
import attendanceRoutes from "./routes/attendance";
import creditOffsetRoutes from "./routes/creditOffset";
import notificationsRoutes from "./routes/notifications";
import terminalReportsRoutes from "./routes/terminalReports";
import liveSignalsRoutes from "./routes/liveSignals";
import { firebaseAuthMiddleware } from "./middleware/auth";

const app = new Hono<{
  Bindings: {
    DB: any;
    FIREBASE_PROJECT_ID: string;
    FIREBASE_CLIENT_EMAIL: string;
    FIREBASE_PRIVATE_KEY: string;
    ENVIRONMENT: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  };
  Variables: {
    userId: string;
    userRole: string;
  };
}>();

app.use("*", logger());
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Health (no auth)
app.route("/health", healthRoutes);

// Auth (delegates to Firebase, returns custom claim role)
app.route("/auth", authRoutes);

// Sync batch (offline-first sync queue flush)
app.route("/api/sync", syncRoutes);

// Protected routes require Firebase JWT + custom claim
app.use("/*", firebaseAuthMiddleware);

// Admin & Headmaster resource routes
app.route("/api/classes", classesRoutes);
app.route("/api/subjects", subjectsRoutes);
app.route("/api/teacher-assignments", teacherAssignmentsRoutes);
app.route("/api/students", studentsRoutes);
app.route("/api/school-settings", schoolSettingsRoutes);
app.route("/api/admin/staff", adminStaffRoutes);
app.route("/api/fee-ledger", feeLedgerRoutes);
app.route("/api/fee-payments", feePaymentsRoutes);
app.route("/api/canteen-collections", canteenCollectionsRoutes);
app.route("/api/attendance", attendanceRoutes);
app.route("/api/credit-offset", creditOffsetRoutes);
app.route("/api/notifications", notificationsRoutes);
app.route("/api/terminal-reports", terminalReportsRoutes);
app.route("/api/live-signals", liveSignalsRoutes);
app.get("/telemetry", async (c) => {
  return c.json({
    status: "ok",
    role: c.get("userRole"),
    userId: c.get("userId"),
    environment: c.env.ENVIRONMENT,
  });
});

export default app;
