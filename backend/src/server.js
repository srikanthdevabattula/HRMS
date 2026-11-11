import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import holidayRoutes from './routes/holidayRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import { seedInitialEmployees } from './controllers/employeeController.js';
import { seedInitialHolidays } from './controllers/holidayController.js';
import { seedInitialLeaves } from './controllers/leaveController.js';
import { seedInitialPayroll } from './controllers/payrollController.js';
import { seedInitialAttendance } from './controllers/attendanceController.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB & Seed Default Data
connectDB().then(async () => {
  // Ensure default Admin user is present in MongoDB
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@hrms.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`👤 Admin user seeded into database: ${adminEmail}`);
    }
  } catch (err) {
    console.warn(`Admin seed check skipped: ${err.message}`);
  }

  // Seed initial records if collections are empty
  await seedInitialEmployees();
  await seedInitialHolidays();
  await seedInitialLeaves();
  await seedInitialPayroll();
  await seedInitialAttendance();
}).catch((err) => {
  console.warn('⚠️ MongoDB connection deferred or offline:', err.message);
});

// Middleware
app.use(cors());
app.use(express.json());

// Basic API Status Endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    service: 'HRMS Backend API',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@hrms.com',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/documents', documentRoutes);

// Start HTTP Server
app.listen(PORT, () => {
  console.log(`🚀 HRMS Server running at http://localhost:${PORT}`);
});
