import mongoose from 'mongoose';
import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';

/**
 * Seed sample leave requests if collection is empty
 */
export const seedInitialLeaves = async () => {
  try {
    const count = await Leave.countDocuments();
    if (count === 0) {
      const sampleLeaves = [
        {
          employeeId: 'EMP003',
          employeeName: 'Emily Davis',
          leaveType: 'Annual Leave',
          startDate: new Date('2026-11-10'),
          endDate: new Date('2026-11-14'),
          days: 5,
          reason: 'Family vacation and personal travel.',
          status: 'Approved',
          reviewedBy: 'System Admin',
        },
        {
          employeeId: 'EMP001',
          employeeName: 'Sarah Connor',
          leaveType: 'Casual Leave',
          startDate: new Date('2026-11-18'),
          endDate: new Date('2026-11-19'),
          days: 2,
          reason: 'Attending personal appointment & family commitments.',
          status: 'Pending',
        },
        {
          employeeId: 'EMP004',
          employeeName: 'Alex Rivera',
          leaveType: 'Sick Leave',
          startDate: new Date('2026-11-05'),
          endDate: new Date('2026-11-06'),
          days: 2,
          reason: 'Seasonal viral flu and rest.',
          status: 'Approved',
          reviewedBy: 'System Admin',
        },
      ];

      await Leave.insertMany(sampleLeaves);
      console.log('🏖️ Seeded 3 sample leave requests into MongoDB');
    }
  } catch (error) {
    console.warn('Leave seed skipped:', error.message);
  }
};

/**
 * @desc    Get all leave requests with optional status filter
 * @route   GET /api/leaves
 */
export const getLeaves = async (req, res) => {
  try {
    const { status, employeeId, email, employeeName } = req.query;
    let query = {};

    if (status && status !== 'All' && status !== 'History') {
      query.status = status;
    }

    // Filter by employee ID, employee email, or employee name if provided
    if (employeeId || email || employeeName) {
      const matchCriteria = [];

      if (employeeId) {
        matchCriteria.push({ employeeId });
        // If employeeId is a Mongo ObjectId, look up the employee record
        if (mongoose.Types.ObjectId.isValid(employeeId)) {
          const empById = await Employee.findById(employeeId).select('employeeId email name');
          if (empById) {
            if (empById.employeeId) matchCriteria.push({ employeeId: empById.employeeId });
            if (empById.email) {
              matchCriteria.push({ employeeEmail: empById.email.toLowerCase().trim() });
            }
            if (empById.name) {
              matchCriteria.push({ employeeName: new RegExp(`^${empById.name.trim()}$`, 'i') });
            }
          }
        }
      }

      if (email) {
        const cleanEmail = email.toLowerCase().trim();
        matchCriteria.push({ employeeEmail: cleanEmail });
        // Also look up employeeId and name by email from Employee collection
        const empByEmail = await Employee.findOne({ email: cleanEmail }).select('employeeId name');
        if (empByEmail) {
          if (empByEmail.employeeId) matchCriteria.push({ employeeId: empByEmail.employeeId });
          if (empByEmail.name) {
            matchCriteria.push({ employeeName: new RegExp(`^${empByEmail.name.trim()}$`, 'i') });
          }
        }
      }

      if (employeeName) {
        matchCriteria.push({ employeeName: new RegExp(`^${employeeName.trim()}$`, 'i') });
      }

      if (matchCriteria.length === 1) {
        Object.assign(query, matchCriteria[0]);
      } else if (matchCriteria.length > 1) {
        query.$or = matchCriteria;
      }
    }

    const leaves = await Leave.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave requests',
      error: error.message,
    });
  }
};

/**
 * @desc    Apply for new leave
 * @route   POST /api/leaves
 */
export const applyLeave = async (req, res) => {
  try {
    const { employeeId, employeeName, employeeEmail, leaveType, startDate, endDate, reason } = req.body;

    if (!employeeName || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employee name, leave type, start date, end date, and reason',
      });
    }

    // Calculate duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const newLeave = await Leave.create({
      employeeId: employeeId || 'EMP_GEN',
      employeeName: employeeName.trim(),
      employeeEmail: employeeEmail ? employeeEmail.toLowerCase().trim() : '',
      leaveType,
      startDate: start,
      endDate: end,
      days,
      reason: reason.trim(),
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: newLeave,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit leave request',
    });
  }
};

/**
 * @desc    Update leave status (Approve / Reject by Admin or Cancel)
 * @route   PATCH /api/leaves/:id/status
 */
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, reviewedBy = 'System Admin' } = req.body;

    if (!['Approved', 'Rejected', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Approved, Rejected, or Cancelled.',
      });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    leave.status = status;
    leave.reviewedBy = reviewedBy;
    await leave.save();

    res.json({
      success: true,
      message: `Leave request marked as ${status}`,
      data: leave,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update leave status',
    });
  }
};

/**
 * @desc    Cancel / Revert leave application by employee (allowed in Pending or Approved state)
 * @route   PATCH /api/leaves/:id/cancel
 */
export const cancelLeave = async (req, res) => {
  try {
    const { reason = 'Cancelled by employee' } = req.body;
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    if (!['Pending', 'Approved'].includes(leave.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a leave request that is already ${leave.status}`,
      });
    }

    const previousStatus = leave.status;
    leave.status = 'Cancelled';
    leave.reviewedBy = reason || 'Cancelled by employee';
    await leave.save();

    // If leave was Approved, check and restore employee attendanceStatus if 'On Leave'
    if (previousStatus === 'Approved') {
      const emp = await Employee.findOne({
        $or: [
          { employeeId: leave.employeeId },
          { email: leave.employeeEmail ? leave.employeeEmail.toLowerCase().trim() : '' },
        ],
      });
      if (emp && emp.attendanceStatus === 'On Leave') {
        emp.attendanceStatus = 'Check-out';
        await emp.save();
      }
    }

    res.json({
      success: true,
      message: 'Leave application successfully cancelled / reverted.',
      data: leave,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel leave request',
    });
  }
};

/**
 * @desc    Delete leave record
 * @route   DELETE /api/leaves/:id
 */
export const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    await Leave.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Leave record removed successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete leave request',
      error: error.message,
    });
  }
};

