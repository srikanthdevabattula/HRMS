import express from 'express';
import {
  getTodayAttendance,
  checkIn,
  checkOut,
  getCalendarData,
  createAdjustment,
  getAdjustments,
  approveAdjustment,
  rejectAdjustment,
} from '../controllers/attendanceController.js';

const router = express.Router();

// Daily Check-in / Check-out & Calendar
router.get('/today', getTodayAttendance);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/calendar', getCalendarData);

// Attendance Adjustments
router.post('/adjustments', createAdjustment);
router.get('/adjustments', getAdjustments);
router.patch('/adjustments/:id/approve', approveAdjustment);
router.patch('/adjustments/:id/reject', rejectAdjustment);

export default router;
