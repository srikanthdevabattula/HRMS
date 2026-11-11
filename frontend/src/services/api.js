/**
 * Authentication and API Service Helper
 */

// Read backend API URL from environment variables, fallback to relative /api
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Perform login request to backend
 * @param {string} email
 * @param {string} password
 * @param {'admin'|'employee'} role
 */
export const loginApi = async (email, password, role = 'admin') => {
  // Construct primary login endpoint URL
  const endpoint = `${BASE_URL.replace(/\/$/, '')}/auth/login`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed. Please check your credentials.');
    }

    return data;
  } catch (error) {
    // If the error has a message from the backend (or response was processed), rethrow it directly
    if (error.message && error.message !== 'Failed to fetch' && !error.message.includes('NetworkError')) {
      throw error;
    }

    // Only retry via relative Vite proxy if network/CORS failed on absolute URL
    if (endpoint.startsWith('http')) {
      const fallbackRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });
      const fallbackData = await fallbackRes.json();
      if (!fallbackRes.ok) {
        throw new Error(fallbackData.message || 'Login failed.');
      }
      return fallbackData;
    }
    throw error;
  }
};

/**
 * LocalStorage Auth Helpers
 */
export const saveAuth = (token, user) => {
  localStorage.setItem('hrms_token', token);
  localStorage.setItem('hrms_user', JSON.stringify(user));
};

export const getAuthToken = () => {
  return localStorage.getItem('hrms_token');
};

export const getAuthUser = () => {
  const user = localStorage.getItem('hrms_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem('hrms_token');
  localStorage.removeItem('hrms_user');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

