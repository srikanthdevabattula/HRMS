import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { loginApi, saveAuth } from '../services/api';
import { ShieldCheck, UserCheck, AlertCircle, Lock, Mail, ArrowRight } from 'lucide-react';

/**
 * Login Page Component
 * Provides both Admin Login and Employee Login
 */
export default function LoginPage() {
  const navigate = useNavigate();

  // Active tab state: 'admin' | 'employee'
  const [activeTab, setActiveTab] = useState('admin');

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Employee form state
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');

  // UI status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Helper to prefill admin credentials from .env for quick testing
  const handleQuickFillAdmin = () => {
    setAdminEmail('admin@hrms.com');
    setAdminPassword('admin123');
    setErrorMessage('');
  };

  // Handle Admin Login submission
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await loginApi(adminEmail, adminPassword, 'admin');

      if (response.success && response.token) {
        // Save token and user details to localStorage
        saveAuth(response.token, response.user);
        navigate('/', { replace: true });
      } else {
        setErrorMessage(response.message || 'Login failed.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Employee Login submission
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await loginApi(employeeEmail, employeePassword, 'employee');

      if (response.success && response.token) {
        saveAuth(response.token, response.user);
        navigate('/', { replace: true });
      } else {
        setErrorMessage(response.message || 'Invalid employee email or password.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to authenticate employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Logo size="large" />
          <p className="text-xs text-slate-400 max-w-xs">
            Sign in to access your HR management portal and organization dashboard.
          </p>
        </div>

        {/* Tab Selection: Admin Login vs Employee Login */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setErrorMessage('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'admin'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Admin Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('employee');
              setErrorMessage('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'employee'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Employee Login</span>
          </button>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* ================= ADMIN LOGIN FORM ================= */}
        {activeTab === 'admin' ? (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@hrms.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleQuickFillAdmin}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition"
                >
                  ⚡ Quick Autofill
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as Administrator</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ================= EMPLOYEE LOGIN FORM ================= */
          <form onSubmit={handleEmployeeSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] leading-relaxed">
              Employees can sign in with the email & password set by the Administrator.
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Employee Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={employeeEmail}
                  onChange={(e) => setEmployeeEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={employeePassword}
                  onChange={(e) => setEmployeePassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as Employee</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-500">
            Secure HRMS Portal • Environment Protected
          </p>
        </div>
      </div>
    </div>
  );
}
