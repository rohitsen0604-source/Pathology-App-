import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/types";
import {
  FlaskConical,
  RotateCcw,
  Download,
  Menu,
  ShieldCheck,
  User,
  ChevronDown
} from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, switchRole, resetDemoData, exportBackup } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const roles: { role: UserRole; label: string; badge: string }[] = [
    { role: "admin", label: "Administrator", badge: "All Access" },
    { role: "receptionist", label: "Receptionist", badge: "Booking & Patients" },
    { role: "technician", label: "Lab Technician", badge: "Samples & Results" },
    { role: "pathologist", label: "Pathologist (MD)", badge: "Verification" },
    { role: "billing", label: "Billing Executive", badge: "Accounts & Cash" },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        {/* Top Demo Banner */}
        <div className="bg-emerald-900 text-emerald-100 px-4 py-1.5 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>
              <strong>DEMO MODE:</strong> All patient records, test results, and invoices run locally in your browser via localStorage. Zero backend / zero external database.
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-emerald-200">
            <span>Demo Version 1.0</span>
            <button
              onClick={() => setShowConfirmReset(true)}
              className="text-white underline hover:text-emerald-300 font-semibold"
            >
              Reset Demo Data
            </button>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-slate-500 hover:text-slate-800 lg:hidden rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  LABORA
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                    PATHOLOGY
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 leading-none hidden sm:block">
                  Enterprise Pathology Management System
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick backup export button */}
            <button
              onClick={exportBackup}
              title="Export all data as JSON"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Export JSON</span>
            </button>

            {/* Demo Role Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-800 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="font-medium text-slate-500">Role:</span>
                <span className="font-semibold text-teal-800 capitalize">
                  {currentUser.role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowRoleMenu(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Switch Demo Role
                      </p>
                      <p className="text-xs text-slate-600">
                        Changes current simulated user & UI perspective
                      </p>
                    </div>

                    <div className="p-1">
                      {roles.map((r) => (
                        <button
                          key={r.role}
                          onClick={() => {
                            switchRole(r.role);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            currentUser.role === r.role
                              ? "bg-teal-50 text-teal-900 font-semibold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <p>{r.label}</p>
                            <p className="text-[10px] text-slate-400">{r.badge}</p>
                          </div>
                          {currentUser.role === r.role && (
                            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Current User Card */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                <User className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-left text-xs leading-tight">
                <p className="font-semibold text-slate-800">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400">{currentUser.designation}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Reset Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Reset Demo Dataset?
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              This will reset all patients, doctors, test bookings, sample statuses, results, and invoices back to the default factory demo dataset (20 patients, 15 tests, 20 sample orders). Any custom entries created during this session will be replaced.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setShowConfirmReset(false);
                }}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

