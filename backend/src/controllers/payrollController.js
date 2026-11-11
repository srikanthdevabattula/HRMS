import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';

/**
 * Enterprise Salary Split Calculator
 * Splits annual salary into Base Pay, Allowances, and Deductions/Taxes
 * 
 * Formula:
 * - Gross Monthly = Annual Salary / 12
 * - Base Pay (Basic) = 50% of Gross
 * - HRA (House Rent) = 20% of Gross
 * - Special Allowance = 15% of Gross
 * - Conveyance Allowance = 10% of Gross
 * - Medical Allowance = Remainder (~5%) so Basic + Allowances = Gross Monthly
 * - Deductions:
 *   - TDS / Income Tax = 10% of Gross
 *   - Provident Fund (PF) = 12% of Basic
 *   - Professional Tax (PT) = $200 fixed
 * - Net Pay = Gross Monthly - Total Deductions
 */
export const calculateSalarySplit = (annualSalary = 60000) => {
  const annual = Math.max(0, Number(annualSalary) || 60000);
  const monthlyGross = Math.round(annual / 12);

  // Earnings Breakdown
  const basicSalary = Math.round(monthlyGross * 0.5); // 50%
  const hra = Math.round(monthlyGross * 0.2); // 20%
  const specialAllowance = Math.round(monthlyGross * 0.15); // 15%
  const conveyanceAllowance = Math.round(monthlyGross * 0.1); // 10%
  // Medical takes the exact remaining balance so sum matches monthlyGross
  const medicalAllowance = Math.max(
    0,
    monthlyGross - (basicSalary + hra + specialAllowance + conveyanceAllowance)
  );
  const allowances = hra + specialAllowance + conveyanceAllowance + medicalAllowance;
  const grossSalary = basicSalary + allowances; // Always equals monthlyGross

  // Deductions Breakdown
  const tds = Math.round(grossSalary * 0.1); // 10% Income Tax
  const pf = Math.round(basicSalary * 0.12); // 12% of Basic
  const professionalTax = 200; // Standard $200 PT
  const deductions = tds + pf + professionalTax;

  // Net Disbursed Pay
  const netSalary = Math.max(0, grossSalary - deductions);

  return {
    annualSalary: annual,
    grossSalary,
    basicSalary,
    hra,
    specialAllowance,
    conveyanceAllowance,
    medicalAllowance,
    allowances,
    tds,
    pf,
    professionalTax,
    deductions,
    netSalary,
  };
};

/**
 * Seed or Synchronize Payroll records
 * Ensures ONLY active employees present in the company directory are in Payroll
 */
export const seedInitialPayroll = async () => {
  try {
    const activeEmployees = await Employee.find({ status: 'Active' });
    if (activeEmployees.length === 0) return;

    const currentMonth = 'November 2026';
    const activeIds = activeEmployees.map((e) => e.employeeId);

    // 1. Purge legacy records of employees who are not enrolled/active in the company
    await Payroll.deleteMany({ employeeId: { $nin: activeIds } });

    // 2. Ensure each active employee has a current month record with full split
    for (const emp of activeEmployees) {
      const split = calculateSalarySplit(emp.salary || 60000);
      const existing = await Payroll.findOne({ employeeId: emp.employeeId, month: currentMonth });

      if (!existing) {
        await Payroll.create({
          employeeId: emp.employeeId,
          employeeName: emp.name,
          department: emp.department || 'Engineering',
          designation: emp.designation || 'Specialist',
          month: currentMonth,
          attendanceStatus: emp.attendanceStatus || 'Check-in',
          workingDays: 22,
          ...split,
          paymentStatus: 'Paid',
          paymentDate: new Date('2026-11-01'),
          paymentMethod: 'Direct Deposit',
        });
      } else {
        existing.employeeName = emp.name;
        existing.department = emp.department;
        existing.designation = emp.designation;
        existing.attendanceStatus = emp.attendanceStatus || existing.attendanceStatus || 'Check-in';
        if (!existing.hra || existing.annualSalary !== emp.salary) {
          Object.assign(existing, split);
        }
        await existing.save();
      }
    }

    console.log(`💳 Synchronized payroll for ${activeEmployees.length} active present employees`);
  } catch (error) {
    console.warn('Payroll seed / sync skipped:', error.message);
  }
};

