"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { TestPackage } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  CalendarPlus,
  Sparkles,
  AlertTriangle
} from "lucide-react";

export const PackageModule: React.FC = () => {
  const { packages, tests, savePackage, deletePackage, setActiveModule } = useApp();

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TestPackage | null>(null);
  const [deletePackageId, setDeletePackageId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    testCodes: string[];
    price: number;
    originalPrice: number;
    description: string;
    isActive: boolean;
  }>({
    name: "",
    testCodes: [],
    price: 1500,
    originalPrice: 2000,
    description: "",
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingPackage(null);
    setFormData({
      name: "",
      testCodes: ["CBC", "GLUCOSE_F"],
      price: 999,
      originalPrice: 1200,
      description: "Comprehensive health checkup bundle.",
      isActive: true,
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (pkg: TestPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      testCodes: [...pkg.testCodes],
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      description: pkg.description,
      isActive: pkg.isActive,
    });
    setIsAddEditOpen(true);
  };

  const toggleTestInPackage = (code: string) => {
    const exists = formData.testCodes.includes(code);
    let updatedCodes: string[];
    if (exists) {
      updatedCodes = formData.testCodes.filter((c) => c !== code);
    } else {
      updatedCodes = [...formData.testCodes, code];
    }

    // Recalculate original price based on tests
    const sum = updatedCodes.reduce((acc, c) => {
      const t = tests.find((test) => test.code === c);
      return acc + (t ? t.price : 0);
    }, 0);

    setFormData({
      ...formData,
      testCodes: updatedCodes,
      originalPrice: sum,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.testCodes.length === 0) return;

    if (editingPackage) {
      savePackage({
        id: editingPackage.id,
        ...formData,
      });
    } else {
      savePackage(formData);
    }

    setIsAddEditOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletePackageId) {
      deletePackage(deletePackageId);
      setDeletePackageId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Diagnostic Health Packages
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {packages.length} Packages
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Bundled health screening panels with custom promotional pricing
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Package</span>
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map((pkg) => {
          const discountPct = Math.round(
            ((pkg.originalPrice - pkg.price) / (pkg.originalPrice || 1)) * 100
          );

          return (
            <div
              key={pkg.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {pkg.id}
                  </span>
                  {discountPct > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      Save {discountPct}%
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {pkg.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {pkg.description}
                </p>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {formatCurrency(pkg.price)}
                  </span>
                  {pkg.originalPrice > pkg.price && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatCurrency(pkg.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Included Tests List */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Included Tests ({pkg.testCodes.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.testCodes.map((code) => (
                      <span
                        key={code}
                        className="text-[11px] font-mono px-2 py-0.5 bg-slate-50 text-slate-700 border border-slate-200 rounded"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveModule("booking")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Book Order</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(pkg)}
                    title="Edit Package"
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletePackageId(pkg.id)}
                    title="Delete Package"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Package Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingPackage ? `Edit Package — ${editingPackage.name}` : "Create Diagnostic Package"}
        description="Select included tests and customize special package pricing."
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Package Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Executive Cardiac & Metabolic Panel"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description of target audience or clinical scope..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Standard Catalog Total (₹)
              </label>
              <input
                type="number"
                min={0}
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Package Offer Price (₹) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-bold text-teal-800"
              />
            </div>
          </div>

          {/* Test Selector checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Tests to Include ({formData.testCodes.length} Selected) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
              {tests.map((test) => {
                const isSelected = formData.testCodes.includes(test.code);
                return (
                  <button
                    key={test.code}
                    type="button"
                    onClick={() => toggleTestInPackage(test.code)}
                    className={`flex items-center justify-between p-2 rounded text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-teal-600 text-white font-medium shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-teal-300"
                    }`}
                  >
                    <div>
                      <p className="font-bold">{test.code}</p>
                      <p className="text-[10px] opacity-80">{formatCurrency(test.price)}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
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
              {editingPackage ? "Update Package" : "Save Package"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      {deletePackageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Delete Health Package?
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to delete package <strong>{deletePackageId}</strong>?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeletePackageId(null)}
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

