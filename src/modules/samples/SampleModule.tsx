"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Sample } from "@/types";
import { formatDateTime, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { getStatusBadge } from "@/components/ui/Badge";
import {
  Search,
  XCircle,
  Barcode,
  Printer,
  FileSpreadsheet,
  ArrowRight
} from "lucide-react";

export const SampleModule: React.FC = () => {
  const {
    samples,
    patients,
    updateSampleStatus,
    setActiveModule,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [viewingBarcodeSample, setViewingBarcodeSample] = useState<Sample | null>(null);
  const [rejectionSampleId, setRejectionSampleId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("Sample hemolyzed / insufficient quantity");

  const filteredSamples = useMemo(() => {
    return samples.filter((s) => {
      const q = searchQuery.toLowerCase();
      const pat = patients.find((p) => p.id === s.patientId);
      const matchesSearch =
        s.id.toLowerCase().includes(q) ||
        s.orderId.toLowerCase().includes(q) ||
        s.barcode.toLowerCase().includes(q) ||
        (pat && pat.fullName.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "all" || s.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [samples, searchQuery, statusFilter, patients]);

  const handleCollect = (sampleId: string) => {
    updateSampleStatus(sampleId, "Collected");
  };

  const handleReceive = (sampleId: string) => {
    updateSampleStatus(sampleId, "Received");
  };

  const handleProcess = (sampleId: string) => {
    updateSampleStatus(sampleId, "Processing");
  };

  const handleConfirmRejection = () => {
    if (rejectionSampleId) {
      updateSampleStatus(rejectionSampleId, "Rejected", rejectionReason);
      setRejectionSampleId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Sample Tracking & Phlebotomy
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {samples.length} Specimens
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Specimen collection, barcode generation, lab accessioning & chain of custody
          </p>
        </div>

        <button
          onClick={() => setActiveModule("results")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-slate-600" />
          <span>Go to Result Entry →</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Sample ID, Order ID, Barcode, or Patient Name..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium">Status Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Statuses ({samples.length})</option>
              <option value="Pending Collection">Pending Collection</option>
              <option value="Collected">Collected</option>
              <option value="Received">Received</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Samples Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Sample ID / Barcode</th>
                <th className="py-3 px-4 font-semibold">Order Ref</th>
                <th className="py-3 px-4 font-semibold">Patient Name</th>
                <th className="py-3 px-4 font-semibold">Specimen Type</th>
                <th className="py-3 px-4 font-semibold">Assigned Tests</th>
                <th className="py-3 px-4 font-semibold">Collection Info</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSamples.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    No samples match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredSamples.map((s) => {
                  const pat = patients.find((p) => p.id === s.patientId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-teal-800 font-mono">
                            {s.id}
                          </span>
                          <button
                            onClick={() => setViewingBarcodeSample(s)}
                            title="View Barcode Label"
                            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                          >
                            <Barcode className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {s.orderId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {pat?.fullName || s.patientId}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {s.sampleType}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {s.testCodes.join(", ")}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {s.collectedAt ? (
                          <div>
                            <p className="font-medium text-slate-800">{formatDateTime(s.collectedAt)}</p>
                            <p className="text-[10px] text-slate-400">By: {s.collectedBy}</p>
                          </div>
                        ) : (
                          <span className="text-amber-600 italic">Not collected yet</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(s.status)}
                        {s.rejectionReason && (
                          <p className="text-[10px] text-rose-600 mt-0.5 truncate max-w-[120px]" title={s.rejectionReason}>
                            {s.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {s.status === "Pending Collection" && (
                            <button
                              onClick={() => handleCollect(s.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded transition-colors"
                            >
                              Collect Specimen
                            </button>
                          )}

                          {s.status === "Collected" && (
                            <button
                              onClick={() => handleReceive(s.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors"
                            >
                              Receive in Lab
                            </button>
                          )}

                          {s.status === "Received" && (
                            <button
                              onClick={() => handleProcess(s.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded transition-colors"
                            >
                              Start Processing
                            </button>
                          )}

                          {s.status === "Processing" && (
                            <button
                              onClick={() => setActiveModule("results")}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors flex items-center gap-1"
                            >
                              <span>Enter Results</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {s.status !== "Completed" && s.status !== "Rejected" && (
                            <button
                              onClick={() => setRejectionSampleId(s.id)}
                              title="Reject Sample"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {s.status === "Completed" && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              Testing Complete
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barcode Label Modal */}
      {viewingBarcodeSample && (
        <Modal
          isOpen={true}
          onClose={() => setViewingBarcodeSample(null)}
          title={`Specimen Barcode Label — ${viewingBarcodeSample.id}`}
          description="Simulated 2-inch specimen tube label for laboratory barcode accessioning."
          maxWidth="md"
        >
          <div className="space-y-4 text-center">
            {/* Visual Simulated Barcode Tag */}
            <div className="border-2 border-dashed border-slate-300 p-5 rounded-xl bg-white max-w-xs mx-auto shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                LABORA PATHOLOGY SPECIMEN
              </p>
              <h4 className="text-sm font-bold text-slate-900 mt-1">
                {patients.find((p) => p.id === viewingBarcodeSample.patientId)?.fullName}
              </h4>
              <p className="text-[11px] text-slate-600">
                {viewingBarcodeSample.sampleType} • {viewingBarcodeSample.testCodes.join(", ")}
              </p>

              {/* Barcode visual stripes */}
              <div className="my-3 py-1 flex items-center justify-center gap-0.5 bg-white">
                {[4, 2, 6, 2, 3, 5, 2, 4, 2, 5, 2, 3, 6, 2, 4, 3, 5, 2, 3, 4, 6, 2, 5, 3, 2, 4, 5, 2, 6, 3].map(
                  (h, idx) => (
                    <div
                      key={idx}
                      className="bg-black"
                      style={{
                        width: idx % 3 === 0 ? "3px" : "1.5px",
                        height: `${32 + (h % 3) * 6}px`,
                      }}
                    />
                  )
                )}
              </div>

              <p className="font-mono font-bold tracking-widest text-xs text-slate-900">
                *{viewingBarcodeSample.barcode}*
              </p>

              <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
                <span>Order: {viewingBarcodeSample.orderId}</span>
                <span>{formatDate(viewingBarcodeSample.collectedAt)}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              In clinical deployment, this label is printed via thermal barcode printer (Zebra / TSC) and affixed to primary specimen tubes.
            </p>

            <button
              onClick={() => {
                window.print();
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Specimen Label</span>
            </button>
          </div>
        </Modal>
      )}

      {/* Reject Specimen Modal */}
      {rejectionSampleId && (
        <Modal
          isOpen={true}
          onClose={() => setRejectionSampleId(null)}
          title="Reject Specimen"
          description="Log clinical rejection reason for quality assurance and recollection."
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rejection Reason *
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 mb-2"
              >
                <option value="Sample hemolyzed / red blood cell rupture">Sample hemolyzed / red blood cell rupture</option>
                <option value="Insufficient sample volume (QNS - Quantity Not Sufficient)">Insufficient sample volume (QNS)</option>
                <option value="Clotted specimen in EDTA anticoagulant vial">Clotted specimen in EDTA tube</option>
                <option value="Mislabeled or unlabelled specimen container">Mislabeled or unlabelled specimen container</option>
                <option value="Lipemic or severely turbid sample">Lipemic or severely turbid sample</option>
                <option value="Sample collection tube expired or compromised">Sample tube expired or compromised</option>
              </select>

              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Or specify custom reason..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setRejectionSampleId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Confirm Specimen Rejection
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

