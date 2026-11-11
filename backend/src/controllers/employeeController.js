import Employee from '../models/Employee.js';

/**
 * Seed initial sample employees if database collection is empty
 */
export const seedInitialEmployees = async () => {
  try {
    const count = await Employee.countDocuments();
    if (count === 0) {
      const sampleEmployees = [
       
      ];

      let seededCount = 0;
      for (const emp of sampleEmployees) {
        const alreadyExists = await Employee.exists({
          $or: [{ employeeId: emp.employeeId }, { email: emp.email.toLowerCase().trim() }],
        });
        if (!alreadyExists) {
          await Employee.create(emp);
          seededCount += 1;
        }
      }
      if (seededCount > 0) {
        console.log(`🌱 Seeded ${seededCount} initial sample employees into MongoDB`);
      }
    }

    // Ensure any previously seeded or edited employees conform to Active / Inactive status
    await Employee.updateMany(
      { status: { $nin: ['Active', 'Inactive'] } },
      { $set: { status: 'Active' } }
    );
  } catch (error) {
    console.warn('Sample employee seed skipped:', error.message);
  }
};

/**
 * @desc    Get all employees with optional search & department filter
 * @route   GET /api/employees
 */
export const getEmployees = async (req, res) => {
  try {
    const { search, department } = req.query;
    let query = {};

    // Filter by department
    if (department && department !== 'All') {
      query.department = department;
    }

    // Search by name, email, designation, or ID
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { designation: searchRegex },
        { employeeId: searchRegex },
      ];
    }

    const employees = await Employee.find(query).select('-password').sort({ createdAt: -1, _id: -1 });

    res.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single employee by ID
 * @route   GET /api/employees/:id
 */
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee',
      error: error.message,
    });
  }
};

/**
 * Generate the next unique employeeId (e.g. EMP001, EMP002, ...).
 * Finds the highest existing numeric suffix so deleted records never cause duplicate IDs.
 */
const generateNextEmployeeId = async () => {
  const existingEmployees = await Employee.find({}, { employeeId: 1 }).lean();
  let maxNumber = 0;

  for (const emp of existingEmployees) {
    if (typeof emp.employeeId !== 'string') continue;
    const match = emp.employeeId.match(/^EMP(\d+)$/i);
    if (!match) continue;
    const parsed = parseInt(match[1], 10);
    if (parsed > maxNumber) {
      maxNumber = parsed;
    }
  }

  let nextNumber = maxNumber + 1;
  let candidateId = `EMP${String(nextNumber).padStart(3, '0')}`;

  while (await Employee.exists({ employeeId: candidateId })) {
    nextNumber += 1;
    candidateId = `EMP${String(nextNumber).padStart(3, '0')}`;
  }

  return candidateId;
};

/**
 * @desc    Create new employee (Admin only)
 * @route   POST /api/employees
 */
export const createEmployee = async (req, res) => {
  try {
    const { name, email, password, designation, department, phone, salary, status } = req.body;

    // Validate required fields: name, email, password, designation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Employee name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Work email is required' });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ success: false, message: 'Password is required for employee access' });
    }
    if (!designation || !designation.trim()) {
      return res.status(400).json({ success: false, message: 'Designation is required' });
    }

    // Check if email already registered
    const cleanEmail = email.toLowerCase().trim();
    const existing = await Employee.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email already exists',
      });
    }

    // Use provided employeeId (if unique) or safely generate next sequential EMPxxx ID
    const requestedId = typeof req.body.employeeId === 'string' ? req.body.employeeId.trim().toUpperCase() : '';
    if (requestedId && (await Employee.exists({ employeeId: requestedId }))) {
      return res.status(400).json({
        success: false,
        message: `Employee ID "${requestedId}" already exists`,
      });
    }

    const employeeId = requestedId || (await generateNextEmployeeId());

    const payload = {
      employeeId,
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      designation: designation.trim(),
      department: department || 'Engineering',
      phone: phone ? phone.trim() : '',
      salary: salary ? Number(salary) : 0,
      status: status || 'Active',
    };

    let newEmployee;
    try {
      newEmployee = await Employee.create(payload);
    } catch (createErr) {
      // Retry once with a fresh ID if an auto-generated employeeId hit a concurrent write collision
      if (!requestedId && createErr?.code === 11000 && createErr?.keyPattern?.employeeId) {
        payload.employeeId = await generateNextEmployeeId();
        newEmployee = await Employee.create(payload);
      } else {
        throw createErr;
      }
    }

    // Return without password
    const safeData = newEmployee.toObject();
    delete safeData.password;

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: safeData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create employee',
    });
  }
};

/**
 * @desc    Update employee details
 * @route   PUT /api/employees/:id
 */
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // If password is updated, hash it
    if (req.body.password && req.body.password.trim()) {
      employee.password = req.body.password.trim();
    }

    if (req.body.name) employee.name = req.body.name.trim();
    if (req.body.email) employee.email = req.body.email.toLowerCase().trim();
    if (req.body.designation) employee.designation = req.body.designation.trim();
    if (req.body.department) employee.department = req.body.department;
    if (req.body.phone !== undefined) employee.phone = req.body.phone.trim();
    if (req.body.salary !== undefined) employee.salary = Number(req.body.salary);
    if (req.body.status) employee.status = req.body.status;

    await employee.save();

    const safeData = employee.toObject();
    delete safeData.password;

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: safeData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update employee',
    });
  }
};

/**
 * @desc    Delete employee
 * @route   DELETE /api/employees/:id
 */
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Employee deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message,
    });
  }
};
