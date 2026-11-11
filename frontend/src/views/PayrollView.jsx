import React, { useState, useEffect } from 'react';
import {
  fetchPayrollRecords,
  generatePayrollApi,
  updatePayrollStatusApi,
} from '../services/payrollService';
import PayslipModal from '../components/PayslipModal';
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';

const MONTHS = ['November 2026', 'December 2026', 'October 2026'];
const STATUS_OPTIONS = ['All', 'Paid', 'Pending'];

/**
 * Payroll Management View
 * Clean enterprise compensation view with dynamic salary splits:
 * Base Pay (50%), Allowances (HRA, Special, Conveyance, Medical), Taxes (TDS, PF, PT), and printable payslips.
 */
export default function PayrollView() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({
    totalPayroll: 0,
    totalGross: 0,
    totalPaid: 0,
    totalPending: 0,
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('November 2026');
  const [statusFilter, setStatusFilter] = useState('All');
  const [feedback, setFeedback] = useState(null);

  // Payslip Modal State
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch records
  const loadPayroll = async () => {
    setLoading(true);
    try {
      const response = await fetchPayrollRecords({
        month: selectedMonth,
        status: statusFilter,
      });
      setRecords(response.data || []);
      setSummary(
        response.summary || {
          totalPayroll: 0,
          totalGross: 0,
          totalPaid: 0,
          totalPending: 0,
          count: 0,
        }
      );
    } catch (err) {
      console.warn('Failed to load payroll:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll();
  }, [selectedMonth, statusFilter]);

  // Generate payroll for selected month
  const handleGeneratePayroll = async () => {
    setIsGenerating(true);
    try {
      const res = await generatePayrollApi(selectedMonth);
      setFeedback({
        type: 'success',
        message: res.message || `Payroll synchronized for ${selectedMonth}!`,
      });
      await loadPayroll();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to generate payroll' });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Mark status as Paid
  const handleUpdateStatus = async (recordId, newStatus) => {
    try {
      await updatePayrollStatusApi(recordId, newStatus);
      setFeedback({ type: 'success', message: `Pay slip updated to ${newStatus}!` });
      await loadPayroll();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update payment status' });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-purple-400" />
            <span>Payroll & Compensation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage employee monthly payroll disbursements, salary splits, tax remittances, and official payslips.
          </p>
        </div>

        <button
          onClick={handleGeneratePayroll}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition cursor-pointer disabled:opacity-50"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>{isGenerating ? 'Syncing...' : 'Sync & Generate Pay Slips'}</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Total Monthly Gross
          </span>
          <p className="mt-1 text-2xl font-extrabold text-white font-mono">
            ${(summary.totalGross || 0).toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            Disbursed Net Pay
          </span>
          <p className="mt-1 text-2xl font-extrabold text-emerald-400 font-mono">
            ${summary.totalPaid.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
            Pending Net Pay
          </span>
          <p className="mt-1 text-2xl font-extrabold text-amber-400 font-mono">
            ${summary.totalPending.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400">
            Enrolled Pay Slips
          </span>
          <p className="mt-1 text-2xl font-extrabold text-purple-400">{summary.count}</p>
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

      {/* Filter Control Bar: Period & Payment Status only */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        {/* Month Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Pay Period:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 transition cursor-pointer"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Status Filter (All, Paid, Pending) & Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {STATUS_OPTIONS.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={loadPayroll}
            title="Refresh list"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Clean Payroll Table with Dynamic Salary Split */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Annual CTC</th>
                <th className="py-3.5 px-4">Base Pay (50%)</th>
                <th className="py-3.5 px-4">Allowances</th>
                <th className="py-3.5 px-4">Gross Salary</th>
                <th className="py-3.5 px-4">Taxes & Deductions</th>
                <th className="py-3.5 px-4">Net Salary</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-purple-500 mb-2" />
                    <span>Loading payroll records...</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-500 space-y-2">
                    <CreditCard className="h-8 w-8 mx-auto text-slate-600 opacity-60" />
                    <p className="text-sm font-medium text-slate-400">
                      No payroll records match the selected filters for {selectedMonth}
                    </p>
                    <p className="text-xs text-slate-500">
                      Click "Sync & Generate Pay Slips" to refresh records for all active employees.
                    </p>
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const basic = r.basicSalary || 0;
                  const hra = r.hra || Math.round(basic * 0.4);
                  const special = r.specialAllowance || Math.round(basic * 0.3);
                  const conveyance = r.conveyanceAllowance || Math.round(basic * 0.2);
                  const medical = r.medicalAllowance || Math.round(basic * 0.1);
                  const totalAllowances =
                    r.allowances || hra + special + conveyance + medical;
                  const gross = r.grossSalary || basic + totalAllowances;

                  const tds = r.tds || Math.round(gross * 0.1);
                  const pf = r.pf || Math.round(basic * 0.12);
                  const pt = r.professionalTax !== undefined ? r.professionalTax : 200;
                  const totalDeductions = r.deductions || tds + pf + pt;

                  const annual = r.annualSalary || gross * 12;

                  return (
                    <tr key={r._id} className="hover:bg-slate-800/40 transition">
                      {/* Employee */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md shrink-0">
                            {r.employeeName?.[0] || 'E'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100">{r.employeeName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {r.employeeId} • <span className="text-slate-300">{r.department}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Annual CTC */}
                      <td className="py-3.5 px-4 font-mono text-slate-300 font-semibold">
                        ${annual.toLocaleString()}
                        <span className="block text-[10px] text-slate-500 font-sans font-normal">
                          / yr
                        </span>
                      </td>

                      {/* Basic Pay (50%) */}
                      <td className="py-3.5 px-4 font-mono text-slate-200">
                        ${basic.toLocaleString()}
                        <span className="block text-[10px] text-slate-500 font-sans">50% Gross</span>
                      </td>

                      {/* Allowances with Split Breakdown */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-emerald-400 font-semibold">
                          +${totalAllowances.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono space-y-0.5 mt-0.5">
                          <span>HRA: ${hra.toLocaleString()}</span>
                          <span className="text-slate-600 mx-1">•</span>
                          <span>Spl: ${special.toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Gross Salary */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                        ${gross.toLocaleString()}
                      </td>

                      {/* Taxes & Deductions with Breakdown */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-rose-400 font-semibold">
                          -${totalDeductions.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono space-y-0.5 mt-0.5">
                          <span>TDS: ${tds.toLocaleString()}</span>
                          <span className="text-slate-600 mx-1">•</span>
                          <span>PF: ${pf.toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Net Salary */}
                      <td className="py-3.5 px-4 font-mono font-extrabold text-white text-sm">
                        ${(r.netSalary || gross - totalDeductions).toLocaleString()}
                      </td>

                      {/* Payment Status (Paid / Pending only) */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            r.paymentStatus === 'Paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              r.paymentStatus === 'Paid' ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                          />
                          {r.paymentStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Payslip Modal button */}
                          <button
                            onClick={() => setSelectedSlip(r)}
                            title="View & Print Official Payslip"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition cursor-pointer border border-indigo-500/30 text-[11px] font-semibold"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Slip</span>
                          </button>

                          {/* Mark Paid button if not paid */}
                          {r.paymentStatus !== 'Paid' && (
                            <button
                              onClick={() => handleUpdateStatus(r._id, 'Paid')}
                              title="Mark as Paid"
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition cursor-pointer border border-emerald-500/20"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal for View & Print */}
      <PayslipModal
        isOpen={!!selectedSlip}
        onClose={() => setSelectedSlip(null)}
        record={selectedSlip}
      />
    </div>
  );
}
