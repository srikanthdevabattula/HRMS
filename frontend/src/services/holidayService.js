/**
 * Holiday API Service Helper
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getEndpoint = () => `${BASE_URL.replace(/\/$/, '')}/holidays`;

export const fetchHolidays = async () => {
  const response = await fetch(getEndpoint());
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch holidays');
  return data.data || [];
};

export const addHoliday = async (holidayData) => {
  const response = await fetch(getEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(holidayData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create holiday');
  return data.data;
};

export const removeHoliday = async (id) => {
  const response = await fetch(`${getEndpoint()}/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete holiday');
  return data.data;
};

