import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchDocuments,
  uploadDocumentApi,
  fetchAssets,
  reportAssetIssueApi,
} from '../services/documentService';
import Logo from '../components/Logo';
import {
  FolderLock,
  FileText,
  FileCheck,
  Download,
  Eye,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Laptop,
  Monitor,
  Key,
  Code,
  HardDrive,
  Cpu,
  RefreshCw,
  Search,
  Filter,
  X,
  File,
  Image,
  GraduationCap,
  Briefcase,
  Receipt,
  UserCheck,
  AlertCircle,
  HelpCircle,
  Award,
  ExternalLink,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'HR Letters',
  'Tax & Statutory',
  'Education',
  'Experience',
  'Personal & ID',
];

/**
 * Employee Documents & Company Assets View
 */
export default function EmployeeDocumentsView({ currentUser }) {
  const employeeId = currentUser?.employeeId || currentUser?.id || 'EMP001';
  const employeeEmail = currentUser?.email || '';
  const employeeName = currentUser?.name || 'Employee';

  // Active top-level section: 'documents' or 'assets'
  const [activeSection, setActiveSection] = useState('documents');

  // Documents state
  const [documents, setDocuments] = useState([]);
  const [docCategory, setDocCategory] = useState('All');
  const [docsLoading, setDocsLoading] = useState(true);

  // Company Assets state
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);

  // Modal states
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewMode, setPreviewMode] = useState('pdf'); // 'pdf' | 'certificate'
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedAssetForHelp, setSelectedAssetForHelp] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Upload Form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'HR Letters',
    documentType: 'Offer Letter',
    fileFormat: 'PDF',
    description: '',
  });
  const [uploading, setUploading] = useState(false);

  // Load documents
  const loadDocs = useCallback(async () => {
    setDocsLoading(true);
    try {
      const data = await fetchDocuments({
        employeeId,
        email: employeeEmail,
        employeeName,
        category: docCategory,
      });
      setDocuments(data || []);
    } catch (err) {
      console.warn('Failed to load documents:', err.message);
      setDocuments([]);
    } finally {
      setDocsLoading(false);
    }
  }, [employeeId, employeeEmail, employeeName, docCategory]);

  // Load assets
  const loadAssetList = useCallback(async () => {
    setAssetsLoading(true);
    try {
      const data = await fetchAssets({
        employeeId,
        email: employeeEmail,
        employeeName,
      });
      setAssets(data || []);
    } catch (err) {
      console.warn('Failed to load assets:', err.message);
      setAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  }, [employeeId, employeeEmail, employeeName]);

  useEffect(() => {
    if (activeSection === 'documents') {
      loadDocs();
    } else {
      loadAssetList();
    }
  }, [activeSection, loadDocs, loadAssetList]);

  // Handle Document Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.title.trim()) return;

    setUploading(true);
    try {
      await uploadDocumentApi({
        ...uploadForm,
        employeeId,
        employeeEmail,
        employeeName,
        fileSize: '1.2 MB',
      });
      setFeedback({
        type: 'success',
        message: `"${uploadForm.title}" uploaded and verified successfully!`,
      });
      setIsUploadOpen(false);
      setUploadForm({
        title: '',
        category: 'HR Letters',
        documentType: 'Offer Letter',
        fileFormat: 'PDF',
        description: '',
      });
      await loadDocs();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to upload document',
      });
    } finally {
      setUploading(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Handle Document Download / Open PDF
  const handleDownloadDoc = (doc) => {
    const pdfUrl = doc.fileUrl || 'https://pdfplaceholder.com/pdf/Annual+Report+2026.pdf';
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    setFeedback({
      type: 'success',
      message: `Opening "${doc.title}.pdf" (${pdfUrl})...`,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Handle Asset Issue report
  const handleReportAsset = async (asset) => {
    try {
      await reportAssetIssueApi(asset._id, {
        issueType: 'Maintenance Request',
        notes: `User ${employeeName} requested support check for ${asset.assetName}`,
      });
      setFeedback({
        type: 'success',
        message: `Support ticket created for ${asset.assetName} (${asset.assetTag}). IT Helpdesk notified.`,
      });
      await loadAssetList();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to report asset issue',
      });
    } finally {
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Helper to pick Category Icon
  const getCategoryIcon = (cat, type) => {
    if (cat === 'HR Letters' || type === 'Offer Letter') return FileCheck;
    if (cat === 'Tax & Statutory') return Receipt;
    if (cat === 'Education') return GraduationCap;
    if (cat === 'Experience') return Briefcase;
    if (cat === 'Personal & ID') return UserCheck;
    return FileText;
  };

  // Helper to pick Asset Icon
  const getAssetIcon = (category) => {
    if (category === 'Hardware') return Laptop;
    if (category === 'Peripherals') return Monitor;
    if (category === 'Access & Security') return Key;
    return Code;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <FolderLock className="h-6 w-6 text-indigo-400" />
            <span>Documents & Company Assets</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access verified employment letters, Form 16, degree credentials, and company hardware assignments.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {activeSection === 'documents' && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Document</span>
            </button>
          )}

          <button
            onClick={activeSection === 'documents' ? loadDocs : loadAssetList}
            title="Refresh records"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RefreshCw
              className={`h-4 w-4 ${docsLoading || assetsLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div
          className={`flex items-center gap-2.5 p-3.5 rounded-2xl text-xs border ${
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

      {/* Main Section Navigation Switcher */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('documents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSection === 'documents'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>My Documents ({documents.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('assets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSection === 'assets'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>Company Assets ({assets.length})</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 hidden sm:inline px-3 font-mono">
          Employee: <strong className="text-slate-300">{employeeName}</strong> ({employeeId})
        </span>
      </div>

      {/* ================= SECTION 1: DOCUMENTS ================= */}
      {activeSection === 'documents' && (
        <div className="space-y-4">
          {/* Subcategory Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setDocCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer ${
                  docCategory === cat
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Documents Grid */}
          {docsLoading ? (
            <div className="py-16 text-center text-slate-500">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-500 mb-2" />
              <span>Loading verified documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="py-16 text-center text-slate-500 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 space-y-2">
              <FileCheck className="h-10 w-10 mx-auto text-slate-600 opacity-50" />
              <p className="text-sm font-semibold text-slate-300">No documents found in this category</p>
              <p className="text-xs text-slate-500">Click "+ Upload Document" to add verified files.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => {
                const IconComponent = getCategoryIcon(doc.category, doc.documentType);
                const issueDateFormatted = new Date(doc.issueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={doc._id || doc.title}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between hover:border-slate-700 transition hover:shadow-xl space-y-4"
                  >
                    {/* Top Row: Icon, Category & Verification Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="h-3 w-3" />
                          <span>{doc.status || 'Verified'}</span>
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">
                          {doc.fileFormat} • {doc.fileSize}
                        </p>
                      </div>
                    </div>

                    {/* Middle Info */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        {doc.category}
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-1" title={doc.title}>
                        {doc.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2" title={doc.description}>
                        {doc.description || `Verified ${doc.documentType} record on file.`}
                      </p>
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Issued: {issueDateFormatted}</span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          title="Preview Document"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer text-xs font-semibold"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDownloadDoc(doc)}
                          title="Download Document"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition cursor-pointer text-xs font-semibold"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Save</span>
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

      {/* ================= SECTION 2: COMPANY ASSETS ================= */}
      {activeSection === 'assets' && (
        <div className="space-y-4">
          {/* Asset Summary Banner */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                IT Equipment Custody
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
                {assets.length} Company Assets Allocated to You
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Company hardware, monitors, smart keys, and enterprise developer tools under your custody.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>All Assets Active</span>
              </span>
            </div>
          </div>

          {/* Assets Grid */}
          {assetsLoading ? (
            <div className="py-16 text-center text-slate-500">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-500 mb-2" />
              <span>Loading company equipment...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map((asset) => {
                const IconComponent = getAssetIcon(asset.category);
                const assignedDateFormatted = new Date(asset.assignedDate).toLocaleDateString(
                  'en-US',
                  { month: 'short', day: 'numeric', year: 'numeric' }
                );

                return (
                  <div
                    key={asset._id || asset.assetTag}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 hover:border-slate-700 transition"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                            {asset.category}
                          </span>
                          <h3 className="text-sm font-bold text-white">{asset.assetName}</h3>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          asset.status === 'Allocated'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{asset.status}</span>
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-500">Asset Tag ID</span>
                        <p className="font-mono font-bold text-slate-200 mt-0.5">{asset.assetTag}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Serial Number</span>
                        <p className="font-mono text-slate-300 mt-0.5">{asset.serialNumber || '—'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Condition</span>
                        <p className="text-emerald-400 font-semibold mt-0.5">{asset.condition || 'Good'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Assigned On</span>
                        <p className="text-slate-300 mt-0.5">{assignedDateFormatted}</p>
                      </div>
                    </div>

                    {/* Specs / Model */}
                    {asset.specs && (
                      <p className="text-[11px] text-slate-400 font-mono bg-slate-950/30 p-2 rounded-lg border border-slate-900">
                        {asset.specs}
                      </p>
                    )}

                    {/* Bottom Actions */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Custody: Verified</span>
                      <button
                        onClick={() => handleReportAsset(asset)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs font-semibold"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
                        <span>IT Support Request</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL 1: DOCUMENT PREVIEW MODAL ================= */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 space-y-4 max-h-[94vh] overflow-y-auto">
            {/* Modal Controls Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                <FileCheck className="h-4 w-4" />
                <span className="font-bold text-white text-sm">{previewDoc.title}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  {previewDoc.documentType}
                </span>
              </div>

              {/* View Switcher: Live PDF vs HR Certificate */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <button
                    onClick={() => setPreviewMode('pdf')}
                    className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer text-[11px] ${
                      previewMode === 'pdf'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Live PDF View
                  </button>
                  <button
                    onClick={() => setPreviewMode('certificate')}
                    className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer text-[11px] ${
                      previewMode === 'certificate'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    HR Verification Seal
                  </button>
                </div>

                <a
                  href={previewDoc.fileUrl || 'https://pdfplaceholder.com/pdf/Annual+Report+2026.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Open URL</span>
                </a>

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* View Mode 1: Live Interactive PDF Iframe */}
            {previewMode === 'pdf' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] px-2 text-slate-400">
                  <span className="truncate max-w-md font-mono text-slate-400">
                    PDF Source: <span className="text-indigo-400 underline">{previewDoc.fileUrl || 'https://pdfplaceholder.com/pdf/Annual+Report+2026.pdf'}</span>
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Verified Authenticated Document</span>
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 shadow-2xl">
                  <iframe
                    src={previewDoc.fileUrl || 'https://pdfplaceholder.com/pdf/Annual+Report+2026.pdf'}
                    className="w-full h-[580px] border-0 bg-slate-900"
                    title={previewDoc.title}
                  />
                </div>
              </div>
            ) : (
              /* View Mode 2: Official Formatted Document Letterhead & Seal */
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 space-y-6">
                {/* Company Logo Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <Logo size="default" />
                  <div className="text-left sm:text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                      {previewDoc.status || 'Verified Document'}
                    </span>
                    <p className="mt-1 text-sm font-bold text-white">{previewDoc.title}</p>
                    <p className="text-[11px] text-slate-400">Category: {previewDoc.category}</p>
                  </div>
                </div>

                {/* Document Identity Meta */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500">Employee</span>
                    <p className="font-bold text-white mt-0.5">{employeeName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Employee ID</span>
                    <p className="font-mono text-indigo-400 font-bold mt-0.5">{employeeId}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Document Type</span>
                    <p className="font-semibold text-slate-200 mt-0.5">{previewDoc.documentType}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Date Issued</span>
                    <p className="text-slate-300 mt-0.5">
                      {new Date(previewDoc.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Document Body Content */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs space-y-3 leading-relaxed text-slate-300">
                  <h4 className="font-bold text-white text-sm pb-2 border-b border-slate-800">
                    {previewDoc.title}
                  </h4>
                  <p>
                    This certifies that the official record for{' '}
                    <strong className="text-white">{employeeName}</strong> (Employee ID:{' '}
                    <strong className="font-mono text-indigo-400">{employeeId}</strong>) has been formally
                    validated and archived in the corporate Human Resource Management System.
                  </p>
                  <p>{previewDoc.description || 'Verified official document on record with HR operations.'}</p>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
                    <p>• PDF Document Link: {previewDoc.fileUrl || 'https://pdfplaceholder.com/pdf/Annual+Report+2026.pdf'}</p>
                    <p>• Digital Hash: SHA-256 Verified Corporate Key</p>
                  </div>
                </div>

                {/* Signature & Seal */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                  <div>
                    <p className="font-semibold text-white">HRMS People Operations</p>
                    <p className="text-slate-500">Electronically Verified • Digitally Signed</p>
                  </div>
                  <div className="text-right font-mono text-[10px] text-emerald-400">
                    REF: SEC-VERIFIED-2026
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 2: UPLOAD DOCUMENT MODAL ================= */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Upload New Document</h2>
                  <p className="text-[11px] text-slate-400">Register verified certificates or credentials</p>
                </div>
              </div>

              <button
                onClick={() => setIsUploadOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  Document Title <strong className="text-indigo-400">*</strong>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master's Degree Certificate, Form 16 Part B..."
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Category</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 transition"
                  >
                    <option value="HR Letters">HR Letters</option>
                    <option value="Tax & Statutory">Tax & Statutory</option>
                    <option value="Education">Education</option>
                    <option value="Experience">Experience</option>
                    <option value="Personal & ID">Personal & ID</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">File Format</label>
                  <select
                    value={uploadForm.fileFormat}
                    onChange={(e) => setUploadForm({ ...uploadForm, fileFormat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 transition"
                  >
                    <option value="PDF">PDF (.pdf)</option>
                    <option value="PNG">PNG Image (.png)</option>
                    <option value="DOCX">Word (.docx)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Description / Issuing Authority</label>
                <textarea
                  rows={2}
                  placeholder="Optional notes or details regarding this document..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Confirm Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

