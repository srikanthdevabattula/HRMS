import React from 'react';
import Logo from './Logo';
import {
  X,
  Printer,
  CheckCircle2,
  DollarSign,
  Calendar,
  Building,
  User,
  Briefcase,
  ShieldCheck,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';

/**
 * Convert number to English currency words
 */
export function numberToWords(num) {
  if (!num || isNaN(num) || num <= 0) return 'Zero Dollars Only';
  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
  };

  const rounded = Math.round(num);
  if (rounded < 100) return inWords(rounded) + ' Dollars Only';
  if (rounded < 1000) {
    return (
      a[Math.floor(rounded / 100)] +
      ' Hundred' +
      (rounded % 100 ? ' ' + inWords(rounded % 100) : '') +
      ' Dollars Only'
    );
  }
  if (rounded < 1000000) {
    const thousands = Math.floor(rounded / 1000);
    const rem = rounded % 1000;
    const thWords =
      thousands < 100
        ? inWords(thousands)
        : a[Math.floor(thousands / 100)] +
          ' Hundred' +
          (thousands % 100 ? ' ' + inWords(thousands % 100) : '');
    let remWords = '';
    if (rem > 0) {
      if (rem < 100) remWords = ' ' + inWords(rem);
      else
        remWords =
          ' ' +
          a[Math.floor(rem / 100)] +
          ' Hundred' +
          (rem % 100 ? ' ' + inWords(rem % 100) : '');
    }
    return `${thWords} Thousand${remWords} Dollars Only`;
  }
  return `${rounded.toLocaleString()} Dollars Only`;
}

/**
 * Isolated Hidden Iframe Printer
 * Generates an exact, clean A4/Letter PDF printout starting from the top margin (0,0)
 * Eliminates top blank whitespace, scroll offsets, and cutoffs.
 */
