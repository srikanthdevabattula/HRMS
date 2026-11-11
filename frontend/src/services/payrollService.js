/**
 * Payroll API Service Helper
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getEndpoint = () => `${BASE_URL.replace(/\/$/, '')}/payroll`;

export const fetchPayrollRecords = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.month && params.month !== 'All') query.append('month', params.month);
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.attendance && params.attendance !== 'All') query.append('attendance', params.attendance);
  if (params.employeeId) query.append('employeeId', params.employeeId);
  if (params.email) query.append('email', params.email);
  if (params.employeeName) query.append('employeeName', params.employeeName);

  const url = `${getEndpoint()}?${query.toString()}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch payroll');
  return data;
};

export const generatePayrollApi = async (month) => {
  const response = await fetch(`${getEndpoint()}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to generate payroll');
  return data;
};

export const updatePayrollStatusApi = async (id, status) => {
  const response = await fetch(`${getEndpoint()}/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update payroll status');
  return data.data;
};
