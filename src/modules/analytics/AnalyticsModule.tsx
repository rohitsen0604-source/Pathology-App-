"use client";

import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

export const AnalyticsModule: React.FC = () => {
  const { patients, orders, doctors } = useApp();

  // Daily Registration / Orders Trend (Last 14 Days)
  const dailyTrends = useMemo(() => {
    const map: Record<string, { date: string; registrations: number; orders: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      map[key] = { date: label, registrations: 0, orders: 0 };
    }

    patients.forEach((p) => {
      if (map[p.registrationDate]) {
        map[p.registrationDate].registrations += 1;
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

  // Doctor-wise Order Volume & Value
  const doctorReferralData = useMemo(() => {
    const map: Record<string, { name: string; orders: number; revenue: number }> = {};
    doctors.forEach((doc) => {
      map[doc.id] = { name: doc.name.replace("Dr. ", ""), orders: 0, revenue: 0 };
    });

    orders.forEach((o) => {
      if (map[o.doctorId]) {
        map[o.doctorId].orders += 1;
        map[o.doctorId].revenue += o.finalAmount;
      }
    });

    return Object.values(map).sort((a, b) => b.orders - a.orders);
  }, [doctors, orders]);

  // Test-wise Order Distribution
  const testDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      o.testCodes.forEach((code) => {
        map[code] = (map[code] || 0) + 1;
      });
    });

    return Object.entries(map)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  // Report Turnaround / Status Distribution
  const reportStatusData = useMemo(() => {
    let completed = 0;
    let pendingApproval = 0;
    let inProgress = 0;

    orders.forEach((o) => {
      if (o.status === "Approved") completed += 1;
      else if (o.status === "Pending Approval") pendingApproval += 1;
      else inProgress += 1;
    });

    return [
      { name: "Completed & Verified", value: completed, color: "#10b981" },
      { name: "Pending Approval", value: pendingApproval, color: "#f59e0b" },
      { name: "In Progress / Lab Run", value: inProgress, color: "#0d9488" },
    ];
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Diagnostic & Revenue Analytics
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Live BI Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational workload, doctor referrals, test volume and financial realization
          </p>
        </div>
      </div>

      {/* Grid of 4 In-Depth Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Registrations & Workload */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Workload Velocity (14 Days)</h3>
              <p className="text-xs text-slate-400">Daily intake of patient registrations and test requests</p>
            </div>
            <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded">
              Trend
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Area type="monotone" dataKey="orders" name="Orders Booked" stroke="#0d9488" fillOpacity={1} fill="url(#colorOrders)" />
                <Area type="monotone" dataKey="registrations" name="Patients Registered" stroke="#10b981" fillOpacity={1} fill="url(#colorPat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Doctor-wise Referral Volumes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Doctor Referral Performance</h3>
              <p className="text-xs text-slate-400">Total test investigations referred by clinician</p>
            </div>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              Clinicians
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doctorReferralData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#0f172a" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Bar dataKey="orders" name="Orders Referred" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Test-wise Volume Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Investigation Code Demand</h3>
              <p className="text-xs text-slate-400">Total runs ordered across active menu</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={testDistribution.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <YAxis type="category" dataKey="code" tick={{ fontSize: 11, fill: "#0f172a", fontWeight: 600 }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Bar dataKey="count" name="Investigations Ordered" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Report Completion & Realization */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Report Status Pipeline</h3>
              <p className="text-xs text-slate-400">Completed verified reports vs pending pathologist signoff</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {reportStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
    </div>
  );
};

