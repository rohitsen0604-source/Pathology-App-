"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { LabTest, TestParameter } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  Info
} from "lucide-react";

export const TestCatalogueModule: React.FC = () => {
  const { tests, saveTest, deleteTest } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);
  const [viewingTest, setViewingTest] = useState<LabTest | null>(null);
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    department: LabTest["department"];
    sampleType: LabTest["sampleType"];
    price: number;
    turnaroundHours: number;
    description: string;
    parameters: TestParameter[];
  }>({
    code: "",
    name: "",
    department: "Biochemistry",
    sampleType: "Serum",
    price: 500,
    turnaroundHours: 4,
    description: "",
    parameters: [],
  });

  const departments = ["Hematology", "Biochemistry", "Clinical Pathology", "Serology", "Microbiology", "Endocrinology"];

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q);

      const matchesDept = deptFilter === "all" || t.department === deptFilter;

      return matchesSearch && matchesDept;
    });
  }, [tests, searchQuery, deptFilter]);

  const handleOpenAdd = () => {
    setEditingTest(null);
    setFormData({
      code: "NEW_TEST",
      name: "",
      department: "Biochemistry",
      sampleType: "Serum",
      price: 450,
      turnaroundHours: 4,
      description: "Standard diagnostic investigation.",
      parameters: [
        {
          id: "P1",
          name: "Primary Parameter",
          unit: "mg/dL",
          refRange: "10 - 50",
          refMin: 10,
          refMax: 50,
          refType: "range",
        },
      ],
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (t: LabTest) => {
    setEditingTest(t);
    setFormData({
      code: t.code,
      name: t.name,
      department: t.department,
      sampleType: t.sampleType,
      price: t.price,
      turnaroundHours: t.turnaroundHours,
      description: t.description || "",
      parameters: [...t.parameters],
    });
    setIsAddEditOpen(true);
  };

  const handleAddParam = () => {
    const nextIdx = formData.parameters.length + 1;
    setFormData({
      ...formData,
      parameters: [
        ...formData.parameters,
        {
          id: `P_${Date.now()}`,
          name: `Parameter ${nextIdx}`,
          unit: "",
          refRange: "Normal",
          refType: "range",
        },
      ],
    });
  };

  const handleRemoveParam = (index: number) => {
    const updated = [...formData.parameters];
    updated.splice(index, 1);
    setFormData({ ...formData, parameters: updated });
  };

  const handleParamChange = (index: number, field: keyof TestParameter, value: unknown) => {
    const updated = [...formData.parameters];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, parameters: updated });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (editingTest) {
      saveTest({
        id: editingTest.id,
        ...formData,
      });
    } else {
      saveTest(formData);
    }

    setIsAddEditOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTestId) {
      deleteTest(deleteTestId);
      setDeleteTestId(null);
      if (viewingTest?.id === deleteTestId) {
        setViewingTest(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Clinical Test Catalogue
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {tests.length} Active Tests
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-configured investigations with illustrative reference intervals and parameters
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Test</span>
        </button>
      </div>

      {/* Illustrative Reference Alert */}
      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong>Illustrative Demo Reference Intervals:</strong> Biological reference ranges provided in this catalogue are demo baseline values for software demonstration purposes only.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by test name, code (e.g. CBC, LFT, TSH), or department..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Department:</label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tests Grid / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Test Code</th>
                <th className="py-3 px-4 font-semibold">Investigation Name</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Sample Type</th>
                <th className="py-3 px-4 font-semibold">TAT</th>
                <th className="py-3 px-4 font-semibold">Parameters</th>
                <th className="py-3 px-4 font-semibold">Price</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    No investigations match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-teal-800 font-mono">
                      {test.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                      {test.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {test.department}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {test.sampleType}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {test.turnaroundHours} hrs
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-teal-50 text-teal-800 px-2 py-0.5 rounded">
                        {test.parameters.length} params
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(test.price)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setViewingTest(test)}
                          title="View Parameters & Reference Ranges"
                          className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(test)}
                          title="Edit Test & Pricing"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTestId(test.id)}
                          title="Delete Test"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Test Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingTest ? `Edit Test — ${editingTest.code}` : "Add New Clinical Test"}
        description="Configure test parameters, turnaround times, and demo reference intervals."
        maxWidth="3xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Test Code (Unique) *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. CBC, LFT"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg uppercase font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Investigation Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Complete Blood Count"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as LabTest["department"] })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sample / Specimen Type *
              </label>
              <select
                value={formData.sampleType}
                onChange={(e) => setFormData({ ...formData, sampleType: e.target.value as LabTest["sampleType"] })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              >
                <option value="Whole Blood">Whole Blood</option>
                <option value="Serum">Serum</option>
                <option value="Plasma">Plasma</option>
                <option value="Urine">Urine</option>
                <option value="Swab">Swab</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Turnaround Time (Hours) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={formData.turnaroundHours}
                onChange={(e) => setFormData({ ...formData, turnaroundHours: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Description / Indications
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Diagnostic indications..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Test Parameters Configuration Section */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800">
                Test Parameters & Demo Biological Reference Intervals ({formData.parameters.length})
              </h4>
              <button
                type="button"
                onClick={handleAddParam}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-2 py-1 rounded"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Parameter</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {formData.parameters.map((param, idx) => (
                <div
                  key={param.id || idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => handleParamChange(idx, "name", e.target.value)}
                    placeholder="Parameter Name"
                    className="flex-2 px-2 py-1 text-xs border border-slate-200 rounded bg-white text-slate-900"
                  />
                  <input
                    type="text"
                    value={param.unit}
                    onChange={(e) => handleParamChange(idx, "unit", e.target.value)}
                    placeholder="Unit (e.g. g/dL)"
                    className="w-20 px-2 py-1 text-xs border border-slate-200 rounded bg-white text-slate-900"
                  />
                  <input
                    type="text"
                    value={param.refRange}
                    onChange={(e) => handleParamChange(idx, "refRange", e.target.value)}
                    placeholder="Demo Reference Range"
                    className="flex-2 px-2 py-1 text-xs border border-slate-200 rounded bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveParam(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
            >
              {editingTest ? "Update Test" : "Save Test"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Test Details Modal */}
      {viewingTest && (
        <Modal
          isOpen={true}
          onClose={() => setViewingTest(null)}
          title={`${viewingTest.name} (${viewingTest.code})`}
          description={`Department of ${viewingTest.department} • Specimen: ${viewingTest.sampleType}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold">Standard Price</span>
                <p className="text-base font-bold text-teal-800 mt-0.5">{formatCurrency(viewingTest.price)}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold">Turnaround Time</span>
                <p className="text-base font-bold text-slate-800 mt-0.5">{viewingTest.turnaroundHours} Hours</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold">Specimen Requirement</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{viewingTest.sampleType}</p>
              </div>
            </div>

            {viewingTest.description && (
              <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                {viewingTest.description}
              </p>
            )}

            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">
                Configured Investigation Parameters ({viewingTest.parameters.length})
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Parameter Name</th>
                      <th className="py-2 px-3 font-semibold">Unit</th>
                      <th className="py-2 px-3 font-semibold">Biological Reference Interval (Demo)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {viewingTest.parameters.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 px-3 font-medium text-slate-900">{p.name}</td>
                        <td className="py-2 px-3 text-slate-500">{p.unit || "-"}</td>
                        <td className="py-2 px-3 text-teal-800 font-mono text-[11px]">{p.refRange}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteTestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Delete Test from Catalogue?
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to delete test <strong>{deleteTestId}</strong>?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteTestId(null)}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

