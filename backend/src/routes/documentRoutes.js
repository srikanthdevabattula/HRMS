import express from 'express';
import {
  getDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument,
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  reportAssetIssue,
} from '../controllers/documentController.js';

const router = express.Router();

// Document endpoints
router.route('/')
  .get(getDocuments)
  .post(uploadDocument);

router.route('/:id')
  .put(updateDocument)
  .delete(deleteDocument);

// Asset endpoints
router.route('/assets')
  .get(getAssets)
  .post(createAsset);

router.route('/assets/:id')
  .put(updateAsset)
  .delete(deleteAsset);

router.route('/assets/:id/report')
  .post(reportAssetIssue);

export default router;
