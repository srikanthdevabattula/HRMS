import mongoose from 'mongoose';

/**
 * Payroll Record Schema for HRMS
 * Supports comprehensive enterprise salary split (Base pay, HRA, Allowances, TDS, PF, PT)
 */
const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: 'Engineering',
    },
    designation: {
      type: String,
      default: 'Staff',
    },
    month: {
      type: String,
      required: true, // e.g. "November 2026"
    },
    annualSalary: {
      type: Number,
      default: 0,
    },
    grossSalary: {
      type: Number,
      default: 0,
    },
    basicSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    hra: {
      type: Number,
      default: 0, // 20% House Rent Allowance
    },
    specialAllowance: {
      type: Number,
      default: 0, // 15% Special Allowance
    },
    conveyanceAllowance: {
      type: Number,
      default: 0, // 10% Conveyance / Travel
    },
    medicalAllowance: {
      type: Number,
      default: 0, // 5% Medical Allowance
    },
    allowances: {
      type: Number,
      default: 0, // Total Allowances = HRA + Special + Conveyance + Medical
    },
    tds: {
      type: Number,
      default: 0, // 10% Tax Deducted at Source
    },
    pf: {
      type: Number,
      default: 0, // 12% Provident Fund (of Basic)
    },
    professionalTax: {
      type: Number,
      default: 200, // Fixed Professional Tax
    },
    deductions: {
      type: Number,
      default: 0, // Total Deductions = TDS + PF + Professional Tax
    },
    netSalary: {
      type: Number,
      required: true,
      default: 0, // Gross - Deductions
    },
    attendanceStatus: {
      type: String,
      default: 'Check-in', // Check-in, Check-out, On Leave, Absent
    },
    workingDays: {
      type: Number,
      default: 22,
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Pending',
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: 'Direct Deposit',
    },
  },
  {
    timestamps: true,
  }
);

const Payroll = mongoose.model('Payroll', payrollSchema);
export default Payroll;
