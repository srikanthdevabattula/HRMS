import React from 'react';
import DashboardView from '../views/DashboardView';
import EmployeeHomeView from '../views/EmployeeHomeView';
import EmployeesView from '../views/EmployeesView';
import HolidaysView from '../views/HolidaysView';
import LeavesView from '../views/LeavesView';
import PayrollView from '../views/PayrollView';
import AdminAdjustmentsView from '../views/AdminAdjustmentsView';
import EmployeePayslipsView from '../views/EmployeePayslipsView';
import EmployeeDocumentsView from '../views/EmployeeDocumentsView';
import { getAuthUser } from '../services/api';

/**
 * TabView Component
 * Renders the active module view based on the selected sidebar tab and role
 *
 * @param {string} tabId - Active tab: 'home' | 'dashboard' | 'employees' | 'holidays' | 'leaves' | 'payroll' | 'payslips' | 'documents'
 * @param {string} leaveSubTab - Active leave filter for employees: 'Pending' | 'Approved' | 'History'
 * @param {function} onSelectTab - Callback to switch tabs from sub-menus or dashboard widgets
 */
export default function TabView({ tabId, leaveSubTab, onSelectTab }) {
  const currentUser = getAuthUser() || { name: 'Admin', role: 'admin' };
  const isEmployee = currentUser.role === 'employee';

  switch (tabId) {
    case 'home':
      return (
        <EmployeeHomeView
          currentUser={currentUser}
          onNavigateToLeaves={(subTab) => onSelectTab && onSelectTab('leaves', subTab)}
        />
      );

    case 'leaves':
      return <LeavesView initialFilter={leaveSubTab} />;

    case 'payslips':
      return <EmployeePayslipsView currentUser={currentUser} />;

    case 'documents':
      return <EmployeeDocumentsView currentUser={currentUser} />;

    case 'employees':
      return <EmployeesView />;

    case 'holidays':
      return <HolidaysView />;

    case 'payroll':
      return <PayrollView />;

    case 'adjustments':
      return <AdminAdjustmentsView />;

    case 'dashboard':
    default:
      if (isEmployee) {
        return (
          <EmployeeHomeView
            currentUser={currentUser}
            onNavigateToLeaves={(subTab) => onSelectTab && onSelectTab('leaves', subTab)}
          />
        );
      }
      return <DashboardView onSelectTab={onSelectTab} />;
  }
}
