import mongoose from 'mongoose';

/**
 * Leave Request Schema for HRMS
 */
const leaveSchema = new mongoose.Schema(
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
    employeeEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    leaveType: {
      type: String,
      required: [true, 'Leave type is required'],
      enum: ['Annual Leave', 'Casual Leave', 'Sick Leave', 'Maternity / Paternity', 'Unpaid Leave'],
      default: 'Casual Leave',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    days: {
      type: Number,
      required: true,
      default: 1,
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
    reviewedBy: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;

