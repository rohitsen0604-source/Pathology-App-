"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  Patient,
  Doctor,
  LabTest,
  TestPackage,
  Sample,
  Order,
  Invoice,
  Staff,
  LabSettings,
  UserRole,
  TestResultEntry,
  ApprovalRecord,
} from "@/types";
import { StorageService, STORAGE_CHANGE_EVENT } from "@/services/storage/storageService";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
}

interface AppContextType {
  isInitialized: boolean;
  currentUser: Staff;
  switchRole: (role: UserRole) => void;
  setCurrentUser: (user: Staff) => void;
  activeModule: string;
  setActiveModule: (mod: string) => void;
  selectedOrderIdForReport: string | null;
  setSelectedOrderIdForReport: (id: string | null) => void;

  // Collections
  patients: Patient[];
  doctors: Doctor[];
  tests: LabTest[];
  packages: TestPackage[];
  samples: Sample[];
  orders: Order[];
  invoices: Invoice[];
  staff: Staff[];
  settings: LabSettings;

  // Operations
  refreshData: () => void;
  resetDemoData: () => void;
  savePatient: (patient: Omit<Patient, "id" | "registrationDate"> & { id?: string }) => Patient;
  deletePatient: (id: string) => boolean;

  saveDoctor: (doctor: Omit<Doctor, "id"> & { id?: string }) => Doctor;
  deleteDoctor: (id: string) => boolean;

  saveTest: (test: Omit<LabTest, "id"> & { id?: string }) => LabTest;
  deleteTest: (id: string) => boolean;

  savePackage: (pkg: Omit<TestPackage, "id"> & { id?: string }) => TestPackage;
  deletePackage: (id: string) => boolean;

  createBooking: (data: {
    patient: Patient;
    doctor: Doctor;
    selectedTests: LabTest[];
    selectedPackages: TestPackage[];
    discount: number;
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
    paidAmount: number;
  }) => { order: Order; sample: Sample; invoice: Invoice };

  saveOrder: (order: Order) => Order;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;

  saveSample: (sample: Sample) => Sample;
  updateSampleStatus: (sampleId: string, status: Sample["status"], reason?: string) => void;

