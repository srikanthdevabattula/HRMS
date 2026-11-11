import Document from '../models/Document.js';
import Asset from '../models/Asset.js';
import Employee from '../models/Employee.js';

/**
 * Default placeholder PDF URL provided for verified employee documents
 */
const PLACEHOLDER_PDF_URL = 'https://pdfplaceholder.com/pdf/Annual+Report+2026.pdf';

/**
 * Default placeholder documents to auto-seed for an employee if none exist
 */
const getDefaultEmployeeDocuments = (emp) => {
  const empId = emp.employeeId || 'EMP001';
  const name = emp.name || 'Employee';
  const email = emp.email || '';

  return [
    {
      employeeId: empId,
      employeeName: name,
      employeeEmail: email,
      title: 'Official Employment Offer Letter',
      category: 'HR Letters',
      documentType: 'Offer Letter',
      fileFormat: 'PDF',
      fileSize: '1.4 MB',
      fileUrl: PLACEHOLDER_PDF_URL,
      issueDate: new Date('2024-07-15'),
      status: 'Verified',
      issuedBy: 'People Operations',
      description: 'Signed full-time employment contract, compensation structure, and benefits overview.',
    },
    {
      employeeId: empId,
      employeeName: name,
      employeeEmail: email,
      title: 'Appointment & Joining Order',
      category: 'HR Letters',
      documentType: 'Joining Letter',
      fileFormat: 'PDF',
      fileSize: '840 KB',
      fileUrl: PLACEHOLDER_PDF_URL,
      issueDate: new Date('2024-08-01'),
      status: 'Verified',
      issuedBy: 'HR Administration',
      description: 'Official confirmation of appointment, designation, and reporting hierarchy.',
    },
    {
      employeeId: empId,
      employeeName: name,
      employeeEmail: email,
      title: 'Annual Performance Appraisal 2026',
      category: 'HR Letters',
      documentType: 'Appraisal Letter',
      fileFormat: 'PDF',
      fileSize: '620 KB',
      fileUrl: PLACEHOLDER_PDF_URL,
      issueDate: new Date('2026-04-01'),
      status: 'Verified',
      issuedBy: 'Executive Leadership',
      description: 'Annual performance rating, title revision, and revised compensation statement.',
    },
    {
      employeeId: empId,
      employeeName: name,
      employeeEmail: email,
      title: 'Form 16 - TDS Certificate (FY 2025-26)',
      category: 'Tax & Statutory',
      documentType: 'Form 16',
      fileFormat: 'PDF',
      fileSize: '2.1 MB',
      fileUrl: PLACEHOLDER_PDF_URL,
      issueDate: new Date('2026-05-15'),
      status: 'Verified',
      issuedBy: 'Finance & Taxation',
      description: 'Part A & Part B TDS summary certificate under Section 203 of Income-tax Act.',
    },
    {
      employeeId: empId,
      employeeName: name,
      employeeEmail: email,
      title: 'Employee ID Profile Photo',
      category: 'Personal & ID',
      documentType: 'Photo',
      fileFormat: 'PNG',
      fileSize: '450 KB',
      fileUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      issueDate: new Date('2024-08-01'),
      status: 'Verified',
      issuedBy: 'Security & Badging',
      description: 'Biometric passport photo for company access card and portal profile.',
    },
    {
      employeeId: empId,
      employeeName: name,
      employeeEmail: email,
      title: 'Bachelor of Technology Degree Certificate',
      category: 'Education',
      documentType: 'Degree Certificate',
      fileFormat: 'PDF',
      fileSize: '3.2 MB',
      fileUrl: PLACEHOLDER_PDF_URL,
      issueDate: new Date('2022-06-20'),
      status: 'Verified',
      issuedBy: 'University Registrar',
      description: 'Accredited university graduation degree certificate and academic records.',
    },
    {
      employeeId: empId,
      employeeName: name,
      employeeEmail: email,
      title: 'Previous Experience & Relieving Certificate',
      category: 'Experience',
      documentType: 'Experience Letter',
      fileFormat: 'PDF',
      fileSize: '1.1 MB',
      fileUrl: PLACEHOLDER_PDF_URL,
      issueDate: new Date('2024-07-28'),
      status: 'Verified',
      issuedBy: 'Previous Employer HR',
      description: 'Verified service credentials, designations, and conduct from prior employment.',
    },
  ];
};

