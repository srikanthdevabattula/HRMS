import express from 'express';
import {
  getLeaves,
  applyLeave,
  updateLeaveStatus,
  cancelLeave,
  deleteLeave,
} from '../controllers/leaveController.js';

const router = express.Router();

router.route('/')
  .get(getLeaves)
  .post(applyLeave);

router.route('/:id/status')
  .patch(updateLeaveStatus);

router.route('/:id/cancel')
  .patch(cancelLeave);

router.route('/:id')
  .delete(deleteLeave);

export default router;

