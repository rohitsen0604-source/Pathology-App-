"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { LabTest, ResultValue, ResultFlag, TestResultEntry } from "@/types";
import { formatDate } from "@/lib/utils";
import { getStatusBadge } from "@/components/ui/Badge";
import {
  Save,
  Send,
  Info,
  CheckCircle2,
} from "lucide-react";

interface TestParameterFormProps {
  orderId: string;
  test: LabTest;
  existingEntry?: TestResultEntry;
  currentUserName: string;
  onSave: (entry: TestResultEntry, nextTestCode?: string) => void;
  nextTestCode?: string;
}

const TestParameterForm: React.FC<TestParameterFormProps> = ({
  test,
  existingEntry,
  currentUserName,
  onSave,
  nextTestCode,
}) => {
  const [paramValues, setParamValues] = useState<Record<string, { value: string; flag: ResultFlag; remarks: string }>>(() => {
    const initialMap: Record<string, { value: string; flag: ResultFlag; remarks: string }> = {};

    test.parameters.forEach((param) => {
      const found = existingEntry?.parameters.find((p) => p.parameterId === param.id);
      if (found) {
        initialMap[param.id] = {
          value: found.value,
          flag: found.flag,
          remarks: found.remarks || "",
        };
      } else {
        const defaultVal = param.refMin !== undefined && param.refMax !== undefined
          ? ((param.refMin + param.refMax) / 2).toFixed(1)
          : param.refRange.includes("Negative") || param.refRange.includes("Nil")
          ? "Nil"
          : param.refRange.split("-")[0]?.trim() || "Normal";

        initialMap[param.id] = {
          value: defaultVal,
          flag: "Normal",
          remarks: "",
        };
      }
    });

    return initialMap;
  });

  const [technicianRemarks, setTechnicianRemarks] = useState(existingEntry?.technicianRemarks || "");

  const handleValueChange = (paramId: string, val: string) => {
    const param = test.parameters.find((p) => p.id === paramId);
    let computedFlag: ResultFlag = "Normal";

    if (param && param.refType === "range" && param.refMin !== undefined && param.refMax !== undefined) {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        if (num < param.refMin) {
          computedFlag = num < param.refMin * 0.7 ? "Critical" : "Low";
        } else if (num > param.refMax) {
          computedFlag = num > param.refMax * 1.3 ? "Critical" : "High";
        } else {
          computedFlag = "Normal";
        }
      }
    } else {
      const lower = val.toLowerCase();
      if (lower.includes("pos") || lower.includes("reactive") || lower.includes("turbid") || lower.includes("high")) {
        computedFlag = "High";
      } else {
        computedFlag = "Normal";
      }
    }

    setParamValues((prev) => ({
      ...prev,
      [paramId]: {
        ...prev[paramId],
        value: val,
        flag: computedFlag,
      },
    }));
  };

  const handleFlagOverride = (paramId: string, flag: ResultFlag) => {
    setParamValues((prev) => ({
      ...prev,
      [paramId]: {
        ...prev[paramId],
        flag: flag,
      },
    }));
  };

  const handleSubmit = (status: "draft" | "submitted") => {
    const parametersList: ResultValue[] = test.parameters.map((p) => {
      const current = paramValues[p.id] || { value: "-", flag: "Normal" as ResultFlag, remarks: "" };
      return {
        parameterId: p.id,
        parameterName: p.name,
        value: current.value,
        unit: p.unit,
        refRange: p.refRange,
        flag: current.flag,
        remarks: current.remarks,
      };
    });

    const resultEntry: TestResultEntry = {
      testCode: test.code,
      testName: test.name,
      department: test.department,
      parameters: parametersList,
      technicianRemarks: technicianRemarks,
      status: status,
      enteredAt: new Date().toISOString(),
      enteredBy: currentUserName,
    };

    onSave(resultEntry, nextTestCode);
  };

  return (
    <div className="space-y-4 pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{test.name}</h4>
          <p className="text-xs text-slate-500">
            Department: {test.department} • Specimen: {test.sampleType}
          </p>
        </div>

        <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
          {test.parameters.length} Test Parameters
        </span>
      </div>

      {/* Parameter Entry Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Investigation Parameter</th>
              <th className="py-2.5 px-3 font-semibold">Observed Value</th>
              <th className="py-2.5 px-3 font-semibold">Unit</th>
              <th className="py-2.5 px-3 font-semibold">Demo Ref Interval</th>
              <th className="py-2.5 px-3 font-semibold">Flag Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {test.parameters.map((param) => {
              const current = paramValues[param.id] || { value: "", flag: "Normal" as ResultFlag, remarks: "" };
              return (
                <tr key={param.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-medium text-slate-900 max-w-[180px]">
                    {param.name}
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={current.value}
                      onChange={(e) => handleValueChange(param.id, e.target.value)}
                      placeholder="Enter value"
                      className="w-28 px-2.5 py-1 text-xs border border-slate-200 rounded font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {param.unit || "-"}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                    {param.refRange}
                  </td>
                  <td className="py-2.5 px-3">
                    <select
                      value={current.flag}
                      onChange={(e) => handleFlagOverride(param.id, e.target.value as ResultFlag)}
                      className={`text-xs font-bold rounded px-2 py-0.5 border ${
                        current.flag === "Normal"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : current.flag === "High"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : current.flag === "Low"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Low">Low</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Technician Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Technician Internal Remarks / Observations
        </label>
        <input
          type="text"
          value={technicianRemarks}
          onChange={(e) => setTechnicianRemarks(e.target.value)}
          placeholder="e.g. Repeated run on automated analyzer for confirmation..."
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
        />
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Logged technician: <strong>{currentUserName}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-slate-600" />
            <span>Save as Draft</span>
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("submitted")}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit for Pathologist Approval</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ResultEntryModule: React.FC = () => {
  const {
    orders,
    tests,
    currentUser,
    updateResults,
    setActiveModule,
  } = useApp();

  const [selectedOrderId, setSelectedOrderId] = useState<string>(() => orders[0]?.id || "");
  const [selectedTestCode, setSelectedTestCode] = useState<string>("");

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || orders[0],
    [orders, selectedOrderId]
  );

  const activeTestCode = selectedTestCode && selectedOrder?.testCodes.includes(selectedTestCode)
    ? selectedTestCode
    : selectedOrder?.testCodes[0] || "";

  const activeTest = useMemo(
    () => tests.find((t) => t.code === activeTestCode),
    [tests, activeTestCode]
  );

  const handleSaveResult = (resultEntry: TestResultEntry, nextTestCode?: string) => {
    if (!selectedOrder) return;
    updateResults(selectedOrder.id, resultEntry.testCode, resultEntry);
    if (nextTestCode) {
      setSelectedTestCode(nextTestCode);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Laboratory Result Entry & Validation
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Tech Workspace
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter observed values, auto-calculate diagnostic flags, and submit for Pathologist verification
          </p>
        </div>

        <button
          onClick={() => setActiveModule("approvals")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <CheckCircle2 className="w-4 h-4 text-slate-600" />
          <span>Go to Pathologist Approvals →</span>
        </button>
      </div>

      {/* Illustrative Notice */}
      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong>Simulated Auto-Flag Evaluation:</strong> Values outside demo reference ranges automatically trigger flags (Low, Normal, High, Critical) with color highlights. This is for software UI demonstration.
        </p>
      </div>

      {/* Two Column Layout: Order Selector & Result Entry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Col: Order Picker */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Select Active Order
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {orders.map((ord) => {
              const isSelected = ord.id === selectedOrder?.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => {
                    setSelectedOrderId(ord.id);
                    setSelectedTestCode(ord.testCodes[0] || "");
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all text-xs ${
                    isSelected
                      ? "border-teal-500 bg-teal-50/60 font-medium"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-800 font-mono">{ord.id}</span>
                    {getStatusBadge(ord.status)}
                  </div>
                  <p className="font-semibold text-slate-900 mt-1 truncate">{ord.patientName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {ord.testCodes.join(", ")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 3 Cols: Active Order Test Results Form */}
        <div className="lg:col-span-3 space-y-4">
          {selectedOrder ? (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
              {/* Patient Meta Strip */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Subject</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedOrder.patientName}</p>
                  <p className="text-slate-500">Order ID: {selectedOrder.id} • Sample: {selectedOrder.sampleId}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Referring Clinician</span>
                  <p className="font-semibold text-slate-800">{selectedOrder.doctorName}</p>
                  <p className="text-slate-500">{formatDate(selectedOrder.orderDate)}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Current State</span>
                  <div className="mt-0.5">{getStatusBadge(selectedOrder.status)}</div>
                </div>
              </div>

              {/* Assigned Tests Tabs */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">Tests in this Order:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.testCodes.map((code) => {
                    const isSelected = code === activeTestCode;
                    const testStatus = selectedOrder.results?.[code]?.status || "pending";
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setSelectedTestCode(code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                          isSelected
                            ? "bg-teal-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <span className="font-mono">{code}</span>
                        {testStatus === "submitted" ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        ) : testStatus === "draft" ? (
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Test Parameter Entry Form */}
              {activeTest ? (
                <TestParameterForm
                  key={`${selectedOrder.id}-${activeTest.code}`}
                  orderId={selectedOrder.id}
                  test={activeTest}
                  existingEntry={selectedOrder.results?.[activeTest.code]}
                  currentUserName={currentUser.name}
                  nextTestCode={selectedOrder.testCodes.find((c) => c !== activeTest.code)}
                  onSave={handleSaveResult}
                />
              ) : null}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
              No order selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