/**
 * Default placeholder company assets to auto-seed for an employee if none exist
 */
const getDefaultEmployeeAssets = (emp) => {
  const empId = emp.employeeId || 'EMP001';
  const name = emp.name || 'Employee';
  const email = emp.email || '';

  return [
    {
      employeeId: empId,
      employeeName: name,
      employeeEmail: email,
      assetName: 'Apple MacBook Pro 16" (M3 Max)',
      category: 'Hardware',
      assetTag: 'AST-LPT-2024-8841',
      serialNumber: 'C02GQ91KMD6T',
      model: 'MacBook Pro 16-inch (Space Black, 36GB RAM, 1TB SSD)',
      assignedDate: new Date('2024-08-01'),
      status: 'Allocated',
      condition: 'Excellent',
      specs: 'Apple M3 Max (14-Core CPU, 30-Core GPU), 36GB Unified Memory, 1TB NVMe, Retina XDR',
    },
    {
      employeeId: empId,
      employeeName: name,
      employeeEmail: email,
      assetName: 'Dell UltraSharp 27" 4K USB-C Monitor',
      category: 'Peripherals',
      assetTag: 'AST-DSP-2024-3109',
      serialNumber: 'CN-0K9821-744',
      model: 'Dell U2723QE (IPS Black, 90W USB-C Power Delivery)',
      assignedDate: new Date('2024-08-05'),
      status: 'Allocated',
      condition: 'Excellent',
      specs: '3840 x 2160 @ 60Hz, 100% sRGB, 98% DCI-P3, Built-in RJ45 Gigabit Hub',
    },
    {
      employeeId: empId,
      employeeName: name,
      employeeEmail: email,
      assetName: 'Logitech MX Master 3S + Mechanical Keyboard',
      category: 'Peripherals',
      assetTag: 'AST-ACC-2024-0914',
      serialNumber: 'LZ8810239-US',
      model: 'MX Master 3S Wireless Mouse & MX Mechanical Wireless Keyboard',
      assignedDate: new Date('2024-08-05'),
      status: 'Allocated',
      condition: 'Like New',
      specs: 'Quiet Click 8K DPI Sensor, Tactile Quiet Switches, USB-C Quick Charge',
    },
    {
      employeeId: empId,
      employeeName: name,
      employeeEmail: email,
      assetName: 'Corporate RFID High-Security Keycard',
      category: 'Access & Security',
      assetTag: 'SEC-CRD-9941',
      serialNumber: 'HID-iCLASS-5481',
      model: 'NFC / RFID Smart Proximity Badge',
      assignedDate: new Date('2024-08-01'),
      status: 'Allocated',
      condition: 'Good',
      specs: 'Access clearance: HQ Headquarters All Floors, Server Room Pod B, Parking Deck P2',
    },
    {
      employeeId: empId,
      employeeName: name,
      employeeEmail: email,
      assetName: 'GitHub Enterprise + JetBrains All Products Seat',
      category: 'Software License',
      assetTag: 'LIC-DEV-2026-5510',
      serialNumber: 'JB-CORP-91402',
      model: 'Enterprise Developer Tier License',
      assignedDate: new Date('2024-08-01'),
      status: 'Allocated',
      condition: 'Active',
      specs: 'Full developer suite access, GitHub Copilot Business, JetBrains Ultimate IDEs',
    },
  ];
};

/**
 * @desc    Get all documents for an employee
 * @route   GET /api/documents
 */