  saveInvoice: (invoice: Invoice) => Invoice;
  recordPayment: (invoiceId: string, amount: number, mode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer') => Invoice | null;

  saveStaff: (staff: Staff) => Staff;
  saveSettings: (settings: LabSettings) => LabSettings;

  updateResults: (orderId: string, testCode: string, resultEntry: TestResultEntry) => void;
  approveReport: (orderId: string, approval: ApprovalRecord) => void;

  exportBackup: () => void;
  importBackup: (jsonStr: string) => { success: boolean; message: string };
  exportPatientsCsv: () => void;

  // Notifications
  toasts: ToastMessage[];
  addToast: (type: ToastMessage["type"], title: string, description?: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeModule, setActiveModule] = useState<string>("dashboard");
  const [selectedOrderIdForReport, setSelectedOrderIdForReport] = useState<string | null>(null);

  const [currentUser, setCurrentUserState] = useState<Staff>(() => StorageService.getCurrentUser());
  const [patients, setPatients] = useState<Patient[]>(() => {
    StorageService.initializeStorage();
    return StorageService.getPatients();
  });
  const [doctors, setDoctors] = useState<Doctor[]>(() => StorageService.getDoctors());
  const [tests, setTests] = useState<LabTest[]>(() => StorageService.getTests());
  const [packages, setPackages] = useState<TestPackage[]>(() => StorageService.getPackages());
  const [samples, setSamples] = useState<Sample[]>(() => StorageService.getSamples());
  const [orders, setOrders] = useState<Order[]>(() => StorageService.getOrders());
  const [invoices, setInvoices] = useState<Invoice[]>(() => StorageService.getInvoices());
  const [staff, setStaff] = useState<Staff[]>(() => StorageService.getStaff());
  const [settings, setSettings] = useState<LabSettings>(() => StorageService.getSettings());

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage["type"], title: string, description?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshData = useCallback(() => {
    setCurrentUserState(StorageService.getCurrentUser());
    setPatients(StorageService.getPatients());
    setDoctors(StorageService.getDoctors());
    setTests(StorageService.getTests());
    setPackages(StorageService.getPackages());
    setSamples(StorageService.getSamples());
    setOrders(StorageService.getOrders());
    setInvoices(StorageService.getInvoices());
    setStaff(StorageService.getStaff());
    setSettings(StorageService.getSettings());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 0);

    const handleStorageChange = () => {
      refreshData();
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshData]);

  const switchRole = useCallback((role: UserRole) => {
    const user = StorageService.switchDemoRole(role);
    setCurrentUserState(user);
    addToast("info", "Role Switched", `Switched to demo role: ${role.toUpperCase()} (${user.name})`);
  }, [addToast]);

  const setCurrentUser = useCallback((user: Staff) => {
    StorageService.setCurrentUser(user);
    setCurrentUserState(user);
  }, []);

  const resetDemoData = useCallback(() => {
    StorageService.resetToDemoData();
    refreshData();
    addToast("success", "Demo Reset Successful", "All records have been reset to factory default demo datasets.");
  }, [refreshData, addToast]);

  const savePatient = useCallback((data: Omit<Patient, "id" | "registrationDate"> & { id?: string }) => {
    const saved = StorageService.savePatient(data);
    refreshData();
    addToast("success", "Patient Saved", `${saved.fullName} (${saved.id}) recorded.`);
    return saved;
  }, [refreshData, addToast]);

  const deletePatient = useCallback((id: string) => {
    const success = StorageService.deletePatient(id);
    refreshData();
    if (success) addToast("info", "Patient Removed", `Patient ID ${id} deleted.`);
    return success;
  }, [refreshData, addToast]);

  const saveDoctor = useCallback((data: Omit<Doctor, "id"> & { id?: string }) => {
    const saved = StorageService.saveDoctor(data);
    refreshData();
    addToast("success", "Doctor Saved", `${saved.name} recorded.`);
    return saved;
  }, [refreshData, addToast]);

  const deleteDoctor = useCallback((id: string) => {
    const success = StorageService.deleteDoctor(id);
    refreshData();
    if (success) addToast("info", "Doctor Deleted", `Doctor record removed.`);
    return success;
  }, [refreshData, addToast]);

  const saveTest = useCallback((data: Omit<LabTest, "id"> & { id?: string }) => {
    const saved = StorageService.saveTest(data);
    refreshData();
    addToast("success", "Test Saved", `${saved.name} (${saved.code}) saved.`);
    return saved;
  }, [refreshData, addToast]);

  const deleteTest = useCallback((id: string) => {
    const success = StorageService.deleteTest(id);
    refreshData();
    if (success) addToast("info", "Test Removed", "Test removed from catalogue.");
    return success;
  }, [refreshData, addToast]);

  const savePackage = useCallback((data: Omit<TestPackage, "id"> & { id?: string }) => {
    const saved = StorageService.savePackage(data);
    refreshData();
    addToast("success", "Package Saved", `${saved.name} saved.`);
    return saved;
  }, [refreshData, addToast]);

  const deletePackage = useCallback((id: string) => {
    const success = StorageService.deletePackage(id);
    refreshData();
    if (success) addToast("info", "Package Removed", "Package deleted.");
    return success;
  }, [refreshData, addToast]);

  const createBooking = useCallback((data: {
    patient: Patient;
    doctor: Doctor;
    selectedTests: LabTest[];
    selectedPackages: TestPackage[];
    discount: number;
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
    paidAmount: number;
  }) => {
    const res = StorageService.createOrderWithSampleAndInvoice(data);
    refreshData();
    addToast("success", "Order Booked", `Order ${res.order.id} & Sample ${res.sample.id} generated!`);
    return res;
  }, [refreshData, addToast]);

  const saveOrder = useCallback((order: Order) => {
    const saved = StorageService.saveOrder(order);
    refreshData();
    return saved;
  }, [refreshData]);

  const updateOrderStatus = useCallback((orderId: string, status: Order["status"]) => {
    const order = StorageService.getOrderById(orderId);
    if (order) {
      order.status = status;
      StorageService.saveOrder(order);
      refreshData();
      addToast("info", "Order Status Updated", `Order ${orderId} is now ${status}.`);
    }
  }, [refreshData, addToast]);

  const saveSample = useCallback((sample: Sample) => {
    const saved = StorageService.saveSample(sample);
    refreshData();
    return saved;
  }, [refreshData]);

  const updateSampleStatus = useCallback((sampleId: string, status: Sample["status"], reason?: string) => {
    const sample = StorageService.getSampleById(sampleId);
    if (sample) {
      sample.status = status;
      if (status === "Collected" && !sample.collectedAt) {
        sample.collectedAt = new Date().toISOString();
        sample.collectedBy = currentUser.name;
      }
      if (status === "Rejected") {
        sample.rejectionReason = reason || "Sample hemolyzed / insufficient volume";
      }
      StorageService.saveSample(sample);

      // Update associated order status accordingly
      const order = StorageService.getOrderById(sample.orderId);
      if (order) {
        if (status === "Collected" && order.status === "Booked") {
          order.status = "Sample Collected";
          StorageService.saveOrder(order);
        } else if (status === "Processing" && (order.status === "Booked" || order.status === "Sample Collected")) {
          order.status = "In Progress";
          StorageService.saveOrder(order);
        }
      }

      refreshData();
      addToast("success", "Sample Updated", `Sample ${sampleId} marked as ${status}.`);
    }
  }, [currentUser.name, refreshData, addToast]);

  const saveInvoice = useCallback((invoice: Invoice) => {
    const saved = StorageService.saveInvoice(invoice);
    refreshData();
    return saved;
  }, [refreshData]);

  const recordPayment = useCallback((invoiceId: string, amount: number, mode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer') => {
    const res = StorageService.recordInvoicePayment(invoiceId, amount, mode);
    refreshData();
    if (res) {
      addToast("success", "Payment Recorded", `₹${amount} recorded via ${mode}. Balance: ₹${res.balance}`);
    }
    return res;
  }, [refreshData, addToast]);

  const saveStaff = useCallback((member: Staff) => {
    const saved = StorageService.saveStaff(member);
    refreshData();
    addToast("success", "Staff Updated", `${saved.name} details updated.`);
    return saved;
  }, [refreshData, addToast]);

  const saveSettings = useCallback((newSettings: LabSettings) => {
    const saved = StorageService.saveSettings(newSettings);
    refreshData();
    addToast("success", "Settings Saved", "Laboratory configuration saved.");
    return saved;
  }, [refreshData, addToast]);

  const updateResults = useCallback((orderId: string, testCode: string, resultEntry: TestResultEntry) => {
    const order = StorageService.getOrderById(orderId);
    if (!order) return;

    if (!order.results) order.results = {};
    order.results[testCode] = resultEntry;

    // Check if any results are submitted -> order goes to 'Pending Approval'
    const allSubmitted = Object.values(order.results).every((r) => r.status === "submitted" || r.status === "approved");
    if (allSubmitted && Object.keys(order.results).length === order.testCodes.length) {
      order.status = "Pending Approval";
    } else {
      order.status = "In Progress";
    }

    StorageService.saveOrder(order);
    refreshData();
    addToast("success", "Results Saved", `Results for ${resultEntry.testName} saved as ${resultEntry.status}.`);
  }, [refreshData, addToast]);

  const approveReport = useCallback((orderId: string, approval: ApprovalRecord) => {
    const order = StorageService.getOrderById(orderId);
    if (!order) return;

    order.approval = approval;
    if (approval.status === "Approved") {
      order.status = "Approved";
      order.reportGeneratedAt = new Date().toISOString();
      if (order.results) {
        Object.keys(order.results).forEach((k) => {
          if (order.results) order.results[k].status = "approved";
        });
      }
      // Update sample to Completed
      const sample = StorageService.getSampleById(order.sampleId);
      if (sample) {
        sample.status = "Completed";
        StorageService.saveSample(sample);
      }
      addToast("success", "Report Approved", `Order ${orderId} has been verified and approved.`);
    } else if (approval.status === "Rejected") {
      order.status = "In Progress";
      addToast("warning", "Report Rejected", `Order ${orderId} returned with remarks.`);
    } else {
      order.status = "In Progress";
      addToast("warning", "Corrections Requested", `Sent back to technician for corrections.`);
    }

    StorageService.saveOrder(order);
    refreshData();
  }, [refreshData, addToast]);

  const exportBackup = useCallback(() => {
    const backup = StorageService.exportAllData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `labora_pathology_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast("success", "Backup Downloaded", "Complete JSON archive exported.");
  }, [addToast]);

  const importBackup = useCallback((jsonStr: string) => {
    const res = StorageService.importData(jsonStr);
    refreshData();
    if (res.success) {
      addToast("success", "Data Restored", res.message);
    } else {
      addToast("error", "Import Failed", res.message);
    }
    return res;
  }, [refreshData, addToast]);

  const exportPatientsCsv = useCallback(() => {
    const csvContent = StorageService.exportPatientsCsv();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `labora_patients_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    addToast("success", "CSV Exported", "Patients table downloaded as CSV.");
  }, [addToast]);

  return (
    <AppContext.Provider
      value={{
        isInitialized,
        currentUser,
        switchRole,
        setCurrentUser,
        activeModule,
        setActiveModule,
        selectedOrderIdForReport,
        setSelectedOrderIdForReport,
        patients,
        doctors,
        tests,
        packages,
        samples,
        orders,
        invoices,
        staff,
        settings,
        refreshData,
        resetDemoData,
        savePatient,
        deletePatient,
        saveDoctor,
        deleteDoctor,
        saveTest,
        deleteTest,
        savePackage,
        deletePackage,
        createBooking,
        saveOrder,
        updateOrderStatus,
        saveSample,
        updateSampleStatus,
        saveInvoice,
        recordPayment,
        saveStaff,
        saveSettings,
        updateResults,
        approveReport,
        exportBackup,
        importBackup,
        exportPatientsCsv,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
