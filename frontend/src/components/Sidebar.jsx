import React, { useState } from 'react';
import Logo from './Logo';
import {
  Home,
  LayoutDashboard,
  Users,
  CalendarDays,
  CalendarCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  History,
  ChevronDown,
  ChevronRight,
  Receipt,
  FolderLock,
} from 'lucide-react';

/**
 * Navigation Items for Admin
 */
const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'holidays', label: 'Holidays', icon: CalendarDays },
  { id: 'leaves', label: 'Leaves', icon: CalendarCheck },
  { id: 'adjustments', label: 'Adjustments', icon: Clock },
  { id: 'payroll', label: 'Payroll', icon: CreditCard },
];

/**
 * Sub-items for Employee Leaves
 */
const EMPLOYEE_LEAVE_SUB_ITEMS = [
  { id: 'Pending', label: 'Pending', icon: Clock },
  { id: 'Approved', label: 'Approved', icon: CheckCircle2 },
  { id: 'History', label: 'History', icon: History },
];

/**
 * Collapsible Sidebar Component
 * Adapts based on user role:
 * - Employee: Home, Leaves (with sub-items: Approved, Pending, History)
 * - Admin: Dashboard, Employees, Holidays, Leaves, Payroll
 */
export default function Sidebar({
  isOpen,
  activeTab,
  leaveSubTab = 'Pending',
  userRole = 'admin',
  onSelectTab,
  onClose,
}) {
  const isEmployee = userRole === 'employee';
  // State to keep leaves accordion open on employee side
  const [leavesExpanded, setLeavesExpanded] = useState(true);

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'
        }`}
      >
        {/* Sidebar Header: Shows full Logo when open, Icon-only when collapsed */}
        <div className="flex h-16 items-center px-4 border-b border-slate-800 shrink-0">
          {isOpen ? (
            <div className="w-full flex items-center justify-start overflow-hidden">
              <Logo size="default" showSubtitle={false} />
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
              <Logo iconOnly size="default" />
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {isEmployee ? (
            // ================= EMPLOYEE NAVIGATION =================
            <>
              {/* 1. Home Tab */}
              <button
                onClick={() => onSelectTab('home')}
                title={!isOpen ? 'Home' : undefined}
                className={`relative flex items-center w-full rounded-xl py-3 text-xs font-semibold transition cursor-pointer ${
                  isOpen ? 'px-3.5 gap-3.5 justify-start' : 'justify-center px-0'
                } ${
                  activeTab === 'home'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`}
              >
                <Home className={`h-5 w-5 shrink-0 ${activeTab === 'home' ? 'text-white' : 'text-slate-400'}`} />
                {isOpen && <span className="whitespace-nowrap">Home</span>}
                {!isOpen && activeTab === 'home' && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-sky-400" />
                )}
              </button>

              {/* 2. Leaves Tab with Sub-items: Approved, Pending, History */}
              <div>
                <button
                  onClick={() => {
                    onSelectTab('leaves', leaveSubTab || 'Pending');
                    if (isOpen) setLeavesExpanded((prev) => !prev);
                  }}
                  title={!isOpen ? 'Leaves (Approved, Pending, History)' : undefined}
                  className={`relative flex items-center w-full rounded-xl py-3 text-xs font-semibold transition cursor-pointer ${
                    isOpen ? 'px-3.5 gap-3.5 justify-between' : 'justify-center px-0'
                  } ${
                    activeTab === 'leaves'
                      ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`}
                >
                  <div className={`flex items-center ${isOpen ? 'gap-3.5' : ''}`}>
                    <CalendarCheck
                      className={`h-5 w-5 shrink-0 ${
                        activeTab === 'leaves' ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    />
                    {isOpen && <span className="whitespace-nowrap">Leaves</span>}
                  </div>

                  {isOpen && (
                    <div className="text-slate-500 hover:text-slate-300">
                      {leavesExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  )}

                  {!isOpen && activeTab === 'leaves' && (
                    <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-400" />
                  )}
                </button>

                {/* Sub-items list: Approved, Pending, History */}
                {isOpen && leavesExpanded && (
                  <div className="mt-1 ml-4 pl-3 border-l border-slate-800 space-y-1">
                    {EMPLOYEE_LEAVE_SUB_ITEMS.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeTab === 'leaves' && leaveSubTab === sub.id;

                      return (
                        <button
                          key={sub.id}
                          onClick={() => onSelectTab('leaves', sub.id)}
                          className={`flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 text-[11px] font-medium transition cursor-pointer ${
                            isSubActive
                              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/25'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          }`}
                        >
                          <SubIcon className={`h-3.5 w-3.5 ${isSubActive ? 'text-amber-400' : 'text-slate-500'}`} />
                          <span>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Payslips Tab */}
              <button
                onClick={() => onSelectTab('payslips')}
                title={!isOpen ? 'Payslips' : undefined}
                className={`relative flex items-center w-full rounded-xl py-3 text-xs font-semibold transition cursor-pointer ${
                  isOpen ? 'px-3.5 gap-3.5 justify-start' : 'justify-center px-0'
                } ${
                  activeTab === 'payslips'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`}
              >
                <Receipt className={`h-5 w-5 shrink-0 ${activeTab === 'payslips' ? 'text-white' : 'text-slate-400'}`} />
                {isOpen && <span className="whitespace-nowrap">Payslips</span>}
                {!isOpen && activeTab === 'payslips' && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
              </button>

              {/* 4. Documents & Assets Tab */}
              <button
                onClick={() => onSelectTab('documents')}
                title={!isOpen ? 'Documents & Assets' : undefined}
                className={`relative flex items-center w-full rounded-xl py-3 text-xs font-semibold transition cursor-pointer ${
                  isOpen ? 'px-3.5 gap-3.5 justify-start' : 'justify-center px-0'
                } ${
                  activeTab === 'documents'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`}
              >
                <FolderLock className={`h-5 w-5 shrink-0 ${activeTab === 'documents' ? 'text-white' : 'text-slate-400'}`} />
                {isOpen && <span className="whitespace-nowrap">Documents & Assets</span>}
                {!isOpen && activeTab === 'documents' && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                )}
              </button>
            </>
          ) : (
            // ================= ADMIN NAVIGATION =================
            ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={!isOpen ? item.label : undefined}
                  className={`relative flex items-center w-full rounded-xl py-3 text-xs font-semibold transition cursor-pointer ${
                    isOpen ? 'px-3.5 gap-3.5 justify-start' : 'justify-center px-0'
                  } ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {isOpen && <span className="whitespace-nowrap">{item.label}</span>}
                  {!isOpen && isActive && (
                    <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-sky-400" />
                  )}
                </button>
              );
            })
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 shrink-0">
          {isOpen ? (
            <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-[11px] text-slate-400 text-center">
              <p className="font-semibold text-indigo-400">
                {isEmployee ? 'Employee Portal' : 'Admin Console'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">v1.0.0 • Connected</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="h-2 w-2 rounded-full bg-emerald-500" title="System Connected" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
