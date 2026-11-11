/**
 * Employee API Service Helper
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getEndpoint = () => `${BASE_URL.replace(/\/$/, '')}/employees`;

/**
 * Fetch all employees with optional search & department filtering
 */
export const fetchEmployees = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.department && params.department !== 'All') query.append('department', params.department);

  const url = `${getEndpoint()}?${query.toString()}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch employees');
  return data.data || [];
};

/**
 * Add a new employee
 */
export const addEmployee = async (employeeData) => {
  const response = await fetch(getEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employeeData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create employee');
  return data.data;
};

/**
 * Update an existing employee
 */
export const editEmployee = async (id, employeeData) => {
  const response = await fetch(`${getEndpoint()}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employeeData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update employee');
  return data.data;
};

/**
 * Delete an employee
 */
export const removeEmployee = async (id) => {
  const response = await fetch(`${getEndpoint()}/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete employee');
  return data.data;
};

