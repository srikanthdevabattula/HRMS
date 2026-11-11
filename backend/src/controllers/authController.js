import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employee from '../models/Employee.js';

/**
 * Generate a JWT token for authenticated users
 * @param {string} id - User ID
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'hrms_default_secret_key', {
    expiresIn: '7d',
  });
};

/**
 * @desc    Login user (Admin / Employee)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password, role = 'admin' } = req.body;

    // 1. Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Employee Login: Authenticate against Employee records
    if (role === 'employee') {
      const employee = await Employee.findOne({ email: cleanEmail });

      if (!employee) {
        return res.status(401).json({
          success: false,
          message: 'Invalid employee email or password',
        });
      }

      // Block inactive employee from logging in
      if (employee.status === 'Inactive') {
        return res.status(403).json({
          success: false,
          message: 'Your account is Inactive. You are not allowed to log in. Please contact Administrator.',
        });
      }

      if (await employee.matchPassword(password)) {
        const token = generateToken(employee._id);
        return res.json({
          success: true,
          message: 'Employee login successful',
          token,
          user: {
            id: employee._id,
            employeeId: employee.employeeId,
            name: employee.name,
            email: employee.email,
            role: 'employee',
            designation: employee.designation,
            department: employee.department,
            status: employee.status,
          },
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid employee email or password',
      });
    }

    // 3. Admin Login Check: Check database User collection first
    let user = null;
    try {
      user = await User.findOne({ email: cleanEmail });
    } catch (dbErr) {
      console.warn('Database query fallback to env:', dbErr.message);
    }

    // Check if matched in database User collection
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      return res.json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Fallback: Check directly against .env variables (ADMIN_EMAIL & ADMIN_PASSWORD)
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'admin@hrms.com').toLowerCase().trim();
    const envAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (cleanEmail === envAdminEmail && password === envAdminPassword) {
      const token = generateToken('admin_root');
      return res.json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          id: 'admin_root',
          name: 'Administrator',
          email: envAdminEmail,
          role: 'admin',
        },
      });
    }

    // Invalid credentials
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};
