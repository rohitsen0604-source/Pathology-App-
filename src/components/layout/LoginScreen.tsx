"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/types";
import {
  FlaskConical,
  Lock,
  Mail,
  ArrowRight,
  Info
} from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { staff, switchRole, setCurrentUser, addToast } = useApp();
  const [email, setEmail] = useState("admin@labora.demo");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    { role: "admin" as UserRole, name: "Dr. Arvind Kulkarni", email: "admin@labora.demo", desc: "Full administrative access" },
    { role: "receptionist" as UserRole, name: "Sneha Patil", email: "reception@labora.demo", desc: "Front desk & patient booking" },
    { role: "technician" as UserRole, name: "Rakesh Verma", email: "tech@labora.demo", desc: "Sample processing & result entry" },
    { role: "pathologist" as UserRole, name: "Dr. Meenakshi Sundaram", email: "pathologist@labora.demo", desc: "Verification & report authorization" },
    { role: "billing" as UserRole, name: "Vikram Malhotra", email: "billing@labora.demo", desc: "Invoicing, payments & receipts" },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Demonstration authentication
    const userFound = staff.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (userFound) {
      setCurrentUser(userFound);
      addToast("success", "Logged In Successfully", `Welcome, ${userFound.name}!`);
      onLoginSuccess();
    } else if (email === "admin@labora.demo") {
      switchRole("admin");
      addToast("success", "Welcome Administrator", "Logged in as Admin.");
      onLoginSuccess();
    } else {
      setError("Please use demo credentials e.g. admin@labora.demo or select a quick role below.");
    }
  };

  const handleQuickRole = (role: UserRole, accountEmail: string) => {
    setEmail(accountEmail);
    switchRole(role);
    addToast("success", "Quick Demo Login", `Signed in as ${role.toUpperCase()}`);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-lg mb-3">
          <FlaskConical className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          LABORA PATHOLOGY
        </h1>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">
          Laboratory Information & Diagnostic System
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Demo Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                  placeholder="admin@labora.demo"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Demo Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                  placeholder="Admin@123"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
            >
              <span>Sign In to Laboratory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2">
              Or Instant Sign-In with Demo Roles
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickRole(acc.role, acc.email)}
                  className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 flex items-center justify-between text-xs transition-colors group"
                >
                  <div>
                    <span className="font-semibold text-slate-800 capitalize group-hover:text-teal-900">
                      {acc.role} ({acc.name})
                    </span>
                    <p className="text-[10px] text-slate-400">{acc.desc}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded">
                    Launch →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Demonstration Notice */}
          <div className="mt-5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-800 flex gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Notice:</strong> This is client-side demo authentication. Data is saved in this browser&apos;s localStorage only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

