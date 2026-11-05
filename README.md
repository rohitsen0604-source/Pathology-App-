# LABORA — Pathology Management System

> **Enterprise Diagnostic Laboratory Information & Patient Management Web Application**  
> **100% Frontend Only • Zero Database • Zero Backend Server**

---

## 🔬 Overview

**LABORA** is a pathology laboratory management dashboard and laboratory information system (LIS). Built using modern React 19, Next.js (App Router), TypeScript, and Tailwind CSS, the application runs entirely inside the client browser.

All data persistence is handled natively through **centralized browser `localStorage`** with safe parsing, factory demo dataset initialization, reactive UI synchronization, and full JSON data backup/restore capabilities.

---

## ✨ Key Modules & Capabilities

1. **Operations Dashboard**
   - Live metrics: Patient registrations, pending specimens, processing pipeline, pathologist reviews, completed reports.
   - Financial counters: Today's revenue, month-to-date collections, outstanding balance dues.
   - Recharts visual charts: 7-day intake trends, monthly billing vs collection, test frequency, order status distribution.

2. **Patient Management**
   - Auto-generated Patient IDs (`PAT-2026-XXXX`).
   - Demographic registry (DOB, age, gender, mobile, email, street address, city, state, pincode).
   - Search & filter by name, ID, contact, gender.
   - Full patient dossier modal with historical order trail, diagnostic reports, and billing ledger.
   - Export patient directory as CSV.

3. **Referring Doctor Directory**
   - Clinician profiles (Specialization, qualifications, clinic/hospital, phone, address).
   - Real-time referral analytics (total referred investigations & attributed revenue).
   - Add, edit, search, and delete referring doctors.

4. **Clinical Test Catalogue**
   - 15 pre-loaded clinical tests:
     - `CBC` (Complete Blood Count with differential)
     - `ESR` (Erythrocyte Sedimentation Rate)
     - `HAEMOGLOBIN` (Rapid Hb Screening)
     - `LFT` (Liver Function Test Comprehensive)
     - `KFT` (Kidney Function Test with Electrolytes)
     - `LIPID` (Cardiovascular Lipid Profile)
     - `TSH` (Ultra-Sensitive 3rd Gen TSH)
     - `T3` (Total Triiodothyronine)
     - `T4` (Total Thyroxine)
     - `VIT_D` (25-OH Vitamin D)
     - `VIT_B12` (Cyanocobalamin)
     - `HBA1C` (Glycated Hemoglobin HPLC)
     - `GLUCOSE_F` (Fasting Blood Glucose Plasma)
     - `URINE_R` (Urine Routine Examination)
     - `URINE_M` (Urine Microscopy Sediment Analysis)
   - Configurable turnaround times, specimen requirements, and demo biological reference ranges.

5. **Diagnostic Health Packages**
   - Bundled checkup profiles with custom package pricing and automatic savings calculation:
     - Full Body Checkup Comprehensive
     - Basic Health Checkup
     - Diabetes Profile Advance
     - Thyroid Profile (T3, T4, TSH)
     - Kidney Profile Extended
     - Liver Profile Comprehensive

6. **Interactive Test Booking & Orders**
   - Multi-step workflow: Patient selection → Doctor selection → Tests & Packages selection.
   - Real-time subtotal, custom discount calculation, GST 0% healthcare note, net total.
   - Multi-mode payment recording (Cash, UPI, Card, Bank Transfer).
   - Generates unique Order ID (`ORD-2026-XXXX`), Sample Barcode (`SMP-2026-XXXX`), and Invoice (`INV-2026-XXXX`).

7. **Sample Tracking & Accessioning**
   - Barcode visual representation for specimen tubes.
   - Chain of custody status transitions: *Pending Collection → Collected → Received in Lab → Processing → Completed*.
   - Sample rejection with clinical justification logging.

8. **Result Entry & Simulated Auto-Flags**
   - Per-order test parameter entry table.
   - Auto-computed flags (*Normal, Low, High, Critical*) evaluated against biological reference ranges.
   - Technician observations and draft saving vs submission for verification.

9. **Pathologist Clinical Verification & Approval**
   - Separate verification workspace for Senior Consultant Pathologists.
   - Review observed values, inspect flags, enter clinical impressions.
   - *Approve & Authorize Report* (electronically locks report version and displays verified digital stamp).
   - *Request Corrections* or *Reject Order*.

10. **A4 Diagnostic Report Engine**
    - Full-screen clinical pathology report preview formatted strictly for standard A4 portrait layout.
    - Official laboratory branding, patient & doctor metadata, department investigations, flags, technician & pathologist signatories, and disclaimer.
    - Client-side PDF generation via jsPDF & AutoTable.
    - One-click print with tailored `@media print` CSS styling.

11. **Billing & Invoices**
    - Automated invoice generation with itemized test & package lines.
    - Collect payments towards partial or unpaid balances.
    - One-click PDF invoice download.

12. **Staff & Role-Based Access**
    - Client-side role switching:
      - **Admin** (`Dr. Arvind Kulkarni`)
      - **Receptionist** (`Sneha Patil`)
      - **Technician** (`Rakesh Verma`)
      - **Pathologist** (`Dr. Meenakshi Sundaram`)
      - **Billing Staff** (`Vikram Malhotra`)

13. **Settings & Data Management**
    - Configure laboratory details, report header notes, footer text, disclaimers.
    - Export entire application state as JSON.
    - Import & restore JSON backup with schema validation.
    - Factory demo reset with confirmation.

---

## 🔑 Demo Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | Dr. Arvind Kulkarni | `admin@labora.demo` | `Admin@123` |
| **Receptionist** | Sneha Patil | `reception@labora.demo` | `Admin@123` |
| **Technician** | Rakesh Verma | `tech@labora.demo` | `Admin@123` |
| **Pathologist** | Dr. Meenakshi Sundaram | `pathologist@labora.demo` | `Admin@123` |
| **Billing Staff** | Vikram Malhotra | `billing@labora.demo` | `Admin@123` |

*(You can also use the one-click demo role switcher in the application header or login screen.)*

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **PDF Engine**: Client-side jsPDF & jsPDF-AutoTable
- **Persistence**: Centralized browser `localStorage`
- **Zero Backend / Zero Database**: Fully static-compatible frontend deployable anywhere (Vercel, GitHub Pages, Netlify).

---

## 🚀 Setup & Development Instructions

### Prerequisites
- Node.js 18+ (tested on Node.js v24)
- npm or pnpm

### Installation
```bash
git clone https://github.com/rohitsen0604-source/Pathology-App-.git
cd Pathology-App-
npm install
```

### Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## ⚠️ Demonstration Notice
This software is a frontend demonstration web application for educational, portfolio, and operational concept evaluation. It stores data locally in the user's browser via localStorage and does not represent an accredited clinical laboratory diagnostic service or legally binding medical signoff.
