import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchDocuments,
  uploadDocumentApi,
  updateDocumentApi,
  deleteDocumentApi,
  fetchAssets,
  createAssetApi,
  updateAssetApi,
  deleteAssetApi,
} from '../services/documentService';
import {
  X,
  FolderLock,
  FileText,
  FileCheck,
  Eye,
  Edit2,
  Trash2,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Laptop,
  Monitor,
  Key,
  Code,
  Receipt,
  GraduationCap,
  Briefcase,
  UserCheck,
  RefreshCw,
  Mail,
  Phone,
  DollarSign,
  Building2,
  HardDrive,
  Cpu,
  Sparkles,
} from 'lucide-react';

const DOC_CATEGORIES = [
  'All',
  'HR Letters',
  'Tax & Statutory',
  'Education',
  'Experience',
  'Personal & ID',
];

const ASSET_CATEGORIES = [
  'All',
  'Hardware',
  'Peripherals',
  'Access & Security',
  'Software License',
];

const PLACEHOLDER_PDF = 'https://pdfplaceholder.com/pdf/Annual+Report+2026.pdf';

/**
 * Employee Details Modal (Admin View)
 * Displays Employee Profile, All Documents, and Company Assets with full editing/adding/deleting capabilities.
 */
export default function EmployeeDetailsModal({
  isOpen,
  onClose,
  employee,
  onEmployeeUpdated,
}) {
  if (!isOpen || !employee) return null;

  const empId = employee.employeeId || 'EMP001';
  const empName = employee.name || 'Employee';
  const empEmail = employee.email || '';

  // Tab State: 'documents' | 'assets'
  const [activeTab, setActiveTab] = useState('documents');

  // Documents state
  const [documents, setDocuments] = useState([]);
  const [selectedDocCategory, setSelectedDocCategory] = useState('All');
  const [docsLoading, setDocsLoading] = useState(true);

  // Assets state
  const [assets, setAssets] = useState([]);
  const [selectedAssetCategory, setSelectedAssetCategory] = useState('All');
  const [assetsLoading, setAssetsLoading] = useState(true);

  // Sub-modals / actions state
  const [previewPdfDoc, setPreviewPdfDoc] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const [editingAsset, setEditingAsset] = useState(null);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);

  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }
  const [actionLoading, setActionLoading] = useState(false);

  // Form states for Add/Edit Document
  const [docFormData, setDocFormData] = useState({
    title: '',
    category: 'HR Letters',
    documentType: 'Offer Letter',
    fileFormat: 'PDF',
    status: 'Verified',
    issuedBy: 'People Operations',
    fileUrl: PLACEHOLDER_PDF,
    description: '',
  });

  // Form states for Add/Edit Asset
  const [assetFormData, setAssetFormData] = useState({
    assetName: '',
    category: 'Hardware',
    assetTag: '',
    serialNumber: '',
    model: '',
    status: 'Allocated',
    condition: 'Excellent',
    specs: '',
  });

  const showToast = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Load documents for this specific employee
  const loadDocuments = useCallback(async () => {
    setDocsLoading(true);
    try {
      const data = await fetchDocuments({
        employeeId: empId,
        email: empEmail,
        employeeName: empName,
        category: selectedDocCategory,
      });
      setDocuments(data || []);
    } catch (err) {
      console.warn('Failed to load employee documents:', err.message);
      setDocuments([]);
    } finally {
      setDocsLoading(false);
    }
  }, [empId, empEmail, empName, selectedDocCategory]);

  // Load assets for this specific employee
  const loadAssets = useCallback(async () => {
    setAssetsLoading(true);
    try {
      const data = await fetchAssets({
        employeeId: empId,
        email: empEmail,
        employeeName: empName,
      });
      setAssets(data || []);
    } catch (err) {
      console.warn('Failed to load employee assets:', err.message);
      setAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  }, [empId, empEmail, empName]);

  useEffect(() => {
    loadDocuments();
    loadAssets();
  }, [loadDocuments, loadAssets]);

  // Document Helpers
  const getDocCategoryIcon = (category, type) => {
    if (category === 'HR Letters' || type === 'Offer Letter') return FileCheck;
    if (category === 'Tax & Statutory') return Receipt;
    if (category === 'Education') return GraduationCap;
    if (category === 'Experience') return Briefcase;
    if (category === 'Personal & ID') return UserCheck;
    return FileText;
  };

  // Asset Helpers
  const getAssetCategoryIcon = (category) => {
    if (category === 'Hardware') return Laptop;
    if (category === 'Peripherals') return Monitor;
    if (category === 'Access & Security') return Key;
    return Code;
  };

  // Open Edit Document Modal
  const handleOpenEditDoc = (doc) => {
    setEditingDoc(doc);
    setDocFormData({
      title: doc.title || '',
      category: doc.category || 'HR Letters',
      documentType: doc.documentType || 'Offer Letter',
      fileFormat: doc.fileFormat || 'PDF',
      status: doc.status || 'Verified',
      issuedBy: doc.issuedBy || 'HR Operations',
      fileUrl: doc.fileUrl || PLACEHOLDER_PDF,
      description: doc.description || '',
    });
  };

  // Open Add Document Modal
  const handleOpenAddDoc = () => {
    setEditingDoc(null);
    setDocFormData({
      title: '',
      category: 'HR Letters',
      documentType: 'Offer Letter',
      fileFormat: 'PDF',
      status: 'Verified',
      issuedBy: 'People Operations',
      fileUrl: PLACEHOLDER_PDF,
      description: '',
    });
    setIsAddDocOpen(true);
  };

  // Save Document (Add or Update)
  const handleSaveDoc = async (e) => {
    e.preventDefault();
    if (!docFormData.title.trim()) {
      showToast('error', 'Document title is required.');
      return;
    }

    setActionLoading(true);
    try {
      if (editingDoc) {
        await updateDocumentApi(editingDoc._id, docFormData);
        showToast('success', `Document "${docFormData.title}" updated successfully!`);
        setEditingDoc(null);
      } else {
        await uploadDocumentApi({
          ...docFormData,
          employeeId: empId,
          employeeEmail: empEmail,
          employeeName: empName,
          fileSize: '1.2 MB',
        });
        showToast('success', `Document "${docFormData.title}" created successfully!`);
        setIsAddDocOpen(false);
      }
      await loadDocuments();
    } catch (err) {
      showToast('error', err.message || 'Failed to save document');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Document
  const handleConfirmDeleteDoc = async () => {
    if (!docToDelete) return;
    setActionLoading(true);
    try {
      await deleteDocumentApi(docToDelete._id);
      showToast('success', `Document "${docToDelete.title}" deleted.`);
      setDocToDelete(null);
      await loadDocuments();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete document');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Asset Modal
  const handleOpenEditAsset = (asset) => {
    setEditingAsset(asset);
    setAssetFormData({
      assetName: asset.assetName || '',
      category: asset.category || 'Hardware',
      assetTag: asset.assetTag || '',
      serialNumber: asset.serialNumber || '',
      model: asset.model || '',
      status: asset.status || 'Allocated',
      condition: asset.condition || 'Excellent',
      specs: asset.specs || '',
    });
  };

  // Open Add Asset Modal
  const handleOpenAddAsset = () => {
    setEditingAsset(null);
    setAssetFormData({
      assetName: '',
      category: 'Hardware',
      assetTag: `AST-${Date.now().toString().slice(-6)}`,
      serialNumber: '',
      model: '',
      status: 'Allocated',
      condition: 'Brand New',
      specs: '',
    });
    setIsAddAssetOpen(true);
  };

  // Save Asset (Add or Update)
  const handleSaveAsset = async (e) => {
    e.preventDefault();
    if (!assetFormData.assetName.trim()) {
      showToast('error', 'Asset Name is required.');
      return;
    }

    setActionLoading(true);
    try {
      if (editingAsset) {
        await updateAssetApi(editingAsset._id, assetFormData);
        showToast('success', `Asset "${assetFormData.assetName}" updated successfully!`);
        setEditingAsset(null);
      } else {
        await createAssetApi({
          ...assetFormData,
          employeeId: empId,
          employeeEmail: empEmail,
          employeeName: empName,
        });
        showToast('success', `Asset "${assetFormData.assetName}" assigned successfully!`);
        setIsAddAssetOpen(false);
      }
      await loadAssets();
    } catch (err) {
      showToast('error', err.message || 'Failed to save asset');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Asset
  const handleConfirmDeleteAsset = async () => {
    if (!assetToDelete) return;
    setActionLoading(true);
    try {
      await deleteAssetApi(assetToDelete._id);
      showToast('success', `Asset "${assetToDelete.assetName}" revoked successfully.`);
      setAssetToDelete(null);
      await loadAssets();
    } catch (err) {
      showToast('error', err.message || 'Failed to revoke asset');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered assets
  const filteredAssets =
    selectedAssetCategory === 'All'
      ? assets
      : assets.filter((a) => a.category === selectedAssetCategory);

  const initials = empName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'EM';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-5xl h-[92vh] max-h-[880px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* ================= MODAL TOP HEADER ================= */}
        <div className="p-5 sm:p-6 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-start justify-between gap-4">
            {/* Employee Bio Profile Header */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-sky-500 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                {initials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {empName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-semibold">
                    {empId}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      employee.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        employee.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                    {employee.status || 'Active'}
                  </span>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                    {employee.designation || 'Staff'} • {employee.department || 'General'}
                  </span>
                  {empEmail && (
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      {empEmail}
                    </span>
                  )}
                  {employee.phone && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      {employee.phone}
                    </span>
                  )}
                  {employee.salary && (
                    <span className="flex items-center gap-1 text-emerald-400 font-mono font-semibold">
                      <DollarSign className="h-3.5 w-3.5" />
                      {employee.salary.toLocaleString()}/yr
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer shrink-0"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Toast Notification inside modal */}
          {feedback && (
            <div
              className={`mt-3.5 flex items-center gap-2 p-2.5 rounded-xl text-xs border ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderLock className="h-4 w-4" />
              <span>Verified Documents</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('assets')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'assets'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop className="h-4 w-4" />
              <span>Company Assets & Equipment</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">
                {assets.length}
              </span>
            </button>
          </div>
        </div>

        {/* ================= MODAL BODY CONTENT ================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* =================== TAB 1: DOCUMENTS =================== */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              {/* Category Filter Pills & Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {DOC_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedDocCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        selectedDocCategory === cat
                          ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-300'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddDoc}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Upload Document</span>
                  </button>
                  <button
                    onClick={loadDocuments}
                    title="Reload documents"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${docsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Documents List */}
              {docsLoading ? (
                <div className="py-16 text-center text-slate-500">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-500 mb-2" />
                  <p className="text-xs">Fetching verified employee documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="py-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl p-6">
                  <FolderLock className="h-10 w-10 mx-auto text-slate-600 mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-slate-300">No documents found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Click "+ Upload Document" to upload or register certificates for {empName}.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {documents.map((doc) => {
                    const CatIcon = getDocCategoryIcon(doc.category, doc.documentType);
                    return (
                      <div
                        key={doc._id}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between gap-3 group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                                <CatIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                                  {doc.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 flex-wrap">
                                  <span className="font-semibold text-slate-300">{doc.category}</span>
                                  <span>•</span>
                                  <span className="font-mono text-slate-400">{doc.fileFormat}</span>
                                  <span>•</span>
                                  <span>{doc.fileSize || '1.0 MB'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Status badge */}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                                doc.status === 'Verified'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                                  : doc.status === 'Rejected'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                              }`}
                            >
                              {doc.status || 'Verified'}
                            </span>
                          </div>

                          {doc.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {doc.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                            <span>Issued: {doc.issuedBy || 'HR Operations'}</span>
                            <span>
                              {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString() : 'Active'}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                          <button
                            onClick={() => setPreviewPdfDoc(doc)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 text-[11px] font-semibold transition cursor-pointer"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Preview PDF</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditDoc(doc)}
                              title="Edit Document Info & Status"
                              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDocToDelete(doc)}
                              title="Delete Document"
                              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =================== TAB 2: COMPANY ASSETS =================== */}
          {activeTab === 'assets' && (
            <div className="space-y-4">
              {/* Filter Pills & Add Asset Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ASSET_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedAssetCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        selectedAssetCategory === cat
                          ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-300'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddAsset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Assign Asset</span>
                  </button>
                  <button
                    onClick={loadAssets}
                    title="Reload assets"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${assetsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Assets Grid */}
              {assetsLoading ? (
                <div className="py-16 text-center text-slate-500">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-500 mb-2" />
                  <p className="text-xs">Fetching company assets...</p>
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="py-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl p-6">
                  <Laptop className="h-10 w-10 mx-auto text-slate-600 mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-slate-300">No assets assigned</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Click "+ Assign Asset" to allocate laptops, monitors, or access credentials.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredAssets.map((asset) => {
                    const AssetIcon = getAssetCategoryIcon(asset.category);
                    return (
                      <div
                        key={asset._id}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between gap-3 group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                                <AssetIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                                  {asset.assetName}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 flex-wrap">
                                  <span className="font-mono text-indigo-400 font-semibold">
                                    {asset.assetTag}
                                  </span>
                                  <span>•</span>
                                  <span>{asset.category}</span>
                                </div>
                              </div>
                            </div>

                            {/* Status badge */}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                                asset.status === 'Allocated'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                                  : asset.status === 'Under Maintenance'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {asset.status || 'Allocated'}
                            </span>
                          </div>

                          {/* Model & Condition */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                            <div>
                              <span className="text-slate-500 block">Serial / Model:</span>
                              <span className="font-mono text-slate-300 font-medium truncate block">
                                {asset.serialNumber || asset.model || 'Standard OEM'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Condition:</span>
                              <span className="text-emerald-400 font-medium">
                                {asset.condition || 'Excellent'}
                              </span>
                            </div>
                          </div>

                          {asset.specs && (
                            <p className="text-[11px] text-slate-400 font-mono line-clamp-2 leading-relaxed">
                              {asset.specs}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                          <span>
                            Assigned:{' '}
                            {asset.assignedDate
                              ? new Date(asset.assignedDate).toLocaleDateString()
                              : 'Current'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditAsset(asset)}
                              title="Edit Asset Details & Status"
                              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setAssetToDelete(asset)}
                              title="Revoke / Delete Asset"
                              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Admin privileges: full access to documents & company property records.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer font-semibold"
          >
            Done
          </button>
        </div>
      </div>

      {/* ================= SUB-MODAL 1: ADD / EDIT DOCUMENT ================= */}
      {(isAddDocOpen || editingDoc) && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                  {editingDoc ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingDoc ? 'Edit Document' : 'Upload / Add Document'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingDoc ? `Editing for ${empName}` : `Add new record for ${empName}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingDoc(null);
                  setIsAddDocOpen(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  Document Title <strong className="text-indigo-400">*</strong>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Appointment Letter, Form 16, Degree Certificate..."
                  value={docFormData.title}
                  onChange={(e) => setDocFormData({ ...docFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Category</label>
                  <select
                    value={docFormData.category}
                    onChange={(e) => setDocFormData({ ...docFormData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="HR Letters">HR Letters</option>
                    <option value="Tax & Statutory">Tax & Statutory</option>
                    <option value="Education">Education</option>
                    <option value="Experience">Experience</option>
                    <option value="Personal & ID">Personal & ID</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Document Type</label>
                  <select
                    value={docFormData.documentType}
                    onChange={(e) =>
                      setDocFormData({ ...docFormData, documentType: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="Offer Letter">Offer Letter</option>
                    <option value="Joining Letter">Joining Letter</option>
                    <option value="Appraisal Letter">Appraisal Letter</option>
                    <option value="Form 16">Form 16</option>
                    <option value="Degree Certificate">Degree Certificate</option>
                    <option value="Experience Letter">Experience Letter</option>
                    <option value="Photo">Photo</option>
                    <option value="Identity Proof">Identity Proof</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Verification Status</label>
                  <select
                    value={docFormData.status}
                    onChange={(e) => setDocFormData({ ...docFormData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Issued By / Department</label>
                  <input
                    type="text"
                    placeholder="e.g. People Operations"
                    value={docFormData.issuedBy}
                    onChange={(e) => setDocFormData({ ...docFormData, issuedBy: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">PDF Document URL</label>
                <input
                  type="text"
                  placeholder="https://pdfplaceholder.com/pdf/Annual+Report+2026.pdf"
                  value={docFormData.fileUrl}
                  onChange={(e) => setDocFormData({ ...docFormData, fileUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px] placeholder-slate-600 outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Document overview, verification notes, credentials info..."
                  value={docFormData.description}
                  onChange={(e) => setDocFormData({ ...docFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDoc(null);
                    setIsAddDocOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingDoc ? 'Save Changes' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SUB-MODAL 2: ADD / EDIT ASSET ================= */}
      {(isAddAssetOpen || editingAsset) && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                  {editingAsset ? <Edit2 className="h-4 w-4" /> : <Laptop className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingAsset ? 'Edit Company Asset' : 'Assign New Asset'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingAsset ? `Editing asset for ${empName}` : `Assign asset to ${empName}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingAsset(null);
                  setIsAddAssetOpen(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  Asset Name <strong className="text-indigo-400">*</strong>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro 16-inch M3 Max, 4K Dell UltraSharp..."
                  value={assetFormData.assetName}
                  onChange={(e) => setAssetFormData({ ...assetFormData, assetName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Category</label>
                  <select
                    value={assetFormData.category}
                    onChange={(e) =>
                      setAssetFormData({ ...assetFormData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Peripherals">Peripherals</option>
                    <option value="Access & Security">Access & Security</option>
                    <option value="Software License">Software License</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Asset Tag</label>
                  <input
                    type="text"
                    placeholder="AST-LPT-2024-8841"
                    value={assetFormData.assetTag}
                    onChange={(e) => setAssetFormData({ ...assetFormData, assetTag: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-600 outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Serial Number</label>
                  <input
                    type="text"
                    placeholder="C02GQ91KMD6T"
                    value={assetFormData.serialNumber}
                    onChange={(e) =>
                      setAssetFormData({ ...assetFormData, serialNumber: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-600 outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Model</label>
                  <input
                    type="text"
                    placeholder="MacBook Pro 16-inch (Space Black)"
                    value={assetFormData.model}
                    onChange={(e) => setAssetFormData({ ...assetFormData, model: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Status</label>
                  <select
                    value={assetFormData.status}
                    onChange={(e) => setAssetFormData({ ...assetFormData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="Allocated">Allocated</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Returned">Returned</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Condition</label>
                  <select
                    value={assetFormData.condition}
                    onChange={(e) =>
                      setAssetFormData({ ...assetFormData, condition: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Needs Service">Needs Service</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Technical Specifications</label>
                <textarea
                  rows={2}
                  placeholder="Processor, RAM, Storage, Port config, or license tier..."
                  value={assetFormData.specs}
                  onChange={(e) => setAssetFormData({ ...assetFormData, specs: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition resize-none font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAsset(null);
                    setIsAddAssetOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingAsset ? 'Save Changes' : 'Assign Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SUB-MODAL 3: CONFIRM DELETE DOCUMENT ================= */}
      {docToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Delete Document</h4>
                <p className="text-xs text-slate-400">
                  Are you sure you want to remove "{docToDelete.title}"?
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmDeleteDoc}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-MODAL 4: CONFIRM REVOKE ASSET ================= */}
      {assetToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Revoke Company Asset</h4>
                <p className="text-xs text-slate-400">
                  Remove "{assetToDelete.assetName}" ({assetToDelete.assetTag}) from {empName}?
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAssetToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmDeleteAsset}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                {actionLoading ? 'Revoking...' : 'Yes, Revoke Asset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-MODAL 5: PDF VIEWER MODAL ================= */}
      {previewPdfDoc && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative flex flex-col w-full max-w-4xl h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{previewPdfDoc.title}</h3>
                  <p className="text-[11px] text-slate-400">
                    {previewPdfDoc.category} • {empName} ({empId})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewPdfDoc.fileUrl || PLACEHOLDER_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open in Tab</span>
                </a>
                <button
                  onClick={() => setPreviewPdfDoc(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 p-2">
              <iframe
                src={`${previewPdfDoc.fileUrl || PLACEHOLDER_PDF}#toolbar=0&navpanes=0`}
                className="w-full h-full rounded-2xl border border-slate-800 bg-white"
                title={previewPdfDoc.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

