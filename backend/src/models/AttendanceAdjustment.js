import mongoose from 'mongoose';

/**
 * Attendance Adjustment Schema
 * Tracks employee adjustment requests for present or past shift dates.
 * Requires Admin review to update the database record.
 */
const attendanceAdjustmentSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    employeeEmail: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      default: 'Engineering',
    },
    // The shift date being adjusted (YYYY-MM-DD)
    date: {
      type: String,
      required: true,
      index: true,
    },
    originalCheckIn: {
      type: Date,
      default: null,
    },
    originalCheckOut: {
      type: Date,
      default: null,
    },
    originalHours: {
      type: Number,
      default: 0,
    },
    adjustedCheckIn: {
      type: Date,
      required: true,
    },
    adjustedCheckOut: {
      type: Date,
      required: true,
    },
    adjustedHours: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the attendance adjustment'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    adminRemarks: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const AttendanceAdjustment = mongoose.model(
  'AttendanceAdjustment',
  attendanceAdjustmentSchema
);

export default AttendanceAdjustment;

