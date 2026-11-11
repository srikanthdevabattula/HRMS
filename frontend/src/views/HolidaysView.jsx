import React, { useState, useEffect } from 'react';
import { fetchHolidays, addHoliday, removeHoliday } from '../services/holidayService';
import ConfirmModal from '../components/ConfirmModal';
import {
  CalendarDays,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Calendar,
  X,
} from 'lucide-react';

const HOLIDAY_TYPES = ['National', 'Public', 'Company', 'Optional'];

/**
 * Holidays Calendar View
 * Displays company scheduled holidays with modal to add new holidays
 * Uses custom UI confirmation modal (no native browser popups)
 */
export default function HolidaysView() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Custom UI Delete Confirmation State
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'Public',
    description: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch holidays
  const loadHolidays = async () => {
    setLoading(true);
    try {
      const data = await fetchHolidays();
      setHolidays(data);
    } catch (err) {
      console.warn('Failed to fetch holidays:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  // Handle Add Holiday submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.date) {
      setFormError('Please provide both holiday title and date.');
      return;
    }

    setFormLoading(true);
    try {
      await addHoliday(formData);
      setFeedback({ type: 'success', message: 'Holiday added to calendar!' });
      setIsModalOpen(false);
      setFormData({ title: '', date: '', type: 'Public', description: '' });
      await loadHolidays();
    } catch (err) {
      setFormError(err.message || 'Failed to add holiday.');
    } finally {
      setFormLoading(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Trigger custom UI delete confirmation
  const handleDeleteClick = (holiday) => {
    setHolidayToDelete(holiday);
  };

  // Confirm Delete Holiday (called by ConfirmModal)
  const handleConfirmDelete = async () => {
    if (!holidayToDelete) return;
    setDeleteLoading(true);

    try {
      await removeHoliday(holidayToDelete._id);
      setFeedback({ type: 'success', message: `Holiday "${holidayToDelete.title}" removed.` });
      setHolidayToDelete(null);
      await loadHolidays();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to remove holiday.' });
    } finally {
      setDeleteLoading(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <CalendarDays className="h-6 w-6 text-emerald-400" />
            <span>Company Holidays 2026</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official non-working days, company vacations, and federal observances.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Holiday</span>
        </button>
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

      {/* Holiday Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500 mb-2" />
            <p className="text-xs">Loading holiday calendar from MongoDB...</p>
          </div>
        ) : holidays.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 space-y-2">
            <Calendar className="h-8 w-8 mx-auto text-slate-600 opacity-60" />
            <p className="text-sm font-medium text-slate-400">No holidays scheduled</p>
            <p className="text-xs text-slate-500">Click "+ Add Holiday" to add official holidays.</p>
          </div>
        ) : (
          holidays.map((h) => {
            const dateObj = new Date(h.date);
            const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' });
            const dayNum = dateObj.toLocaleDateString('en-US', { day: '2-digit' });
            const weekday = h.day || dateObj.toLocaleDateString('en-US', { weekday: 'long' });

            return (
              <div
                key={h._id}
                className="group relative rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg hover:border-slate-700 transition flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Date badge */}
                  <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950 border border-slate-800 p-2.5 min-w-[56px] text-center shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {monthStr}
                    </span>
                    <span className="text-xl font-black text-white">{dayNum}</span>
                  </div>

                  {/* Title & Type */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          h.type === 'National'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : h.type === 'Public'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : h.type === 'Company'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {h.type}
                      </span>
                    </div>

                    <h3 className="mt-1 text-sm font-bold text-slate-100 truncate">{h.title}</h3>
                    <p className="text-[11px] text-slate-400 font-medium">{weekday}</p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(h)}
                    title="Delete Holiday"
                    className="p-1.5 rounded-lg bg-slate-800/80 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Description */}
                {h.description && (
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/70">
                    {h.description}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Holiday Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Add New Holiday</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Holiday Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Founders Day"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 transition cursor-pointer"
                  >
                    {HOLIDAY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  placeholder="Additional details about the holiday..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                >
                  {formLoading ? 'Adding...' : 'Add to Calendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom UI Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!holidayToDelete}
        onClose={() => setHolidayToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Holiday"
        message={
          holidayToDelete
            ? `Are you sure you want to remove "${holidayToDelete.title}" from the company holiday calendar?`
            : ''
        }
        confirmText="Yes, Remove"
        cancelText="Keep Holiday"
        danger={true}
        loading={deleteLoading}
      />
    </div>
  );
}
