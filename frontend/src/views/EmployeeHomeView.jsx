import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchTodayAttendance,
  checkInApi,
  checkOutApi,
  fetchCalendarAttendance,
  fetchAdjustmentsApi,
} from '../services/attendanceService';
import AttendanceAdjustmentModal from '../components/AttendanceAdjustmentModal';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  CalendarCheck,
  Palmtree,
  Coffee,
  XCircle,
  Timer,
  Award,
  Send,
  Plus,
  RefreshCw,
} from 'lucide-react';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Format Date helper (YYYY-MM-DD)
 */
const formatDateStr = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format Time string helper (e.g. 09:15 AM)
 */
const formatTimeStr = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

/**
 * Employee Home View
 * Features:
 * - Real-time Check-In / Check-Out Widget with Daily Goal tracker
 * - Monthly Attendance Calendar with distinct Amber for Short Hours (<8h), Green for Full Day (>=8h)
 * - Click-to-Adjust on present or past dates with "Requested Adjustment" status
 * - Dedicated Tabs for "Shift Tracker & Calendar" and "Attendance Adjustments"
 */
export default function EmployeeHomeView({ currentUser, onNavigateToLeaves }) {
  const employeeId = currentUser?.employeeId || currentUser?.id || '';
  const employeeEmail = currentUser?.email || '';

  // Top View Tab: 'calendar' | 'adjustments'
  const [activeMainTab, setActiveMainTab] = useState('calendar');

  // Current Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Today's attendance state
  const [todayData, setTodayData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Calendar Navigation (Year & Month: 1-indexed)
  const today = useMemo(() => new Date(), []);
  const todayDateStr = useMemo(() => formatDateStr(today), [today]);

  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1); // 1-12
  const [calLoading, setCalLoading] = useState(false);

  // Consolidated calendar data from API
  const [calendarData, setCalendarData] = useState({
    attendance: [],
    holidays: [],
    leaves: [],
    adjustments: [],
  });

  // Selected date for detailed card view
  const [selectedDay, setSelectedDay] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);

  // Attendance Adjustment Modal State
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [adjustmentTargetDay, setAdjustmentTargetDay] = useState(null);

  // Adjustments List State for "Attendance Adjustments" Tab
  const [adjustmentsList, setAdjustmentsList] = useState([]);
  const [adjFilter, setAdjFilter] = useState('All');
  const [adjLoading, setAdjLoading] = useState(false);

  // Ticking Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Load Today's Attendance Record
  const loadTodayData = useCallback(async () => {
    try {
      const res = await fetchTodayAttendance({ employeeId, email: employeeEmail });
      if (res && res.data) {
        setTodayData(res.data);
      } else {
        setTodayData(null);
      }
    } catch (err) {
      console.warn('Today attendance fetch error:', err.message);
    }
  }, [employeeId, employeeEmail]);

  // 2. Load Calendar Data for selected Year & Month
  const loadCalendar = useCallback(async () => {
    setCalLoading(true);
    try {
      const res = await fetchCalendarAttendance({
        employeeId,
        email: employeeEmail,
        year: calYear,
        month: calMonth,
      });

      if (res) {
        setCalendarData({
          attendance: res.attendance || [],
          holidays: res.holidays || [],
          leaves: res.leaves || [],
          adjustments: res.adjustments || [],
        });
      }
    } catch (err) {
      console.warn('Calendar attendance fetch error:', err.message);
    } finally {
      setCalLoading(false);
    }
  }, [employeeId, employeeEmail, calYear, calMonth]);

  // 3. Load Employee's Adjustments List
  const loadAdjustments = useCallback(async () => {
    setAdjLoading(true);
    try {
      const res = await fetchAdjustmentsApi({
        employeeId,
        email: employeeEmail,
        status: adjFilter,
      });
      setAdjustmentsList(res.data || []);
    } catch (err) {
      console.warn('Adjustments fetch error:', err.message);
      setAdjustmentsList([]);
    } finally {
      setAdjLoading(false);
    }
  }, [employeeId, employeeEmail, adjFilter]);

  useEffect(() => {
    loadTodayData();
  }, [loadTodayData]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  useEffect(() => {
    if (activeMainTab === 'adjustments') {
      loadAdjustments();
    }
  }, [activeMainTab, loadAdjustments]);

  // Handle Check-in Action
  const handleCheckIn = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await checkInApi({ employeeId, email: employeeEmail });
      setFeedback({ type: 'success', message: res.message || 'Checked in successfully!' });
      await loadTodayData();
      await loadCalendar();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to check in.' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Handle Check-out Action
  const handleCheckOut = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await checkOutApi({ employeeId, email: employeeEmail });
      setFeedback({ type: 'success', message: res.message || 'Checked out successfully!' });
      await loadTodayData();
      await loadCalendar();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to check out.' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Calendar Month Navigation
  const handlePrevMonth = () => {
    if (calMonth === 1) {
      setCalMonth(12);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 12) {
      setCalMonth(1);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setCalYear(today.getFullYear());
    setCalMonth(today.getMonth() + 1);
  };

  // Calculate live work duration if currently checked in
  const liveHoursWorked = useMemo(() => {
    if (!todayData?.checkIn) return 0;
    if (todayData?.checkOut) return todayData.workHours || 0;
    const diffMs = currentTime - new Date(todayData.checkIn);
    const hours = Math.max(0, diffMs / (1000 * 60 * 60));
    return Number(hours.toFixed(2));
  }, [todayData, currentTime]);

  const targetHours = 8.0;
  const progressPercent = Math.min(100, Math.round((liveHoursWorked / targetHours) * 100));
  const isTargetAchieved = liveHoursWorked >= targetHours;

  // Calendar Days Grid Construction
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth - 1, 1).getDay(); // 0 = Sun

  // Count pending adjustments
  const pendingAdjustmentsCount = useMemo(() => {
    return (calendarData.adjustments || []).filter((a) => a.status === 'Pending').length;
  }, [calendarData.adjustments]);

  // Helper to determine status and colors for any calendar date
  const getDayDetails = useCallback(
    (dayNum) => {
      const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dObj = new Date(calYear, calMonth - 1, dayNum);
      const dayOfWeek = dObj.getDay(); // 0 = Sun, 6 = Sat
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isToday = dateStr === todayDateStr;
      const isPast = dateStr < todayDateStr;

      // 1. Check if an Attendance Adjustment was requested for this date
      const pendingAdj = (calendarData.adjustments || []).find(
        (a) => a.date === dateStr && a.status === 'Pending'
      );
      if (pendingAdj) {
        return {
          dateStr,
          dayNum,
          dayOfWeek,
          type: 'adjustment_requested',
          label: 'Requested Adjustment',
          hours: pendingAdj.adjustedHours,
          checkIn: pendingAdj.adjustedCheckIn,
          checkOut: pendingAdj.adjustedCheckOut,
          colorClass: 'bg-indigo-500/25 text-indigo-200 border-indigo-500/60 ring-1 ring-indigo-400/40 hover:bg-indigo-500/35',
          dotColor: 'bg-indigo-400 animate-pulse',
          adjustment: pendingAdj,
          tooltip: `Requested Adjustment (${pendingAdj.adjustedHours}h): In at ${formatTimeStr(pendingAdj.adjustedCheckIn)} | Out at ${formatTimeStr(pendingAdj.adjustedCheckOut)} • Awaiting Admin Approval`,
        };
      }

      // 2. Check Attendance Record
      const att = calendarData.attendance.find((a) => a.date === dateStr);
      if (att) {
        if (att.checkIn && !att.checkOut && isToday) {
          return {
            dateStr,
            dayNum,
            dayOfWeek,
            type: 'in_progress',
            label: 'Checked In',
            hours: liveHoursWorked,
            checkIn: att.checkIn,
            checkOut: null,
            colorClass: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-400 animate-pulse',
            dotColor: 'bg-emerald-400 animate-ping',
            tooltip: `Currently Checked In at ${formatTimeStr(att.checkIn)} • Logged: ${liveHoursWorked}h / 8h (Click to Request Adjustment)`,
          };
        }
        if (att.workHours >= 8.0) {
          return {
            dateStr,
            dayNum,
            dayOfWeek,
            type: 'present',
            label: 'Present (Full Day)',
            hours: att.workHours,
            checkIn: att.checkIn,
            checkOut: att.checkOut,
            colorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30',
            dotColor: 'bg-emerald-400',
            tooltip: `Present: ${att.workHours}h • In: ${formatTimeStr(att.checkIn)} | Out: ${formatTimeStr(att.checkOut)} (8h completed • Click to Adjust)`,
          };
        }
        if (att.workHours > 0 && att.workHours < 8.0) {
          const shortDiff = Number((8.0 - att.workHours).toFixed(1));
          return {
            dateStr,
            dayNum,
            dayOfWeek,
            type: 'short',
            label: `Short Hours (${att.workHours}h)`,
            hours: att.workHours,
            checkIn: att.checkIn,
            checkOut: att.checkOut,
            // Distinct Warm Amber/Gold - completely distinguishable from Green
            colorClass: 'bg-amber-500/25 text-amber-200 border-amber-500/60 ring-1 ring-amber-500/30 hover:bg-amber-500/35',
            dotColor: 'bg-amber-400',
            tooltip: `Short Hours: ${att.workHours}h (< 8h) • In: ${formatTimeStr(att.checkIn)} | Out: ${formatTimeStr(att.checkOut)} • Short by ${shortDiff}h (Click to Request Adjustment)`,
          };
        }
      }

      // 3. Check Holiday
      const holiday = calendarData.holidays.find((h) => {
        if (!h.date) return false;
        const hStr = typeof h.date === 'string' ? h.date.slice(0, 10) : formatDateStr(h.date);
        return hStr === dateStr;
      });
      if (holiday) {
        return {
          dateStr,
          dayNum,
          dayOfWeek,
          type: 'holiday',
          label: `Holiday: ${holiday.title}`,
          colorClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 hover:bg-yellow-500/30',
          dotColor: 'bg-yellow-400',
          tooltip: `Holiday: ${holiday.title} (${holiday.type || 'Company Holiday'}) - Paid Day Off`,
        };
      }

      // 4. Check Leaves (Approved vs Applied/Pending)
      for (const leave of calendarData.leaves) {
        if (!leave.startDate || !leave.endDate) continue;
        const startStr = typeof leave.startDate === 'string' ? leave.startDate.slice(0, 10) : formatDateStr(leave.startDate);
        const endStr = typeof leave.endDate === 'string' ? leave.endDate.slice(0, 10) : formatDateStr(leave.endDate);

        if (dateStr >= startStr && dateStr <= endStr) {
          if (leave.status === 'Approved') {
            return {
              dateStr,
              dayNum,
              dayOfWeek,
              type: 'approved_leave',
              label: `Leave (${leave.leaveType})`,
              colorClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40 hover:bg-orange-500/30',
              dotColor: 'bg-orange-400',
              tooltip: `Approved Leave: ${leave.leaveType} • Reason: ${leave.reason || 'Personal'}`,
            };
          }
          if (leave.status === 'Pending') {
            return {
              dateStr,
              dayNum,
              dayOfWeek,
              type: 'applied_leave',
              label: `Applied Leave (${leave.leaveType})`,
              colorClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30',
              dotColor: 'bg-indigo-400',
              tooltip: `Applied Leave (Pending Review): ${leave.leaveType}`,
            };
          }
        }
      }

      // 5. Check Weekend (Saturday & Sunday - Light Violet)
      if (isWeekend) {
        return {
          dateStr,
          dayNum,
          dayOfWeek,
          type: 'weekend',
          label: dayOfWeek === 0 ? 'Sunday' : 'Saturday',
          colorClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25',
          dotColor: 'bg-purple-400',
          tooltip: `${dayOfWeek === 0 ? 'Sunday' : 'Saturday'} • Weekend Off`,
        };
      }

      // 6. Past working day with no record -> Absent (Red)
      if (isPast) {
        return {
          dateStr,
          dayNum,
          dayOfWeek,
          type: 'absent',
          label: 'Absent',
          colorClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30',
          dotColor: 'bg-rose-400',
          tooltip: 'Absent • No check-in recorded for this working day (Click to Request Adjustment)',
        };
      }

      // 7. Future working day (neutral)
      return {
        dateStr,
        dayNum,
        dayOfWeek,
        type: 'upcoming',
        label: 'Upcoming',
        colorClass: 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:bg-slate-800/40',
        dotColor: 'bg-slate-600',
        tooltip: 'Scheduled working shift',
      };
    },
    [calYear, calMonth, calendarData, todayDateStr, liveHoursWorked]
  );

  // Click on Calendar Day: Open Attendance Adjustment if present or past day
  const handleDayClick = (info) => {
    setSelectedDay(info);
    if (
      info.dateStr <= todayDateStr &&
      info.type !== 'holiday' &&
      info.type !== 'weekend'
    ) {
      setAdjustmentTargetDay(info);
      setIsAdjustmentModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span>Welcome, {currentUser?.name?.split(' ')[0] || 'Employee'}</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your daily shift hours, monitor attendance calendar, and request shift punch adjustments.
          </p>
        </div>

        {/* View Mode Tabs (Both Employee and Admin now have tabs!) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveMainTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeMainTab === 'calendar'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Shift & Calendar</span>
          </button>

          <button
            onClick={() => setActiveMainTab('adjustments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeMainTab === 'adjustments'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Attendance Adjustments</span>
            {pendingAdjustmentsCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500 text-slate-950">
                {pendingAdjustmentsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Toast Notification */}
      {feedback && (
        <div
          className={`flex items-center gap-2.5 p-4 rounded-2xl text-xs border animate-fadeIn ${
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

      {/* ================= TAB 1: SHIFT TRACKER & CALENDAR ================= */}
      {activeMainTab === 'calendar' && (
        <div className="space-y-6">
          {/* DAILY SHIFT TRACKER WIDGET */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5" />
                  <span>Daily Shift Tracker</span>
                </span>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-2xl font-black text-white font-mono">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>

                  {/* Status Badge */}
                  {todayData?.checkIn && !todayData?.checkOut ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Shift In Progress</span>
                    </span>
                  ) : todayData?.checkOut ? (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        todayData.status === 'Present'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Shift Completed ({todayData.status})</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Not Checked In</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading || !!todayData?.checkIn}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-bold transition shadow-lg cursor-pointer disabled:cursor-not-allowed ${
                    todayData?.checkIn
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/30 active:scale-95'
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  <span>{todayData?.checkIn ? 'Checked In' : 'Check In Now'}</span>
                </button>

                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading || !todayData?.checkIn || !!todayData?.checkOut}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-bold transition shadow-lg cursor-pointer disabled:cursor-not-allowed ${
                    !todayData?.checkIn || todayData?.checkOut
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60'
                      : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-600/30 active:scale-95'
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  <span>{todayData?.checkOut ? 'Checked Out' : 'Check Out'}</span>
                </button>
              </div>
            </div>

            {/* 8-Hour Goal Progress Bar */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                  <Award className={`h-4 w-4 ${isTargetAchieved ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <span>
                    Today's Progress: <strong>{liveHoursWorked}h</strong> / <strong>8.0h</strong>
                  </span>
                </span>
                <span
                  className={`font-mono font-bold ${
                    isTargetAchieved ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {progressPercent}% Completed
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isTargetAchieved
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/50'
                      : 'bg-gradient-to-r from-amber-500 to-orange-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Timestamps Row */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>
                  Check-in:{' '}
                  <strong className="text-slate-200">
                    {todayData?.checkIn ? formatTimeStr(todayData.checkIn) : '—'}
                  </strong>
                </span>

                <span>
                  Check-out:{' '}
                  <strong className="text-slate-200">
                    {todayData?.checkOut ? formatTimeStr(todayData.checkOut) : 'In Progress'}
                  </strong>
                </span>

                <span>
                  Remaining:{' '}
                  <strong className={isTargetAchieved ? 'text-emerald-400' : 'text-amber-400'}>
                    {isTargetAchieved
                      ? 'Target Achieved'
                      : `${Number((targetHours - liveHoursWorked).toFixed(2))} hrs`}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* MONTHLY ATTENDANCE CALENDAR */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl space-y-5">
            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Attendance Calendar</h3>
                  <p className="text-xs text-slate-400">
                    Detailed monthly attendance log, shift hours, leaves, and official holidays. Click any past/present date to request adjustment.
                  </p>
                </div>
              </div>

              {/* Month Navigator */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="px-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white font-mono min-w-[140px] text-center">
                  {MONTH_NAMES[calMonth - 1]} {calYear}
                </div>

                <button
                  onClick={handleNextMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={handleJumpToToday}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-xs font-semibold transition cursor-pointer ml-1"
                >
                  Today
                </button>
              </div>
            </div>

            {/* COLOR LEGEND BAR */}
            <div className="flex items-center gap-3.5 flex-wrap text-xs p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Legend:</span>

              {/* Green - Present */}
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-emerald-500/30 border border-emerald-500" />
                <span className="text-slate-300 font-medium">Present (≥ 8 hrs)</span>
              </div>

              {/* Warm Amber - Short Hours */}
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-amber-500/30 border border-amber-500" />
                <span className="text-amber-300 font-bold">Short Hours (&lt; 8 hrs)</span>
              </div>

              {/* Indigo - Requested Adjustment */}
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-indigo-500/40 border border-indigo-400" />
                <span className="text-indigo-300 font-medium">Requested Adjustment</span>
              </div>

              {/* Red - Absent */}
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-rose-500/30 border border-rose-500" />
                <span className="text-slate-300 font-medium">Absent</span>
              </div>

              {/* Orange - Approved Leave */}
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-orange-500/30 border border-orange-500" />
                <span className="text-slate-300 font-medium">Approved Leave</span>
              </div>

              {/* Violet - Weekend */}
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-purple-500/30 border border-purple-500" />
                <span className="text-slate-300 font-medium">Weekend (Sat & Sun)</span>
              </div>

              {/* Yellow - Holiday */}
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-yellow-500/30 border border-yellow-500" />
                <span className="text-slate-300 font-medium">Company Holiday</span>
              </div>
            </div>

            {/* Live Day Inspection Strip */}
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs min-h-[44px]">
              {hoveredDay ? (
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`h-2.5 w-2.5 rounded-full ${hoveredDay.dotColor}`} />
                  <span className="font-bold text-white font-mono">{hoveredDay.dateStr}</span>
                  <span className="text-slate-600">•</span>
                  <span className="font-bold text-slate-200">{hoveredDay.label}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300">{hoveredDay.tooltip}</span>
                </div>
              ) : (
                <span className="text-slate-500 text-[11px] flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span>Click any past or present date on the calendar to submit an Attendance Adjustment request.</span>
                </span>
              )}
            </div>

            {/* Calendar Grid Container */}
            <div className="overflow-x-auto py-2">
              <div className="min-w-[680px]">
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-2 pb-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  {DAYS_OF_WEEK.map((day, idx) => (
                    <div
                      key={day}
                      className={`py-2 rounded-xl ${
                        idx === 0 || idx === 6 ? 'text-purple-300 bg-purple-500/10' : 'text-slate-300'
                      }`}
                    >
                      {day} {idx === 0 || idx === 6 ? '• Weekend' : ''}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-2 pt-2.5">
                  {/* Blank cells for offset */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div
                      key={`blank-${i}`}
                      className="h-24 sm:h-28 rounded-2xl border border-slate-900 bg-slate-950/20 opacity-30"
                    />
                  ))}

                  {/* Month Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const info = getDayDetails(dayNum);
                    const isToday = info.dateStr === todayDateStr;
                    const isSelected = selectedDay?.dateStr === info.dateStr;

                    const rowIdx = Math.floor((firstDayOfWeek + dayNum - 1) / 7);
                    const colIdx = (firstDayOfWeek + dayNum - 1) % 7;
                    const isTopRows = rowIdx <= 1;
                    const isLeftCol = colIdx === 0;
                    const isRightCol = colIdx === 6;

                    const tooltipPositionClass = `${
                      isTopRows ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
                    } ${
                      isLeftCol ? 'left-0 translate-x-0' : isRightCol ? 'right-0 translate-x-0' : 'left-1/2 -translate-x-1/2'
                    }`;

                    return (
                      <div
                        key={`day-${dayNum}`}
                        onClick={() => handleDayClick(info)}
                        onMouseEnter={() => setHoveredDay(info)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`group relative h-24 sm:h-28 rounded-2xl border p-2.5 flex flex-col justify-between transition duration-200 cursor-pointer hover:z-50 ${
                          info.colorClass
                        } ${isSelected ? 'ring-2 ring-white shadow-xl scale-[1.02]' : ''}`}
                      >
                        {/* Top Row: Date Number and Status Dot */}
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-black font-mono ${isToday ? 'text-white' : ''}`}>
                            {dayNum}
                          </span>
                          <span className={`h-2 w-2 rounded-full ${info.dotColor}`} />
                        </div>

                        {/* Middle Info / Hours Display */}
                        <div className="space-y-0.5">
                          {info.hours !== undefined ? (
                            <p className="text-xs font-extrabold font-mono leading-tight">
                              {info.hours}h Logged
                            </p>
                          ) : null}

                          <p className="text-[10px] font-semibold truncate leading-tight opacity-90">
                            {info.label}
                          </p>
                        </div>

                        {/* Bottom Tag */}
                        <div className="text-[9px] uppercase font-bold tracking-tight opacity-80 truncate">
                          {info.type === 'adjustment_requested'
                            ? 'Requested Adjustment'
                            : info.type === 'present'
                            ? '8h Complete'
                            : info.type === 'short'
                            ? '< 8h Short'
                            : info.type === 'weekend'
                            ? 'Off Day'
                            : info.type === 'holiday'
                            ? 'Holiday'
                            : info.type === 'approved_leave'
                            ? 'Approved'
                            : info.type === 'applied_leave'
                            ? 'Pending'
                            : info.type === 'absent'
                            ? 'Absent'
                            : isToday
                            ? 'Today'
                            : ''}
                        </div>

                        {/* Tooltip on Hover */}
                        <div
                          className={`absolute ${tooltipPositionClass} w-64 p-3.5 rounded-2xl bg-slate-950/98 border border-slate-700 shadow-2xl text-left pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 backdrop-blur-md`}
                        >
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                            <span className="text-[11px] font-bold text-white font-mono">
                              {new Date(calYear, calMonth - 1, dayNum).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className={`h-2 w-2 rounded-full ${info.dotColor}`} />
                          </div>

                          <div className="mt-2 space-y-1 text-[11px]">
                            <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                              <span>Status:</span>
                              <span className="font-bold text-white">{info.label}</span>
                            </p>

                            {info.checkIn && (
                              <p className="text-slate-400">
                                Check-in: <strong className="text-slate-200">{formatTimeStr(info.checkIn)}</strong>
                              </p>
                            )}
                            {info.checkOut && (
                              <p className="text-slate-400">
                                Check-out: <strong className="text-slate-200">{formatTimeStr(info.checkOut)}</strong>
                              </p>
                            )}
                            {info.hours !== undefined && (
                              <p className="text-slate-400">
                                Duration:{' '}
                                <strong className={info.hours >= 8 ? 'text-emerald-400' : 'text-amber-400'}>
                                  {info.hours} Hours
                                </strong>
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 leading-relaxed">
                              {info.tooltip}
                            </p>
                          </div>

                          <div
                            className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
                              isTopRows ? '-top-2 border-b-slate-700' : '-bottom-2 border-t-slate-700'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ATTENDANCE ADJUSTMENTS ================= */}
      {activeMainTab === 'adjustments' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {['All', 'Pending', 'Approved', 'Rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setAdjFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    adjFilter === st
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'Pending' ? 'Pending Review' : st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={loadAdjustments}
                title="Refresh requests"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${adjLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setAdjustmentTargetDay({
                    dateStr: todayDateStr,
                    checkIn: todayData?.checkIn,
                    checkOut: todayData?.checkOut,
                    hours: liveHoursWorked,
                  });
                  setIsAdjustmentModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Request Adjustment</span>
              </button>
            </div>
          </div>

          {/* Adjustments Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Shift Date</th>
                    <th className="py-3.5 px-4">Original Recorded</th>
                    <th className="py-3.5 px-4">Requested Shift</th>
                    <th className="py-3.5 px-4">Reason for Request</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Remarks</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60">
                  {adjLoading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-500 mb-2" />
                        <span>Loading adjustment requests...</span>
                      </td>
                    </tr>
                  ) : adjustmentsList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500 space-y-2">
                        <Clock className="h-8 w-8 mx-auto text-slate-600 opacity-60" />
                        <p className="text-sm font-medium text-slate-400">No {adjFilter.toLowerCase()} adjustment requests found</p>
                        <p className="text-xs text-slate-500">
                          Click on any past or present date on the calendar, or use "Request Adjustment" to submit a shift correction.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    adjustmentsList.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {item.date}
                        </td>

                        <td className="py-3.5 px-4">
                          {item.originalCheckIn ? (
                            <div className="space-y-0.5">
                              <p className="text-slate-300 font-mono">
                                {formatTimeStr(item.originalCheckIn)} – {formatTimeStr(item.originalCheckOut)}
                              </p>
                              <span className="text-[10px] text-amber-400 font-semibold">
                                {item.originalHours}h Logged
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-rose-400 font-semibold">
                              No punch / Absent
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <p className="text-emerald-400 font-mono font-bold">
                              {formatTimeStr(item.adjustedCheckIn)} – {formatTimeStr(item.adjustedCheckOut)}
                            </p>
                            <span className="text-[10px] text-emerald-400 font-semibold">
                              {item.adjustedHours}h Target ({item.adjustedHours >= 8 ? '8h Complete' : 'Short Hours'})
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-slate-300 text-xs italic bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                            "{item.reason}"
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                              item.status === 'Approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : item.status === 'Pending'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                item.status === 'Approved'
                                  ? 'bg-emerald-400'
                                  : item.status === 'Pending'
                                  ? 'bg-amber-400 animate-pulse'
                                  : 'bg-rose-400'
                              }`}
                            />
                            <span>{item.status === 'Pending' ? 'Requested Adjustment' : item.status}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right text-[11px] text-slate-400">
                          {item.adminRemarks || (item.status === 'Pending' ? 'Awaiting Review' : '—')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Adjustment Modal */}
      <AttendanceAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        targetDay={adjustmentTargetDay}
        currentUser={currentUser}
        onSuccess={(msg) => {
          setFeedback({ type: 'success', message: msg });
          loadCalendar();
          if (activeMainTab === 'adjustments') loadAdjustments();
          setTimeout(() => setFeedback(null), 5000);
        }}
      />
    </div>
  );
}
