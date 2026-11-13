import React from "react";

const SCHOOL_NAME = "Eagle International School";

export default function TeacherPage() {
  return (
    <div className="bg-neutral-page min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 shadow-card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold">
              T
            </div>
            <h1 className="text-28 font-bold text-text-primary sentence-case">
              Teacher Portal
            </h1>
          </div>
          <p className="text-text-secondary">
            Classroom operations for {SCHOOL_NAME}. Mobile-first design.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="card p-5 shadow-card">
            <p className="text-text-secondary text-xs font-600 mb-1 uppercase tracking-wider">
              Cash in hand
            </p>
            <p className="text-3xl font-bold text-brand-blue">GHS —</p>
            <p className="text-text-secondary text-xs">
              To reconcile with headmaster
            </p>
          </div>
          <div className="card p-5 shadow-card">
            <p className="text-text-secondary text-xs font-600 mb-1 uppercase tracking-wider">
              Students present today
            </p>
            <p className="text-3xl font-bold text-success-green">—</p>
          </div>
          <div className="card p-5 shadow-card">
            <p className="text-text-secondary text-xs font-600 mb-1 uppercase tracking-wider">
              Pending sync
            </p>
            <p className="text-3xl font-bold text-warning-amber">—</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 shadow-card">
            <h3 className="text-text-primary font-600 text-sm mb-4 sentence-case">
              Daily attendance
            </h3>
            <p className="text-text-secondary text-xs mb-4">
              Mark present / absent / late for your assigned class.
            </p>
            <button className="btn-primary w-full">Take attendance</button>
          </div>
          <div className="card p-6 shadow-card">
            <h3 className="text-text-primary font-600 text-sm mb-4 sentence-case">
              Canteen collection
            </h3>
            <p className="text-text-secondary text-xs mb-4">
              1 day (GHS 20) &bull; 1 week (GHS 100) &bull; 1 month (GHS 400)
            </p>
            <button className="btn-primary w-full mb-3">Collect payment</button>
            <button className="btn-secondary w-full">View pending collections</button>
          </div>
        </div>

        <div className="mt-8 card p-6 shadow-card">
          <h3 className="text-text-primary font-600 text-sm mb-4 sentence-case">
            Examination &amp; terminal reports
          </h3>
          <p className="text-text-secondary text-xs mb-4">
            Enter class scores (50%) and exam scores (50%), attendance,
            conduct, and remarks. Generate draft PDF reports offline.
          </p>
          <button className="btn-primary w-full">Enter scores</button>
        </div>
      </div>
    </div>
  );
}