export const printPayslipDocument = (record) => {
  if (!record) return;

  const basicSalary = record.basicSalary || 0;
  const hra = record.hra || Math.round(basicSalary * 0.4);
  const specialAllowance = record.specialAllowance || Math.round(basicSalary * 0.3);
  const conveyanceAllowance = record.conveyanceAllowance || Math.round(basicSalary * 0.2);
  const medicalAllowance = record.medicalAllowance || Math.round(basicSalary * 0.1);
  const totalAllowances =
    record.allowances || hra + specialAllowance + conveyanceAllowance + medicalAllowance;
  const grossEarnings = record.grossSalary || basicSalary + totalAllowances;

  const tds = record.tds || Math.round(grossEarnings * 0.1);
  const pf = record.pf || Math.round(basicSalary * 0.12);
  const professionalTax = record.professionalTax !== undefined ? record.professionalTax : 200;
  const totalDeductions = record.deductions || tds + pf + professionalTax;
  const netSalary = record.netSalary || Math.max(0, grossEarnings - totalDeductions);

  const annualSalary = record.annualSalary || grossEarnings * 12;
  const workingDays = record.workingDays || 22;
  const words = numberToWords(netSalary);
  const paymentDateStr = record.paymentDate
    ? new Date(record.paymentDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '1st of Month';

  // Create isolated hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Payslip_${record.employeeId}_${(record.month || '').replace(/\s+/g, '_')}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 14mm 12mm 14mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          padding: 0;
          font-size: 11px;
          line-height: 1.4;
        }
        .payslip-container {
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          padding: 24px 28px;
          background: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 16px;
          border-bottom: 2px solid #e2e8f0;
        }
        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-box {
          width: 38px;
          height: 38px;
          background: #4f46e5;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 900;
          font-size: 18px;
        }
        .logo-title {
          font-size: 20px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .logo-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          color: #4f46e5;
          background: #eef2ff;
          border: 1px solid #c7d2fe;
          padding: 1px 6px;
          border-radius: 4px;
          margin-left: 4px;
          vertical-align: middle;
        }
        .company-sub {
          font-size: 10.5px;
          color: #64748b;
          font-weight: 600;
          margin-top: 2px;
        }
        .company-address {
          font-size: 9.5px;
          color: #94a3b8;
          margin-top: 2px;
        }
        .slip-meta {
          text-align: right;
        }
        .slip-pill {
          display: inline-block;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: #4338ca;
          background: #e0e7ff;
          border: 1px solid #c7d2fe;
          padding: 3px 10px;
          border-radius: 999px;
        }
        .month-title {
          font-size: 16px;
          font-weight: 900;
          color: #0f172a;
          margin-top: 4px;
        }
        .disbursement-text {
          font-size: 10px;
          color: #64748b;
          font-family: monospace;
          margin-top: 1px;
        }
        .grid-info {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          padding: 14px 16px;
          margin-top: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        .info-cell span {
          display: block;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #64748b;
        }
        .info-cell strong {
          display: block;
          font-size: 11.5px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 2px;
        }
        .info-cell .highlight {
          color: #4338ca;
          font-family: monospace;
        }
        .split-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 16px;
        }
        .table-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 14px;
          background: #ffffff;
        }
        .table-title {
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          padding-bottom: 8px;
          margin-bottom: 8px;
          border-bottom: 1.5px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
        }
        .title-earnings { color: #059669; }
        .title-deductions { color: #e11d48; }
        .row-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
          font-size: 11px;
          color: #334155;
        }
        .row-item .desc {
          font-size: 9px;
          color: #94a3b8;
          display: block;
        }
        .row-item .amt {
          font-family: monospace;
          font-weight: 600;
          font-size: 11.5px;
        }
        .total-row {
          border-top: 1.5px solid #cbd5e1;
          margin-top: 8px;
          padding-top: 8px;
          font-weight: 800;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #0f172a;
        }
        .total-row .amt-green {
          color: #059669;
          font-family: monospace;
        }
        .total-row .amt-rose {
          color: #e11d48;
          font-family: monospace;
        }
        .net-card {
          margin-top: 16px;
          background: #eef2ff;
          border: 1.5px solid #c7d2fe;
          border-radius: 10px;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .net-label {
          font-size: 9.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #4338ca;
        }
        .net-amount {
          font-size: 24px;
          font-weight: 900;
          color: #1e1b4b;
          font-family: monospace;
          margin-top: 2px;
        }
        .net-words {
          font-size: 10px;
          color: #475569;
          font-style: italic;
          margin-top: 3px;
        }
        .status-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 999px;
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #86efac;
        }
        .status-badge-pending {
          background: #fef3c7;
          color: #b45309;
          border: 1px solid #fde68a;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 20px;
          margin-top: 20px;
          padding-top: 14px;
          border-top: 1.5px solid #e2e8f0;
          font-size: 9.5px;
          color: #64748b;
        }
        .signatory-box {
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: flex-end;
        }
        .signatory-line {
          width: 170px;
          border-bottom: 1px solid #94a3b8;
          margin-bottom: 4px;
          text-align: center;
          font-family: monospace;
          font-size: 8.5px;
          text-transform: uppercase;
          color: #64748b;
          padding-bottom: 2px;
        }
        .computer-gen {
          text-align: center;
          font-size: 8.5px;
          color: #94a3b8;
          margin-top: 16px;
        }
      </style>
    </head>
    <body>
      <div class="payslip-container">
        <!-- Header -->
        <div class="header">
          <div>
            <div class="logo-wrap">
              <div class="logo-box">H</div>
              <div>
                <div class="logo-title">HRMS <span class="logo-badge">PRO</span></div>
                <div class="company-sub">Human Resource Management System</div>
              </div>
            </div>
            <div class="company-address">HRMS Enterprise Systems Inc. • Global Operations</div>
            <div class="company-address">100 Enterprise Way, Suite 400 • payroll@hrms-enterprise.com</div>
          </div>
          <div class="slip-meta">
            <span class="slip-pill">OFFICIAL PAY SLIP</span>
            <div class="month-title">${record.month}</div>
            <div class="disbursement-text">Disbursement: ${record.paymentMethod || 'Direct Deposit'}</div>
          </div>
        </div>

        <!-- Employee Info Grid (Attendance Status removed) -->
        <div class="grid-info">
          <div class="info-cell">
            <span>Employee Name</span>
            <strong>${record.employeeName}</strong>
          </div>
          <div class="info-cell">
            <span>Employee ID</span>
            <strong class="highlight">${record.employeeId}</strong>
          </div>
          <div class="info-cell">
            <span>Department</span>
            <strong>${record.department || 'Engineering'}</strong>
          </div>
          <div class="info-cell">
            <span>Designation</span>
            <strong>${record.designation || 'Staff'}</strong>
          </div>
          <div class="info-cell" style="padding-top:8px; border-top:1px dashed #cbd5e1;">
            <span>Pay Period</span>
            <strong>${record.month}</strong>
          </div>
          <div class="info-cell" style="padding-top:8px; border-top:1px dashed #cbd5e1;">
            <span>Working Days</span>
            <strong>${workingDays} Days</strong>
          </div>
          <div class="info-cell" style="padding-top:8px; border-top:1px dashed #cbd5e1;">
            <span>Annual CTC</span>
            <strong style="font-family:monospace;">$${annualSalary.toLocaleString()} / yr</strong>
          </div>
          <div class="info-cell" style="padding-top:8px; border-top:1px dashed #cbd5e1;">
            <span>Payment Status</span>
            <strong style="color:${record.paymentStatus === 'Paid' ? '#059669' : '#d97706'};">${record.paymentStatus}</strong>
          </div>
        </div>

        <!-- Split Grid -->
        <div class="split-grid">
          <!-- Earnings -->
          <div class="table-card">
            <div class="table-title title-earnings">
              <span>Earnings & Allowances</span>
              <span style="font-size:9px; font-family:monospace; color:#64748b;">Amount (USD)</span>
            </div>
            <div class="row-item">
              <div>
                <strong>Basic Pay (Base Salary)</strong>
                <span class="desc">50% of Gross</span>
              </div>
              <span class="amt">$${basicSalary.toLocaleString()}</span>
            </div>
            <div class="row-item">
              <div>
                <strong>House Rent Allowance (HRA)</strong>
                <span class="desc">20% of Gross</span>
              </div>
              <span class="amt">+$${hra.toLocaleString()}</span>
            </div>
            <div class="row-item">
              <div>
                <strong>Special Allowance</strong>
                <span class="desc">15% of Gross</span>
              </div>
              <span class="amt">+$${specialAllowance.toLocaleString()}</span>
            </div>
            <div class="row-item">
              <div>
                <strong>Conveyance / Travel</strong>
                <span class="desc">10% of Gross</span>
              </div>
              <span class="amt">+$${conveyanceAllowance.toLocaleString()}</span>
            </div>
            <div class="row-item">
              <div>
                <strong>Medical & Wellness</strong>
                <span class="desc">5% of Gross</span>
              </div>
              <span class="amt">+$${medicalAllowance.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span>Total Gross Earnings</span>
              <span class="amt-green">$${grossEarnings.toLocaleString()}</span>
            </div>
          </div>

          <!-- Deductions -->
          <div class="table-card">
            <div class="table-title title-deductions">
              <span>Taxes & Statutory Deductions</span>
              <span style="font-size:9px; font-family:monospace; color:#64748b;">Amount (USD)</span>
            </div>
            <div class="row-item">
              <div>
                <strong>Income Tax (TDS)</strong>
                <span class="desc">10% Standard Withholding</span>
              </div>
              <span class="amt">-$${tds.toLocaleString()}</span>
            </div>
            <div class="row-item">
              <div>
                <strong>Provident Fund (PF)</strong>
                <span class="desc">12% Employee Contribution</span>
              </div>
              <span class="amt">-$${pf.toLocaleString()}</span>
            </div>
            <div class="row-item">
              <div>
                <strong>Professional Tax (PT)</strong>
                <span class="desc">Statutory State Levy</span>
              </div>
              <span class="amt">-$${professionalTax.toLocaleString()}</span>
            </div>
            <div style="height: 38px;"></div>
            <div class="total-row">
              <span>Total Deductions</span>
              <span class="amt-rose">-$${totalDeductions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <!-- Net Salary Box -->
        <div class="net-card">
          <div>
            <div class="net-label">Net Disbursed Take-Home Pay</div>
            <div class="net-amount">$${netSalary.toLocaleString()} <span style="font-size:11px; font-weight:normal; color:#64748b;">USD</span></div>
            <div class="net-words"><strong>Amount in words:</strong> ${words}</div>
          </div>
          <div style="text-align:right;">
            <div class="${record.paymentStatus === 'Paid' ? 'status-badge' : 'status-badge status-badge-pending'}">
              ✓ ${record.paymentStatus?.toUpperCase() || 'PENDING'}
            </div>
            <div style="font-size:9px; color:#64748b; margin-top:4px;">Disbursed: ${paymentDateStr}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer-grid">
          <div>
            <strong style="color:#334155;">HR & Payroll Verification</strong>
            <p style="margin-top:2px; font-size:8.5px; color:#94a3b8;">
              System authenticated and verified by HRMS Pro Enterprise Compensation Engine.
              All statutory taxes and remittances calculated in compliance with corporate guidelines.
            </p>
          </div>
          <div class="signatory-box">
            <div class="signatory-line">Authorized Signatory</div>
            <strong style="color:#334155; font-size:9.5px;">Director of People Operations</strong>
          </div>
        </div>

        <div class="computer-gen">
          This is a computer-generated salary slip and does not require a physical signature.
        </div>
      </div>
    </body>
    </html>
  `);
  doc.close();

  // Print after doc finishes rendering
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1500);
  }, 250);
};

/**
 * Official Printable Employee Pay Slip Modal
 */
export default function PayslipModal({ isOpen, onClose, record }) {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    printPayslipDocument(record);
  };

  // Salary Components & Exact Split
  const basicSalary = record.basicSalary || 0;
  const hra = record.hra || Math.round(basicSalary * 0.4);
  const specialAllowance = record.specialAllowance || Math.round(basicSalary * 0.3);
  const conveyanceAllowance = record.conveyanceAllowance || Math.round(basicSalary * 0.2);
  const medicalAllowance = record.medicalAllowance || Math.round(basicSalary * 0.1);
  const totalAllowances =
    record.allowances || hra + specialAllowance + conveyanceAllowance + medicalAllowance;
  const grossEarnings = record.grossSalary || basicSalary + totalAllowances;

  const tds = record.tds || Math.round(grossEarnings * 0.1);
  const pf = record.pf || Math.round(basicSalary * 0.12);
  const professionalTax = record.professionalTax !== undefined ? record.professionalTax : 200;
  const totalDeductions = record.deductions || tds + pf + professionalTax;
  const netSalary = record.netSalary || Math.max(0, grossEarnings - totalDeductions);

  const annualSalary = record.annualSalary || grossEarnings * 12;
  const workingDays = record.workingDays || 22;

  return (
    <div className="payslip-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn">
      {/* On-screen Print CSS fallback if Ctrl+P is pressed */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          body {
            visibility: hidden !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .payslip-modal-overlay {
            position: static !important;
            display: block !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .payslip-modal-container {
            position: static !important;
            display: block !important;
            max-height: none !important;
            overflow: visible !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          #official-payslip-print, #official-payslip-print * {
            visibility: visible !important;
          }
          #official-payslip-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 16px !important;
            margin: 0 !important;
            background: white !important;
            color: #0f172a !important;
            border: 1.5px solid #cbd5e1 !important;
          }
        }
      `}</style>

      <div className="payslip-modal-container relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
            <DollarSign className="h-4 w-4" />
            <span>Official Salary Pay Slip • {record.month}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* On-screen Preview of Pay Slip Container */}
        <div
          id="official-payslip-print"
          className="rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 space-y-6"
        >
          {/* Slip Header & Company Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <Logo size="default" />
              <p className="text-[11px] text-slate-400 mt-1.5">
                HRMS Enterprise Systems Inc. • Global Operations
              </p>
              <p className="text-[10px] text-slate-500">
                100 Enterprise Way, Suite 400 • payroll@hrms-enterprise.com
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                Official Pay Slip
              </span>
              <p className="mt-1 text-base font-extrabold text-white">
                {record.month}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Disbursement: {record.paymentMethod || 'Direct Deposit'}
              </p>
            </div>
          </div>

          {/* Employee Metadata Grid (Attendance Status removed) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Employee Name
              </span>
              <p className="font-bold text-white mt-0.5">{record.employeeName}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Employee ID
              </span>
              <p className="font-mono text-indigo-400 font-bold mt-0.5">
                {record.employeeId}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Department
              </span>
              <p className="font-semibold text-slate-200 mt-0.5">
                {record.department || 'Engineering'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Designation
              </span>
              <p className="font-semibold text-slate-200 mt-0.5">
                {record.designation || 'Staff'}
              </p>
            </div>

            {/* Row 2 Metadata */}
            <div className="pt-2 border-t border-slate-800/60">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Pay Period
              </span>
              <p className="font-semibold text-slate-200 mt-0.5">
                {record.month}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/60">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Working Days
              </span>
              <p className="font-semibold text-slate-200 mt-0.5">
                {workingDays} Days
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/60">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Annual CTC
              </span>
              <p className="font-mono font-bold text-slate-200 mt-0.5">
                ${annualSalary.toLocaleString()} / yr
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/60">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Payment Status
              </span>
              <p
                className={`font-bold mt-0.5 ${
                  record.paymentStatus === 'Paid'
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {record.paymentStatus}
              </p>
            </div>
          </div>

          {/* Salary Split: Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Earnings Breakdown */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">
                  Earnings Breakdown
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Amount (USD)</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <div>
                  <span className="font-medium">Basic Pay (Base Salary)</span>
                  <span className="block text-[10px] text-slate-500">50% of Gross</span>
                </div>
                <span className="font-mono font-semibold">${basicSalary.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <div>
                  <span className="font-medium">House Rent Allowance (HRA)</span>
                  <span className="block text-[10px] text-slate-500">20% of Gross</span>
                </div>
                <span className="font-mono">+${hra.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <div>
                  <span className="font-medium">Special Allowance</span>
                  <span className="block text-[10px] text-slate-500">15% of Gross</span>
                </div>
                <span className="font-mono">+${specialAllowance.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <div>
                  <span className="font-medium">Conveyance / Travel</span>
                  <span className="block text-[10px] text-slate-500">10% of Gross</span>
                </div>
                <span className="font-mono">+${conveyanceAllowance.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <div>
                  <span className="font-medium">Medical Allowance</span>
                  <span className="block text-[10px] text-slate-500">Health & Wellness</span>
                </div>
                <span className="font-mono">+${medicalAllowance.toLocaleString()}</span>
              </div>

              <div className="pt-2.5 border-t border-slate-800 flex justify-between font-bold text-white">
                <span>Total Gross Earnings</span>
                <span className="font-mono text-emerald-400">
                  ${grossEarnings.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-bold text-rose-400 text-xs uppercase tracking-wider">
                  Deductions & Taxes
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Amount (USD)</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <div>
                  <span className="font-medium">Income Tax (TDS)</span>
                  <span className="block text-[10px] text-slate-500">
                    10% Standard Withholding
                  </span>
                </div>
                <span className="font-mono">-${tds.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <div>
                  <span className="font-medium">Provident Fund (PF)</span>
                  <span className="block text-[10px] text-slate-500">
                    12% Employee Contribution
                  </span>
                </div>
                <span className="font-mono">-${pf.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <div>
                  <span className="font-medium">Professional Tax (PT)</span>
                  <span className="block text-[10px] text-slate-500">
                    Statutory State Levy
                  </span>
                </div>
                <span className="font-mono">-${professionalTax.toLocaleString()}</span>
              </div>

              {/* Spacer to align heights */}
              <div className="h-[46px] hidden sm:block"></div>

              <div className="pt-2.5 border-t border-slate-800 flex justify-between font-bold text-white">
                <span>Total Deductions</span>
                <span className="font-mono text-rose-400">
                  -${totalDeductions.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight Box */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Net Disbursed Take-Home Pay
              </span>
              <p className="text-2xl sm:text-3xl font-black text-white font-mono mt-0.5">
                ${netSalary.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-400">USD</span>
              </p>
              <p className="text-[11px] text-slate-300 mt-1 italic">
                <strong>Amount in words:</strong> {numberToWords(netSalary)}
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  record.paymentStatus === 'Paid'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{record.paymentStatus?.toUpperCase()}</span>
              </span>
              {record.paymentDate && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Disbursed on {new Date(record.paymentDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Corporate Verification Footer & Signatory */}
          <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-slate-400">
            <div>
              <p className="font-semibold text-slate-300">
                HR & Payroll Verification
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Processed automatically via HRMS Pro Compensation Engine. All statutory tax deductions
                remitted in compliance with corporate guidelines.
              </p>
            </div>
            <div className="sm:text-right flex flex-col sm:items-end justify-end">
              <div className="w-40 border-b border-slate-700 pb-1 mb-1 text-center">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                  Authorized Signatory
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-300">
                Director of People Operations
              </p>
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-600">
            This is a computer-generated salary slip and does not require a physical signature.
          </p>
        </div>
      </div>
    </div>
  );
}
