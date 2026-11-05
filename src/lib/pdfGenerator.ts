import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Order, Patient, Doctor, LabSettings, Invoice } from "@/types";
import { formatDate, formatDateTime, formatCurrency } from "./utils";

export function generateReportPdf(
  order: Order,
  patient: Patient,
  doctor: Doctor,
  settings: LabSettings
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Header Background bar
  doc.setFillColor(13, 148, 136); // Teal #0d9488
  doc.rect(0, 0, pageWidth, 7, "F");

  // Lab Title
  doc.setTextColor(15, 23, 42); // Charcoal slate-900
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(settings.labName, margin, 18);

  // Tagline & Header Note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(settings.tagline, margin, 23);
  doc.text(
    `${settings.address}, ${settings.city}, ${settings.state} - ${settings.pincode} | Ph: ${settings.phone} | Email: ${settings.email}`,
    margin,
    27.5
  );

  // Decorative Accent line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin, 31, pageWidth - margin, 31);

  // Patient & Clinical Meta Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, 34, pageWidth - margin * 2, 29, 2, 2, "FD");

  doc.setFontSize(8.5);
  // Column 1: Patient Details
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("PATIENT INFORMATION", margin + 4, 39);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Patient Name:", margin + 4, 44);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(patient.fullName, margin + 28, 44);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Age / Gender:", margin + 4, 49);
  doc.setTextColor(15, 23, 42);
  doc.text(`${patient.age} Yrs / ${patient.gender}`, margin + 28, 49);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Patient ID:", margin + 4, 54);
  doc.setTextColor(15, 23, 42);
  doc.text(patient.id, margin + 28, 54);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Mobile No:", margin + 4, 59);
  doc.setTextColor(15, 23, 42);
  doc.text(patient.mobile, margin + 28, 59);

  // Column 2: Referral & Specimen Meta
  const col2X = margin + 98;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("ORDER & SPECIMEN METADATA", col2X, 39);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Referred By:", col2X, 44);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(doctor.name, col2X + 26, 44);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Order ID / Ref:", col2X, 49);
  doc.setTextColor(15, 23, 42);
  doc.text(order.id, col2X + 26, 49);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Sample ID / Barcode:", col2X, 54);
  doc.setTextColor(15, 23, 42);
  doc.text(order.sampleId, col2X + 26, 54);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Order Date & Time:", col2X, 59);
  doc.setTextColor(15, 23, 42);
  doc.text(formatDateTime(order.orderDate), col2X + 26, 59);

  let currentY = 67;

  // Build Results Tables
  if (order.results && Object.keys(order.results).length > 0) {
    Object.values(order.results).forEach((testEntry) => {
      // Test Department Banner
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, currentY, pageWidth - margin * 2, 6, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(13, 148, 136); // Teal
      doc.text(
        `${testEntry.testName.toUpperCase()} — (${testEntry.department.toUpperCase()})`,
        margin + 4,
        currentY + 4.3
      );
      currentY += 8;

      const tableRows = testEntry.parameters.map((p) => [
        p.parameterName,
        p.value,
        p.unit || "-",
        p.refRange,
        p.flag === "Normal" ? "Normal" : p.flag.toUpperCase(),
      ]);

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [["Test Investigation / Parameter", "Observed Value", "Unit", "Biological Reference Interval", "Flag"]],
        body: tableRows,
        theme: "plain",
        headStyles: {
          fillColor: [248, 250, 252],
          textColor: [15, 23, 42],
          fontStyle: "bold",
          fontSize: 8,
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85],
          lineColor: [241, 245, 249],
          lineWidth: 0.1,
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 70, fontStyle: "normal" },
          1: { cellWidth: 32, fontStyle: "bold" },
          2: { cellWidth: 24 },
          3: { cellWidth: 38 },
          4: { cellWidth: 18, fontStyle: "bold" },
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 4) {
            const flag = data.cell.raw;
            if (flag === "HIGH" || flag === "CRITICAL") {
              data.cell.styles.textColor = [220, 38, 38]; // Red
            } else if (flag === "LOW") {
              data.cell.styles.textColor = [217, 119, 6]; // Amber
            } else {
              data.cell.styles.textColor = [22, 163, 74]; // Green
            }
          }
        },
      });

      // Update currentY after table
      const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
      currentY = (lastTable ? lastTable.finalY : currentY + 20) + 4;

      if (testEntry.technicianRemarks) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Technician Remarks: ${testEntry.technicianRemarks}`, margin + 2, currentY);
        currentY += 5;
      }
    });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("No test parameters entered or verified for this order yet.", margin, currentY + 6);
    currentY += 16;
  }

  // Pathologist Verification Notes & Stamp
  if (order.approval) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFillColor(240, 253, 250); // teal-50
    doc.setDrawColor(204, 251, 241);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 16, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 118, 110);
    doc.text("SIMULATED CLINICAL PATHOLOGIST VERIFICATION & REMARKS:", margin + 3, currentY + 5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(
      order.approval.remarks || "All reported test parameters reviewed and verified against internal demo quality controls.",
      margin + 3,
      currentY + 10
    );
    currentY += 20;
  }

  // Signatures Section (Positioned safely at bottom of page)
  const signY = Math.max(currentY + 6, 245);

  doc.setDrawColor(203, 213, 225);
  doc.line(margin + 5, signY, margin + 55, signY);
  doc.line(pageWidth - margin - 60, signY, pageWidth - margin - 5, signY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(settings.technicianName, margin + 5, signY + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Medical Lab Technician", margin + 5, signY + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(settings.pathologistName, pageWidth - margin - 60, signY + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(settings.pathologistTitle, pageWidth - margin - 60, signY + 8);
  doc.text(`Reg No: ${settings.pathologistRegNo}`, pageWidth - margin - 60, signY + 12);

  // Digital verification badge
  if (order.status === "Approved") {
    doc.setFillColor(220, 252, 231); // green-100
    doc.setDrawColor(134, 239, 172);
    doc.roundedRect(pageWidth / 2 - 25, signY - 2, 50, 12, 1, 1, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(21, 128, 61);
    doc.text("VERIFIED & ELECTRONICALLY", pageWidth / 2, signY + 3, { align: "center" });
    doc.text("APPROVED DEMO REPORT", pageWidth / 2, signY + 7.5, { align: "center" });
  }

  // Footer Disclaimer
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 280, pageWidth, 17, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `END OF REPORT — ${settings.reportFooterText}`,
    pageWidth / 2,
    284,
    { align: "center" }
  );
  doc.text(
    settings.disclaimer,
    pageWidth / 2,
    288,
    { align: "center", maxWidth: pageWidth - margin * 2 }
  );

  // Save the PDF
  doc.save(`LABORA_REPORT_${order.id}_${patient.fullName.replace(/\s+/g, "_")}.pdf`);
}

export function generateInvoicePdf(invoice: Invoice, settings: LabSettings): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Header Banner
  doc.setFillColor(13, 148, 136); // Teal
  doc.rect(0, 0, pageWidth, 6, "F");

  // Lab Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(settings.labName, margin, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`${settings.address}, ${settings.city}, ${settings.state} - ${settings.pincode}`, margin, 23);
  doc.text(`Phone: ${settings.phone} | GST: ${settings.gstNo}`, margin, 27.5);

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, 31, pageWidth - margin, 31);

  // Invoice Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("TAX INVOICE & RECEIPT", margin, 40);

  // Invoice & Patient Info Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 44, pageWidth - margin * 2, 26, 2, 2, "FD");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Billed To:", margin + 4, 50);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.patientName, margin + 22, 50);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Patient ID:", margin + 4, 56);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.patientId, margin + 22, 56);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Contact:", margin + 4, 62);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.patientMobile, margin + 22, 62);

  // Right side of box
  const rightX = margin + 105;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Invoice Number:", rightX, 50);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.id, rightX + 28, 50);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Order ID:", rightX, 56);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.orderId, rightX + 28, 56);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Date:", rightX, 62);
  doc.setTextColor(15, 23, 42);
  doc.text(formatDate(invoice.date), rightX + 28, 62);

  // Table of Items
  const items = invoice.items.map((item, idx) => [
    (idx + 1).toString(),
    item.description,
    item.type.toUpperCase(),
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.total),
  ]);

  autoTable(doc, {
    startY: 75,
    margin: { left: margin, right: margin },
    head: [["#", "Investigation / Service", "Type", "Qty", "Rate", "Amount"]],
    body: items,
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 85 },
      2: { cellWidth: 25 },
      3: { cellWidth: 15, halign: "center" },
      4: { cellWidth: 25, halign: "right" },
      5: { cellWidth: 22, halign: "right" },
    },
  });

  const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
  const tableBottom = lastTable ? lastTable.finalY : 120;

  // Summary Table on Right
  const summaryX = pageWidth - margin - 70;
  let curY = tableBottom + 8;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Subtotal:", summaryX, curY);
  doc.text(formatCurrency(invoice.subtotal), pageWidth - margin, curY, { align: "right" });

  curY += 6;
  doc.text("Discount Applied:", summaryX, curY);
  doc.setTextColor(22, 163, 74);
  doc.text(`- ${formatCurrency(invoice.discount)}`, pageWidth - margin, curY, { align: "right" });

  curY += 6;
  doc.setTextColor(71, 85, 105);
  doc.text("Taxes (GST 0% on healthcare):", summaryX, curY);
  doc.text(formatCurrency(0), pageWidth - margin, curY, { align: "right" });

  curY += 7;
  doc.setDrawColor(203, 213, 225);
  doc.line(summaryX, curY - 2, pageWidth - margin, curY - 2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Grand Total:", summaryX, curY + 2);
  doc.text(formatCurrency(invoice.total), pageWidth - margin, curY + 2, { align: "right" });

  curY += 8;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("Amount Paid:", summaryX, curY + 2);
  doc.setTextColor(21, 128, 61);
  doc.text(formatCurrency(invoice.paidAmount), pageWidth - margin, curY + 2, { align: "right" });

  curY += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(invoice.balance > 0 ? 220 : 15, invoice.balance > 0 ? 38 : 23, invoice.balance > 0 ? 38 : 42);
  doc.text("Balance Due:", summaryX, curY + 2);
  doc.text(formatCurrency(invoice.balance), pageWidth - margin, curY + 2, { align: "right" });

  // Payment Status Badge on Left
  doc.setFillColor(invoice.paymentStatus === "Paid" ? 220 : invoice.paymentStatus === "Partial" ? 254 : 254, invoice.paymentStatus === "Paid" ? 252 : invoice.paymentStatus === "Partial" ? 243 : 226, invoice.paymentStatus === "Paid" ? 231 : invoice.paymentStatus === "Partial" ? 199 : 226);
  doc.roundedRect(margin, tableBottom + 8, 55, 18, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(invoice.paymentStatus === "Paid" ? 22 : invoice.paymentStatus === "Partial" ? 180 : 220, invoice.paymentStatus === "Paid" ? 101 : invoice.paymentStatus === "Partial" ? 83 : 38, invoice.paymentStatus === "Paid" ? 52 : invoice.paymentStatus === "Partial" ? 9 : 38);
  doc.text(`STATUS: ${invoice.paymentStatus.toUpperCase()}`, margin + 5, tableBottom + 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Mode: ${invoice.paymentMode}`, margin + 5, tableBottom + 21);

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Thank you for choosing Labora Advanced Diagnostics. This is a computer generated demo invoice.", margin, 275);

  doc.save(`LABORA_INVOICE_${invoice.id}.pdf`);
}