export const getDocuments = async (req, res) => {
  try {
    const { employeeId, email, employeeName, category } = req.query;

    let targetEmp = await Employee.findOne({
      $or: [
        ...(employeeId ? [{ employeeId }] : []),
        ...(email ? [{ email: email.toLowerCase().trim() }] : []),
        ...(employeeName ? [{ name: new RegExp(`^${employeeName.trim()}$`, 'i') }] : []),
      ],
    });

    const empId = targetEmp ? targetEmp.employeeId : (employeeId || 'EMP001');
    const empEmail = targetEmp ? targetEmp.email : (email || '');
    const empName = targetEmp ? targetEmp.name : (employeeName || 'Employee');

    let query = {
      $or: [
        { employeeId: empId },
        ...(empEmail ? [{ employeeEmail: empEmail.toLowerCase().trim() }] : []),
        ...(empName ? [{ employeeName: new RegExp(`^${empName.trim()}$`, 'i') }] : []),
      ],
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    let docs = await Document.find(query).sort({ issueDate: -1, createdAt: -1 });

    // Auto-seed default verified employee documents if none exist
    if (docs.length === 0) {
      const defaults = getDefaultEmployeeDocuments({
        employeeId: empId,
        name: empName,
        email: empEmail,
      });

      try {
        await Document.insertMany(defaults);
        docs = await Document.find(query).sort({ issueDate: -1, createdAt: -1 });
      } catch (seedErr) {
        console.warn('Document seed skipped:', seedErr.message);
      }
    }

    // Ensure all PDF documents have the placeholder URL
    const enrichedDocs = docs.map((doc) => {
      const item = doc.toObject ? doc.toObject() : { ...doc };
      if (!item.fileUrl && item.fileFormat === 'PDF') {
        item.fileUrl = PLACEHOLDER_PDF_URL;
      }
      return item;
    });

    res.json({
      success: true,
      count: enrichedDocs.length,
      data: enrichedDocs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch employee documents',
    });
  }
};

/**
 * @desc    Upload / register a new employee document
 * @route   POST /api/documents
 */
export const uploadDocument = async (req, res) => {
  try {
    const {
      employeeId,
      employeeEmail,
      employeeName,
      title,
      category,
      documentType,
      fileFormat = 'PDF',
      fileSize = '1.0 MB',
      description,
    } = req.body;

    if (!title || !category || !documentType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide document title, category, and document type.',
      });
    }

    const newDoc = await Document.create({
      employeeId: employeeId || 'EMP001',
      employeeEmail: employeeEmail ? employeeEmail.toLowerCase().trim() : '',
      employeeName: employeeName || 'Employee',
      title: title.trim(),
      category,
      documentType,
      fileFormat,
      fileSize,
      issueDate: new Date(),
      status: 'Verified',
      issuedBy: 'Employee Upload',
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded and registered successfully.',
      data: newDoc,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to upload document',
    });
  }
};

/**
 * @desc    Get all assets assigned to an employee
 * @route   GET /api/documents/assets
 */
export const getAssets = async (req, res) => {
  try {
    const { employeeId, email, employeeName } = req.query;

    let targetEmp = await Employee.findOne({
      $or: [
        ...(employeeId ? [{ employeeId }] : []),
        ...(email ? [{ email: email.toLowerCase().trim() }] : []),
        ...(employeeName ? [{ name: new RegExp(`^${employeeName.trim()}$`, 'i') }] : []),
      ],
    });

    const empId = targetEmp ? targetEmp.employeeId : (employeeId || 'EMP001');
    const empEmail = targetEmp ? targetEmp.email : (email || '');
    const empName = targetEmp ? targetEmp.name : (employeeName || 'Employee');

    let query = {
      $or: [
        { employeeId: empId },
        ...(empEmail ? [{ employeeEmail: empEmail.toLowerCase().trim() }] : []),
        ...(empName ? [{ employeeName: new RegExp(`^${empName.trim()}$`, 'i') }] : []),
      ],
    };

    let assets = await Asset.find(query).sort({ assignedDate: -1 });

    // Auto-seed default assigned company assets if none exist
    if (assets.length === 0) {
      const defaults = getDefaultEmployeeAssets({
        employeeId: empId,
        name: empName,
        email: empEmail,
      });

      try {
        await Asset.insertMany(defaults);
        assets = await Asset.find(query).sort({ assignedDate: -1 });
      } catch (seedErr) {
        console.warn('Asset seed skipped:', seedErr.message);
      }
    }

    res.json({
      success: true,
      count: assets.length,
      data: assets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch employee assets',
    });
  }
};

