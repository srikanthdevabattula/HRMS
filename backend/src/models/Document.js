import mongoose from 'mongoose';

/**
 * Employee Document Schema
 * Holds verified employee records: HR letters, Form 16, ID photos, degrees, experience
 */
const documentSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['HR Letters', 'Tax & Statutory', 'Education', 'Experience', 'Personal & ID'],
      required: true,
    },
    documentType: {
      type: String, // e.g. "Offer Letter", "Joining Letter", "Appraisal Letter", "Form 16", "Photo", "Degree Certificate", "Experience Letter"
      required: true,
    },
    fileFormat: {
      type: String,
      default: 'PDF',
    },
    fileSize: {
      type: String,
      default: '1.2 MB',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Verified', 'Pending Verification', 'Issued'],
      default: 'Verified',
    },
    issuedBy: {
      type: String,
      default: 'HR Department',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);
export default Document;

