import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchAdjustmentsApi,
  approveAdjustmentApi,
  rejectAdjustmentApi,
} from '../services/attendanceService';
import ConfirmModal from '../components/ConfirmModal';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  Check,
  X,
  User,
  Building,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const TABS = [
  { id: 'Pending', label: 'Pending Review' },
  { id: 'Approved', label: 'Approved' },
  { id: 'Rejected', label: 'Rejected' },
  { id: 'All', label: 'All Requests' },
];

/**
 * Helper to format ISO time string to 12-hour AM/PM format
 */
const formatTime = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

/**
 * Format Date string (e.g. Nov 11, 2026)
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Admin Attendance Adjustments View
 * Allows HR / Admin to review, approve, or reject employee shift adjustments.
 * Approvals automatically update attendance records in MongoDB.
 */
export default function AdminAdjustmentsView() {
  const [adjustments, setAdjustments] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [activeTab, setActiveTab] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Action states for Approval/Rejection
  const [selectedForAction, setSelectedForAction] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Load adjustments
  const loadAdjustments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdjustmentsApi({ status: activeTab });
      setAdjustments(res.data || []);
      setSummary(res.summary || { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      console.warn('Failed to load adjustments:', err.message);
      setAdjustments([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadAdjustments();
  }, [loadAdjustments]);

  // Handle Approve
  const handleApprove = async () => {
    if (!selectedForAction) return;
    setIsSubmittingAction(true);
    try {
      await approveAdjustmentApi(selectedForAction._id, {
        reviewedBy: 'Admin',
      });
      setFeedback({
        type: 'success',
        message: `Adjustment for ${selectedForAction.employeeName} approved! Attendance record updated.`,
      });
      setSelectedForAction(null);
      setActionType(null);
      await loadAdjustments();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to approve adjustment.' });
    } finally {
      setIsSubmittingAction(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!selectedForAction) return;
    setIsSubmittingAction(true);
    try {
      await rejectAdjustmentApi(
        selectedForAction._id,
        rejectReason || 'Adjusted hours not approved by HR'
      );
      setFeedback({
        type: 'success',
        message: `Adjustment for ${selectedForAction.employeeName} rejected.`,
      });
      setSelectedForAction(null);
      setActionType(null);
      setRejectReason('');
      await loadAdjustments();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to reject adjustment.' });
    } finally {
      setIsSubmittingAction(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Clock className="h-6 w-6 text-indigo-400" />
            <span>Attendance Adjustments</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review and authenticate employee shift adjustment requests. Approved adjustments automatically
            update database attendance records.
          </p>
        </div>

        <button
          onClick={loadAdjustments}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Total Requests
          </span>
          <p className="mt-1 text-2xl font-extrabold text-white">{summary.total}</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
            Pending Review
          </span>
          <p className="mt-1 text-2xl font-extrabold text-amber-400">{summary.pending}</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            Approved Adjustments
          </span>
          <p className="mt-1 text-2xl font-extrabold text-emerald-400">{summary.approved}</p>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400">
            Rejected
          </span>
          <p className="mt-1 text-2xl font-extrabold text-rose-400">{summary.rejected}</p>
        </div>
      </div>

      {/* Feedback Toast */}
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

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        {TABS.map((tab) => {
          const count =
            tab.id === 'Pending'
              ? summary.pending
              : tab.id === 'Approved'
              ? summary.approved
              : tab.id === 'Rejected'
              ? summary.rejected
              : summary.total;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Adjustments Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Shift Date</th>
                <th className="py-3.5 px-4">Original Recorded</th>
                <th className="py-3.5 px-4">Requested Adjustment</th>
                <th className="py-3.5 px-4">Reason for Request</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-500 mb-2" />
                    <span>Loading adjustment requests...</span>
                  </td>
                </tr>
              ) : adjustments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 space-y-2">
                    <Clock className="h-8 w-8 mx-auto text-slate-600 opacity-60" />
                    <p className="text-sm font-medium text-slate-400">
                      No {activeTab.toLowerCase()} adjustment requests found
                    </p>
                    <p className="text-xs text-slate-500">
                      When employees submit shift adjustments, they appear here for your approval.
                    </p>
                  </td>
                </tr>
              ) : (
                adjustments.map((adj) => (
                  <tr key={adj._id} className="hover:bg-slate-800/40 transition">
                    {/* Employee */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-md shrink-0">
                          {adj.employeeName?.[0] || 'E'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">{adj.employeeName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {adj.employeeId} • <span className="text-slate-300">{adj.department}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Shift Date */}
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {formatDate(adj.date)}
                    </td>

                    {/* Original Recorded */}
                    <td className="py-3.5 px-4">
                      {adj.originalCheckIn ? (
                        <div className="space-y-0.5">
                          <p className="text-slate-300 font-mono">
                            {formatTime(adj.originalCheckIn)} – {formatTime(adj.originalCheckOut)}
                          </p>
                          <span className="inline-block text-[10px] font-semibold text-amber-400">
                            Logged: {adj.originalHours}h
                          </span>
                        </div>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Absent / No punch
                        </span>
                      )}
                    </td>

                    {/* Requested Adjustment */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="text-emerald-400 font-mono font-bold">
                          {formatTime(adj.adjustedCheckIn)} – {formatTime(adj.adjustedCheckOut)}
                        </p>
                        <span className="inline-block text-[10px] font-semibold text-emerald-400/90">
                          Target: {adj.adjustedHours}h ({adj.adjustedHours >= 8.0 ? 'Full Day' : 'Short Hours'})
                        </span>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-300 text-xs italic bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                        "{adj.reason}"
                      </p>
                      {adj.adminRemarks && (
                        <p className="text-[10px] text-slate-500 mt-1">
                          Remarks: <strong className="text-slate-400">{adj.adminRemarks}</strong>
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          adj.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : adj.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            adj.status === 'Approved'
                              ? 'bg-emerald-400'
                              : adj.status === 'Pending'
                              ? 'bg-amber-400 animate-pulse'
                              : 'bg-rose-400'
                          }`}
                        />
                        <span>{adj.status === 'Pending' ? 'Requested Adjustment' : adj.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {adj.status === 'Pending' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedForAction(adj);
                              setActionType('approve');
                            }}
                            title="Approve Adjustment"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer text-xs shadow-md shadow-emerald-600/20"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedForAction(adj);
                              setActionType('reject');
                            }}
                            title="Reject Adjustment"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold transition cursor-pointer text-xs border border-rose-500/30"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          Reviewed {adj.reviewedAt ? new Date(adj.reviewedAt).toLocaleDateString() : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      {actionType === 'approve' && selectedForAction && (
        <ConfirmModal
          isOpen={true}
          title="Approve Attendance Adjustment?"
          message={`Are you sure you want to approve the adjustment for ${selectedForAction.employeeName} on ${formatDate(selectedForAction.date)}? This will update the check-in time to ${formatTime(selectedForAction.adjustedCheckIn)} and check-out to ${formatTime(selectedForAction.adjustedCheckOut)} (${selectedForAction.adjustedHours}h) in the database.`}
          confirmText={isSubmittingAction ? 'Approving...' : 'Approve & Update DB'}
          cancelText="Cancel"
          confirmVariant="primary"
          onConfirm={handleApprove}
          onCancel={() => {
            setSelectedForAction(null);
            setActionType(null);
          }}
        />
      )}

      {/* Reject Modal with Remarks */}
      {actionType === 'reject' && selectedForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-400" />
                <span>Reject Adjustment Request</span>
              </h3>
              <button
                onClick={() => {
                  setSelectedForAction(null);
                  setActionType(null);
                  setRejectReason('');
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Provide a reason for rejecting the adjustment for{' '}
              <strong className="text-white">{selectedForAction.employeeName}</strong> on{' '}
              {formatDate(selectedForAction.date)}.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete punch hours not supported by supervisor log..."
              rows={3}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-rose-500 resize-none"
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  setSelectedForAction(null);
                  setActionType(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isSubmittingAction}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer disabled:opacity-50"
              >
                {isSubmittingAction ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

