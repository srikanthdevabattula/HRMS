import express from 'express';
import {
  getPayrollRecords,
  generatePayroll,
  updatePayrollStatus,
} from '../controllers/payrollController.js';

const router = express.Router();

router.route('/')
  .get(getPayrollRecords);

router.post('/generate', generatePayroll);
router.patch('/:id/status', updatePayrollStatus);

export default router;

