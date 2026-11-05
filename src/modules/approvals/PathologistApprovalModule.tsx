"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Order, ApprovalRecord } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { getStatusBadge } from "@/components/ui/Badge";
import {
  ShieldCheck,
  XCircle,
  RotateCcw,
  Search,
  Info,
  Clock
} from "lucide-react";

export const PathologistApprovalModule: React.FC = () => {
  const {
    orders,
    currentUser,
    approveReport,
    setActiveModule,
    setSelectedOrderIdForReport,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [pathologistRemarks, setPathologistRemarks] = useState(
    "Report values reviewed and verified against internal clinical quality benchmarks."
  );

  // Orders waiting for approval
  const pendingOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === "Pending Approval" || (o.status === "In Progress" && o.results && Object.keys(o.results).length > 0)
    );
  }, [orders]);

  // Approved orders
  const approvedOrders = useMemo(() => {
    return orders.filter((o) => o.status === "Approved");
  }, [orders]);

  const currentList = activeTab === "pending" ? pendingOrders : approvedOrders;

  const filteredList = useMemo(() => {
    return currentList.filter((o) => {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.patientName.toLowerCase().includes(q) ||
        o.doctorName.toLowerCase().includes(q) ||
        o.testCodes.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [currentList, searchQuery]);

  const handleOpenReview = (order: Order) => {
    setReviewOrder(order);
    setPathologistRemarks(
      order.approval?.remarks ||
        "Report values reviewed and verified against internal clinical quality benchmarks."
    );
  };

  const handleDecision = (decision: "Approved" | "Rejected" | "Correction Requested") => {
    if (!reviewOrder) return;

    const approvalRecord: ApprovalRecord = {
      approverId: currentUser.id,
      approverName: currentUser.name,
      approverRole: currentUser.designation,
      approvedAt: new Date().toISOString(),
      status: decision,
      remarks: pathologistRemarks,
    };

    approveReport(reviewOrder.id, approvalRecord);
    setReviewOrder(null);

    if (decision === "Approved") {
      setSelectedOrderIdForReport(reviewOrder.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pathologist Quality Verification & Approval
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {pendingOrders.length} Pending Approvals
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Senior Consultant Pathologist review, clinical correlation & electronic signature authorization
          </p>
        </div>

        {/* Tab switch */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "pending"
                ? "bg-white text-teal-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review ({pendingOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "approved"
                ? "bg-white text-teal-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified & Approved ({approvedOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Demonstration Legal Disclaimer */}
      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong>Simulated Approval Disclaimer:</strong> Pathologist authorization demonstrated here is simulated workflow logic for software testing. It does not represent legally valid medical authorization or accredited clinical diagnostic signoff.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Patient, Doctor or Test code..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Approval List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Patient Name</th>
                <th className="py-3 px-4 font-semibold">Referring Doctor</th>
                <th className="py-3 px-4 font-semibold">Investigations</th>
                <th className="py-3 px-4 font-semibold">Order Date</th>
                <th className="py-3 px-4 font-semibold">Workflow Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    {activeTab === "pending"
                      ? "No orders currently pending Pathologist approval. Great job!"
                      : "No approved reports found."}
                  </td>
                </tr>
              ) : (
                filteredList.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-teal-800 font-mono">
                      {ord.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {ord.patientName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {ord.doctorName}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {ord.testCodes.join(", ")}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDate(ord.orderDate)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(ord.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {ord.status === "Approved" ? (
                        <button
                          onClick={() => {
                            setSelectedOrderIdForReport(ord.id);
                            setActiveModule("reports");
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded transition-colors"
                        >
                          View Report PDF
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenReview(ord)}
                          className="px-3 py-1 text-[11px] font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
                        >
                          Review & Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Review & Approval Modal */}
      {reviewOrder && (
        <Modal
          isOpen={true}
          onClose={() => setReviewOrder(null)}
          title={`Clinical Verification — Order ${reviewOrder.id}`}
          description={`Patient: ${reviewOrder.patientName} • Referred By: ${reviewOrder.doctorName}`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            {/* Specimen & Patient Banner */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Patient:</span>
                <p className="font-bold text-slate-900">{reviewOrder.patientName}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Doctor:</span>
                <p className="font-bold text-slate-900">{reviewOrder.doctorName}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Sample Barcode:</span>
                <p className="font-mono font-bold text-teal-800">{reviewOrder.sampleId}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Registered:</span>
                <p className="text-slate-700">{formatDateTime(reviewOrder.orderDate)}</p>
              </div>
            </div>

            {/* Test Results Breakdown */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {reviewOrder.results && Object.keys(reviewOrder.results).length > 0 ? (
                Object.values(reviewOrder.results).map((entry) => (
                  <div key={entry.testCode} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>
                        {entry.testName} ({entry.testCode}) — {entry.department}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Entered by {entry.enteredBy} at {formatDate(entry.enteredAt)}
                      </span>
                    </div>

                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                        <tr>
                          <th className="py-2 px-3">Investigation Parameter</th>
                          <th className="py-2 px-3">Observed Value</th>
                          <th className="py-2 px-3">Unit</th>
                          <th className="py-2 px-3">Reference Range</th>
                          <th className="py-2 px-3">Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {entry.parameters.map((p) => (
                          <tr key={p.parameterId} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-medium text-slate-900">{p.parameterName}</td>
                            <td className="py-2 px-3 font-bold text-slate-900">{p.value}</td>
                            <td className="py-2 px-3 text-slate-500">{p.unit || "-"}</td>
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{p.refRange}</td>
                            <td className="py-2 px-3">{getStatusBadge(p.flag)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {entry.technicianRemarks && (
                      <div className="p-2 bg-slate-50 text-[11px] text-slate-500 italic border-t border-slate-100">
                        Technician note: {entry.technicianRemarks}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 italic">
                  No entered results recorded yet for this order. Please enter results first in the Result Entry module.
                </div>
              )}
            </div>

            {/* Pathologist Clinical Interpretation & Signoff Section */}
            <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 space-y-2">
              <label className="block text-xs font-bold text-teal-900">
                Pathologist Clinical Verification Remarks & Interpretation *
              </label>
              <textarea
                rows={2}
                value={pathologistRemarks}
                onChange={(e) => setPathologistRemarks(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-teal-200 rounded-lg text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                placeholder="Add clinical diagnostic correlation, recommendations or verification signoff..."
              />
              <p className="text-[10px] text-teal-700">
                Approving Pathologist: <strong>{currentUser.name}</strong> ({currentUser.designation})
              </p>
            </div>

            {/* Decision Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setReviewOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDecision("Correction Requested")}
                  className="px-3.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Request Corrections</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision("Rejected")}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject Order</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision("Approved")}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Approve & Authorize Report</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

