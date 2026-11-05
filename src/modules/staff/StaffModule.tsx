"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Staff, UserRole } from "@/types";
import { Modal } from "@/components/ui/Modal";
import {
  Plus,
  Edit2,
  ShieldCheck,
  Check,
  X,
  Phone,
  Mail,
  ArrowRight
} from "lucide-react";

export const StaffModule: React.FC = () => {
  const { staff, saveStaff, currentUser, setCurrentUser, addToast } = useApp();

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: UserRole;
    phone: string;
    designation: string;
    isActive: boolean;
  }>({
    name: "",
    email: "",
    role: "technician",
    phone: "+91 98200 00000",
    designation: "Laboratory Associate",
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      name: "",
      email: "",
      role: "technician",
      phone: "+91 98200 00000",
      designation: "Laboratory Associate",
      isActive: true,
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (s: Staff) => {
    setEditingStaff(s);
    setFormData({
      name: s.name,
      email: s.email,
      role: s.role,
      phone: s.phone,
      designation: s.designation,
      isActive: s.isActive,
    });
    setIsAddEditOpen(true);
  };

  const handleToggleActive = (s: Staff) => {
    const updated = { ...s, isActive: !s.isActive };
    saveStaff(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (editingStaff) {
      saveStaff({
        id: editingStaff.id,
        ...formData,
      });
    } else {
      const nextId = `STF-${(staff.length + 1).toString().padStart(3, "0")}`;
      saveStaff({
        id: nextId,
        ...formData,
      });
    }

    setIsAddEditOpen(false);
  };

  const handleSwitchToStaff = (s: Staff) => {
    setCurrentUser(s);
    addToast("info", "Role Switched", `Now viewing as ${s.name} (${s.role.toUpperCase()})`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Laboratory Staff & Roles Directory
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {staff.length} Team Members
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure laboratory accounts, clinical roles, access designations & permissions
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {staff.map((member) => {
          const isCurrentUser = currentUser.id === member.id;
          return (
            <div
              key={member.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isCurrentUser ? "border-teal-500 ring-2 ring-teal-500/10" : "border-slate-200"
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {member.id}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isCurrentUser && (
                      <span className="text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        member.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                  <p className="text-xs text-slate-500">{member.designation}</p>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-semibold capitalize text-teal-900">
                      Role: {member.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {!isCurrentUser ? (
                  <button
                    onClick={() => handleSwitchToStaff(member)}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                  >
                    <span>Switch Role</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[11px] text-teal-700 font-medium">Currently Active</span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(member)}
                    title={member.isActive ? "Deactivate" : "Activate"}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                  >
                    {member.isActive ? <X className="w-4 h-4 text-rose-500" /> : <Check className="w-4 h-4 text-emerald-500" />}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(member)}
                    title="Edit Member"
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Staff Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingStaff ? `Edit Team Member — ${editingStaff.name}` : "Add Laboratory Staff"}
        description="Demo credentials for client-side authentication and workflow simulation."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Ramesh Gupta"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Demo Email (Login ID) *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. staff@labora.demo"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Demo Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              >
                <option value="admin">Administrator</option>
                <option value="receptionist">Receptionist</option>
                <option value="technician">Lab Technician</option>
                <option value="pathologist">Consultant Pathologist</option>
                <option value="billing">Billing Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation *
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Job title"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98200 XXXXX"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
            >
              {editingStaff ? "Update Member" : "Save Team Member"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

