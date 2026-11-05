"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { generateInvoicePdf } from "@/lib/pdfGenerator";
import { Modal } from "@/components/ui/Modal";
import { getStatusBadge } from "@/components/ui/Badge";
import {
  Search,
  Download
} from "lucide-react";

export const BillingModule: React.FC = () => {
  const { invoices, settings, recordPayment } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentModeFilter, setPaymentModeFilter] = useState("all");

  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer'>("UPI");

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalBilled = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;

    invoices.forEach((inv) => {
      totalBilled += inv.total;
      totalCollected += inv.paidAmount;
      totalOutstanding += inv.balance;
    });

    return { totalBilled, totalCollected, totalOutstanding };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        inv.id.toLowerCase().includes(q) ||
        inv.orderId.toLowerCase().includes(q) ||
        inv.patientName.toLowerCase().includes(q) ||
        inv.patientMobile.includes(q);

      const matchesStatus = statusFilter === "all" || inv.paymentStatus === statusFilter;
      const matchesMode = paymentModeFilter === "all" || inv.paymentMode === paymentModeFilter;

      return matchesSearch && matchesStatus && matchesMode;
    });
  }, [invoices, searchQuery, statusFilter, paymentModeFilter]);

  const handleOpenPayment = (inv: Invoice) => {
    setPaymentModalInvoice(inv);
    setPaymentAmount(inv.balance);
    setPaymentMode(inv.paymentMode || "UPI");
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice || paymentAmount <= 0) return;

    recordPayment(paymentModalInvoice.id, paymentAmount, paymentMode);
    setPaymentModalInvoice(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Billing & Financial Invoices
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {invoices.length} Invoices
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Accounts receivables, instant GST receipts, payment reconciliation & settlement
          </p>
        </div>
      </div>

      {/* Top 3 Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Gross Billed Revenue</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(metrics.totalBilled)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">From test bookings & packages</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Actual Collections Received</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {formatCurrency(metrics.totalCollected)}
          </p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Settled via Cash, UPI, Card, Bank</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Outstanding Balance Due</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {formatCurrency(metrics.totalOutstanding)}
          </p>
          <p className="text-[11px] text-rose-600 mt-0.5">Pending collection from patients</p>
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
            placeholder="Search by Invoice ID, Order ID, Patient Name, or Mobile..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Payment Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Invoices</option>
            <option value="Paid">Fully Paid</option>
            <option value="Partial">Partial Payment</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Mode:</label>
          <select
            value={paymentModeFilter}
            onChange={(e) => setPaymentModeFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Modes</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Invoice No</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Patient Name</th>
                <th className="py-3 px-4 font-semibold">Order Ref</th>
                <th className="py-3 px-4 font-semibold">Total Amount</th>
                <th className="py-3 px-4 font-semibold">Paid</th>
                <th className="py-3 px-4 font-semibold">Balance Due</th>
                <th className="py-3 px-4 font-semibold">Payment Mode</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                    No invoices match your search filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-teal-800 font-mono">
                      {inv.id}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDate(inv.date)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {inv.patientName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {inv.orderId}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">
                      {formatCurrency(inv.paidAmount)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-rose-600">
                      {formatCurrency(inv.balance)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {inv.paymentMode}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(inv.paymentStatus)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => generateInvoicePdf(inv, settings)}
                          title="Download Invoice PDF"
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setViewingInvoice(inv)}
                          title="View Invoice Details"
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          Details
                        </button>

                        {inv.balance > 0 && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="px-2 py-1 text-[11px] font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded shadow-xs transition-colors"
                          >
                            Collect
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

      {/* Invoice Details Modal */}
      {viewingInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setViewingInvoice(null)}
          title={`Invoice ${viewingInvoice.id}`}
          description={`Date: ${formatDate(viewingInvoice.date)} • Order: ${viewingInvoice.orderId}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Patient & Billing strip */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Billed To</p>
                <p className="font-bold text-slate-900 text-sm">{viewingInvoice.patientName}</p>
                <p className="text-slate-500">ID: {viewingInvoice.patientId} • Ph: {viewingInvoice.patientMobile}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Payment Status</p>
                <div className="mt-1">{getStatusBadge(viewingInvoice.paymentStatus)}</div>
                <p className="text-[11px] text-slate-500 mt-1">Mode: {viewingInvoice.paymentMode}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Service / Investigation</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {viewingInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 px-3 font-medium text-slate-900">{item.description}</td>
                      <td className="py-2 px-3 text-slate-500 uppercase text-[10px]">{item.type}</td>
                      <td className="py-2 px-3 text-center">{item.quantity}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2 px-3 text-right font-semibold">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 ml-auto max-w-xs text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(viewingInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>- {formatCurrency(viewingInvoice.discount)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST (0% Healthcare):</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-teal-800">{formatCurrency(viewingInvoice.total)}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-700">
                <span>Amount Paid:</span>
                <span>{formatCurrency(viewingInvoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-rose-600">
                <span>Balance Due:</span>
                <span>{formatCurrency(viewingInvoice.balance)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => generateInvoicePdf(viewingInvoice, settings)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Invoice PDF</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setPaymentModalInvoice(null)}
          title={`Collect Payment — ${paymentModalInvoice.id}`}
          description={`Patient: ${paymentModalInvoice.patientName} • Remaining Due: ${formatCurrency(paymentModalInvoice.balance)}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmPayment} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount to Collect (₹) *
              </label>
              <input
                type="number"
                min={1}
                max={paymentModalInvoice.balance}
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-bold text-slate-900 text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Mode *
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as 'Cash' | 'UPI' | 'Card' | 'Bank Transfer')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              >
                <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                <option value="Cash">Cash at Counter</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
              >
                Confirm & Record Receipt
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

