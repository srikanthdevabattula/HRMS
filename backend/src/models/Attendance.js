import mongoose from 'mongoose';

/**
 * Attendance Schema for daily employee check-in and check-out logs
 */
const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    employeeEmail: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Standardized date string YYYY-MM-DD
    date: {
      type: String,
      required: true,
      index: true,
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    workMinutes: {
      type: Number,
      default: 0,
    },
    workHours: {
      type: Number,
      default: 0,
    },
    // Status: Present (>=8 hrs), Short Hours (<8 hrs), Absent, On Leave
    status: {
      type: String,
      enum: ['Present', 'Short Hours', 'Absent', 'On Leave', 'Half Day', 'In Progress'],
      default: 'In Progress',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure 1 attendance record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;

