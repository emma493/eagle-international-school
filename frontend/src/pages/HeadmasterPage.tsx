import React from "react";

const SCHOOL_NAME = "Eagle International School";

export default function HeadmasterPage() {
  return (
    <div className="bg-neutral-page min-h-screen p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-28 font-bold text-text-primary sentence-case">
              Headmaster Portal
            </h1>
            <p className="text-text-secondary">
              School operations for {SCHOOL_NAME}
            </p>
          </div>
          <button className="btn-primary px-6">Canteen reconciliation</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 shadow-card">
            <p className="text-text-secondary text-xs font-600 mb-1 uppercase tracking-wider">
              Total students
            </p>
            <p className="text-3xl font-bold text-text-primary">—</p>
          </div>
          <div className="card p-6 shadow-card">
            <p className="text-text-secondary text-xs font-600 mb-1 uppercase tracking-wider">
              Fees owing
            </p>
            <p className="text-3xl font-bold text-status-problem-text">GHS —</p>
          </div>
          <div className="card p-6 shadow-card">
            <p className="text-text-secondary text-xs font-600 mb-1 uppercase tracking-wider">
              Cash to reconcile
            </p>
            <p className="text-3xl font-bold text-brand-blue">GHS —</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card p-6 shadow-card">
              <h3 className="text-text-primary font-600 text-sm mb-4 sentence-case">
                Quick actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="btn-secondary w-full">Register student</button>
                <button className="btn-secondary w-full">Issue fees</button>
                <button className="btn-secondary w-full">Assign teacher</button>
                <button className="btn-secondary w-full">Academic settings</button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="card p-6 shadow-card">
              <h3 className="text-text-primary font-600 text-sm mb-4 sentence-case">
                Academic settings
              </h3>
              <p className="text-text-secondary text-xs mb-4">
                Term dates, canteen rate (default GHS 20/day), grading format.
              </p>
              <button className="btn-primary w-full mb-4">Configure</button>
              <p className="text-text-secondary text-xs">
                Current term: not set &bull; Canteen rate: GHS 20.00/day
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
