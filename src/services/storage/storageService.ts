import {
  Patient,
  Doctor,
  LabTest,
  TestPackage,
  Sample,
  Order,
  Invoice,
  InvoiceItem,
  Staff,
  LabSettings,
  AppDataBackup,
  UserRole
} from "@/types";
import {
  DEFAULT_SETTINGS,
  DEFAULT_STAFF,
  DEFAULT_DOCTORS,
  DEFAULT_TESTS,
  DEFAULT_PACKAGES,
  DEFAULT_PATIENTS,
  buildDefaultOrdersAndSamples,
} from "./seedData";

const STORAGE_KEYS = {
  INITIALIZED: "labora_initialized_v1",
  CURRENT_USER: "labora_current_user",
  PATIENTS: "labora_patients",
  DOCTORS: "labora_doctors",
  TESTS: "labora_tests",
  PACKAGES: "labora_packages",
  ORDERS: "labora_orders",
  SAMPLES: "labora_samples",
  INVOICES: "labora_invoices",
  STAFF: "labora_staff",
  SETTINGS: "labora_settings",
};

export const STORAGE_CHANGE_EVENT = "labora_storage_update";

function emitStorageChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT));
  }
}

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Storage error reading ${key}:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    emitStorageChange();
    return true;
  } catch (err) {
    console.error(`Storage error writing ${key}:`, err);
    return false;
  }
}

