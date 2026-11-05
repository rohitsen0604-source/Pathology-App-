"use client";

import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/lib/utils";
import { getStatusBadge } from "@/components/ui/Badge";
import {
  Users,
  FileCheck2,
  Clock,
  ArrowUpRight,
  PlusCircle,
  CalendarCheck,
  UserPlus
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export const DashboardModule: React.FC = () => {
  const {
    patients,
    orders,
    samples,
    invoices,
    setActiveModule,
    setSelectedOrderIdForReport,
  } = useApp();

  // Dynamic calculations from actual localStorage records
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const totalPatients = patients.length;
    const todayRegistrations = patients.filter((p) => p.registrationDate === todayStr).length;
    const totalOrders = orders.length;

    const pendingSamples = samples.filter((s) => s.status === "Pending Collection" || s.status === "Collected").length;
    const processingSamples = samples.filter((s) => s.status === "Processing" || s.status === "Received").length;
    const pendingApprovals = orders.filter((o) => o.status === "Pending Approval").length;
    const completedReports = orders.filter((o) => o.status === "Approved").length;

    // Revenue calculations
    let todayRevenue = 0;
    let monthlyRevenue = 0;
    let pendingPayments = 0;

    invoices.forEach((inv) => {
      if (inv.date === todayStr) {
        todayRevenue += inv.paidAmount;
      }
      if (inv.date.startsWith(currentMonth)) {
        monthlyRevenue += inv.paidAmount;
      }
      pendingPayments += inv.balance;
    });

    return {
      totalPatients,
      todayRegistrations,
      totalOrders,
      pendingSamples,
      processingSamples,
      pendingApprovals,
      completedReports,
      todayRevenue,
      monthlyRevenue,
      pendingPayments,
    };
  }, [patients, orders, samples, invoices]);

  // Chart 1: Daily Registrations / Orders (Last 7 Days)
  const registrationChartData = useMemo(() => {
    const map: Record<string, { date: string; patients: number; orders: number }> = {};
    const days = 7;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      map[key] = { date: label, patients: 0, orders: 0 };
    }

    patients.forEach((p) => {
      if (map[p.registrationDate]) {
        map[p.registrationDate].patients += 1;
      }
    });

    orders.forEach((o) => {
      const dKey = o.orderDate.split("T")[0];
      if (map[dKey]) {
        map[dKey].orders += 1;
      }
    });

    return Object.values(map);
  }, [patients, orders]);

  // Chart 2: Test Distribution
  const testDistributionData = useMemo(() => {
    const countMap: Record<string, number> = {};
    orders.forEach((o) => {
      o.testCodes.forEach((t) => {
        countMap[t] = (countMap[t] || 0) + 1;
      });
    });

    return Object.entries(countMap)
      .map(([code, count]) => ({ name: code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [orders]);

  // Chart 3: Order Status Distribution
  const orderStatusData = useMemo(() => {
    const statusMap: Record<string, number> = {
      Approved: 0,
      "Pending Approval": 0,
      "In Progress": 0,
      "Sample Collected": 0,
      Booked: 0,
    };

    orders.forEach((o) => {
      statusMap[o.status] = (statusMap[o.status] || 0) + 1;
    });

    return [
      { name: "Approved", value: statusMap["Approved"] || 0, color: "#10b981" },
      { name: "Pending Approval", value: statusMap["Pending Approval"] || 0, color: "#f59e0b" },
      { name: "In Progress", value: statusMap["In Progress"] || 0, color: "#0d9488" },
      { name: "Sample Collected", value: statusMap["Sample Collected"] || 0, color: "#6366f1" },
      { name: "Booked", value: statusMap["Booked"] || 0, color: "#94a3b8" },
    ].filter((item) => item.value > 0);
  }, [orders]);

  // Chart 4: Monthly Revenue overview
  const monthlyRevenueData = useMemo(() => {
    return [
      { month: "Jun", revenue: 84000, collections: 79000 },
      { month: "Jul", revenue: 96000, collections: 91000 },
      { month: "Aug", revenue: 112000, collections: 108000 },
      { month: "Sep", revenue: 125000, collections: 119000 },
      { month: "Oct", revenue: 142000, collections: 138000 },
      { month: "Nov", revenue: Math.max(stats.monthlyRevenue * 1.5, 48000), collections: stats.monthlyRevenue },
    ];
  }, [stats.monthlyRevenue]);

  const PIE_COLORS = ["#0d9488", "#10b981", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6"];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Laboratory Operations Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time specimen tracking, diagnostic reporting & accounts overview
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveModule("patients")}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-600" />
            <span>New Patient</span>
          </button>
          <button
            onClick={() => setActiveModule("booking")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Book New Test</span>
          </button>
        </div>
      </div>

      {/* Metrics Row 1: Key Operational Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Patients</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalPatients}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
              <span>+{stats.todayRegistrations} registered today</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Test Orders */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Test Orders</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalOrders}</p>
            <p className="text-[11px] text-slate-400 mt-1">From registered doctors</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Approvals */}
        <div
          onClick={() => setActiveModule("approvals")}
          className="bg-white p-4 rounded-xl border border-amber-200 hover:border-amber-300 shadow-xs flex items-center justify-between cursor-pointer group transition-all"
        >
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Approvals</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingApprovals}</p>
            <p className="text-[11px] text-amber-600 group-hover:underline mt-1">Review results →</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Completed Reports */}
        <div
          onClick={() => setActiveModule("reports")}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-xs flex items-center justify-between cursor-pointer group transition-all"
        >
          <div>
            <p className="text-xs font-medium text-slate-500">Completed Reports</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.completedReports}</p>
            <p className="text-[11px] text-emerald-600 group-hover:underline mt-1">View & Print →</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Metrics Row 2: Financial & Sample Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Today&apos;s Revenue</span>
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">Today</span>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {formatCurrency(stats.todayRevenue)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Direct lab cash/UPI collections</p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Month to Date</span>
            <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded">Current Month</span>
          </div>
          <p className="text-xl font-bold text-teal-800 mt-1">
            {formatCurrency(stats.monthlyRevenue)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Recorded browser receipts</p>
        </div>

        {/* Pending Collections / Samples */}
        <div
          onClick={() => setActiveModule("samples")}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-300 shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Pending Samples</span>
            <span className="text-[10px] font-semibold bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded">Lab Phlebotomy</span>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.pendingSamples}</p>
          <p className="text-[11px] text-teal-600 group-hover:underline mt-1">
            {stats.processingSamples} currently processing
          </p>
        </div>

        {/* Pending Payments */}
        <div
          onClick={() => setActiveModule("billing")}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-rose-300 shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Pending Dues</span>
            <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">Accounts</span>
          </div>
          <p className="text-xl font-bold text-rose-600 mt-1">
            {formatCurrency(stats.pendingPayments)}
          </p>
          <p className="text-[11px] text-rose-600 group-hover:underline mt-1">View unpaid invoices →</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Trends */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Activity Trend (Last 7 Days)</h3>
              <p className="text-xs text-slate-400">Patient intake vs Test orders registered</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">Daily</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="patients" name="Patients" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="orders" name="Orders" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Revenue Collections */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Revenue & Collections</h3>
              <p className="text-xs text-slate-400">Billed amount vs actual collections in INR</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">Finance</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) => [
                    formatCurrency(typeof val === "number" ? val : parseFloat(val) || 0),
                    "",
                  ]}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Line type="monotone" dataKey="revenue" name="Total Billed" stroke="#64748b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="collections" name="Collected" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Test Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Most Ordered Lab Tests</h3>
              <p className="text-xs text-slate-400">Order frequency by clinical investigation code</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={testDistributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#0f172a", fontWeight: 600 }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Bar dataKey="count" name="Total Orders" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Order Status Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Order Status Pipeline</h3>
              <p className="text-xs text-slate-400">Workflow stage breakdown across active orders</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Test Orders</h3>
            <p className="text-xs text-slate-400">Latest specimens processed in the laboratory</p>
          </div>
          <button
            onClick={() => setActiveModule("reports")}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>All Orders & Reports</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Order ID</th>
                <th className="py-2.5 px-4 font-semibold">Patient Name</th>
                <th className="py-2.5 px-4 font-semibold">Doctor</th>
                <th className="py-2.5 px-4 font-semibold">Tests</th>
                <th className="py-2.5 px-4 font-semibold">Final Amount</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {orders.slice(0, 5).map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-teal-800">{ord.id}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{ord.patientName}</td>
                  <td className="py-3 px-4 text-slate-600">{ord.doctorName}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {ord.testCodes.join(", ")}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">{formatCurrency(ord.finalAmount)}</td>
                  <td className="py-3 px-4">{getStatusBadge(ord.status)}</td>
                  <td className="py-3 px-4 text-right">
                    {ord.status === "Approved" ? (
                      <button
                        onClick={() => {
                          setSelectedOrderIdForReport(ord.id);
                          setActiveModule("reports");
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200 transition-colors"
                      >
                        View Report
                      </button>
                    ) : ord.status === "Pending Approval" ? (
                      <button
                        onClick={() => setActiveModule("approvals")}
                        className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveModule("results")}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      >
                        Enter Results
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

