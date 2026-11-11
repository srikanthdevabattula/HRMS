import mongoose from 'mongoose';

/**
 * Holiday Schema for HRMS Company Calendar
 */
const holidaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Holiday title is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Holiday date is required'],
    },
    day: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['National', 'Public', 'Optional', 'Company'],
      default: 'Public',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Holiday = mongoose.model('Holiday', holidaySchema);
export default Holiday;

