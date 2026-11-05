"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Patient } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { getStatusBadge } from "@/components/ui/Badge";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Download,
  FileText,
  AlertTriangle
} from "lucide-react";

export const PatientModule: React.FC = () => {
  const {
    patients,
    orders,
    invoices,
    savePatient,
    deletePatient,
    exportPatientsCsv,
    setActiveModule,
    setSelectedOrderIdForReport,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "reports" | "invoices">("profile");

  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    age: 30,
    gender: "Male" as "Male" | "Female" | "Other",
    dob: "1994-01-01",
    mobile: "",
    email: "",
    address: "",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
  });

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.fullName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.mobile.includes(q) ||
        p.email.toLowerCase().includes(q);

      const matchesGender = genderFilter === "all" || p.gender === genderFilter;

      return matchesSearch && matchesGender;
    });
  }, [patients, searchQuery, genderFilter]);

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setFormData({
      fullName: "",
      age: 32,
      gender: "Male",
      dob: "1994-05-15",
      mobile: "+91 98200 00000",
      email: "",
      address: "",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (pat: Patient) => {
    setEditingPatient(pat);
    setFormData({
      fullName: pat.fullName,
      age: pat.age,
      gender: pat.gender,
      dob: pat.dob,
      mobile: pat.mobile,
      email: pat.email,
      address: pat.address,
      city: pat.city,
      state: pat.state,
      pincode: pat.pincode,
    });
    setIsAddEditOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.mobile.trim()) return;

    if (editingPatient) {
      savePatient({
        id: editingPatient.id,
        ...formData,
      });
    } else {
      savePatient(formData);
    }

    setIsAddEditOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletePatientId) {
      deletePatient(deletePatientId);
      setDeletePatientId(null);
      if (viewingPatient?.id === deletePatientId) {
        setViewingPatient(null);
      }
    }
  };

  // Associated records for viewed patient
  const patientOrders = useMemo(() => {
    if (!viewingPatient) return [];
    return orders.filter((o) => o.patientId === viewingPatient.id);
  }, [orders, viewingPatient]);

  const patientInvoices = useMemo(() => {
    if (!viewingPatient) return [];
    return invoices.filter((i) => i.patientId === viewingPatient.id);
  }, [invoices, viewingPatient]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Patient Management
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {patients.length} Total Patients
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Register new subjects, browse history, diagnostic records & invoices
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportPatientsCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Patient ID, Name, Mobile or Email..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Gender:</label>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Patient Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Patient ID</th>
                <th className="py-3 px-4 font-semibold">Full Name</th>
                <th className="py-3 px-4 font-semibold">Age / Gender</th>
                <th className="py-3 px-4 font-semibold">Contact (Mobile)</th>
                <th className="py-3 px-4 font-semibold">City</th>
                <th className="py-3 px-4 font-semibold">Reg. Date</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No patients match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-teal-800 font-mono">
                      {pat.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {pat.fullName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {pat.age} yrs • {pat.gender}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {pat.mobile}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {pat.city}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDate(pat.registrationDate)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setViewingPatient(pat);
                            setActiveTab("profile");
                          }}
                          title="View Profile & Medical History"
                          className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(pat)}
                          title="Edit Details"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletePatientId(pat.id)}
                          title="Delete Patient"
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

      {/* Add / Edit Patient Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingPatient ? `Edit Patient — ${editingPatient.id}` : "Register New Patient"}
        description="Fill in patient demographic information for clinical and invoicing records."
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Anand Kumar Sharma"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age (Years) *
              </label>
              <input
                type="number"
                required
                min={0}
                max={120}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as "Male" | "Female" | "Other" })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+91 98200 XXXXX"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@example.com"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Flat / Building, Road name"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
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
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
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
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
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
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>
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
              {editingPatient ? "Update Patient" : "Save Patient"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Patient Details & Medical History Modal */}
      {viewingPatient && (
        <Modal
          isOpen={true}
          onClose={() => setViewingPatient(null)}
          title={`Patient Dossier — ${viewingPatient.fullName}`}
          description={`ID: ${viewingPatient.id} • Registered ${formatDate(viewingPatient.registrationDate)}`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("profile")}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === "profile"
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Profile Demographics
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === "orders"
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Orders & Investigations ({patientOrders.length})
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === "reports"
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Approved Reports ({patientOrders.filter((o) => o.status === "Approved").length})
              </button>
              <button
                onClick={() => setActiveTab("invoices")}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === "invoices"
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Invoices & Billing ({patientInvoices.length})
              </button>
            </div>

            {/* Tab 1: Profile */}
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                  <h4 className="font-bold text-slate-800 mb-2 uppercase text-[11px] tracking-wider">
                    Personal Details
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient ID:</span>
                    <span className="font-bold text-teal-800">{viewingPatient.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Full Name:</span>
                    <span className="font-semibold text-slate-900">{viewingPatient.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Age / Gender:</span>
                    <span className="text-slate-800">{viewingPatient.age} Yrs / {viewingPatient.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date of Birth:</span>
                    <span className="text-slate-800">{viewingPatient.dob}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registration Date:</span>
                    <span className="text-slate-800">{formatDate(viewingPatient.registrationDate)}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                  <h4 className="font-bold text-slate-800 mb-2 uppercase text-[11px] tracking-wider">
                    Contact & Address
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mobile:</span>
                    <span className="font-semibold text-slate-900">{viewingPatient.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-800">{viewingPatient.email || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Address:</span>
                    <span className="text-slate-800 text-right max-w-[200px]">{viewingPatient.address || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">City / State:</span>
                    <span className="text-slate-800">{viewingPatient.city}, {viewingPatient.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pincode:</span>
                    <span className="text-slate-800">{viewingPatient.pincode}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Orders */}
            {activeTab === "orders" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Order ID</th>
                      <th className="py-2.5 px-3 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold">Referred By</th>
                      <th className="py-2.5 px-3 font-semibold">Tests</th>
                      <th className="py-2.5 px-3 font-semibold">Amount</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {patientOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          No test orders recorded for this patient yet.
                        </td>
                      </tr>
                    ) : (
                      patientOrders.map((ord) => (
                        <tr key={ord.id}>
                          <td className="py-2.5 px-3 font-bold text-teal-800">{ord.id}</td>
                          <td className="py-2.5 px-3">{formatDate(ord.orderDate)}</td>
                          <td className="py-2.5 px-3">{ord.doctorName}</td>
                          <td className="py-2.5 px-3 font-mono">{ord.testCodes.join(", ")}</td>
                          <td className="py-2.5 px-3 font-semibold">{formatCurrency(ord.finalAmount)}</td>
                          <td className="py-2.5 px-3">{getStatusBadge(ord.status)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Reports */}
            {activeTab === "reports" && (
              <div className="space-y-3">
                {patientOrders.filter((o) => o.status === "Approved").length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No approved clinical pathology reports available yet.
                  </p>
                ) : (
                  patientOrders
                    .filter((o) => o.status === "Approved")
                    .map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">
                              Report for Order {ord.id}
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                              Verified
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Tests: {ord.testCodes.join(", ")} • Approved by {ord.approval?.approverName}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedOrderIdForReport(ord.id);
                            setViewingPatient(null);
                            setActiveModule("reports");
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Open Full Report</span>
                        </button>
                      </div>
                    ))
                )}
              </div>
            )}

            {/* Tab 4: Invoices */}
            {activeTab === "invoices" && (
              <div className="space-y-3">
                {patientInvoices.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No invoices generated for this patient yet.
                  </p>
                ) : (
                  patientInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-teal-800 font-mono">{inv.id}</span>
                          <span className="text-slate-400">• {formatDate(inv.date)}</span>
                          {getStatusBadge(inv.paymentStatus)}
                        </div>
                        <p className="text-slate-500 mt-1">
                          Total: {formatCurrency(inv.total)} • Paid: {formatCurrency(inv.paidAmount)} • Balance: {formatCurrency(inv.balance)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setViewingPatient(null);
                          setActiveModule("billing");
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        View Billing
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Patient Confirmation */}
      {deletePatientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Delete Patient Record?
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to delete patient <strong>{deletePatientId}</strong>? This will remove their record from browser storage.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeletePatientId(null)}
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

