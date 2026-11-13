import React from "react";

const SCHOOL_NAME = "Eagle International School";

export default function AdminPage() {
  return (
    <div className="bg-neutral-page min-h-screen p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="card p-8 shadow-card mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <h1 className="text-28 font-bold text-text-primary sentence-case">
              Admin Console
            </h1>
          </div>
          <p className="text-text-secondary mb-6">
            System engineering console for {SCHOOL_NAME}. Infrastructure
            telemetry, branding, and account recovery live here.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 shadow-card">
              <h3 className="text-text-primary font-600 text-sm mb-2 sentence-case">
                School branding
              </h3>
              <p className="text-text-secondary text-xs mb-4">
                Manage school name, logo, motto, and theme colors.
              </p>
              <button className="btn-primary w-full">Configure branding</button>
            </div>
            <div className="card p-6 shadow-card">
              <h3 className="text-text-primary font-600 text-sm mb-2 sentence-case">
                Infrastructure telemetry
              </h3>
              <p className="text-text-secondary text-xs mb-4">
                Turso storage, API latency, and error logs.
              </p>
              <button className="btn-primary w-full">Open telemetry</button>
            </div>
            <div className="card p-6 shadow-card">
              <h3 className="text-text-primary font-600 text-sm mb-2 sentence-case">
                Account recovery
              </h3>
              <p className="text-text-secondary text-xs mb-4">
                Emergency password resets and staff creation.
              </p>
              <button className="btn-primary w-full">Manage accounts</button>
            </div>
          </div>

          <div className="mt-8 p-6 bg-brand-blue-tint rounded-input border border-brand-blue/20">
            <p className="text-brand-blue text-sm font-500 sentence-case mb-2">
              Privacy boundary
            </p>
            <p className="text-text-secondary text-sm leading-relaxed">
              The admin console does not display school income figures or
              private parent contact lists.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
