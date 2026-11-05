"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Order, Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { generateInvoicePdf } from "@/lib/pdfGenerator";
import { getStatusBadge } from "@/components/ui/Badge";
import {
  Search,
  Check,
  Receipt,
  Printer,
  TestTubes,
  CheckCircle2
} from "lucide-react";

export const TestBookingModule: React.FC = () => {
  const {
    patients,
    doctors,
    tests,
    packages,
    orders,
    settings,
    createBooking,
    setActiveModule,
    setSelectedOrderIdForReport,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"book" | "orders">("book");

  // Booking Form State
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || "");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || "");
  const [selectedTestCodes, setSelectedTestCodes] = useState<string[]>(["CBC"]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer'>("UPI");
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Success Confirmation State
  const [createdOrderResult, setCreatedOrderResult] = useState<{
    order: Order;
    invoice: Invoice;
  } | null>(null);

  // Search filter for tests in booking
  const [testSearch, setTestSearch] = useState("");
  const [ordersSearch, setOrdersSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId),
    [patients, selectedPatientId]
  );

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id === selectedDoctorId),
    [doctors, selectedDoctorId]
  );

  // Calculation of totals
  const subtotal = useMemo(() => {
    let sum = 0;
    selectedPackageIds.forEach((pkgId) => {
      const p = packages.find((pkg) => pkg.id === pkgId);
      if (p) sum += p.price;
    });
    selectedTestCodes.forEach((code) => {
      const t = tests.find((test) => test.code === code);
      if (t) sum += t.price;
    });
    return sum;
  }, [selectedPackageIds, selectedTestCodes, packages, tests]);

  const finalAmount = Math.max(0, subtotal - discount);

  // Toggle Test selection
  const toggleTest = (code: string) => {
    if (selectedTestCodes.includes(code)) {
      setSelectedTestCodes(selectedTestCodes.filter((c) => c !== code));
    } else {
      setSelectedTestCodes([...selectedTestCodes, code]);
    }
  };

  // Toggle Package selection
  const togglePackage = (id: string) => {
    if (selectedPackageIds.includes(id)) {
      setSelectedPackageIds(selectedPackageIds.filter((p) => p !== id));
    } else {
      setSelectedPackageIds([...selectedPackageIds, id]);
    }
  };

  const handleBookOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedDoctor) return;
    if (selectedTestCodes.length === 0 && selectedPackageIds.length === 0) return;

    const selectedTestsList = tests.filter((t) => selectedTestCodes.includes(t.code));
    const selectedPackagesList = packages.filter((p) => selectedPackageIds.includes(p.id));

    const result = createBooking({
      patient: selectedPatient,
      doctor: selectedDoctor,
      selectedTests: selectedTestsList,
      selectedPackages: selectedPackagesList,
      discount: discount,
      paymentMode: paymentMode,
      paidAmount: paidAmount > 0 ? paidAmount : finalAmount, // default to full payment if paidAmount set
    });

    setCreatedOrderResult({
      order: result.order,
      invoice: result.invoice,
    });
  };

  // Filtered orders list for Orders tab
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = ordersSearch.toLowerCase();
      const matchesSearch =
        o.id.toLowerCase().includes(q) ||
        o.patientName.toLowerCase().includes(q) ||
        o.doctorName.toLowerCase().includes(q) ||
        o.testCodes.some((c) => c.toLowerCase().includes(q));

      const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, ordersSearch, orderStatusFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Test Booking & Order Management
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {orders.length} Registered Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Register patient test requests, assign referring doctors & issue instant invoices
          </p>
        </div>

        {/* Tab switch */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab("book")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "book"
                ? "bg-white text-teal-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            New Test Booking
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "orders"
                ? "bg-white text-teal-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Orders List ({orders.length})
          </button>
        </div>
      </div>

      {activeTab === "book" ? (
        <form onSubmit={handleBookOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Patient */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Select Patient</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModule("patients")}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  + Add New Patient
                </button>
              </div>

              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.id}) — {p.age} Yrs / {p.gender} — {p.mobile}
                  </option>
                ))}
              </select>

              {selectedPatient && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Contact:</span>
                    <p className="font-medium text-slate-800">{selectedPatient.mobile}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">City / Location:</span>
                    <p className="font-medium text-slate-800">{selectedPatient.city}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Registered:</span>
                    <p className="font-medium text-slate-800">{formatDate(selectedPatient.registrationDate)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Select Referring Doctor */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Select Referring Doctor</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModule("doctors")}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  + Add Doctor
                </button>
              </div>

              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.qualification}) — {d.specialization} — {d.clinic}
                  </option>
                ))}
              </select>

              {selectedDoctor && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{selectedDoctor.clinic}</p>
                    <p className="text-[11px] text-slate-400">{selectedDoctor.address} • Ph: {selectedDoctor.phone}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded">
                    {selectedDoctor.specialization}
                  </span>
                </div>
              )}
            </div>

            {/* Step 3: Select Tests & Packages */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Select Tests & Packages</h3>
                </div>
                <span className="text-xs text-slate-400">
                  {selectedTestCodes.length} Tests, {selectedPackageIds.length} Packages chosen
                </span>
              </div>

              {/* Health Packages Row */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">Discounted Health Packages</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {packages.map((pkg) => {
                    const isSelected = selectedPackageIds.includes(pkg.id);
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => togglePackage(pkg.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between text-xs ${
                          isSelected
                            ? "border-teal-500 bg-teal-50/50 text-teal-950 shadow-xs"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold">{pkg.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {pkg.testCodes.length} Tests: {pkg.testCodes.slice(0, 4).join(", ")}
                            {pkg.testCodes.length > 4 ? "..." : ""}
                          </p>
                          <p className="font-bold text-teal-800 mt-1">
                            {formatCurrency(pkg.price)}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected ? "bg-teal-600 border-teal-600 text-white" : "border-slate-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Individual Tests Grid */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-700">Individual Lab Investigations</p>
                  <div className="relative w-44">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                    <input
                      type="text"
                      value={testSearch}
                      onChange={(e) => setTestSearch(e.target.value)}
                      placeholder="Filter tests..."
                      className="w-full pl-7 pr-2 py-1 text-xs border border-slate-200 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {tests
                    .filter(
                      (t) =>
                        t.name.toLowerCase().includes(testSearch.toLowerCase()) ||
                        t.code.toLowerCase().includes(testSearch.toLowerCase())
                    )
                    .map((test) => {
                      const isSelected = selectedTestCodes.includes(test.code);
                      return (
                        <div
                          key={test.code}
                          onClick={() => toggleTest(test.code)}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs ${
                            isSelected
                              ? "border-teal-500 bg-teal-50/60 font-medium"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-slate-900 font-mono">{test.code}</span>
                            <p className="text-[11px] text-slate-500 truncate">{test.name}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-slate-900">{formatCurrency(test.price)}</span>
                            <div
                              className={`w-3.5 h-3.5 rounded border ml-auto mt-0.5 flex items-center justify-center ${
                                isSelected ? "bg-teal-600 border-teal-600 text-white" : "border-slate-300"
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Bill Breakdown & Submit */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 sticky top-20">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Receipt className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Order & Billing Summary</h3>
              </div>

              {/* Items Summary */}
              <div className="space-y-2 max-h-48 overflow-y-auto text-xs text-slate-600">
                {selectedPackageIds.map((pkgId) => {
                  const p = packages.find((pkg) => pkg.id === pkgId);
                  return (
                    <div key={pkgId} className="flex justify-between">
                      <span className="truncate max-w-[170px]">Pkg: {p?.name}</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(p?.price || 0)}</span>
                    </div>
                  );
                })}
                {selectedTestCodes.map((c) => {
                  const t = tests.find((test) => test.code === c);
                  return (
                    <div key={c} className="flex justify-between">
                      <span className="truncate max-w-[170px]">{t?.name}</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(t?.price || 0)}</span>
                    </div>
                  );
                })}
                {selectedTestCodes.length === 0 && selectedPackageIds.length === 0 && (
                  <p className="text-slate-400 italic py-2 text-center">No tests selected yet</p>
                )}
              </div>

              {/* Pricing calculations */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Subtotal:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Discount (₹):</span>
                  <input
                    type="number"
                    min={0}
                    max={subtotal}
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-20 px-2 py-1 text-xs border border-slate-200 rounded text-right font-medium text-slate-900"
                  />
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Healthcare Tax (GST 0%):</span>
                  <span>{formatCurrency(0)}</span>
                </div>

                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Final Amount:</span>
                  <span className="text-teal-800">{formatCurrency(finalAmount)}</span>
                </div>
              </div>

              {/* Payment details */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as 'Cash' | 'UPI' | 'Card' | 'Bank Transfer')}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="Cash">Cash Counter</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">Amount Received (₹)</span>
                    <button
                      type="button"
                      onClick={() => setPaidAmount(finalAmount)}
                      className="text-[11px] text-teal-600 font-semibold hover:underline"
                    >
                      Paid in Full
                    </button>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={finalAmount}
                    value={paidAmount || finalAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={subtotal === 0}
                className="w-full py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Booking & Generate Order</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Orders List Tab */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={ordersSearch}
                onChange={(e) => setOrdersSearch(e.target.value)}
                placeholder="Search orders by Order ID, Patient, Doctor or Test code..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium">Status:</label>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800"
              >
                <option value="all">All Statuses</option>
                <option value="Booked">Booked</option>
                <option value="Sample Collected">Sample Collected</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Order ID</th>
                    <th className="py-3 px-4 font-semibold">Order Date</th>
                    <th className="py-3 px-4 font-semibold">Patient Name</th>
                    <th className="py-3 px-4 font-semibold">Doctor</th>
                    <th className="py-3 px-4 font-semibold">Investigations</th>
                    <th className="py-3 px-4 font-semibold">Total Amount</th>
                    <th className="py-3 px-4 font-semibold">Payment</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                        No orders match filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-teal-800 font-mono">
                          {ord.id}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatDate(ord.orderDate)}
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
                        <td className="py-3 px-4 font-bold">
                          {formatCurrency(ord.finalAmount)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(ord.paymentStatus)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(ord.status)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            {ord.status === "Approved" ? (
                              <button
                                onClick={() => {
                                  setSelectedOrderIdForReport(ord.id);
                                  setActiveModule("reports");
                                }}
                                className="px-2 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded"
                              >
                                View Report
                              </button>
                            ) : ord.status === "Pending Approval" ? (
                              <button
                                onClick={() => setActiveModule("approvals")}
                                className="px-2 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded"
                              >
                                Review
                              </button>
                            ) : (
                              <button
                                onClick={() => setActiveModule("samples")}
                                className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
                              >
                                Track Sample
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Booking Success Confirmation Modal */}
      {createdOrderResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Test Order Booked Successfully!
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Saved permanently to browser localStorage.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-bold text-teal-800 font-mono">{createdOrderResult.order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sample Barcode ID:</span>
                <span className="font-bold text-slate-800 font-mono">{createdOrderResult.order.sampleId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-bold text-slate-800 font-mono">{createdOrderResult.invoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-semibold text-slate-800">{createdOrderResult.order.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Billed / Paid:</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(createdOrderResult.order.finalAmount)} ({createdOrderResult.order.paymentStatus})
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  generateInvoicePdf(createdOrderResult.invoice, settings);
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Download Invoice PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreatedOrderResult(null);
                  setActiveModule("samples");
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <TestTubes className="w-4 h-4" />
                <span>Proceed to Sample Collection →</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatedOrderResult(null)}
                className="text-xs text-slate-500 hover:text-slate-700 pt-1"
              >
                Close & Book Another Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

