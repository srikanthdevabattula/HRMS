import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import Holiday from '../models/Holiday.js';
import Leave from '../models/Leave.js';
import AttendanceAdjustment from '../models/AttendanceAdjustment.js';

// Helper to get formatted YYYY-MM-DD string
export const getTodayDateString = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Seed initial sample attendance for past days of November 2026 so calendar looks rich
 */
export const seedInitialAttendance = async () => {
  try {
    const count = await Attendance.countDocuments();
    if (count === 0) {
      const sampleDays = [
        // Nov 2 (Mon) - Full day (8.5h)
        { date: '2026-11-02', checkInH: 9, checkInM: 0, checkOutH: 17, checkOutM: 30, workHours: 8.5, status: 'Present' },
        // Nov 3 (Tue) - Full day (8.2h)
        { date: '2026-11-03', checkInH: 9, checkInM: 15, checkOutH: 17, checkOutM: 27, workHours: 8.2, status: 'Present' },
        // Nov 4 (Wed) - Short hours (6.5h)
        { date: '2026-11-04', checkInH: 9, checkInM: 30, checkOutH: 16, checkOutM: 0, workHours: 6.5, status: 'Short Hours', notes: 'Short by 1h 30m' },
        // Nov 6 (Fri) - Full day (8.0h)
        { date: '2026-11-06', checkInH: 8, checkInM: 55, checkOutH: 17, checkOutM: 0, workHours: 8.08, status: 'Present' },
        // Nov 9 (Mon) - Full day (8.75h)
        { date: '2026-11-09', checkInH: 9, checkInM: 0, checkOutH: 17, checkOutM: 45, workHours: 8.75, status: 'Present' },
        // Nov 10 (Tue) - Short hours (5.5h)
        { date: '2026-11-10', checkInH: 10, checkInM: 0, checkOutH: 15, checkOutM: 30, workHours: 5.5, status: 'Short Hours', notes: 'Short by 2h 30m' },
      ];

      const employees = await Employee.find().select('employeeId email');
      for (const emp of employees) {
        for (const s of sampleDays) {
          const inDate = new Date(`${s.date}T${String(s.checkInH).padStart(2, '0')}:${String(s.checkInM).padStart(2, '0')}:00`);
          const outDate = new Date(`${s.date}T${String(s.checkOutH).padStart(2, '0')}:${String(s.checkOutM).padStart(2, '0')}:00`);

          await Attendance.create({
            employeeId: emp.employeeId,
            employeeEmail: emp.email,
            date: s.date,
            checkIn: inDate,
            checkOut: outDate,
            workMinutes: Math.round(s.workHours * 60),
            workHours: s.workHours,
            status: s.status,
            notes: s.notes || (s.status === 'Present' ? '8h target completed' : ''),
          });
        }
      }
      console.log('⏰ Seeded sample attendance history for active employees');
    }
  } catch (err) {
    console.warn('Attendance seed check skipped:', err.message);
  }
};

/**
 * @desc    Get today's check-in/out status for the logged-in employee
 * @route   GET /api/attendance/today
 */
