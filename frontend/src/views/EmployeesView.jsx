import React, { useState, useEffect } from 'react';
import {
  fetchEmployees,
  addEmployee,
  editEmployee,
  removeEmployee,
} from '../services/employeeService';
import AddEditEmployeeModal from '../components/AddEditEmployeeModal';
import ConfirmModal from '../components/ConfirmModal';
import EmployeeDetailsModal from '../components/EmployeeDetailsModal';
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Phone,
  Users,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FolderLock,
} from 'lucide-react';

const DEPARTMENTS = [
  'All',
  'Engineering',
  'Human Resources',
  'Design',
  'Marketing',
  'Finance',
  'Operations',
];

/**
 * Employees Management View
 * Allows Admin to view, search, filter, add, edit, and delete employees
 * Uses custom UI confirmation modal instead of native browser popups
 */
export default function EmployeesView() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Employee Documents & Assets Details Modal
  const [selectedEmployeeForDetails, setSelectedEmployeeForDetails] = useState(null);

  // Custom UI Delete Confirmation State
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch employees list from backend
  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await fetchEmployees({ search, department });
      setEmployees([...data].sort((a, b) => (b.salary) - (a.salary)));
    } catch (err) {
      console.warn('Failed to fetch from backend:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [search, department]);

  // Open modal for adding a new employee
  const handleAddNew = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  // Open modal for editing an existing employee
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  // Save (Create or Update) employee handler
  const handleFormSubmit = async (formData) => {
    try {
      if (editingEmployee) {
        await editEmployee(editingEmployee._id, formData);
        setFeedback({ type: 'success', message: 'Employee updated successfully!' });
      } else {
        await addEmployee(formData);
        setFeedback({ type: 'success', message: 'Employee added successfully with login access!' });
      }
      await loadEmployees();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed' });
      throw err;
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Trigger UI Confirmation modal for delete
  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
  };

  // Confirm delete handler (invoked by ConfirmModal)
  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    setDeleteLoading(true);

    try {
      await removeEmployee(employeeToDelete._id);
      setFeedback({
        type: 'success',
        message: `Employee "${employeeToDelete.name || 'Staff'}" removed successfully!`,
      });
      setEmployeeToDelete(null);
      await loadEmployees();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete employee' });
    } finally {
      setDeleteLoading(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Header with Stats & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-indigo-400" />
            <span>Employees Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage organization members, assignments, and roles. Click on any employee row to inspect and edit their verified documents and company assets.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New Employee</span>
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

      {/* Filters & Search Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, designation, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Department Filter & Refresh */}
        <div className="flex items-center gap-2.5">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All Departments' : dept}
              </option>
            ))}
          </select>

          <button
            onClick={loadEmployees}
            title="Refresh list"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Employees Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Designation & Dept</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Salary</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-500 mb-2" />
                    <span>Loading employees from MongoDB...</span>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 space-y-2">
                    <Users className="h-8 w-8 mx-auto text-slate-600 opacity-60" />
                    <p className="text-sm font-medium text-slate-400">No employees found</p>
                    <p className="text-xs text-slate-500">
                      Click "+ Add New Employee" to register your first staff member.
                    </p>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const displayName =
                    emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
                  const initials = displayName
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={emp._id}
                      onClick={() => setSelectedEmployeeForDetails(emp)}
                      className="hover:bg-slate-800/60 transition cursor-pointer group"
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold flex items-center justify-center text-xs shadow-md shrink-0 group-hover:scale-105 transition">
                            {initials || 'EM'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100 group-hover:text-indigo-300 transition">
                              {displayName}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <span className="text-indigo-400 font-semibold">{emp.employeeId}</span> • {emp.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Designation & Department */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-200">{emp.designation}</p>
                        <span className="inline-block mt-0.5 rounded-md bg-slate-800 border border-slate-700/60 px-2 py-0.5 text-[10px] text-slate-400 font-medium">
                          {emp.department}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-slate-400 text-xs">
                        {emp.phone ? (
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-slate-500" />
                            {emp.phone}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Salary */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                        {emp.salary ? `$${emp.salary.toLocaleString()}` : '$0'}
                      </td>

                      {/* Attendance Status (Empty as requested for now) */}
                      <td className="py-3.5 px-4">
                        {emp.attendanceStatus && emp.attendanceStatus !== '—' && emp.attendanceStatus !== '' ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              emp.attendanceStatus === 'Check-in'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : emp.attendanceStatus === 'Check-out'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : emp.attendanceStatus === 'On Leave'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {emp.attendanceStatus}
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono">—</span>
                        )}
                      </td>

                      {/* Account Status Badge (Active / Inactive) */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            emp.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              emp.status === 'Active'
                                ? 'bg-emerald-400'
                                : 'bg-rose-400'
                            }`}
                          />
                          {emp.status === 'Active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmployeeForDetails(emp);
                            }}
                            title="View & Edit Documents and Assets"
                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 border border-indigo-500/20 transition cursor-pointer"
                          >
                            <FolderLock className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(emp);
                            }}
                            title="Edit Employee Profile"
                            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 transition cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(emp);
                            }}
                            title="Delete Employee"
                            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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

      {/* Add / Edit Employee Modal */}
      <AddEditEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        employeeToEdit={editingEmployee}
      />

      {/* Employee Documents & Company Assets Modal (View & Edit) */}
      <EmployeeDetailsModal
        isOpen={!!selectedEmployeeForDetails}
        onClose={() => setSelectedEmployeeForDetails(null)}
        employee={selectedEmployeeForDetails}
        onEmployeeUpdated={loadEmployees}
      />

      {/* Nice Custom UI Confirmation Modal (No Browser Alert/Confirm!) */}
      <ConfirmModal
        isOpen={!!employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Employee"
        message={
          employeeToDelete
            ? `Are you sure you want to remove ${
                employeeToDelete.name || employeeToDelete.email
              }? Their account and employment records will be permanently deleted.`
            : ''
        }
        confirmText="Yes, Remove Employee"
        cancelText="Keep Employee"
        danger={true}
        loading={deleteLoading}
      />
    </div>
  );
}
