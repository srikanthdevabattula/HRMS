import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Employee Schema for HRMS
 * Stores organization staff profiles, credentials, contact info, job role, and status
 */
const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Work email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required for employee login access'],
    },
    designation: {
      type: String,
      required: [true, 'Designation / Job title is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: ['Engineering', 'Human Resources', 'Design', 'Marketing', 'Finance', 'Operations'],
      default: 'Engineering',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    salary: {
      type: Number,
      default: 0,
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    attendanceStatus: {
      type: String,
      enum: ['Check-in', 'Check-out', 'On Leave', 'Absent', '—', ''],
      default: '—',
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password for employee login
employeeSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving
employeeSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
