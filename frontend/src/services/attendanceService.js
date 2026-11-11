/**
 * Attendance API Service Helper
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getEndpoint = () => `${BASE_URL.replace(/\/$/, '')}/attendance`;

/**
 * Helper to fetch with fallback to relative proxy
 */
const safeFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  } catch (err) {
    if (url.startsWith('http')) {
      const parsed = new URL(url);
      const relativeUrl = `${parsed.pathname}${parsed.search}`;
      try {
        const fallbackRes = await fetch(relativeUrl, options);
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) return fallbackData;
      } catch {
        // Fallback failed
      }
    }
    throw err;
  }
};

/**
 * Fetch today's check-in / check-out status
 */
export const fetchTodayAttendance = async ({ employeeId, email }) => {
  const query = new URLSearchParams();
  if (employeeId) query.append('employeeId', employeeId);
  if (email) query.append('email', email);

  const url = `${getEndpoint()}/today?${query.toString()}`;
  const data = await safeFetch(url);
  return data;
};

/**
 * Record Check-In
 */
export const checkInApi = async ({ employeeId, email, notes = '' }) => {
  const url = `${getEndpoint()}/check-in`;
  const data = await safeFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, email, notes }),
  });
  return data;
};

/**
 * Record Check-Out
 */
export const checkOutApi = async ({ employeeId, email, notes = '' }) => {
  const url = `${getEndpoint()}/check-out`;
  const data = await safeFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, email, notes }),
  });
  return data;
};

/**
 * Fetch monthly attendance calendar data (attendance records, holidays, leaves, adjustments)
 */
export const fetchCalendarAttendance = async ({ employeeId, email, year, month }) => {
  const query = new URLSearchParams();
  if (employeeId) query.append('employeeId', employeeId);
  if (email) query.append('email', email);
  if (year) query.append('year', year);
  if (month) query.append('month', month);

  const url = `${getEndpoint()}/calendar?${query.toString()}`;
  const data = await safeFetch(url);
  return data;
};

/**
 * Submit an Attendance Adjustment Request
 */
export const createAdjustmentApi = async ({
  employeeId,
  email,
  date,
  adjustedCheckIn,
  adjustedCheckOut,
  reason,
}) => {
  const url = `${getEndpoint()}/adjustments`;
  const data = await safeFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      employeeId,
      email,
      date,
      adjustedCheckIn,
      adjustedCheckOut,
      reason,
    }),
  });
  return data;
};

/**
 * Fetch Attendance Adjustment Requests (Employee or Admin)
 */
export const fetchAdjustmentsApi = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.employeeId) query.append('employeeId', params.employeeId);
  if (params.email) query.append('email', params.email);
  if (params.status && params.status !== 'All') query.append('status', params.status);

  const url = `${getEndpoint()}/adjustments?${query.toString()}`;
  const data = await safeFetch(url);
  return data;
};

/**
 * Admin Approve Attendance Adjustment
 */
export const approveAdjustmentApi = async (id, payload = {}) => {
  const url = `${getEndpoint()}/adjustments/${id}/approve`;
  const data = await safeFetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return data;
};

/**
 * Admin Reject Attendance Adjustment
 */
export const rejectAdjustmentApi = async (id, adminRemarks = '') => {
  const url = `${getEndpoint()}/adjustments/${id}/reject`;
  const data = await safeFetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminRemarks }),
  });
  return data;
};