/**
 * @desc    Get all payroll records
 * @route   GET /api/payroll
 * Supports filtering by month, payment status, attendance status, or specific employee
 */
export const getPayrollRecords = async (req, res) => {
  try {
    const { month, status, attendance, employeeId, email, employeeName } = req.query;
    const currentMonth = month && month !== 'All' ? month : 'November 2026';

    let targetEmp = null;
    const isEmployeeQuery = !!(employeeId || email || employeeName);

    if (isEmployeeQuery) {
      // Look up specific employee
      targetEmp = await Employee.findOne({
        $or: [
          ...(employeeId ? [{ employeeId }] : []),
          ...(email ? [{ email: email.toLowerCase().trim() }] : []),
          ...(employeeName ? [{ name: new RegExp(`^${employeeName.trim()}$`, 'i') }] : []),
        ],
      });
    }

    // If Admin view (not an employee self-query), ensure synchronization with active employees
    if (!isEmployeeQuery) {
      const activeEmployees = await Employee.find({ status: 'Active' });
      const activeIds = activeEmployees.map((e) => e.employeeId);

      // Remove orphaned records not in company
      if (activeIds.length > 0) {
        await Payroll.deleteMany({ employeeId: { $nin: activeIds } });
      }

      // Sync active employees into payroll for currentMonth
      for (const emp of activeEmployees) {
        const split = calculateSalarySplit(emp.salary || 60000);
        const existing = await Payroll.findOne({ employeeId: emp.employeeId, month: currentMonth });

        if (!existing) {
          await Payroll.create({
            employeeId: emp.employeeId,
            employeeName: emp.name,
            department: emp.department || 'Engineering',
            designation: emp.designation || 'Specialist',
            month: currentMonth,
            attendanceStatus: emp.attendanceStatus || 'Check-in',
            workingDays: 22,
            ...split,
            paymentStatus: 'Paid',
            paymentDate: new Date('2026-11-01'),
            paymentMethod: 'Direct Deposit',
          });
        } else {
          let updated = false;
          if (existing.employeeName !== emp.name) {
            existing.employeeName = emp.name;
            updated = true;
          }
          if (existing.department !== emp.department) {
            existing.department = emp.department;
            updated = true;
          }
          if (existing.designation !== emp.designation) {
            existing.designation = emp.designation;
            updated = true;
          }
          if (emp.attendanceStatus && existing.attendanceStatus !== emp.attendanceStatus) {
            existing.attendanceStatus = emp.attendanceStatus;
            updated = true;
          }
          if (!existing.hra || existing.annualSalary !== emp.salary) {
            Object.assign(existing, split);
            updated = true;
          }
          if (updated) {
            await existing.save();
          }
        }
      }
    }

    // Build query
    let query = {};
    if (month && month !== 'All') {
      query.month = month;
    }
    if (status && status !== 'All') {
      query.paymentStatus = status;
    }

    if (isEmployeeQuery) {
      // Employees can only view payslips that have been Paid/disbursed
      query.paymentStatus = 'Paid';

      const matchCriteria = [];
      if (employeeId) matchCriteria.push({ employeeId });
      if (employeeName) matchCriteria.push({ employeeName: new RegExp(`^${employeeName.trim()}$`, 'i') });

      if (targetEmp) {
        if (targetEmp.employeeId) matchCriteria.push({ employeeId: targetEmp.employeeId });
        if (targetEmp.name) matchCriteria.push({ employeeName: new RegExp(`^${targetEmp.name.trim()}$`, 'i') });
      }

      if (matchCriteria.length === 1) {
        Object.assign(query, matchCriteria[0]);
      } else if (matchCriteria.length > 1) {
        query.$or = matchCriteria;
      }
    }

    // Attendance Filter
    if (attendance && attendance !== 'All') {
      if (attendance === 'Present') {
        query.attendanceStatus = { $in: ['Check-in', 'Check-out', 'Present'] };
      } else if (attendance === 'On Leave') {
        query.attendanceStatus = 'On Leave';
      } else if (attendance === 'Absent') {
        query.attendanceStatus = 'Absent';
      }
    }

    let records = await Payroll.find(query).sort({ paymentDate: -1, createdAt: -1 });

    // If querying for a specific employee and no records exist yet, auto-seed past credited months
    if (isEmployeeQuery && records.length === 0 && targetEmp) {
      const split = calculateSalarySplit(targetEmp.salary || 85000);
      const pastMonths = [
        { month: 'November 2026', date: new Date('2026-11-01') },
        { month: 'October 2026', date: new Date('2026-10-31') },
        { month: 'September 2026', date: new Date('2026-09-30') },
        { month: 'August 2026', date: new Date('2026-08-31') },
      ];

      const sampleCredited = pastMonths.map((m) => ({
        employeeId: targetEmp.employeeId || 'EMP001',
        employeeName: targetEmp.name,
        department: targetEmp.department || 'Engineering',
        designation: targetEmp.designation || 'Specialist',
        month: m.month,
        attendanceStatus: targetEmp.attendanceStatus || 'Check-in',
        workingDays: 22,
        ...split,
        paymentStatus: 'Paid',
        paymentDate: m.date,
        paymentMethod: 'Direct Deposit',
      }));

      try {
        await Payroll.insertMany(sampleCredited);
        records = await Payroll.find(query).sort({ paymentDate: -1, createdAt: -1 });
      } catch (insertErr) {
        console.warn('Auto-seed past payslips skipped:', insertErr.message);
      }
    }

    // Calculate totals
    const totalPayroll = records.reduce((sum, r) => sum + (r.netSalary || 0), 0);
    const totalGross = records.reduce((sum, r) => sum + (r.grossSalary || r.basicSalary + (r.allowances || 0)), 0);
    const totalPaid = records
      .filter((r) => r.paymentStatus === 'Paid')
      .reduce((sum, r) => sum + (r.netSalary || 0), 0);
    const totalPending = records
      .filter((r) => r.paymentStatus !== 'Paid')
      .reduce((sum, r) => sum + (r.netSalary || 0), 0);

    // Attendance breakdown counts
    const presentCount = records.filter((r) =>
      ['Check-in', 'Check-out', 'Present'].includes(r.attendanceStatus)
    ).length;
    const onLeaveCount = records.filter((r) => r.attendanceStatus === 'On Leave').length;
    const absentCount = records.filter((r) => r.attendanceStatus === 'Absent').length;

    res.json({
      success: true,
      summary: {
        totalPayroll,
        totalGross,
        totalPaid,
        totalPending,
        count: records.length,
        presentCount,
        onLeaveCount,
        absentCount,
      },
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payroll records',
      error: error.message,
    });
  }
};

