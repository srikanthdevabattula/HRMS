import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * Modern Confirmation UI Modal (Replaces native browser alert/confirm popups)
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Cancel handler
 * @param {function} onConfirm - Confirm action handler
 * @param {string} title - Modal heading
 * @param {string} message - Detailed confirmation message
 * @param {string} confirmText - Button text (e.g. "Delete")
 * @param {string} cancelText - Cancel button text
 * @param {boolean} danger - If true, styles as destructive/red
 * @param {boolean} loading - Loading spinner state
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = true,
  loading = false,
}) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 animate-scaleUp">
        {/* Close X icon */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Icon + Title */}
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              danger
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25 shadow-lg shadow-rose-500/10'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-lg shadow-amber-500/10'
            }`}
          >
            {danger ? <Trash2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
          </div>

          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <p className="text-[11px] text-slate-400">Please confirm to proceed</p>
          </div>
        </div>

        {/* Message Body */}
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4">
          <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg transition cursor-pointer disabled:opacity-50 ${
              danger
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

