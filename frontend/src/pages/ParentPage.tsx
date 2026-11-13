import React from "react";

const SCHOOL_NAME = "Eagle International School";

export default function ParentPage() {
  return (
    <div className="bg-neutral-page min-h-screen p-4 lg:p-8">
      <div className="max-w-xl mx-auto">
        <div className="card p-5 shadow-card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold">
              P
            </div>
            <h1 className="text-20 font-bold text-text-primary sentence-case">
              Parent Portal
            </h1>
          </div>
          <p className="text-text-secondary text-xs">
            Connected to {SCHOOL_NAME}
          </p>
        </div>

        {/* Child switcher */}
        <div className="card p-5 shadow-card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-neutral-secondary overflow-hidden flex-shrink-0">
              <img
                src="https://via.placeholder.com/40"
                alt="Child"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text-primary font-600 text-sm sentence-case">
                Ama Mensah ▾
              </p>
              <p className="text-text-secondary text-xs">Basic 4 &bull; JHS track</p>
            </div>
            <button className="text-brand-blue font-600 text-xs">Switch child</button>
          </div>
          <p className="text-text-secondary text-xs mb-4">
            Tap to switch between your linked children.
          </p>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="card p-5 shadow-card">
            <p className="text-text-secondary text-xs font-600 mb-1 uppercase tracking-wider">
              Total debt
            </p>
            <p className="text-3xl font-bold text-status-problem-text">GHS —</p>
            <p className="text-text-secondary text-xs">
              Itemized: fees, printing, books, canteen, dues
            </p>
          </div>
          <div className="card p-5 shadow-card">
            <p className="text-text-secondary text-xs font-600 mb-1 uppercase tracking-wider">
              Surplus credit
            </p>
            <p className="text-3xl font-bold text-success-green">GHS —</p>
            <p className="text-text-secondary text-xs">
              From absent prepaid canteen days
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-5 shadow-card">
            <h3 className="text-text-primary font-600 text-sm mb-3 sentence-case">
              Attendance
            </h3>
            <button className="btn-secondary w-full text-xs">View history</button>
          </div>
          <div className="card p-5 shadow-card">
            <h3 className="text-text-primary font-600 text-sm mb-3 sentence-case">
              Terminal reports
            </h3>
            <button className="btn-primary w-full text-xs">Download published reports</button>
          </div>
        </div>
      </div>
    </div>
  );
}
