import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchLeaves,
  applyLeaveApi,
  updateLeaveStatusApi,
  cancelLeaveApi,
} from '../services/leaveService';
import { getAuthUser } from '../services/api';
import ApplyLeaveModal from '../components/ApplyLeaveModal';
import ConfirmModal from '../components/ConfirmModal';
import {
  CalendarCheck,
  Plus,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Filter,
  History,
  RotateCcw,
} from 'lucide-react';

/**
 * Leaves Management View
 *
 * Role behavior:
 * - Employee: Views personal leaves filtered by [Pending, Approved, History].
 *   Can submit new leave applications.
 *   Can Cancel / Revert leaves in Pending or Approved states.
 * - Admin: Views all employee leave requests. Can Approve or Reject pending requests.
 *   Explicitly has NO delete option and NO apply leave option.
 */
export default function LeavesView({ initialFilter = null }) {
  const currentUser = getAuthUser() || { name: 'Admin', role: 'admin' };
  const isEmployee = currentUser.role === 'employee';

  // Extract primitive strings to prevent infinite render loops
  const employeeId = currentUser.employeeId || currentUser.id || '';
  const employeeEmail = currentUser.email || '';

  // Default active filter tab
  const [activeFilter, setActiveFilter] = useState(
    initialFilter || (isEmployee ? 'Pending' : 'All')
  );

  const [leaves, setLeaves] = useState([]);
  const [allEmployeeLeaves, setAllEmployeeLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Apply Leave Modal state (Employee only)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Revert / Cancel Leave confirmation modal state (Employee only)
  const [cancelModalLeave, setCancelModalLeave] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Sync initialFilter prop if it changes from sidebar navigation
  useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
    }
  }, [initialFilter]);

  // Load leaves with role-based filtering
  const loadLeaves = useCallback(async () => {
    setLoading(true);
    try {
      if (isEmployee) {
        // For employee, fetch all their personal leave records to keep badge counts synchronized
        const filters = {
          employeeId,
          email: employeeEmail,
        };
        if (currentUser?.name) {
          filters.employeeName = currentUser.name;
        }

        const data = await fetchLeaves(filters);
        setAllEmployeeLeaves(data);
      } else {
        // Admin views all employees with status filter
        const filters = {};
        if (activeFilter !== 'All') {
          filters.status = activeFilter;
        }
        const data = await fetchLeaves(filters);
        setLeaves(data);
      }
    } catch (err) {
      console.warn('Failed to load leaves:', err.message);
      if (isEmployee) {
        setAllEmployeeLeaves([]);
      } else {
        setLeaves([]);
      }
    } finally {
      setLoading(false);
    }
  }, [activeFilter, isEmployee, employeeId, employeeEmail, currentUser?.name]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  // Admin action: Approve or Reject a leave application
  const handleStatusChange = async (leaveId, newStatus) => {
    try {
      await updateLeaveStatusApi(leaveId, newStatus);
      setFeedback({
        type: 'success',
        message: `Leave application marked as ${newStatus}!`,
      });
      await loadLeaves();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update leave status.',
      });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Employee action: Initiate leave cancellation (Opens Confirm UI Modal)
  const handlePromptCancel = (leaveItem) => {
    setCancelModalLeave(leaveItem);
  };

  // Employee action: Confirm leave cancellation
  const handleConfirmCancel = async () => {
    if (!cancelModalLeave) return;
    setCancelLoading(true);
    try {
      await cancelLeaveApi(cancelModalLeave._id);
      setFeedback({
        type: 'success',
        message: `Leave application (${cancelModalLeave.leaveType}) was successfully cancelled/reverted.`,
      });
      setCancelModalLeave(null);
      await loadLeaves();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to cancel leave application.',
      });
    } finally {
      setCancelLoading(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Employee action: Submit leave application
  const handleApplyLeaveSubmit = async (formData) => {
    await applyLeaveApi(formData);
    setFeedback({
      type: 'success',
      message: 'Leave application submitted successfully! It is now pending review.',
    });
    // Switch to Pending filter to see newly submitted request
    setActiveFilter('Pending');
    await loadLeaves();
    setTimeout(() => setFeedback(null), 5000);
  };

  // Derived displayed leaves list for Employee vs Admin
  const displayedLeaves = useMemo(() => {
    if (!isEmployee) return leaves;

    if (activeFilter === 'Pending') {
      return allEmployeeLeaves.filter((l) => l.status === 'Pending');
    }
    if (activeFilter === 'Approved') {
      return allEmployeeLeaves.filter((l) => l.status === 'Approved');
    }
    // 'History' shows all statuses (Pending, Approved, Rejected, Cancelled)
    return allEmployeeLeaves;
  }, [isEmployee, leaves, allEmployeeLeaves, activeFilter]);

  // Compute live counts
  const pendingCount = useMemo(() => {
    return isEmployee
      ? allEmployeeLeaves.filter((l) => l.status === 'Pending').length
      : leaves.filter((l) => l.status === 'Pending').length;
  }, [isEmployee, allEmployeeLeaves, leaves]);

  const approvedCount = useMemo(() => {
    return isEmployee
      ? allEmployeeLeaves.filter((l) => l.status === 'Approved').length
      : leaves.filter((l) => l.status === 'Approved').length;
  }, [isEmployee, allEmployeeLeaves, leaves]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <CalendarCheck className="h-6 w-6 text-amber-400" />
            <span>{isEmployee ? 'My Leaves' : 'Leave Management'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isEmployee
              ? 'Apply for time off and track your approval status and leave history.'
              : 'Review employee time-off requests, approve or reject applications.'}
          </p>
        </div>

        {/* Action Controls: Apply Leave is ONLY for Employees; Admin cannot apply */}
        <div className="flex items-center gap-2.5">
          {isEmployee && (
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Apply for Leave</span>
            </button>
          )}

          <button
            onClick={loadLeaves}
            title="Refresh leaves"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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

      {/* Navigation Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isEmployee ? (
            // Employee Filter Tabs: Pending, Approved, History
            <>
              <button
                onClick={() => setActiveFilter('Pending')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeFilter === 'Pending'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>Pending</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveFilter('Approved')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeFilter === 'Approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Approved</span>
                {approvedCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px]">
                    {approvedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveFilter('History')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeFilter === 'History'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <History className="h-3.5 w-3.5 text-indigo-400" />
                <span>History</span>
              </button>
            </>
          ) : (
            // Admin Filter Tabs: All, Pending, Approved, Rejected
            ['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeFilter === status
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {status}
              </button>
            ))
          )}
        </div>

        <span className="text-xs text-slate-400 px-2 font-mono">
          {displayedLeaves.length} Request{displayedLeaves.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Leaves Records Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                {!isEmployee && <th className="py-3.5 px-4">Employee</th>}
                <th className="py-3.5 px-4">Leave Type</th>
                <th className="py-3.5 px-4">Duration & Dates</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                {isEmployee && <th className="py-3.5 px-4">Remarks</th>}
                <th className="py-3.5 px-4 text-right">
                  {isEmployee ? 'Action' : 'Review Action'}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-amber-500 mb-2" />
                    <span>Loading leave records...</span>
                  </td>
                </tr>
              ) : displayedLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 space-y-2">
                    <CalendarCheck className="h-8 w-8 mx-auto text-slate-600 opacity-60" />
                    <p className="text-sm font-medium text-slate-400">
                      No {activeFilter !== 'All' && activeFilter !== 'History' ? activeFilter.toLowerCase() : ''} leave applications found
                    </p>
                    {isEmployee && (
                      <p className="text-xs text-slate-500">
                        Click "+ Apply for Leave" to submit a time-off request.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                displayedLeaves.map((item) => {
                  const startStr = new Date(item.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const endStr = new Date(item.endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={item._id} className="hover:bg-slate-800/40 transition">
                      {/* Employee (Shown on Admin side) */}
                      {!isEmployee && (
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white font-bold flex items-center justify-center text-xs shadow-md shrink-0">
                              {item.employeeName?.[0] || 'E'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-100">{item.employeeName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {item.employeeId} {item.employeeEmail ? `• ${item.employeeEmail}` : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Leave Type */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            item.leaveType === 'Annual Leave'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : item.leaveType === 'Sick Leave'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {item.leaveType}
                        </span>
                      </td>

                      {/* Duration & Dates */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-200">
                          {startStr} – {endStr}
                        </p>
                        <p className="text-[10px] text-slate-400">{item.days} day(s)</p>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-300 truncate" title={item.reason}>
                          {item.reason}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : item.status === 'Pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : item.status === 'Cancelled'
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.status === 'Approved'
                                ? 'bg-emerald-400'
                                : item.status === 'Pending'
                                ? 'bg-amber-400 animate-pulse'
                                : item.status === 'Cancelled'
                                ? 'bg-slate-500'
                                : 'bg-rose-400'
                            }`}
                          />
                          {item.status}
                        </span>
                      </td>

                      {/* Employee Remarks Column */}
                      {isEmployee && (
                        <td className="py-3.5 px-4 text-[11px] text-slate-400">
                          {item.status === 'Approved' ? (
                            <span className="text-emerald-400 font-medium">Approved by Management</span>
                          ) : item.status === 'Pending' ? (
                            <span className="text-amber-400 font-medium">Under Review</span>
                          ) : item.status === 'Cancelled' ? (
                            <span className="text-slate-400 font-medium">Cancelled by Employee</span>
                          ) : (
                            <span className="text-rose-400 font-medium">{item.reviewedBy || 'Application Rejected'}</span>
                          )}
                        </td>
                      )}

                      {/* Actions Column */}
                      {!isEmployee ? (
                        // Admin Review Action: Approve or Reject (NO delete button on admin side!)
                        <td className="py-3.5 px-4 text-right">
                          {item.status === 'Pending' ? (
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                onClick={() => handleStatusChange(item._id, 'Approved')}
                                title="Approve Leave"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500 hover:text-white transition cursor-pointer border border-emerald-500/30 text-[11px] font-semibold"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleStatusChange(item._id, 'Rejected')}
                                title="Reject Leave"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500 hover:text-white transition cursor-pointer border border-rose-500/30 text-[11px] font-semibold"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              {item.reviewedBy ? `Reviewed: ${item.reviewedBy}` : 'Completed'}
                            </span>
                          )}
                        </td>
                      ) : (
                        // Employee Action: Revert leave (allowed in Pending or Approved state)
                        <td className="py-3.5 px-4 text-right">
                          {item.status === 'Approved' ? (
                            <button
                              onClick={() => handlePromptCancel(item)}
                              title="Revert / Cancel this approved leave"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white transition cursor-pointer border border-rose-500/25 text-xs font-semibold shadow-xs"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Revert Leave</span>
                            </button>
                          ) : item.status === 'Pending' ? (
                            <button
                              onClick={() => handlePromptCancel(item)}
                              title="Cancel / Withdraw this pending leave request"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-rose-500 hover:text-white transition cursor-pointer border border-slate-700 hover:border-rose-500/30 text-xs font-semibold shadow-xs"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Cancel Request</span>
                            </button>
                          ) : item.status === 'Cancelled' ? (
                            <span className="text-[11px] text-slate-500 italic">Reverted</span>
                          ) : (
                            <span className="text-[11px] text-slate-500">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal (For Employees) */}
      {isEmployee && (
        <ApplyLeaveModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onSubmit={handleApplyLeaveSubmit}
          currentUser={currentUser}
        />
      )}

      {/* Confirmation UI Modal for Cancelling / Reverting Leave (NO window.confirm!) */}
      <ConfirmModal
        isOpen={!!cancelModalLeave}
        onClose={() => setCancelModalLeave(null)}
        onConfirm={handleConfirmCancel}
        loading={cancelLoading}
        danger={true}
        title={
          cancelModalLeave?.status === 'Approved'
            ? 'Revert Approved Leave?'
            : 'Cancel Leave Application?'
        }
        message={
          cancelModalLeave
            ? `Are you sure you want to ${
                cancelModalLeave.status === 'Approved' ? 'revert' : 'cancel'
              } your ${cancelModalLeave.leaveType} for ${new Date(
                cancelModalLeave.startDate
              ).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })} – ${new Date(cancelModalLeave.endDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })} (${cancelModalLeave.days} day(s))? These dates will be released and marked as available on your calendar.`
            : ''
        }
        confirmText={
          cancelModalLeave?.status === 'Approved'
            ? 'Yes, Revert Leave'
            : 'Yes, Cancel Request'
        }
        cancelText="Keep Leave"
      />
    </div>
  );
}
