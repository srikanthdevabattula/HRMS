/**
 * Documents and Assets API Service Helper
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getEndpoint = () => `${BASE_URL.replace(/\/$/, '')}/documents`;

/**
 * Fetch employee documents with optional category or identity filters
 */
export const fetchDocuments = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.employeeId) query.append('employeeId', params.employeeId);
  if (params.email) query.append('email', params.email);
  if (params.employeeName) query.append('employeeName', params.employeeName);

  const url = `${getEndpoint()}?${query.toString()}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch documents');
    return data.data || [];
  } catch (error) {
    if (url.startsWith('http')) {
      try {
        const fallbackRes = await fetch(`/api/documents?${query.toString()}`);
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) return fallbackData.data || [];
      } catch {
        // fallback failed
      }
    }
    throw error;
  }
};

/**
 * Upload / register a new document
 */
export const uploadDocumentApi = async (docData) => {
  const url = getEndpoint();
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to upload document');
    return data.data;
  } catch (error) {
    if (url.startsWith('http')) {
      try {
        const fallbackRes = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(docData),
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) return fallbackData.data;
      } catch {
        // ignore
      }
    }
    throw error;
  }
};

/**
 * Update an existing document
 */
export const updateDocumentApi = async (docId, updateData) => {
  const url = `${getEndpoint()}/${docId}`;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update document');
    return data.data;
  } catch (error) {
    if (url.startsWith('http')) {
      try {
        const fallbackRes = await fetch(`/api/documents/${docId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) return fallbackData.data;
      } catch {
        // ignore
      }
    }
    throw error;
  }
};

/**
 * Delete a document
 */
export const deleteDocumentApi = async (docId) => {
  const url = `${getEndpoint()}/${docId}`;
  try {
    const response = await fetch(url, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete document');
    return data;
  } catch (error) {
    if (url.startsWith('http')) {
      try {
        const fallbackRes = await fetch(`/api/documents/${docId}`, {
          method: 'DELETE',
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) return fallbackData;
      } catch {
        // ignore
      }
    }
    throw error;
  }
};

/**
 * Fetch company assets assigned to employee
 */
export const fetchAssets = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.employeeId) query.append('employeeId', params.employeeId);
  if (params.email) query.append('email', params.email);
  if (params.employeeName) query.append('employeeName', params.employeeName);

  const url = `${getEndpoint()}/assets?${query.toString()}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch company assets');
    return data.data || [];
  } catch (error) {
    if (url.startsWith('http')) {
      try {
        const fallbackRes = await fetch(`/api/documents/assets?${query.toString()}`);
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) return fallbackData.data || [];
      } catch {
        // fallback failed
      }
    }
    throw error;
  }
};

/**
 * Assign a new company asset to employee
 */
export const createAssetApi = async (assetData) => {
  const url = `${getEndpoint()}/assets`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to assign company asset');
    return data.data;
  } catch (error) {
    if (url.startsWith('http')) {
      try {
        const fallbackRes = await fetch('/api/documents/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assetData),
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) return fallbackData.data;
      } catch {
        // ignore
      }
    }
    throw error;
  }
};

/**
 * Update an assigned company asset
 */
export const updateAssetApi = async (assetId, assetData) => {
  const url = `${getEndpoint()}/assets/${assetId}`;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update company asset');
    return data.data;
  } catch (error) {
    if (url.startsWith('http')) {
      try {
        const fallbackRes = await fetch(`/api/documents/assets/${assetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assetData),
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) return fallbackData.data;
      } catch {
        // ignore
      }
    }
    throw error;
  }
};

/**
 * Delete / revoke a company asset
 */
export const deleteAssetApi = async (assetId) => {
  const url = `${getEndpoint()}/assets/${assetId}`;
  try {
    const response = await fetch(url, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to revoke company asset');
    return data;
  } catch (error) {
    if (url.startsWith('http')) {
      try {
        const fallbackRes = await fetch(`/api/documents/assets/${assetId}`, {
          method: 'DELETE',
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) return fallbackData;
      } catch {
        // ignore
      }
    }
    throw error;
  }
};

/**
 * Report issue or request maintenance for an asset
 */
export const reportAssetIssueApi = async (assetId, issueData) => {
  const url = `${getEndpoint()}/assets/${assetId}/report`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issueData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to submit asset support ticket');
    return data;
  } catch (error) {
    if (url.startsWith('http')) {
      try {
        const fallbackRes = await fetch(`/api/documents/assets/${assetId}/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(issueData),
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) return fallbackData;
      } catch {
        // ignore
      }
    }
    throw error;
  }
};
