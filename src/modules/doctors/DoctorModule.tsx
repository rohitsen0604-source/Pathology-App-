"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Doctor } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle
} from "lucide-react";

export const DoctorModule: React.FC = () => {
  const { doctors, orders, saveDoctor, deleteDoctor } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);
  const [deleteDoctorId, setDeleteDoctorId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    qualification: "MBBS, MD",
    specialization: "General Physician",
    phone: "",
    clinic: "",
    address: "",
    email: "",
  });

  const specializations = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => set.add(d.specialization));
    return Array.from(set);
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        doc.name.toLowerCase().includes(q) ||
        doc.id.toLowerCase().includes(q) ||
        doc.clinic.toLowerCase().includes(q) ||
        doc.specialization.toLowerCase().includes(q);

      const matchesSpec = specializationFilter === "all" || doc.specialization === specializationFilter;

      return matchesSearch && matchesSpec;
    });
  }, [doctors, searchQuery, specializationFilter]);

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setFormData({
      name: "Dr. ",
      qualification: "MBBS, MD",
      specialization: "General Physician",
      phone: "+91 98210 00000",
      clinic: "Medical Center",
      address: "Mumbai",
      email: "",
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    setFormData({
      name: doc.name,
      qualification: doc.qualification,
      specialization: doc.specialization,
      phone: doc.phone,
      clinic: doc.clinic,
      address: doc.address,
      email: doc.email || "",
    });
    setIsAddEditOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingDoctor) {
      saveDoctor({
        id: editingDoctor.id,
        ...formData,
      });
    } else {
      saveDoctor(formData);
    }

    setIsAddEditOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteDoctorId) {
      deleteDoctor(deleteDoctorId);
      setDeleteDoctorId(null);
      if (viewingDoctor?.id === deleteDoctorId) {
        setViewingDoctor(null);
      }
    }
  };

  // Referral stats for viewed doctor
  const doctorOrders = useMemo(() => {
    if (!viewingDoctor) return [];
    return orders.filter((o) => o.doctorId === viewingDoctor.id);
  }, [orders, viewingDoctor]);

  const doctorTotalRevenue = useMemo(() => {
    return doctorOrders.reduce((acc, curr) => acc + curr.finalAmount, 0);
  }, [doctorOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Referring Doctors Directory
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {doctors.length} Physicians
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage referring physicians, clinics, hospitals & referral analytics
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Referring Doctor</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Doctor Name, ID, Clinic, or Specialization..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Specialization:</label>
          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Doctor ID</th>
                <th className="py-3 px-4 font-semibold">Doctor Name</th>
                <th className="py-3 px-4 font-semibold">Qualification</th>
                <th className="py-3 px-4 font-semibold">Specialization</th>
                <th className="py-3 px-4 font-semibold">Clinic / Hospital</th>
                <th className="py-3 px-4 font-semibold">Contact</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No referring doctors found.
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doc) => {
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-teal-800 font-mono">
                        {doc.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {doc.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {doc.qualification}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-100">
                          {doc.specialization}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {doc.clinic}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {doc.phone}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setViewingDoctor(doc)}
                            title="View Doctor Details & Referrals"
                            className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(doc)}
                            title="Edit Doctor Details"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteDoctorId(doc.id)}
                            title="Delete Doctor"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingDoctor ? `Edit Doctor — ${editingDoctor.id}` : "Add Referring Doctor"}
        description="Doctor credentials and practice information for referral attribution."
        maxWidth="xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Doctor Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. Full Name"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Qualification
              </label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="MBBS, MD, FRCP"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specialization *
              </label>
              <input
                type="text"
                required
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="General Medicine / Cardiology"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98210 XXXXX"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="doctor@clinic.com"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinic / Hospital Name
              </label>
              <input
                type="text"
                value={formData.clinic}
                onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                placeholder="Clinic or Hospital affiliation"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Address / Location
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Area, City"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
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
              {editingDoctor ? "Update Doctor" : "Save Doctor"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Doctor Details Modal */}
      {viewingDoctor && (
        <Modal
          isOpen={true}
          onClose={() => setViewingDoctor(null)}
          title={`Doctor Profile — ${viewingDoctor.name}`}
          description={`ID: ${viewingDoctor.id} • ${viewingDoctor.specialization}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <p className="text-slate-400 uppercase text-[10px] font-bold">Physician Profile</p>
                <p className="text-sm font-bold text-slate-900">{viewingDoctor.name}</p>
                <p className="text-slate-600">{viewingDoctor.qualification}</p>
                <p className="text-teal-700 font-medium">{viewingDoctor.specialization}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <p className="text-slate-400 uppercase text-[10px] font-bold">Practice & Clinic</p>
                <p className="text-sm font-semibold text-slate-900">{viewingDoctor.clinic}</p>
                <p className="text-slate-600">{viewingDoctor.address}</p>
                <p className="text-slate-600">Ph: {viewingDoctor.phone}</p>
              </div>
            </div>

            {/* Referrals summary */}
            <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-teal-900">Total Referred Test Orders</p>
                <p className="text-teal-700 mt-0.5">{doctorOrders.length} patient investigations</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-teal-900">Total Referral Value</p>
                <p className="text-sm font-extrabold text-teal-800">{formatCurrency(doctorTotalRevenue)}</p>
              </div>
            </div>

            {/* Orders referred list */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Referred Orders</h4>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="py-2 px-3">Order ID</th>
                      <th className="py-2 px-3">Patient</th>
                      <th className="py-2 px-3">Tests</th>
                      <th className="py-2 px-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doctorOrders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400">
                          No orders referred yet.
                        </td>
                      </tr>
                    ) : (
                      doctorOrders.map((ord) => (
                        <tr key={ord.id}>
                          <td className="py-2 px-3 font-semibold text-teal-800">{ord.id}</td>
                          <td className="py-2 px-3">{ord.patientName}</td>
                          <td className="py-2 px-3 font-mono">{ord.testCodes.join(", ")}</td>
                          <td className="py-2 px-3 font-medium">{formatCurrency(ord.finalAmount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteDoctorId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Delete Doctor Record?
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to delete referring doctor <strong>{deleteDoctorId}</strong>?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteDoctorId(null)}
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

