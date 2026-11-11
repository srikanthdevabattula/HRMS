import React, { useState, useEffect } from 'react';
import { createAdjustmentApi } from '../services/attendanceService';
import {
  X,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Send,
  Timer,
  Info,
} from 'lucide-react';

/**
 * Format Time string helper
 */
const formatTimeStr = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

/**
 * Attendance Adjustment Modal Component
 * Allows employees to request attendance adjustments for present or past shift dates.
 */
export default function AttendanceAdjustmentModal({
  isOpen,
  onClose,
  targetDay,
  currentUser,
  onSuccess,
}) {
  const [inTimeStr, setInTimeStr] = useState('09:00');
  const [outTimeStr, setOutTimeStr] = useState('17:30');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Set default times when modal opens
  useEffect(() => {
    if (isOpen) {
      setInTimeStr('09:00');
      setOutTimeStr('17:30');
      setReason('');
      setErrorMsg(null);
    }
  }, [isOpen, targetDay]);

  if (!isOpen || !targetDay) return null;

  // Calculate duration in hours based on input times
  const computeDurationHours = () => {
    if (!inTimeStr || !outTimeStr) return 0;
    const [inH, inM] = inTimeStr.split(':').map(Number);
    const [outH, outM] = outTimeStr.split(':').map(Number);
    const inTotalMinutes = inH * 60 + inM;
    const outTotalMinutes = outH * 60 + outM;
    if (outTotalMinutes <= inTotalMinutes) return 0;
    const diff = (outTotalMinutes - inTotalMinutes) / 60;
    return Number(diff.toFixed(2));
  };

  const calculatedHours = computeDurationHours();
  const isValidDuration = calculatedHours > 0;
  const isTargetAchieved = calculatedHours >= 8.0;

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidDuration) {
      setErrorMsg('Check-out time must be later than check-in time.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Please provide a reason for the adjustment request.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const fullInIso = new Date(`${targetDay.dateStr}T${inTimeStr}:00`).toISOString();
      const fullOutIso = new Date(`${targetDay.dateStr}T${outTimeStr}:00`).toISOString();

      await createAdjustmentApi({
        employeeId: currentUser?.employeeId || currentUser?.id,
        email: currentUser?.email,
        date: targetDay.dateStr,
        adjustedCheckIn: fullInIso,
        adjustedCheckOut: fullOutIso,
        reason: reason.trim(),
      });

      if (onSuccess) {
        onSuccess(`Adjustment request submitted for ${targetDay.dateStr}! Awaiting Admin approval.`);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit adjustment request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Request Attendance Adjustment</h3>
              <p className="text-[11px] text-slate-400">
                Shift Date: <strong className="text-white font-mono">{targetDay.dateStr}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Existing Shift Summary Card */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Current Recorded Shift
          </span>
          <div className="flex items-center justify-between text-slate-200">
            <div>
              {targetDay.checkIn ? (
                <p className="font-mono text-slate-300">
                  Punch: {formatTimeStr(targetDay.checkIn)} – {formatTimeStr(targetDay.checkOut)}
                </p>
              ) : (
                <p className="text-rose-400 font-semibold">No check-in recorded (Absent / Missed)</p>
              )}
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                targetDay.hours >= 8.0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {targetDay.hours !== undefined ? `${targetDay.hours}h Logged` : '0h Logged'}
            </span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Adjustment Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Time pickers row */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                <span>Adjusted Check-in *</span>
              </label>
              <input
                type="time"
                value={inTimeStr}
                onChange={(e) => setInTimeStr(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs outline-none focus:border-indigo-500 transition cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                <span>Adjusted Check-out *</span>
              </label>
              <input
                type="time"
                value={outTimeStr}
                onChange={(e) => setOutTimeStr(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs outline-none focus:border-indigo-500 transition cursor-pointer"
              />
            </div>
          </div>

          {/* Calculated Duration Preview */}
          <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1.5">
              <Timer className="h-4 w-4 text-indigo-400" />
              <span>Requested Shift Duration:</span>
            </span>
            <span
              className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
                isTargetAchieved
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {calculatedHours}h {isTargetAchieved ? '(8h Complete)' : '(< 8h Short)'}
            </span>
          </div>

          {/* Reason textarea */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Reason for Adjustment *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain the reason (e.g. forgot to check out before client meeting, system outage, field work)..."
              rows={3}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500 transition resize-none placeholder:text-slate-600"
            />
          </div>

          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <Info className="h-3 w-3 shrink-0" />
            <span>
              Once submitted, your request is sent to Admin for review. Upon approval, your attendance record in the database will be updated.
            </span>
          </p>

          {/* Action buttons */}
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValidDuration || !reason.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

