import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TabView from '../components/TabView';
import { getAuthUser, clearAuth } from '../services/api';
import { LogOut, Menu } from 'lucide-react';

/**
 * Main Home / Dashboard Page
 * Features a collapsible sidebar toggled by the lines button (hamburger)
 * Automatically tailors navigation and views for Employee vs Admin
 */
export default function HomePage() {
  const navigate = useNavigate();
  const user = getAuthUser() || { name: 'Admin', email: 'admin@hrms.com', role: 'admin' };
  const isEmployee = user.role === 'employee';

  // Sidebar toggle state (open by default on desktop)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Active navigation tab:
  // - Employee: 'home' | 'leaves' | 'payslips' | 'documents'
  // - Admin: 'dashboard' | 'employees' | 'holidays' | 'leaves' | 'payroll'
  const [activeTab, setActiveTab] = useState(isEmployee ? 'home' : 'dashboard');

  // Active leave sub-filter for employee: 'Pending' | 'Approved' | 'History'
  const [leaveSubTab, setLeaveSubTab] = useState('Pending');

  // Handle switching tabs (and optional sub-tab for leaves)
  const handleSelectTab = (tabId, subTab = null) => {
    setActiveTab(tabId);
    if (subTab) {
      setLeaveSubTab(subTab);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* 1. Collapsible Sidebar with Role-based Tabs */}
      <Sidebar
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        leaveSubTab={leaveSubTab}
        userRole={user.role}
        onSelectTab={handleSelectTab}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar with the Lines (Hamburger) Button */}
        <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Lines (Hamburger) Button to toggle sidebar open & close */}
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              title={isSidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Right Header: Profile Badge & Logout */}
          <div className="flex items-center gap-3">
            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
              <div
                className={`h-6 w-6 rounded-lg text-white font-bold flex items-center justify-center text-[10px] ${
                  isEmployee
                    ? 'bg-gradient-to-tr from-amber-600 to-orange-500'
                    : 'bg-gradient-to-tr from-indigo-600 to-sky-500'
                }`}
              >
                {(user.name || 'AD')
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || 'AD'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-slate-200 leading-tight">
                    {user.name || 'Admin User'}
                  </p>
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono font-semibold ${
                      isEmployee
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {isEmployee ? 'Employee' : 'Admin'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">{user.email || 'admin@hrms.com'}</p>
              </div>
            </div>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 active:scale-95 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <TabView
            tabId={activeTab}
            leaveSubTab={leaveSubTab}
            onSelectTab={handleSelectTab}
          />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 py-3.5 px-6 text-center text-xs text-slate-600">
          HRMS Portal • Vite + React + Tailwind CSS & Express + MongoDB
        </footer>
      </div>
    </div>
  );
}
