import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle, Eye, EyeOff, Lock, Mail, User, Briefcase, DollarSign, Phone, Building } from 'lucide-react';

const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Design',
  'Marketing',
  'Finance',
  'Operations',
];

const STATUSES = ['Active', 'Inactive'];

/**
 * Modal for creating and editing employee records
 * Includes required fields: name, email, password, designation, etc.
 */
export default function AddEditEmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  employeeToEdit = null,
}) {
  const isEditing = !!employeeToEdit;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    designation: '',
    department: 'Engineering',
    salary: '',
    phone: '',
    status: 'Active',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form when editing an existing employee
  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        name: employeeToEdit.name || '',
        email: employeeToEdit.email || '',
        password: '', // Leave blank when editing unless admin wants to change it
        designation: employeeToEdit.designation || '',
        department: employeeToEdit.department || 'Engineering',
        salary: employeeToEdit.salary || '',
        phone: employeeToEdit.phone || '',
        status: employeeToEdit.status || 'Active',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        designation: '',
        department: 'Engineering',
        salary: '',
        phone: '',
        status: 'Active',
      });
    }
    setError('');
    setShowPassword(false);
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field validations
    if (!formData.name.trim()) {
      setError('Employee name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Work email is required.');
      return;
    }
    if (!isEditing && !formData.password.trim()) {
      setError('Password is required for employee access.');
      return;
    }
    if (!formData.designation.trim()) {
      setError('Designation / Job title is required.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        salary: formData.salary ? Number(formData.salary) : 0,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              {isEditing ? <Save className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? 'Edit Employee Details' : 'Add New Employee'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isEditing ? `Updating ${employeeToEdit.employeeId}` : 'Create employee record & login access'}
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

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <p>{error}</p>
          </div>
        )}

        {/* Employee Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Full Name (Required) */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-indigo-400" />
              <span>Full Name <strong className="text-rose-400">*</strong></span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* 2. Email Address (Required) */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-indigo-400" />
              <span>Work Email <strong className="text-rose-400">*</strong></span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. john.doe@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* 3. Password (Required for new employee) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-indigo-400" />
                <span>
                  Password {isEditing ? <span className="text-slate-500 font-normal">(Leave blank to keep current)</span> : <strong className="text-rose-400">*</strong>}
                </span>
              </label>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, password: 'password123' })}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 transition"
                >
                  ⚡ Set default (password123)
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required={!isEditing}
                placeholder={isEditing ? 'Enter new password if changing' : '••••••••'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Employee will use this password to log in via Employee Login.
            </p>
          </div>

          {/* 4. Designation & Department (Required) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                <span>Designation <strong className="text-rose-400">*</strong></span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Frontend Engineer"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-indigo-400" />
                <span>Department</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. Salary, Phone & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-indigo-400" />
                <span>Annual Salary ($)</span>
              </label>
              <input
                type="number"
                placeholder="85000"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-indigo-400" />
                <span>Phone</span>
              </label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
