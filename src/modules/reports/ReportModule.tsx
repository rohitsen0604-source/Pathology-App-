"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { formatDateTime, formatDate } from "@/lib/utils";
import { generateReportPdf } from "@/lib/pdfGenerator";
import { getStatusBadge } from "@/components/ui/Badge";
import {
  Printer,
  Download,
  Search,
  FlaskConical,
  Clock
} from "lucide-react";

export const ReportModule: React.FC = () => {
  const {
    orders,
    patients,
    doctors,
    settings,
    selectedOrderIdForReport,
    setSelectedOrderIdForReport,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterApprovedOnly, setFilterApprovedOnly] = useState(false);

  // Available orders for reporting
  const availableOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        o.id.toLowerCase().includes(q) ||
        o.patientName.toLowerCase().includes(q) ||
        o.doctorName.toLowerCase().includes(q) ||
        o.testCodes.some((c) => c.toLowerCase().includes(q));

      const matchesStatus = filterApprovedOnly ? o.status === "Approved" : true;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, filterApprovedOnly]);

  // Selected Order
  const currentOrderId = selectedOrderIdForReport || availableOrders[0]?.id;
  const currentOrder = useMemo(
    () => orders.find((o) => o.id === currentOrderId),
    [orders, currentOrderId]
  );

  const currentPatient = useMemo(
    () => (currentOrder ? patients.find((p) => p.id === currentOrder.patientId) : undefined),
    [patients, currentOrder]
  );

  const currentDoctor = useMemo(
    () => (currentOrder ? doctors.find((d) => d.id === currentOrder.doctorId) : undefined),
    [doctors, currentOrder]
  );

  const handleDownloadPdf = () => {
    if (!currentOrder || !currentPatient || !currentDoctor) return;
    generateReportPdf(currentOrder, currentPatient, currentDoctor, settings);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Diagnostic Pathology Reports
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              A4 Medical Reports Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Client-side PDF generation, electronic verification & printable clinical reports
          </p>
        </div>

        {currentOrder && currentOrder.status === "Approved" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download A4 PDF</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Main Two Columns: Report Selector vs A4 Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Search & Orders Picker */}
        <div className="no-print lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports by patient or ID..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filterApprovedOnly}
                onChange={(e) => setFilterApprovedOnly(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>Show approved reports only</span>
            </label>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-2 max-h-[650px] overflow-y-auto space-y-1.5">
            {availableOrders.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center italic">
                No orders match your search.
              </p>
            ) : (
              availableOrders.map((ord) => {
                const isSelected = ord.id === currentOrderId;
                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrderIdForReport(ord.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                      isSelected
                        ? "border-teal-500 bg-teal-50/60 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-teal-800">{ord.id}</span>
                      {getStatusBadge(ord.status)}
                    </div>
                    <p className="font-semibold text-slate-900 mt-1 truncate">{ord.patientName}</p>
                    <p className="text-[11px] text-slate-500">Ref: {ord.doctorName}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{ord.testCodes.join(", ")}</span>
                      <span>{formatDate(ord.orderDate)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (8 cols): A4 Medical Report Preview Canvas */}
        <div className="lg:col-span-8">
          {currentOrder && currentPatient && currentDoctor ? (
            <div className="space-y-4">
              {/* Approval status banner */}
              {currentOrder.status !== "Approved" && (
                <div className="no-print p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Status: {currentOrder.status}</strong> — This report has not completed Pathologist verification yet.
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Draft Preview
                  </span>
                </div>
              )}

              {/* A4 Report Canvas */}
              <div
                id="printable-report"
                className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-300 shadow-lg text-slate-900 min-h-[900px] flex flex-col justify-between"
              >
                <div>
                  {/* Top Header Bar */}
                  <div className="h-1.5 bg-teal-600 -mx-8 sm:-mx-10 -mt-8 sm:-mt-10 rounded-t-2xl mb-6" />

                  {/* Lab Branding Header */}
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-200 pb-5">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                        <FlaskConical className="w-7 h-7" />
                      </div>
                      <div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                          {settings.labName}
                        </h1>
                        <p className="text-xs text-teal-700 font-semibold mt-0.5">
                          {settings.tagline}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {settings.address}, {settings.city}, {settings.state} - {settings.pincode}
                          <br />
                          Ph: {settings.phone} • Email: {settings.email} • GST: {settings.gstNo}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-slate-100 sm:pl-4">
                      <span className="inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                        Clinical Pathology
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {settings.reportHeaderNote}
                      </p>
                    </div>
                  </div>

                  {/* Patient & Order Demographics Strip */}
                  <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Patient Name</p>
                      <p className="font-bold text-slate-900 text-sm">{currentPatient.fullName}</p>
                      <p className="text-slate-500">{currentPatient.age} Yrs / {currentPatient.gender}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Patient ID / Mobile</p>
                      <p className="font-bold text-teal-800 font-mono">{currentPatient.id}</p>
                      <p className="text-slate-500">{currentPatient.mobile}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Referred By</p>
                      <p className="font-bold text-slate-900">{currentDoctor.name}</p>
                      <p className="text-slate-500 truncate">{currentDoctor.clinic}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Order / Sample Ref</p>
                      <p className="font-bold text-slate-900 font-mono">{currentOrder.id}</p>
                      <p className="text-slate-500 font-mono">{currentOrder.sampleId}</p>
                    </div>
                  </div>

                  {/* Investigation Results Section */}
                  <div className="space-y-6">
                    {currentOrder.results && Object.keys(currentOrder.results).length > 0 ? (
                      Object.values(currentOrder.results).map((entry) => (
                        <div key={entry.testCode} className="space-y-2">
                          <div className="py-1 px-2.5 bg-slate-100 rounded text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center justify-between">
                            <span>{entry.testName} — ({entry.department})</span>
                            <span className="text-[10px] font-normal text-slate-500">
                              Specimen: Blood / Serum
                            </span>
                          </div>

                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-200 text-slate-500">
                              <tr>
                                <th className="py-2 px-2 font-semibold">Investigation Parameter</th>
                                <th className="py-2 px-2 font-semibold">Observed Value</th>
                                <th className="py-2 px-2 font-semibold">Unit</th>
                                <th className="py-2 px-2 font-semibold">Biological Reference Interval</th>
                                <th className="py-2 px-2 font-semibold text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {entry.parameters.map((param) => {
                                const isAbnormal = param.flag !== "Normal";
                                return (
                                  <tr key={param.parameterId} className="hover:bg-slate-50/50">
                                    <td className="py-2 px-2 font-medium text-slate-900">
                                      {param.parameterName}
                                    </td>
                                    <td
                                      className={`py-2 px-2 font-bold ${
                                        isAbnormal ? "text-rose-600 font-extrabold" : "text-slate-900"
                                      }`}
                                    >
                                      {param.value}
                                    </td>
                                    <td className="py-2 px-2 text-slate-500">
                                      {param.unit || "-"}
                                    </td>
                                    <td className="py-2 px-2 font-mono text-[11px] text-slate-600">
                                      {param.refRange}
                                    </td>
                                    <td className="py-2 px-2 text-right">
                                      {param.flag === "Normal" ? (
                                        <span className="text-[11px] font-semibold text-emerald-700">
                                          Normal
                                        </span>
                                      ) : param.flag === "High" ? (
                                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                          HIGH
                                        </span>
                                      ) : param.flag === "Low" ? (
                                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                          LOW
                                        </span>
                                      ) : (
                                        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                          CRITICAL
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>

                          {entry.technicianRemarks && (
                            <p className="text-[11px] text-slate-500 italic pl-2 border-l-2 border-teal-500">
                              Technician Remarks: {entry.technicianRemarks}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-xl border border-slate-100">
                        Test results have not been logged yet for this order. Go to Result Entry module.
                      </div>
                    )}

                    {/* Pathologist Verification Notes & Stamp */}
                    {currentOrder.approval && (
                      <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200 text-xs text-slate-700 space-y-1">
                        <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider">
                          Clinical Pathologist Verification & Impression
                        </span>
                        <p className="text-slate-800 leading-relaxed font-medium">
                          {currentOrder.approval.remarks}
                        </p>
                        <p className="text-[10px] text-slate-400 pt-1">
                          Verified on {formatDateTime(currentOrder.approval.approvedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Signatures & Disclaimer */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex items-end justify-between text-xs">
                    {/* Technician Signature */}
                    <div className="text-left">
                      <div className="w-36 h-0.5 bg-slate-300 mb-2" />
                      <p className="font-bold text-slate-900">{settings.technicianName}</p>
                      <p className="text-[11px] text-slate-500">Medical Lab Technologist (MLT)</p>
                    </div>

                    {/* Electronic Verification Stamp Badge */}
                    {currentOrder.status === "Approved" && (
                      <div className="text-center px-4 py-1.5 rounded-lg border-2 border-emerald-500 bg-emerald-50/80">
                        <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest">
                          DIGITALLY VERIFIED
                        </p>
                        <p className="text-[9px] text-emerald-600 font-semibold">
                          LABORA DEMO SYSTEM
                        </p>
                      </div>
                    )}

                    {/* Consultant Pathologist Signature */}
                    <div className="text-right">
                      <div className="w-48 h-0.5 bg-slate-300 mb-2 ml-auto" />
                      <p className="font-bold text-slate-900">{settings.pathologistName}</p>
                      <p className="text-[11px] text-slate-500">{settings.pathologistTitle}</p>
                      <p className="text-[10px] text-slate-400">Reg No: {settings.pathologistRegNo}</p>
                    </div>
                  </div>

                  {/* Legal Disclaimer Box */}
                  <div className="mt-6 pt-3 border-t border-slate-100 text-[9px] text-slate-400 text-center space-y-1">
                    <p className="font-semibold uppercase tracking-wider">
                      *** END OF EXAMINATION REPORT ***
                    </p>
                    <p>{settings.reportFooterText}</p>
                    <p>{settings.disclaimer}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-16 text-center rounded-xl border border-slate-200 text-slate-400">
              No report selected. Choose an order from the list on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

