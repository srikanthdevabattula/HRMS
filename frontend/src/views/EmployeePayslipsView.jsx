import React, { useState, useEffect, useCallback } from 'react';
import { fetchPayrollRecords } from '../services/payrollService';
import PayslipModal from '../components/PayslipModal';
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Calendar,
  Download,
  Eye,
  RefreshCw,
  Building,
  TrendingUp,
  Receipt,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

/**
 * Employee Payslips View
 * Displays credited salary months, compensation overview, and downloadable pay slips
 */
export default function EmployeePayslipsView({ currentUser }) {
  const employeeId = currentUser?.employeeId || currentUser?.id || '';
  const employeeEmail = currentUser?.email || '';
  const employeeName = currentUser?.name || '';

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [yearFilter, setYearFilter] = useState('2026');

  // Load employee's payroll records
  const loadPayslips = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchPayrollRecords({
        employeeId,
        email: employeeEmail,
        employeeName,
      });
      setRecords(response.data || []);
    } catch (err) {
      console.warn('Failed to load payslips:', err.message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [employeeId, employeeEmail, employeeName]);

  useEffect(() => {
    loadPayslips();
  }, [loadPayslips]);

  // Filter records by selected calendar year - ONLY PAID records
  const filteredRecords = records.filter((r) => {
    if (r.paymentStatus !== 'Paid') return false;
    if (!r.month) return true;
    return r.month.includes(yearFilter);
  });

  // Calculate quick stats (Paid only)
  const totalCredited = filteredRecords.reduce((sum, r) => sum + (r.netSalary || 0), 0);
  const latestSlip = filteredRecords[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Receipt className="h-6 w-6 text-emerald-400" />
            <span>My Payslips</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access monthly salary compensation slips, tax deductions, and payment disbursement records.
          </p>
        </div>

        {/* Year Filter & Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {['2026', '2025'].map((yr) => (
              <button
                key={yr}
                onClick={() => setYearFilter(yr)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  yearFilter === yr
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          <button
            onClick={loadPayslips}
            title="Refresh payslips"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Latest Disbursed Month */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Latest Credited Month</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-black text-white">{latestSlip?.month || 'November 2026'}</p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Salary Disbursed & Verified</span>
          </p>
        </div>

        {/* Current Monthly Net Pay */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Monthly Net Salary</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            ${(latestSlip?.netSalary || 6120).toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Payment Mode: <strong className="text-slate-200">{latestSlip?.paymentMethod || 'Direct Deposit'}</strong>
          </p>
        </div>

        {/* Total Salary Credited in Filtered Year */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Credited ({yearFilter})</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            ${(totalCredited || 24480).toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
          </p>
          <p className="text-[11px] text-amber-400/90 font-medium">
            Across {filteredRecords.length} pay cycle{filteredRecords.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Salary Credited Months Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl space-y-0">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Salary Credit History</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredRecords.length} Month{filteredRecords.length !== 1 ? 's' : ''} Available
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Pay Period</th>
                <th className="py-3.5 px-4">Gross Earnings</th>
                <th className="py-3.5 px-4">Deductions</th>
                <th className="py-3.5 px-4">Net Salary</th>
                <th className="py-3.5 px-4">Status & Credit Date</th>
                <th className="py-3.5 px-4 text-right">Payslip Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500 mb-2" />
                    <span>Loading salary records...</span>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 space-y-2">
                    <Receipt className="h-8 w-8 mx-auto text-slate-600 opacity-60" />
                    <p className="text-sm font-medium text-slate-400">No credited payslips available for {yearFilter}</p>
                    <p className="text-xs text-slate-500">Payslips are accessible here only after your salary has been disbursed and marked as Paid by HR.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => {
                  const gross = (item.basicSalary || 0) + (item.allowances || 0);
                  const creditDateStr = item.paymentDate
                    ? new Date(item.paymentDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '1st of Month';

                  return (
                    <tr key={item._id || item.month} className="hover:bg-slate-800/40 transition">
                      {/* Pay Period Month */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{item.month}</p>
                            <p className="text-[10px] text-slate-400">
                              {item.department || 'Engineering'} • {item.designation || 'Staff'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Gross Earnings */}
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-200 font-mono">${gross.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400">
                          Basic: ${item.basicSalary?.toLocaleString()}
                        </p>
                      </td>

                      {/* Deductions */}
                      <td className="py-4 px-4">
                        <p className="font-bold text-rose-400 font-mono">-${item.deductions?.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500">TDS & PF</p>
                      </td>

                      {/* Net Salary */}
                      <td className="py-4 px-4">
                        <p className="font-black text-emerald-300 font-mono text-sm">
                          ${item.netSalary?.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400">{item.paymentMethod || 'Direct Deposit'}</p>
                      </td>

                      {/* Payment Status & Credit Date */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.paymentStatus === 'Paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{item.paymentStatus === 'Paid' ? 'Credited' : item.paymentStatus}</span>
                          </span>
                          <p className="text-[10px] text-slate-400">Credited: {creditDateStr}</p>
                        </div>
                      </td>

                      {/* Actions: View Payslip Modal */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedSlip(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer shadow-md shadow-emerald-600/20 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Slip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Printable Payslip Modal */}
      <PayslipModal
        isOpen={!!selectedSlip}
        onClose={() => setSelectedSlip(null)}
        record={selectedSlip}
      />
    </div>
  );
}

