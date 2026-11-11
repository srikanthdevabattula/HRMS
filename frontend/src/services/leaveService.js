/**
 * Leave API Service Helper
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getEndpoint = () => `${BASE_URL.replace(/\/$/, '')}/leaves`;

/**
 * Fetch leaves with optional filters (status, employeeId, email)
 * Supports passing a string status or an options object
 */
export const fetchLeaves = async (filters = {}) => {
  const query = new URLSearchParams();

  if (typeof filters === 'string') {
    if (filters && filters !== 'All' && filters !== 'History') {
      query.append('status', filters);
    }
  } else if (filters && typeof filters === 'object') {
    if (filters.status && filters.status !== 'All' && filters.status !== 'History') {
      query.append('status', filters.status);
    }
    if (filters.employeeId) {
      query.append('employeeId', filters.employeeId);
    }
    if (filters.email) {
      query.append('email', filters.email);
    }
    if (filters.employeeName) {
      query.append('employeeName', filters.employeeName);
    }
  }

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const primaryUrl = `${getEndpoint()}${queryString}`;

  try {
    const response = await fetch(primaryUrl);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch leaves');
    return data.data || [];
  } catch (error) {
    if (primaryUrl.startsWith('http')) {
      try {
        const fallbackRes = await fetch(`/api/leaves${queryString}`);
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) {
          return fallbackData.data || [];
        }
      } catch {
        // Fallback also failed, rethrow original error
      }
    }
    throw error;
  }
};

export const applyLeaveApi = async (leaveData) => {
  const response = await fetch(getEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leaveData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to submit leave request');
  return data.data;
};

export const updateLeaveStatusApi = async (id, status) => {
  const response = await fetch(`${getEndpoint()}/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update leave status');
  return data.data;
};

/**
 * Cancel or revert leave application by employee (allowed in Pending or Approved state)
 */
export const cancelLeaveApi = async (id, reason = 'Cancelled by employee') => {
  const primaryUrl = `${getEndpoint()}/${id}/cancel`;
  try {
    const response = await fetch(primaryUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to cancel leave application');
    return data.data;
  } catch (error) {
    if (primaryUrl.startsWith('http')) {
      try {
        const fallbackRes = await fetch(`/api/leaves/${id}/cancel`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) return fallbackData.data;
      } catch {
        // Fallback failed
      }
    }
    // Also try standard status update fallback with 'Cancelled'
    try {
      const statusRes = await fetch(`${getEndpoint()}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled', reviewedBy: reason }),
      });
      const statusData = await statusRes.json();
      if (statusRes.ok) return statusData.data;
    } catch {
      // Status fallback failed
    }
    throw error;
  }
};

export const deleteLeaveApi = async (id) => {
  const response = await fetch(`${getEndpoint()}/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete leave request');
  return data.data;
};