/**
 * @desc    Submit an issue or upgrade request for an asset
 * @route   POST /api/documents/assets/:id/report
 */
export const reportAssetIssue = async (req, res) => {
  try {
    const { issueType, notes } = req.body;
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    // Update status to maintenance if requested
    if (issueType === 'Defective' || issueType === 'Hardware Damage') {
      asset.status = 'Under Maintenance';
      await asset.save();
    }

    res.json({
      success: true,
      message: `Support ticket created for ${asset.assetName} (${asset.assetTag}). IT Helpdesk will follow up.`,
      data: asset,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to report asset issue',
    });
  }
};

/**
 * @desc    Admin Update an employee document
 * @route   PUT /api/documents/:id
 */
export const updateDocument = async (req, res) => {
  try {
    const { title, category, documentType, status, description, issuedBy, fileUrl } = req.body;
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (title) doc.title = title.trim();
    if (category) doc.category = category;
    if (documentType) doc.documentType = documentType;
    if (status) doc.status = status;
    if (description !== undefined) doc.description = description.trim();
    if (issuedBy) doc.issuedBy = issuedBy.trim();
    if (fileUrl) doc.fileUrl = fileUrl.trim();

    await doc.save();

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: doc,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update document' });
  }
};

/**
 * @desc    Admin Delete an employee document
 * @route   DELETE /api/documents/:id
 */
export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to delete document' });
  }
};

/**
 * @desc    Admin Create / Assign a new Company Asset to employee
 * @route   POST /api/documents/assets
 */
export const createAsset = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      employeeEmail,
      assetName,
      category = 'Hardware',
      assetTag,
      serialNumber,
      model,
      status = 'Allocated',
      condition = 'Excellent',
      specs,
    } = req.body;

    if (!assetName || !employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Asset Name and Employee ID.',
      });
    }

    const generatedTag = assetTag || `AST-${Date.now().toString().slice(-6)}`;

    const newAsset = await Asset.create({
      employeeId,
      employeeName: employeeName || '',
      employeeEmail: employeeEmail ? employeeEmail.toLowerCase().trim() : '',
      assetName: assetName.trim(),
      category,
      assetTag: generatedTag,
      serialNumber: serialNumber ? serialNumber.trim() : '',
      model: model ? model.trim() : '',
      assignedDate: new Date(),
      status,
      condition,
      specs: specs ? specs.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Asset assigned successfully',
      data: newAsset,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to assign asset' });
  }
};

/**
 * @desc    Admin Update a Company Asset
 * @route   PUT /api/documents/assets/:id
 */
export const updateAsset = async (req, res) => {
  try {
    const {
      assetName,
      category,
      assetTag,
      serialNumber,
      model,
      status,
      condition,
      specs,
    } = req.body;

    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    if (assetName) asset.assetName = assetName.trim();
    if (category) asset.category = category;
    if (assetTag) asset.assetTag = assetTag.trim();
    if (serialNumber !== undefined) asset.serialNumber = serialNumber.trim();
    if (model !== undefined) asset.model = model.trim();
    if (status) asset.status = status;
    if (condition) asset.condition = condition;
    if (specs !== undefined) asset.specs = specs.trim();

    await asset.save();

    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: asset,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update asset' });
  }
};

/**
 * @desc    Admin Delete / Revoke a Company Asset
 * @route   DELETE /api/documents/assets/:id
 */
export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    await Asset.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Asset revoked and removed successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to delete asset' });
  }
};

