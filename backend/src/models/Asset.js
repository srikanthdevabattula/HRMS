import mongoose from 'mongoose';

/**
 * Company Asset Schema
 * Tracks hardware, laptops, monitors, smart cards, and software licenses issued to an employee
 */
const assetSchema = new mongoose.Schema(
  {
    employeeId: {
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
    employeeName: {
      type: String,
      trim: true,
      default: '',
    },
    assetName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Hardware', 'Peripherals', 'Access & Security', 'Software License'],
      default: 'Hardware',
    },
    assetTag: {
      type: String,
      required: true,
    },
    serialNumber: {
      type: String,
      default: '',
    },
    model: {
      type: String,
      default: '',
    },
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Allocated', 'Under Maintenance', 'Returned'],
      default: 'Allocated',
    },
    condition: {
      type: String,
      default: 'Brand New',
    },
    specs: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Asset = mongoose.model('Asset', assetSchema);
export default Asset;

