import React, { useState, useEffect } from 'react';
import { fetchEmployees } from '../services/employeeService';
import { fetchHolidays } from '../services/holidayService';
import { fetchLeaves } from '../services/leaveService';
import { fetchPayrollRecords } from '../services/payrollService';
import { getAuthUser } from '../services/api';
import {
  Users,
  CalendarDays,
  CalendarCheck,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building,
} from 'lucide-react';

/**
 * Dashboard Overview View
 * Displays high-level KPIs, quick navigation to sub-modules, and organization metrics
 */
export default function DashboardView({ onSelectTab }) {
  const user = getAuthUser() || { name: 'Admin', role: 'admin' };

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    holidaysCount: 0,
    nextHoliday: null,
    pendingLeaves: 0,
    payrollTotal: 0,
  });
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);

  // Load consolidated dashboard metrics
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Employees
      const employees = await fetchEmployees().catch(() => []);
      const activeCount = employees.filter((e) => e.status === 'Active').length;

      // 2. Fetch Holidays
      const holidays = await fetchHolidays().catch(() => []);

      // 3. Fetch Leaves
      const leaves = await fetchLeaves().catch(() => []);
      const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;

      // 4. Fetch Payroll
      const payroll = await fetchPayrollRecords().catch(() => ({ summary: { totalPayroll: 0 } }));
      const payrollTotal = payroll?.summary?.totalPayroll || 0;

      // Next holiday
      const nextHol = holidays.length > 0 ? holidays[0] : null;

      setStats({
        totalEmployees: employees.length,
        activeEmployees: activeCount,
        holidaysCount: holidays.length,
        nextHoliday: nextHol,
        pendingLeaves: pendingLeavesCount,
        payrollTotal: payrollTotal,
      });

      setRecentEmployees(employees.slice(0, 5));
      setUpcomingHolidays(holidays.slice(0, 4));
    } catch (err) {
      console.warn('Dashboard data fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-950 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>HRMS Enterprise Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {user.name || 'Admin'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Here is your workforce summary, active employee roster, upcoming holiday schedules, and compensation cycles.
            </p>
          </div>

          <button
            onClick={loadDashboardData}
            title="Refresh dashboard metrics"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer text-xs font-semibold shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Employees */}
        <div
          onClick={() => onSelectTab && onSelectTab('employees')}
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 hover:border-indigo-500/50 transition cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Employees
            </span>
            <div className="h-10 w-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? '—' : stats.totalEmployees}
            </p>
            <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {stats.activeEmployees} Active Members
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-indigo-400 transition">
            <span>Manage Directory</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 2. Upcoming Holidays */}
        <div
          onClick={() => onSelectTab && onSelectTab('holidays')}
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 hover:border-sky-500/50 transition cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Company Holidays
            </span>
            <div className="h-10 w-10 rounded-xl bg-sky-600/15 border border-sky-500/30 text-sky-400 flex items-center justify-center group-hover:scale-110 transition">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? '—' : stats.holidaysCount}
            </p>
            <p className="text-xs text-sky-400 font-medium mt-1 truncate">
              {stats.nextHoliday ? stats.nextHoliday.title : '2026 Calendar'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-sky-400 transition">
            <span>View Calendar</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 3. Leave Requests */}
        <div
          onClick={() => onSelectTab && onSelectTab('leaves')}
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 hover:border-amber-500/50 transition cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pending Leaves
            </span>
            <div className="h-10 w-10 rounded-xl bg-amber-600/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? '—' : stats.pendingLeaves}
            </p>
            <p className="text-xs text-amber-400 font-medium mt-1">
              Awaiting Manager Approval
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-amber-400 transition">
            <span>Review Applications</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 4. Monthly Payroll */}
        <div
          onClick={() => onSelectTab && onSelectTab('payroll')}
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 hover:border-purple-500/50 transition cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Monthly Payroll
            </span>
            <div className="h-10 w-10 rounded-xl bg-purple-600/15 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? '—' : stats.payrollTotal ? `$${stats.payrollTotal.toLocaleString()}` : '$34,900'}
            </p>
            <p className="text-xs text-purple-400 font-medium mt-1">
              November 2026 Cycle
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-purple-400 transition">
            <span>Disbursement Details</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Employees & Upcoming Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Employees Table Preview */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-white">Employees Directory Preview</h2>
            </div>
            <button
              onClick={() => onSelectTab && onSelectTab('employees')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentEmployees.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No employees registered yet.</p>
            ) : (
              recentEmployees.map((emp) => {
                const displayName = emp.name || 'Staff Member';
                const initials = displayName
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div key={emp._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{displayName}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {emp.designation} • <span className="text-indigo-400">{emp.department}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Status badge: ONLY Active or Inactive */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          emp.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            emp.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        {emp.status === 'Active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Holidays Preview */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                <CalendarDays className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-white">Upcoming 2026 Holidays</h2>
            </div>
            <button
              onClick={() => onSelectTab && onSelectTab('holidays')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <span>Full Schedule</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingHolidays.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No holidays scheduled.</p>
            ) : (
              upcomingHolidays.map((hol) => (
                <div
                  key={hol._id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1.5 rounded-lg bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 text-center shrink-0">
                      <p className="text-[10px] font-mono uppercase tracking-wider font-bold">
                        {hol.day ? hol.day.slice(0, 3) : 'HOL'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{hol.title}</p>
                      <p className="text-[11px] text-slate-400">{hol.date}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium shrink-0">
                    {hol.type || 'Public Holiday'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

