export type UserRole = 'admin' | 'receptionist' | 'technician' | 'pathologist' | 'billing';

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  designation: string;
  isActive: boolean;
  avatar?: string;
}

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  registrationDate: string;
}

export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  specialization: string;
  phone: string;
  clinic: string;
  address: string;
  email?: string;
}

export type ResultFlag = 'Normal' | 'Low' | 'High' | 'Critical';

export interface TestParameter {
  id: string;
  name: string;
  unit: string;
  refRange: string;
  refMin?: number;
  refMax?: number;
  refType: 'range' | 'text' | 'options';
  options?: string[];
}

export interface LabTest {
  id: string;
  code: string;
  name: string;
  department: 'Hematology' | 'Biochemistry' | 'Clinical Pathology' | 'Serology' | 'Microbiology' | 'Endocrinology';
  sampleType: 'Whole Blood' | 'Serum' | 'Plasma' | 'Urine' | 'Swab';
  price: number;
  turnaroundHours: number;
  parameters: TestParameter[];
  description?: string;
}

export interface TestPackage {
  id: string;
  name: string;
  testCodes: string[];
  price: number;
  originalPrice: number;
  description: string;
  isActive: boolean;
}

export type SampleStatus =
  | 'Pending Collection'
  | 'Collected'
  | 'Received'
  | 'Processing'
  | 'Rejected'
  | 'Completed';

export interface Sample {
  id: string;
  orderId: string;
  patientId: string;
  testCodes: string[];
  sampleType: string;
  status: SampleStatus;
  collectedAt?: string;
  collectedBy?: string;
  barcode: string;
  rejectionReason?: string;
}

export interface ResultValue {
  parameterId: string;
  parameterName: string;
  value: string;
  unit: string;
  refRange: string;
  flag: ResultFlag;
  remarks?: string;
}

export interface TestResultEntry {
  testCode: string;
  testName: string;
  department: string;
  parameters: ResultValue[];
  technicianRemarks?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  enteredAt?: string;
  enteredBy?: string;
}

export type OrderStatus =
  | 'Booked'
  | 'Sample Collected'
  | 'In Progress'
  | 'Pending Approval'
  | 'Approved'
  | 'Report Delivered';

export interface ApprovalRecord {
  approverId: string;
  approverName: string;
  approverRole: string;
  approvedAt: string;
  status: 'Approved' | 'Rejected' | 'Correction Requested';
  remarks?: string;
}

export interface Order {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  testCodes: string[];
  packageIds?: string[];
  orderDate: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  paidAmount: number;
  balanceAmount: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  invoiceId: string;
  status: OrderStatus;
  sampleId: string;
  results?: Record<string, TestResultEntry>; // keyed by testCode
  approval?: ApprovalRecord;
  reportGeneratedAt?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  type: 'test' | 'package';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  orderId: string;
  patientId: string;
  patientName: string;
  patientMobile: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  balance: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  notes?: string;
}

export interface LabSettings {
  labName: string;
  tagline: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNo: string;
  reportHeaderNote: string;
  reportFooterText: string;
  disclaimer: string;
  pathologistName: string;
  pathologistTitle: string;
  pathologistRegNo: string;
  technicianName: string;
  currencySymbol: string;
}

export interface AppDataBackup {
  version: string;
  exportedAt: string;
  patients: Patient[];
  doctors: Doctor[];
  tests: LabTest[];
  packages: TestPackage[];
  samples: Sample[];
  orders: Order[];
  invoices: Invoice[];
  staff: Staff[];
  settings: LabSettings;
}

