"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { LabSettings } from "@/types";
import {
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  Save,
  Info
} from "lucide-react";

export const SettingsModule: React.FC = () => {
  const {
    settings,
    saveSettings,
    exportBackup,
    importBackup,
    exportPatientsCsv,
    resetDemoData,
    patients,
    orders,
    tests,
    samples,
    invoices,
    staff,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"general" | "reports" | "signatories" | "backup">("general");

  const [formData, setFormData] = useState<LabSettings>({ ...settings });
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importBackup(content);
        setImportStatus(res);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Laboratory Settings & Data Management
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Browser Storage
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure laboratory branding, report templates, demo signatories & JSON backup archives
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "general" ? "bg-white text-teal-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Laboratory Profile
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "reports" ? "bg-white text-teal-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Report Headers & Footer
          </button>
          <button
            onClick={() => setActiveTab("signatories")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "signatories" ? "bg-white text-teal-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Signatory Profiles
          </button>
          <button
            onClick={() => setActiveTab("backup")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "backup" ? "bg-white text-teal-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Backup & JSON Data
          </button>
        </div>
      </div>

      {/* Tab 1: General Lab Profile */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Facility Demographics & Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Laboratory Official Facility Name
              </label>
              <input
                type="text"
                required
                value={formData.labName}
                onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tagline / Motto
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Contact(s)
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Laboratory Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GST Registration No.
              </label>
              <input
                type="text"
                value={formData.gstNo}
                onChange={(e) => setFormData({ ...formData, gstNo: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Website
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Laboratory Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Report Customization */}
      {activeTab === "reports" && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            A4 Diagnostic Report Headers & Disclaimers
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Top Accreditation / Quality Notice Strip
            </label>
            <input
              type="text"
              value={formData.reportHeaderNote}
              onChange={(e) => setFormData({ ...formData, reportHeaderNote: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Report Footer Note
            </label>
            <input
              type="text"
              value={formData.reportFooterText}
              onChange={(e) => setFormData({ ...formData, reportFooterText: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Legal Medical Disclaimer (Appears at bottom of every PDF)
            </label>
            <textarea
              rows={3}
              value={formData.disclaimer}
              onChange={(e) => setFormData({ ...formData, disclaimer: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Report Templates</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Signatory Profiles */}
      {activeTab === "signatories" && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Authorized Report Signatories (Demonstration Only)
          </h3>

          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p>
              These simulated clinician credentials are printed on final approved diagnostic reports to illustrate professional laboratory reports.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Senior Pathologist Name *
              </label>
              <input
                type="text"
                required
                value={formData.pathologistName}
                onChange={(e) => setFormData({ ...formData, pathologistName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medical Qualifications & Title *
              </label>
              <input
                type="text"
                required
                value={formData.pathologistTitle}
                onChange={(e) => setFormData({ ...formData, pathologistTitle: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medical Council Registration No. *
              </label>
              <input
                type="text"
                required
                value={formData.pathologistRegNo}
                onChange={(e) => setFormData({ ...formData, pathologistRegNo: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medical Lab Technologist (MLT) *
              </label>
              <input
                type="text"
                required
                value={formData.technicianName}
                onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Signatories</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Backup, JSON Archive & Storage Reset */}
      {activeTab === "backup" && (
        <div className="space-y-6">
          {/* Storage Warning Banner */}
          <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-950">
                Browser Local Storage Architecture Notice
              </p>
              <p className="mt-1 leading-relaxed">
                All records (patients, orders, test results, invoices) exist solely in this web browser&apos;s localStorage. Clearing your browser cookies or browsing history will delete locally saved records unless you export a JSON backup first.
              </p>
            </div>
          </div>

          {/* Current Storage Inventory */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Current Local Storage Records Count
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-400 font-medium">Patients</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{patients.length}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-400 font-medium">Orders</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{orders.length}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-400 font-medium">Tests</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{tests.length}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-400 font-medium">Samples</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{samples.length}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-400 font-medium">Invoices</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{invoices.length}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-400 font-medium">Staff</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{staff.length}</p>
              </div>
            </div>
          </div>

          {/* Backup & Restore Operations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Export JSON */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-teal-600" />
                <h4 className="text-sm font-bold text-slate-900">Export Full Data Backup</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Download a complete, validated JSON snapshot containing all patients, test catalogues, packages, specimens, results, invoices, and settings.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={exportBackup}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup (.json)</span>
                </button>
                <button
                  type="button"
                  onClick={exportPatientsCsv}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Export Patients CSV</span>
                </button>
              </div>
            </div>

            {/* Import JSON */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-600" />
                <h4 className="text-sm font-bold text-slate-900">Restore from JSON Backup</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Restore application state from a previously exported Labora JSON backup file. Validates JSON structure before applying.
              </p>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-teal-700" />
                  <span>Choose JSON Backup File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {importStatus && (
                <div
                  className={`p-2.5 rounded-lg text-xs ${
                    importStatus.success
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {importStatus.message}
                </div>
              )}
            </div>
          </div>

          {/* Reset Demo Data Card */}
          <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-rose-700">
                <RotateCcw className="w-5 h-5" />
                <h4 className="text-sm font-bold">Reset Demo Dataset</h4>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Restores the application to its original sample data (20 fictional patients, 5 doctors, 15 tests, 20 sample orders, pending results, completed reports).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors shrink-0"
            >
              Reset to Factory Demo Data
            </button>
          </div>
        </div>
      )}

      {/* Demo Reset Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <RotateCcw className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Reset Demo Dataset?
            </h3>
            <p className="text-xs text-slate-500 mt-2 mb-5 leading-relaxed">
              This will overwrite any newly created patients, test results, or invoices with the original seed demo dataset. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setShowConfirmReset(false);
                }}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