export const getTodayAttendance = async (req, res) => {
  try {
    const { employeeId, email } = req.query;
    if (!employeeId && !email) {
      return res.status(400).json({ success: false, message: 'Employee identifier required' });
    }

    const todayStr = getTodayDateString();
    let query = { date: todayStr };

    if (employeeId && email) {
      query.$or = [{ employeeId }, { employeeEmail: email.toLowerCase().trim() }];
    } else if (employeeId) {
      query.employeeId = employeeId;
    } else {
      query.employeeEmail = email.toLowerCase().trim();
    }

    let record = await Attendance.findOne(query);

    return res.json({
      success: true,
      today: todayStr,
      data: record || null,
      isCheckedIn: !!(record && record.checkIn && !record.checkOut),
      isCheckedOut: !!(record && record.checkIn && record.checkOut),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Perform Check-in for today
 * @route   POST /api/attendance/check-in
 */
export const checkIn = async (req, res) => {
  try {
    const { employeeId, email, notes } = req.body;
    if (!employeeId && !email) {
      return res.status(400).json({ success: false, message: 'Employee identifier is required' });
    }

    const todayStr = getTodayDateString();
    const now = new Date();

    // Find employee to get both ID and email
    const emp = await Employee.findOne({
      $or: [{ employeeId }, { email: email?.toLowerCase().trim() }],
    });

    const finalEmpId = emp ? emp.employeeId : employeeId;
    const finalEmail = emp ? emp.email : (email ? email.toLowerCase().trim() : '');

    // Check if record already exists for today
    let record = await Attendance.findOne({
      employeeId: finalEmpId,
      date: todayStr,
    });

    if (record && record.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today.',
        data: record,
      });
    }

    if (!record) {
      record = new Attendance({
        employeeId: finalEmpId,
        employeeEmail: finalEmail,
        date: todayStr,
        checkIn: now,
        status: 'In Progress',
        notes: notes || '',
      });
    } else {
      record.checkIn = now;
      record.checkOut = null;
      record.status = 'In Progress';
    }

    await record.save();

    // Update Employee active status in directory to 'Check-in'
    if (emp) {
      emp.attendanceStatus = 'Check-in';
      await emp.save();
    }

    res.json({
      success: true,
      message: `Checked in successfully at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      data: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Perform Check-out for today
 * @route   POST /api/attendance/check-out
 */
export const checkOut = async (req, res) => {
  try {
    const { employeeId, email, notes } = req.body;
    const todayStr = getTodayDateString();
    const now = new Date();

    const emp = await Employee.findOne({
      $or: [{ employeeId }, { email: email?.toLowerCase().trim() }],
    });

    const finalEmpId = emp ? emp.employeeId : employeeId;

    let record = await Attendance.findOne({
      employeeId: finalEmpId,
      date: todayStr,
    });

    if (!record || !record.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You must check in before checking out.',
      });
    }

    if (record.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out for today.',
        data: record,
      });
    }

    record.checkOut = now;

    // Calculate total duration
    const diffMs = record.checkOut - record.checkIn;
    const minutes = Math.max(0, Math.round(diffMs / 60000));
    const hours = Number((minutes / 60).toFixed(2));

    record.workMinutes = minutes;
    record.workHours = hours;

    // 8 hours requirement check:
    // If workHours >= 8 -> 'Present' (Green)
    // If workHours < 8 -> 'Short Hours' (Amber/Orange)
    if (hours >= 8.0) {
      record.status = 'Present';
      record.notes = notes || `Completed ${hours} hrs (8h target achieved)`;
    } else {
      const shortMinutes = Math.round(8 * 60 - minutes);
      const shortH = Math.floor(shortMinutes / 60);
      const shortM = shortMinutes % 60;
      record.status = 'Short Hours';
      record.notes = notes || `Logged ${hours} hrs (Short by ${shortH}h ${shortM}m)`;
    }

    await record.save();

    // Update Employee active status in directory to 'Check-out'
    if (emp) {
      emp.attendanceStatus = 'Check-out';
      await emp.save();
    }

    res.json({
      success: true,
      message: `Checked out successfully. Total logged: ${hours} hours (${record.status}).`,
      data: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get monthly calendar attendance data for an employee
 *          Consolidates check-ins, holidays, approved leaves, and pending leaves
 * @route   GET /api/attendance/calendar
 */
export const getCalendarData = async (req, res) => {
  try {
    const { employeeId, email, year, month } = req.query;

    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || new Date().getMonth() + 1; // 1-indexed

    // Format month prefix YYYY-MM
    const monthPrefix = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

    // Find employee
    const emp = await Employee.findOne({
      $or: [{ employeeId }, { email: email?.toLowerCase().trim() }],
    });

    const finalEmpId = emp ? emp.employeeId : employeeId;
    const finalEmail = emp ? emp.email : (email ? email.toLowerCase().trim() : '');

    // 1. Fetch Attendance records for this month
    const attendanceRecords = await Attendance.find({
      employeeId: finalEmpId,
      date: new RegExp(`^${monthPrefix}`),
    });

    // 2. Fetch Company Holidays for this year
    const holidays = await Holiday.find({});

    // 3. Fetch Leaves for this employee
    const leaveCriteria = [];
    if (finalEmpId) {
      leaveCriteria.push({ employeeId: finalEmpId });
    }
    if (finalEmail) {
      leaveCriteria.push({ employeeEmail: finalEmail });
    }
    if (emp && emp.name) {
      leaveCriteria.push({ employeeName: new RegExp(`^${emp.name.trim()}$`, 'i') });
    }
    const leaves = leaveCriteria.length > 0 ? await Leave.find({ $or: leaveCriteria }) : [];

    // 4. Fetch Attendance Adjustments for this employee
    const adjustments = await AttendanceAdjustment.find({
      employeeId: finalEmpId,
      date: new RegExp(`^${monthPrefix}`),
    });

    res.json({
      success: true,
      year: targetYear,
      month: targetMonth,
      monthPrefix,
      attendance: attendanceRecords,
      holidays,
      leaves,
      adjustments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Submit an Attendance Adjustment Request
 * @route   POST /api/attendance/adjustments
 */
export const createAdjustment = async (req, res) => {
  try {
    const {
      employeeId,
      email,
      date,
      adjustedCheckIn,
      adjustedCheckOut,
      reason,
    } = req.body;

    if (!date || !adjustedCheckIn || !adjustedCheckOut || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide shift date, adjusted check-in, check-out, and a valid reason.',
      });
    }

    // Look up employee
    const emp = await Employee.findOne({
      $or: [
        ...(employeeId ? [{ employeeId }] : []),
        ...(email ? [{ email: email.toLowerCase().trim() }] : []),
      ],
    });

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Check if there is already a Pending adjustment for this date
    const existingPending = await AttendanceAdjustment.findOne({
      employeeId: emp.employeeId,
      date,
      status: 'Pending',
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'An adjustment request for this date is already pending review.',
      });
    }

    // Fetch existing attendance record if available
    const existingAtt = await Attendance.findOne({
      employeeId: emp.employeeId,
      date,
    });

    const inTime = new Date(adjustedCheckIn);
    const outTime = new Date(adjustedCheckOut);

    if (outTime <= inTime) {
      return res.status(400).json({
        success: false,
        message: 'Adjusted check-out time must be after check-in time.',
      });
    }

    const diffHours = Number(((outTime - inTime) / 3600000).toFixed(2));

    const adjustment = await AttendanceAdjustment.create({
      employeeId: emp.employeeId,
      employeeName: emp.name,
      employeeEmail: emp.email,
      department: emp.department || 'Engineering',
      date,
      originalCheckIn: existingAtt ? existingAtt.checkIn : null,
      originalCheckOut: existingAtt ? existingAtt.checkOut : null,
      originalHours: existingAtt ? existingAtt.workHours : 0,
      adjustedCheckIn: inTime,
      adjustedCheckOut: outTime,
      adjustedHours: diffHours,
      reason,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Attendance adjustment request submitted. Awaiting Admin review.',
      data: adjustment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Attendance Adjustment Requests (for Employee or Admin)
 * @route   GET /api/attendance/adjustments
 */
export const getAdjustments = async (req, res) => {
  try {
    const { employeeId, email, status } = req.query;
    let query = {};

    if (employeeId || email) {
      const match = [];
      if (employeeId) match.push({ employeeId });
      if (email) match.push({ employeeEmail: email.toLowerCase().trim() });
      if (match.length === 1) Object.assign(query, match[0]);
      else query.$or = match;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const list = await AttendanceAdjustment.find(query).sort({ createdAt: -1 });

    const total = list.length;
    const pending = list.filter((a) => a.status === 'Pending').length;
    const approved = list.filter((a) => a.status === 'Approved').length;
    const rejected = list.filter((a) => a.status === 'Rejected').length;

    res.json({
      success: true,
      summary: { total, pending, approved, rejected },
      data: list,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin Approve Attendance Adjustment
 *          Updates Attendance in DB and changes status to 'Approved'
 * @route   PATCH /api/attendance/adjustments/:id/approve
 */
export const approveAdjustment = async (req, res) => {
  try {
    const adjustment = await AttendanceAdjustment.findById(req.params.id);
    if (!adjustment) {
      return res.status(404).json({ success: false, message: 'Adjustment request not found.' });
    }

    if (adjustment.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This request is already marked as ${adjustment.status}.`,
      });
    }

    // 1. Update or create the Attendance record in DB
    let att = await Attendance.findOne({
      employeeId: adjustment.employeeId,
      date: adjustment.date,
    });

    const isFullDay = adjustment.adjustedHours >= 8.0;
    const statusLabel = isFullDay ? 'Present' : 'Short Hours';
    const notesStr = `Adjusted by Admin approval: ${adjustment.reason}`;

    if (!att) {
      att = new Attendance({
        employeeId: adjustment.employeeId,
        employeeEmail: adjustment.employeeEmail,
        date: adjustment.date,
        checkIn: adjustment.adjustedCheckIn,
        checkOut: adjustment.adjustedCheckOut,
        workMinutes: Math.round(adjustment.adjustedHours * 60),
        workHours: adjustment.adjustedHours,
        status: statusLabel,
        notes: notesStr,
      });
    } else {
      att.checkIn = adjustment.adjustedCheckIn;
      att.checkOut = adjustment.adjustedCheckOut;
      att.workMinutes = Math.round(adjustment.adjustedHours * 60);
      att.workHours = adjustment.adjustedHours;
      att.status = statusLabel;
      att.notes = notesStr;
    }

    await att.save();

    // 2. If adjusting today's shift, update employee attendanceStatus to Check-out
    if (adjustment.date === getTodayDateString()) {
      await Employee.updateOne(
        { employeeId: adjustment.employeeId },
        { attendanceStatus: 'Check-out' }
      );
    }

    // 3. Mark Adjustment as Approved
    adjustment.status = 'Approved';
    adjustment.reviewedBy = req.body.reviewedBy || 'Admin';
    adjustment.reviewedAt = new Date();
    if (req.body.adminRemarks) {
      adjustment.adminRemarks = req.body.adminRemarks;
    }
    await adjustment.save();

    res.json({
      success: true,
      message: `Adjustment for ${adjustment.employeeName} approved and updated in database!`,
      data: adjustment,
      attendance: att,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin Reject Attendance Adjustment
 * @route   PATCH /api/attendance/adjustments/:id/reject
 */
export const rejectAdjustment = async (req, res) => {
  try {
    const { adminRemarks = 'Adjustment request rejected by Admin' } = req.body;
    const adjustment = await AttendanceAdjustment.findById(req.params.id);
    if (!adjustment) {
      return res.status(404).json({ success: false, message: 'Adjustment request not found.' });
    }

    if (adjustment.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This request is already marked as ${adjustment.status}.`,
      });
    }

    adjustment.status = 'Rejected';
    adjustment.adminRemarks = adminRemarks;
    adjustment.reviewedBy = req.body.reviewedBy || 'Admin';
    adjustment.reviewedAt = new Date();
    await adjustment.save();

    res.json({
      success: true,
      message: 'Attendance adjustment request rejected.',
      data: adjustment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