/**
 * @desc    Generate payroll records for all active employees for given month
 * @route   POST /api/payroll/generate
 */
export const generatePayroll = async (req, res) => {
  try {
    const { month = 'November 2026' } = req.body;

    const employees = await Employee.find({ status: 'Active' });
    if (employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active employees found to generate payroll.',
      });
    }

    let generatedCount = 0;

    for (const emp of employees) {
      const existing = await Payroll.findOne({ employeeId: emp.employeeId, month });
      if (!existing) {
        const split = calculateSalarySplit(emp.salary || 60000);

        await Payroll.create({
          employeeId: emp.employeeId,
          employeeName: emp.name,
          department: emp.department || 'Engineering',
          designation: emp.designation || 'Staff',
          month,
          attendanceStatus: emp.attendanceStatus || 'Check-in',
          workingDays: 22,
          ...split,
          paymentStatus: 'Pending',
          paymentMethod: 'Direct Deposit',
        });
        generatedCount++;
      }
    }

    res.json({
      success: true,
      message: `Generated ${generatedCount} pay slips for ${month}`,
      generatedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate payroll',
    });
  }
};

/**
 * @desc    Update payroll payment status (Paid / Processing / Pending)
 * @route   PATCH /api/payroll/:id/status
 */
export const updatePayrollStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Paid', 'Pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Paid or Pending.',
      });
    }

    const record = await Payroll.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found',
      });
    }

    record.paymentStatus = status;
    if (status === 'Paid') {
      record.paymentDate = new Date();
    } else {
      record.paymentDate = null;
    }

    await record.save();

    res.json({
      success: true,
      message: `Payroll marked as ${status}`,
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update payroll status',
    });
  }
};
