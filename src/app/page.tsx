"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { LoginScreen } from "@/components/layout/LoginScreen";

// Modules
import { DashboardModule } from "@/modules/dashboard/DashboardModule";
import { PatientModule } from "@/modules/patients/PatientModule";
import { DoctorModule } from "@/modules/doctors/DoctorModule";
import { TestCatalogueModule } from "@/modules/tests/TestCatalogueModule";
import { PackageModule } from "@/modules/packages/PackageModule";
import { TestBookingModule } from "@/modules/orders/TestBookingModule";
import { SampleModule } from "@/modules/samples/SampleModule";
import { ResultEntryModule } from "@/modules/results/ResultEntryModule";
import { PathologistApprovalModule } from "@/modules/approvals/PathologistApprovalModule";
import { ReportModule } from "@/modules/reports/ReportModule";
import { BillingModule } from "@/modules/billing/BillingModule";
import { StaffModule } from "@/modules/staff/StaffModule";
import { AnalyticsModule } from "@/modules/analytics/AnalyticsModule";
import { SettingsModule } from "@/modules/settings/SettingsModule";

export default function Home() {
  const { isInitialized, activeModule } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Avoid hydration mismatch while reading localStorage
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Labora Pathology System...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <DashboardModule />;
      case "analytics":
        return <AnalyticsModule />;
      case "patients":
        return <PatientModule />;
      case "doctors":
        return <DoctorModule />;
      case "tests":
        return <TestCatalogueModule />;
      case "packages":
        return <PackageModule />;
      case "booking":
        return <TestBookingModule />;
      case "samples":
        return <SampleModule />;
      case "results":
        return <ResultEntryModule />;
      case "approvals":
        return <PathologistApprovalModule />;
      case "reports":
        return <ReportModule />;
      case "billing":
        return <BillingModule />;
      case "staff":
        return <StaffModule />;
      case "settings":
        return <SettingsModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navigation & Role Switcher */}
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex w-full">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}
