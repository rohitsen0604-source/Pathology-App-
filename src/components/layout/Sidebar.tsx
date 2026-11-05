import React from "react";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FlaskConical,
  Package,
  CalendarPlus,
  TestTubes,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  CreditCard,
  UserCog,
  BarChart3,
  Settings,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeModule, setActiveModule, samples, orders, invoices } = useApp();

  const pendingSamplesCount = samples.filter((s) => s.status === "Pending Collection" || s.status === "Collected").length;
  const pendingApprovalsCount = orders.filter((o) => o.status === "Pending Approval").length;
  const pendingPaymentsCount = invoices.filter((i) => i.paymentStatus !== "Paid").length;

  const navGroups = [
    {
      group: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "analytics", label: "Lab Analytics", icon: BarChart3 },
      ],
    },
    {
      group: "Clinical Operations",
      items: [
        { id: "booking", label: "Book Test / Order", icon: CalendarPlus, highlight: true },
        { id: "patients", label: "Patient Management", icon: Users },
        { id: "doctors", label: "Doctor Directory", icon: UserCheck },
        {
          id: "samples",
          label: "Sample Management",
          icon: TestTubes,
          badge: pendingSamplesCount > 0 ? pendingSamplesCount : undefined,
          badgeColor: "bg-teal-100 text-teal-800",
        },
        {
          id: "results",
          label: "Result Entry",
          icon: FileSpreadsheet,
        },
        {
          id: "approvals",
          label: "Pathologist Approval",
          icon: CheckCircle2,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeColor: "bg-amber-100 text-amber-800 font-bold",
        },
        { id: "reports", label: "Report Generation", icon: FileText },
      ],
    },
    {
      group: "Catalogue & Packages",
      items: [
        { id: "tests", label: "Test Catalogue", icon: FlaskConical },
        { id: "packages", label: "Health Packages", icon: Package },
      ],
    },
    {
      group: "Accounts & Administration",
      items: [
        {
          id: "billing",
          label: "Billing & Invoices",
          icon: CreditCard,
          badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined,
          badgeColor: "bg-rose-100 text-rose-800",
        },
        { id: "staff", label: "Staff Directory", icon: UserCog },
        { id: "settings", label: "Settings & Backup", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 z-40 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
              L
            </div>
            <span className="font-bold text-slate-900 text-sm">Labora Pathology</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {grp.group}
              </p>
              <div className="space-y-0.5 pt-1">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-teal-600 text-white shadow-xs font-semibold"
                          : item.highlight
                          ? "text-teal-700 bg-teal-50/70 hover:bg-teal-100/60 font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive
                              ? "text-white"
                              : item.highlight
                              ? "text-teal-600"
                              : "text-slate-400"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive ? "bg-teal-800 text-white" : item.badgeColor
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Local Storage Indicator pill at bottom of sidebar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="p-2.5 rounded-lg border border-slate-200/80 bg-white text-[11px] text-slate-500 flex flex-col gap-1">
            <div className="flex items-center justify-between text-slate-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Storage: Local
              </span>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                Indexed
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Stored in browser localStorage. No cloud upload.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

