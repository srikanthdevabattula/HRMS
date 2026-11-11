import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchHolidays } from '../services/holidayService';
import { fetchLeaves } from '../services/leaveService';
import {
  X,
  CalendarCheck,
  AlertCircle,
  Calendar as CalendarIcon,
  FileText,
  Send,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
} from 'lucide-react';

const LEAVE_TYPES = [
  'Casual Leave',
  'Sick Leave',
  'Annual Leave',
  'Maternity / Paternity',
  'Unpaid Leave',
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatDateStr = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Apply Leave Modal Component
 * Features:
 * - Interactive leave date picker calendar
 * - Only present and upcoming dates are selectable
 * - Weekends (Saturday & Sunday) and Company Holidays are explicitly disabled
 * - Displays already applied leaves (Approved in orange, Pending in blue/indigo)
 * - Automatically computes working days requested (excluding weekends, holidays & already applied days)
 */
export default function ApplyLeaveModal({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
}) {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatDateStr(today), [today]);

  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [holidays, setHolidays] = useState([]);
  const [existingLeaves, setExistingLeaves] = useState([]);

  // Calendar month/year navigation (starts at current month)
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1); // 1-12
  const [hoveredDay, setHoveredDay] = useState(null);

  // Fetch holidays and existing leaves from backend when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        leaveType: 'Casual Leave',
        startDate: '',
        endDate: '',
        reason: '',
      });
      setError('');
      setCalYear(today.getFullYear());
      setCalMonth(today.getMonth() + 1);

      const empId = currentUser?.employeeId || currentUser?.id || '';
      const email = currentUser?.email || '';
      const empName = currentUser?.name || '';

      Promise.all([
        fetchHolidays().catch(() => []),
        fetchLeaves({ employeeId: empId, email, employeeName: empName }).catch(() => []),
      ]).then(([holidaysData, leavesData]) => {
        setHolidays(holidaysData || []);
        setExistingLeaves(leavesData || []);
      });
    }
  }, [isOpen, today, currentUser]);

  // Map of holiday date strings
  const holidayMap = useMemo(() => {
    const map = new Map();
    holidays.forEach((h) => {
      if (!h.date) return;
      const dStr = typeof h.date === 'string' ? h.date.slice(0, 10) : formatDateStr(h.date);
      map.set(dStr, h.title || 'Company Holiday');
    });
    return map;
  }, [holidays]);

  // Map of already applied leaves for this employee
  const existingLeaveMap = useMemo(() => {
    const map = new Map();
    existingLeaves.forEach((leave) => {
      // Only include Approved and Pending leaves (Rejected leaves don't block applying)
      if (leave.status !== 'Approved' && leave.status !== 'Pending') return;
      if (!leave.startDate || !leave.endDate) return;

      const startStr = typeof leave.startDate === 'string' ? leave.startDate.slice(0, 10) : formatDateStr(leave.startDate);
      const endStr = typeof leave.endDate === 'string' ? leave.endDate.slice(0, 10) : formatDateStr(leave.endDate);

      let curr = new Date(startStr + 'T00:00:00');
      const end = new Date(endStr + 'T00:00:00');
      while (curr <= end) {
        const dStr = formatDateStr(curr);
        map.set(dStr, {
          status: leave.status, // 'Approved' | 'Pending'
          leaveType: leave.leaveType,
          reason: leave.reason,
        });
        curr.setDate(curr.getDate() + 1);
      }
    });
    return map;
  }, [existingLeaves]);

  // Check if date is a weekend (Saturday or Sunday)
  const isWeekend = (dateObj) => {
    const day = dateObj.getDay();
    return day === 0 || day === 6;
  };

  // Calculate actual working days in selected range (excluding weekends, holidays & already applied days)
  const durationSummary = useMemo(() => {
    if (!formData.startDate) return { workingDays: 0, weekendDays: 0, holidayDays: 0, alreadyAppliedDays: 0 };

    const start = new Date(formData.startDate + 'T00:00:00');
    const end = formData.endDate ? new Date(formData.endDate + 'T00:00:00') : new Date(formData.startDate + 'T00:00:00');

    if (end < start) return { workingDays: 0, weekendDays: 0, holidayDays: 0, alreadyAppliedDays: 0 };

    let workingDays = 0;
    let weekendDays = 0;
    let holidayDays = 0;
    let alreadyAppliedDays = 0;

    let curr = new Date(start);
    while (curr <= end) {
      const dStr = formatDateStr(curr);
      if (isWeekend(curr)) {
        weekendDays++;
      } else if (holidayMap.has(dStr)) {
        holidayDays++;
      } else if (existingLeaveMap.has(dStr)) {
        alreadyAppliedDays++;
      } else {
        workingDays++;
      }
      curr.setDate(curr.getDate() + 1);
    }

    return { workingDays, weekendDays, holidayDays, alreadyAppliedDays };
  }, [formData.startDate, formData.endDate, holidayMap, existingLeaveMap]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    // Prevent navigating into past months
    const isCurrentMonthOrPast =
      calYear < today.getFullYear() ||
      (calYear === today.getFullYear() && calMonth <= today.getMonth() + 1);
    if (isCurrentMonthOrPast) return;

    if (calMonth === 1) {
      setCalYear((prev) => prev - 1);
      setCalMonth(12);
    } else {
      setCalMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 12) {
      setCalYear((prev) => prev + 1);
      setCalMonth(1);
    } else {
      setCalMonth((prev) => prev + 1);
    }
  };

  // Calendar click handler for selecting leave dates
  const handleDateClick = (dateStr, isDisabled) => {
    if (isDisabled) return;
    setError('');

    // If no start date or both start and end dates are already picked -> start new selection
    if (!formData.startDate || (formData.startDate && formData.endDate)) {
      setFormData((prev) => ({
        ...prev,
        startDate: dateStr,
        endDate: '',
      }));
    } else if (formData.startDate && !formData.endDate) {
      // If clicking date before start date -> reset start date
      if (dateStr < formData.startDate) {
        setFormData((prev) => ({
          ...prev,
          startDate: dateStr,
          endDate: '',
        }));
      } else {
        // Set end date
        setFormData((prev) => ({
          ...prev,
          endDate: dateStr,
        }));
      }
    }
  };

  if (!isOpen) return null;

  // Calendar calculations
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth - 1, 1).getDay();

  const isCurrentMonth = calYear === today.getFullYear() && calMonth === today.getMonth() + 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.startDate) {
      setError('Please select a leave start date from the calendar.');
      return;
    }
    const finalEndDate = formData.endDate || formData.startDate;

    if (durationSummary.workingDays === 0) {
      setError('The selected date range contains 0 new working days (only weekends, holidays, or already applied dates selected). Please choose available working days.');
      return;
    }

    if (!formData.reason.trim()) {
      setError('Please provide a reason for your leave request.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        employeeId: currentUser?.employeeId || currentUser?.id || 'EMP001',
        employeeName: currentUser?.name || 'Employee',
        employeeEmail: currentUser?.email || '',
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: finalEndDate,
        reason: formData.reason.trim(),
        days: durationSummary.workingDays,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit leave application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/25">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Apply for Leave</h2>
              <p className="text-[11px] text-slate-400">
                Select your time-off dates on the calendar (weekends, holidays & existing leaves are disabled)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Top Row: Applicant & Leave Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Applicant</label>
              <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                <span className="font-semibold text-white">{currentUser?.name || 'Employee'}</span>
                <span className="text-slate-500 text-[11px] ml-1.5 font-mono">({currentUser?.employeeId || 'EMP'})</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                Leave Type <strong className="text-amber-400">*</strong>
              </label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500 transition cursor-pointer"
              >
                {LEAVE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ================= INTERACTIVE LEAVE CALENDAR ================= */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
            {/* Calendar Header with Month Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-amber-400" />
                <span className="font-bold text-white text-xs">
                  Select Dates on Calendar
                </span>
                <span className="text-[10px] text-slate-400">
                  (Click start date, then end date)
                </span>
              </div>

              {/* Month Switcher (Present & Next months only) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  disabled={isCurrentMonth}
                  title="Previous month (past months disabled)"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-bold text-white min-w-[120px] text-center font-mono">
                  {MONTH_NAMES[calMonth - 1]} {calYear}
                </span>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  title="Next month"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Comprehensive Legend */}
            <div className="flex items-center gap-3 text-[10px] text-slate-400 flex-wrap pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded bg-emerald-500/20 border border-emerald-500/40" />
                <span>Selectable Working Day</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded bg-amber-600 border border-amber-400" />
                <span>Selected Range</span>
              </div>
              {/* Approved Leave (Already Applied) */}
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded bg-orange-500/30 border border-orange-500" />
                <span className="text-orange-300 font-medium">Approved Leave (Already Applied)</span>
              </div>
              {/* Pending Leave (Already Applied) */}
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded bg-indigo-500/30 border border-indigo-500" />
                <span className="text-indigo-300 font-medium">Applied Leave (Pending)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded bg-purple-500/20 border border-purple-500/40" />
                <span>Weekend (Disabled)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded bg-yellow-500/20 border border-yellow-500/40" />
                <span>Holiday (Disabled)</span>
              </div>
            </div>

            {/* Live Hover Inspection Strip */}
            <div className="min-h-[26px] flex items-center px-2 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] transition">
              {hoveredDay ? (
                hoveredDay.existingLeave ? (
                  <span className="flex items-center gap-1.5 text-orange-300 font-medium animate-fadeIn">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                    <strong>{hoveredDay.dateStr}</strong>: {hoveredDay.existingLeave.status === 'Approved' ? 'Approved Leave' : 'Applied Leave (Pending Approval)'} • {hoveredDay.existingLeave.leaveType} {hoveredDay.existingLeave.reason ? `("${hoveredDay.existingLeave.reason}")` : ''} (Already Applied — Disabled)
                  </span>
                ) : hoveredDay.isHol ? (
                  <span className="flex items-center gap-1.5 text-yellow-300 font-medium animate-fadeIn">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                    <strong>{hoveredDay.dateStr}</strong>: Company Holiday • {hoveredDay.holidayName} (Paid Day Off — Disabled)
                  </span>
                ) : hoveredDay.isWknd ? (
                  <span className="flex items-center gap-1.5 text-purple-300 font-medium animate-fadeIn">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                    <strong>{hoveredDay.dateStr}</strong>: Weekend Day Off (Saturday / Sunday — Disabled)
                  </span>
                ) : hoveredDay.isPast ? (
                  <span className="flex items-center gap-1.5 text-slate-400 animate-fadeIn">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                    <strong>{hoveredDay.dateStr}</strong>: Past Date (Disabled — Cannot apply for elapsed dates)
                  </span>
                ) : hoveredDay.isSelectedStart || hoveredDay.isSelectedEnd ? (
                  <span className="flex items-center gap-1.5 text-amber-300 font-bold animate-fadeIn">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <strong>{hoveredDay.dateStr}</strong>: {hoveredDay.isSelectedStart ? 'Start Date' : 'End Date'} of requested leave
                  </span>
                ) : hoveredDay.isInRange ? (
                  <span className="flex items-center gap-1.5 text-amber-300 animate-fadeIn">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <strong>{hoveredDay.dateStr}</strong>: Included in leave range
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-300 font-medium animate-fadeIn">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <strong>{hoveredDay.dateStr}</strong>: Available Working Day • Click to pick as {formData.startDate && !formData.endDate ? 'End Date' : 'Start Date'}
                  </span>
                )
              ) : (
                <span className="text-[10px] text-slate-500 italic">
                  Tip: Hover over any day to inspect details. Existing applied leaves, weekends, and holidays cannot be selected.
                </span>
              )}
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/80 pb-1.5">
              {DAYS_OF_WEEK.map((d, i) => (
                <div key={d} className={i === 0 || i === 6 ? 'text-purple-400/80 font-bold' : ''}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Blank offset days */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`blank-${i}`} className="h-10 rounded-lg bg-transparent" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dateObj = new Date(calYear, calMonth - 1, dayNum);

                const isPast = dateStr < todayStr;
                const isWknd = isWeekend(dateObj);
                const holidayName = holidayMap.get(dateStr);
                const isHol = !!holidayName;
                const existingLeave = existingLeaveMap.get(dateStr);
                const isAlreadyApplied = !!existingLeave;

                // Disabled condition: past dates, weekends, company holidays, or ALREADY applied leaves
                const isDisabled = isPast || isWknd || isHol || isAlreadyApplied;

                // Selection check
                const isSelectedStart = formData.startDate === dateStr;
                const isSelectedEnd = formData.endDate === dateStr;
                const isInRange =
                  formData.startDate &&
                  formData.endDate &&
                  dateStr > formData.startDate &&
                  dateStr < formData.endDate &&
                  !isWknd &&
                  !isHol &&
                  !isAlreadyApplied;

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDateClick(dateStr, isDisabled)}
                    onMouseEnter={() =>
                      setHoveredDay({
                        dateStr,
                        dayNum,
                        isPast,
                        isWknd,
                        isHol,
                        holidayName,
                        existingLeave,
                        isSelectedStart,
                        isSelectedEnd,
                        isInRange,
                      })
                    }
                    onMouseLeave={() => setHoveredDay(null)}
                    title={
                      existingLeave
                        ? `${existingLeave.status === 'Approved' ? 'Approved Leave' : 'Already Applied (Pending)'}: ${existingLeave.leaveType} (${existingLeave.reason || 'Leave'})`
                        : isHol
                        ? `Holiday: ${holidayName} (Paid Off Day - Disabled)`
                        : isWknd
                        ? 'Weekend Off Day (Disabled)'
                        : isPast
                        ? 'Past Date (Disabled)'
                        : `Select ${dateStr}`
                    }
                    className={`relative h-10 rounded-xl flex flex-col items-center justify-center transition text-xs font-semibold select-none ${
                      isSelectedStart || isSelectedEnd
                        ? 'bg-amber-600 text-white font-extrabold ring-2 ring-amber-400 shadow-md scale-105 z-10'
                        : isInRange
                        ? 'bg-amber-500/25 text-amber-200 border border-amber-500/40'
                        : existingLeave?.status === 'Approved'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 cursor-not-allowed opacity-90 shadow-xs'
                        : existingLeave?.status === 'Pending'
                        ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/45 cursor-not-allowed opacity-90 shadow-xs'
                        : isHol
                        ? 'bg-yellow-500/10 text-yellow-400/50 border border-yellow-500/20 cursor-not-allowed opacity-60'
                        : isWknd
                        ? 'bg-purple-500/10 text-purple-400/50 border border-purple-500/20 cursor-not-allowed opacity-60'
                        : isPast
                        ? 'bg-slate-950/40 text-slate-700 cursor-not-allowed border border-slate-900/60'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/50 cursor-pointer'
                    }`}
                  >
                    <span className="text-[11px] font-mono leading-none">{dayNum}</span>
                    <span className="text-[8px] font-bold uppercase tracking-tight leading-none mt-0.5 truncate max-w-full px-0.5">
                      {isSelectedStart
                        ? 'Start'
                        : isSelectedEnd
                        ? 'End'
                        : isInRange
                        ? 'Leave'
                        : existingLeave?.status === 'Approved'
                        ? 'Approved'
                        : existingLeave?.status === 'Pending'
                        ? 'Applied'
                        : isHol
                        ? 'Holiday'
                        : isWknd
                        ? 'Off'
                        : isPast
                        ? '—'
                        : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range Inputs & Dynamic Working Days Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                Start Date <strong className="text-amber-400">*</strong>
              </label>
              <input
                type="date"
                min={todayStr}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 transition text-xs font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                End Date (Optional for single day)
              </label>
              <input
                type="date"
                min={formData.startDate || todayStr}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 transition text-xs font-mono"
              />
            </div>
          </div>

          {/* Working Days Duration Badge */}
          {formData.startDate && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                <span>Working Days Requested:</span>
              </span>
              <div className="text-right">
                <span className="font-black text-sm text-white">
                  {durationSummary.workingDays} Working Day{durationSummary.workingDays !== 1 ? 's' : ''}
                </span>
                {(durationSummary.weekendDays > 0 || durationSummary.holidayDays > 0 || durationSummary.alreadyAppliedDays > 0) && (
                  <p className="text-[10px] text-amber-400/80">
                    ({[
                      durationSummary.alreadyAppliedDays > 0 ? `${durationSummary.alreadyAppliedDays} already applied` : null,
                      durationSummary.weekendDays > 0 ? `${durationSummary.weekendDays} weekend` : null,
                      durationSummary.holidayDays > 0 ? `${durationSummary.holidayDays} holiday` : null,
                    ].filter(Boolean).join(', ')} excluded)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-amber-400" />
              <span>Reason for Leave <strong className="text-amber-400">*</strong></span>
            </label>
            <textarea
              rows={2}
              placeholder="Please provide details for your time-off request..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-amber-500 transition resize-none text-xs"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || durationSummary.workingDays === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold transition cursor-pointer shadow-lg shadow-amber-600/30 disabled:opacity-50 text-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