export const StorageService = {
  // Initialize storage only if not initialized
  initializeStorage(): void {
    if (typeof window === "undefined") return;

    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (isInit) {
      return; // Do not overwrite existing localStorage records
    }

    this.resetToDemoData();
  },

  resetToDemoData(): void {
    if (typeof window === "undefined") return;

    const { orders, samples, invoices } = buildDefaultOrdersAndSamples();

    safeSet(STORAGE_KEYS.PATIENTS, DEFAULT_PATIENTS);
    safeSet(STORAGE_KEYS.DOCTORS, DEFAULT_DOCTORS);
    safeSet(STORAGE_KEYS.TESTS, DEFAULT_TESTS);
    safeSet(STORAGE_KEYS.PACKAGES, DEFAULT_PACKAGES);
    safeSet(STORAGE_KEYS.STAFF, DEFAULT_STAFF);
    safeSet(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    safeSet(STORAGE_KEYS.ORDERS, orders);
    safeSet(STORAGE_KEYS.SAMPLES, samples);
    safeSet(STORAGE_KEYS.INVOICES, invoices);

    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      safeSet(STORAGE_KEYS.CURRENT_USER, DEFAULT_STAFF[0]); // Default to Admin
    }

    localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
    emitStorageChange();
  },

  // Auth / Current User
  getCurrentUser(): Staff {
    return safeGet<Staff>(STORAGE_KEYS.CURRENT_USER, DEFAULT_STAFF[0]);
  },

  setCurrentUser(user: Staff): void {
    safeSet(STORAGE_KEYS.CURRENT_USER, user);
  },

  switchDemoRole(role: UserRole): Staff {
    const staffList = this.getStaff();
    const found = staffList.find((s) => s.role === role && s.isActive);
    if (found) {
      this.setCurrentUser(found);
      return found;
    }
    const tempUser: Staff = {
      id: `STF-TEMP-${role.toUpperCase()}`,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `${role}@labora.demo`,
      role: role,
      phone: "+91 99999 00000",
      designation: `${role.toUpperCase()} Specialist`,
      isActive: true,
    };
    this.setCurrentUser(tempUser);
    return tempUser;
  },

  // Patients
  getPatients(): Patient[] {
    return safeGet<Patient[]>(STORAGE_KEYS.PATIENTS, []);
  },

  getPatientById(id: string): Patient | undefined {
    return this.getPatients().find((p) => p.id === id);
  },

  savePatient(patient: Omit<Patient, "id" | "registrationDate"> & { id?: string }): Patient {
    const patients = this.getPatients();
    let updated: Patient;

    if (patient.id) {
      const index = patients.findIndex((p) => p.id === patient.id);
      if (index !== -1) {
        updated = {
          ...patients[index],
          ...patient,
        };
        patients[index] = updated;
      } else {
        updated = {
          ...patient,
          id: patient.id,
          registrationDate: new Date().toISOString().split("T")[0],
        } as Patient;
        patients.unshift(updated);
      }
    } else {
      const nextNum = patients.length + 1;
      const newId = `PAT-2026-${nextNum.toString().padStart(4, "0")}`;
      updated = {
        ...patient,
        id: newId,
        registrationDate: new Date().toISOString().split("T")[0],
      };
      patients.unshift(updated);
    }

    safeSet(STORAGE_KEYS.PATIENTS, patients);
    return updated;
  },

  deletePatient(id: string): boolean {
    const patients = this.getPatients().filter((p) => p.id !== id);
    return safeSet(STORAGE_KEYS.PATIENTS, patients);
  },

  // Doctors
  getDoctors(): Doctor[] {
    return safeGet<Doctor[]>(STORAGE_KEYS.DOCTORS, []);
  },

  getDoctorById(id: string): Doctor | undefined {
    return this.getDoctors().find((d) => d.id === id);
  },

  saveDoctor(doctor: Omit<Doctor, "id"> & { id?: string }): Doctor {
    const doctors = this.getDoctors();
    let updated: Doctor;

    if (doctor.id) {
      const index = doctors.findIndex((d) => d.id === doctor.id);
      if (index !== -1) {
        updated = { ...doctors[index], ...doctor };
        doctors[index] = updated;
      } else {
        updated = { ...doctor, id: doctor.id } as Doctor;
        doctors.push(updated);
      }
    } else {
      const nextNum = doctors.length + 101;
      const newId = `DOC-${nextNum}`;
      updated = { ...doctor, id: newId };
      doctors.push(updated);
    }

    safeSet(STORAGE_KEYS.DOCTORS, doctors);
    return updated;
  },

  deleteDoctor(id: string): boolean {
    const doctors = this.getDoctors().filter((d) => d.id !== id);
    return safeSet(STORAGE_KEYS.DOCTORS, doctors);
  },

  // Tests
  getTests(): LabTest[] {
    return safeGet<LabTest[]>(STORAGE_KEYS.TESTS, []);
  },

  getTestByCode(code: string): LabTest | undefined {
    return this.getTests().find((t) => t.code.toUpperCase() === code.toUpperCase());
  },

  saveTest(test: Omit<LabTest, "id"> & { id?: string }): LabTest {
    const tests = this.getTests();
    let updated: LabTest;

    if (test.id) {
      const index = tests.findIndex((t) => t.id === test.id);
      if (index !== -1) {
        updated = { ...tests[index], ...test };
        tests[index] = updated;
      } else {
        updated = { ...test, id: test.id } as LabTest;
        tests.push(updated);
      }
    } else {
      const nextNum = (tests.length + 1).toString().padStart(2, "0");
      const newId = `TST-${nextNum}`;
      updated = { ...test, id: newId };
      tests.push(updated);
    }

    safeSet(STORAGE_KEYS.TESTS, tests);
    return updated;
  },

  deleteTest(id: string): boolean {
    const tests = this.getTests().filter((t) => t.id !== id);
    return safeSet(STORAGE_KEYS.TESTS, tests);
  },

  // Packages
  getPackages(): TestPackage[] {
    return safeGet<TestPackage[]>(STORAGE_KEYS.PACKAGES, []);
  },

  savePackage(pkg: Omit<TestPackage, "id"> & { id?: string }): TestPackage {
    const packages = this.getPackages();
    let updated: TestPackage;

    if (pkg.id) {
      const index = packages.findIndex((p) => p.id === pkg.id);
      if (index !== -1) {
        updated = { ...packages[index], ...pkg };
        packages[index] = updated;
      } else {
        updated = { ...pkg, id: pkg.id } as TestPackage;
        packages.push(updated);
      }
    } else {
      const nextNum = (packages.length + 1).toString().padStart(2, "0");
      const newId = `PKG-${nextNum}`;
      updated = { ...pkg, id: newId };
      packages.push(updated);
    }

    safeSet(STORAGE_KEYS.PACKAGES, packages);
    return updated;
  },

  deletePackage(id: string): boolean {
    const packages = this.getPackages().filter((p) => p.id !== id);
    return safeSet(STORAGE_KEYS.PACKAGES, packages);
  },

  // Orders
  getOrders(): Order[] {
    return safeGet<Order[]>(STORAGE_KEYS.ORDERS, []);
  },

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id);
  },

  saveOrder(order: Order): Order {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === order.id);
    if (index !== -1) {
      orders[index] = order;
    } else {
      orders.unshift(order);
    }
    safeSet(STORAGE_KEYS.ORDERS, orders);
    return order;
  },

  createOrderWithSampleAndInvoice(data: {
    patient: Patient;
    doctor: Doctor;
    selectedTests: LabTest[];
    selectedPackages: TestPackage[];
    discount: number;
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
    paidAmount: number;
  }): { order: Order; sample: Sample; invoice: Invoice } {
    const orders = this.getOrders();
    const samples = this.getSamples();
    const invoices = this.getInvoices();

    const orderNum = (orders.length + 1).toString().padStart(4, "0");
    const orderId = `ORD-2026-${orderNum}`;
    const sampleId = `SMP-2026-${orderNum}`;
    const invoiceId = `INV-2026-${orderNum}`;

    // Calculate totals
    let subtotal = 0;
    const testCodes = new Set<string>();
    const invoiceItems: InvoiceItem[] = [];

    data.selectedPackages.forEach((pkg) => {
      subtotal += pkg.price;
      pkg.testCodes.forEach((c) => testCodes.add(c));
      invoiceItems.push({
        id: `ITM-PKG-${pkg.id}`,
        description: `Package: ${pkg.name}`,
        type: "package" as const,
        quantity: 1,
        unitPrice: pkg.price,
        total: pkg.price,
      });
    });

    data.selectedTests.forEach((test) => {
      subtotal += test.price;
      testCodes.add(test.code);
      invoiceItems.push({
        id: `ITM-TST-${test.id}`,
        description: test.name,
        type: "test" as const,
        quantity: 1,
        unitPrice: test.price,
        total: test.price,
      });
    });

    const finalAmount = Math.max(0, subtotal - data.discount);
    const paid = Math.min(data.paidAmount, finalAmount);
    const balance = Math.max(0, finalAmount - paid);
    const paymentStatus: 'Paid' | 'Partial' | 'Unpaid' =
      balance === 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid";

    const newOrder: Order = {
      id: orderId,
      patientId: data.patient.id,
      patientName: data.patient.fullName,
      doctorId: data.doctor.id,
      doctorName: data.doctor.name,
      testCodes: Array.from(testCodes),
      packageIds: data.selectedPackages.map((p) => p.id),
      orderDate: new Date().toISOString(),
      totalAmount: subtotal,
      discount: data.discount,
      finalAmount: finalAmount,
      paymentStatus: paymentStatus,
      paidAmount: paid,
      balanceAmount: balance,
      paymentMode: data.paymentMode,
      invoiceId: invoiceId,
      status: "Booked",
      sampleId: sampleId,
    };

    const newSample: Sample = {
      id: sampleId,
      orderId: orderId,
      patientId: data.patient.id,
      testCodes: Array.from(testCodes),
      sampleType: data.selectedTests[0]?.sampleType || "Blood / Serum",
      status: "Pending Collection",
      barcode: `SMP2026${orderNum}`,
    };

    const newInvoice: Invoice = {
      id: invoiceId,
      orderId: orderId,
      patientId: data.patient.id,
      patientName: data.patient.fullName,
      patientMobile: data.patient.mobile,
      date: new Date().toISOString().split("T")[0],
      items: invoiceItems,
      subtotal: subtotal,
      discount: data.discount,
      tax: 0,
      total: finalAmount,
      paidAmount: paid,
      balance: balance,
      paymentStatus: paymentStatus,
      paymentMode: data.paymentMode,
      notes: "Demo test booking invoice generated by Labora.",
    };

    orders.unshift(newOrder);
    samples.unshift(newSample);
    invoices.unshift(newInvoice);

    safeSet(STORAGE_KEYS.ORDERS, orders);
    safeSet(STORAGE_KEYS.SAMPLES, samples);
    safeSet(STORAGE_KEYS.INVOICES, invoices);

    return { order: newOrder, sample: newSample, invoice: newInvoice };
  },

  // Samples
  getSamples(): Sample[] {
    return safeGet<Sample[]>(STORAGE_KEYS.SAMPLES, []);
  },

  getSampleById(id: string): Sample | undefined {
    return this.getSamples().find((s) => s.id === id);
  },

  saveSample(sample: Sample): Sample {
    const samples = this.getSamples();
    const index = samples.findIndex((s) => s.id === sample.id);
    if (index !== -1) {
      samples[index] = sample;
    } else {
      samples.unshift(sample);
    }
    safeSet(STORAGE_KEYS.SAMPLES, samples);
    return sample;
  },

  // Invoices
  getInvoices(): Invoice[] {
    return safeGet<Invoice[]>(STORAGE_KEYS.INVOICES, []);
  },

  getInvoiceById(id: string): Invoice | undefined {
    return this.getInvoices().find((i) => i.id === id);
  },

  saveInvoice(invoice: Invoice): Invoice {
    const invoices = this.getInvoices();
    const index = invoices.findIndex((i) => i.id === invoice.id);
    if (index !== -1) {
      invoices[index] = invoice;
    } else {
      invoices.unshift(invoice);
    }
    safeSet(STORAGE_KEYS.INVOICES, invoices);
    return invoice;
  },

  recordInvoicePayment(invoiceId: string, amount: number, mode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer'): Invoice | null {
    const invoices = this.getInvoices();
    const index = invoices.findIndex((i) => i.id === invoiceId);
    if (index === -1) return null;

    const inv = invoices[index];
    const newPaid = inv.paidAmount + amount;
    const newBalance = Math.max(0, inv.total - newPaid);
    const newStatus: 'Paid' | 'Partial' | 'Unpaid' =
      newBalance === 0 ? "Paid" : newPaid > 0 ? "Partial" : "Unpaid";

    inv.paidAmount = newPaid;
    inv.balance = newBalance;
    inv.paymentStatus = newStatus;
    inv.paymentMode = mode;
    invoices[index] = inv;
    safeSet(STORAGE_KEYS.INVOICES, invoices);

    // Also sync the order
    const order = this.getOrderById(inv.orderId);
    if (order) {
      order.paidAmount = newPaid;
      order.balanceAmount = newBalance;
      order.paymentStatus = newStatus;
      this.saveOrder(order);
    }

    return inv;
  },

  // Staff
  getStaff(): Staff[] {
    return safeGet<Staff[]>(STORAGE_KEYS.STAFF, []);
  },

  saveStaff(member: Staff): Staff {
    const staff = this.getStaff();
    const index = staff.findIndex((s) => s.id === member.id);
    if (index !== -1) {
      staff[index] = member;
    } else {
      staff.push(member);
    }
    safeSet(STORAGE_KEYS.STAFF, staff);
    return member;
  },

  // Settings
  getSettings(): LabSettings {
    return safeGet<LabSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  saveSettings(settings: LabSettings): LabSettings {
    safeSet(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  },

  // Backup & Restore
  exportAllData(): AppDataBackup {
    return {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      patients: this.getPatients(),
      doctors: this.getDoctors(),
      tests: this.getTests(),
      packages: this.getPackages(),
      samples: this.getSamples(),
      orders: this.getOrders(),
      invoices: this.getInvoices(),
      staff: this.getStaff(),
      settings: this.getSettings(),
    };
  },

  importData(backupJson: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(backupJson) as AppDataBackup;
      if (!data || !Array.isArray(data.patients) || !Array.isArray(data.tests) || !Array.isArray(data.orders)) {
        return { success: false, message: "Invalid backup format. Required collections missing." };
      }

      safeSet(STORAGE_KEYS.PATIENTS, data.patients);
      if (Array.isArray(data.doctors)) safeSet(STORAGE_KEYS.DOCTORS, data.doctors);
      if (Array.isArray(data.tests)) safeSet(STORAGE_KEYS.TESTS, data.tests);
      if (Array.isArray(data.packages)) safeSet(STORAGE_KEYS.PACKAGES, data.packages);
      if (Array.isArray(data.samples)) safeSet(STORAGE_KEYS.SAMPLES, data.samples);
      if (Array.isArray(data.orders)) safeSet(STORAGE_KEYS.ORDERS, data.orders);
      if (Array.isArray(data.invoices)) safeSet(STORAGE_KEYS.INVOICES, data.invoices);
      if (Array.isArray(data.staff)) safeSet(STORAGE_KEYS.STAFF, data.staff);
      if (data.settings) safeSet(STORAGE_KEYS.SETTINGS, data.settings);

      emitStorageChange();
      return { success: true, message: `Successfully restored ${data.patients.length} patients, ${data.orders.length} orders.` };
    } catch (err) {
      return { success: false, message: `Import error: ${err instanceof Error ? err.message : "Unknown error"}` };
    }
  },

  exportPatientsCsv(): string {
    const patients = this.getPatients();
    const headers = ["Patient ID", "Full Name", "Age", "Gender", "Date of Birth", "Mobile", "Email", "Address", "City", "State", "Pincode", "Registration Date"];
    const rows = patients.map((p) => [
      p.id,
      `"${p.fullName.replace(/"/g, '""')}"`,
      p.age,
      p.gender,
      p.dob,
      p.mobile,
      p.email,
      `"${p.address.replace(/"/g, '""')}"`,
      p.city,
      p.state,
      p.pincode,
      p.registrationDate,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  },
};

