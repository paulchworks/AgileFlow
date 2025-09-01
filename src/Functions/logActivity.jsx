// src/functions/logActivity.jsx
// Client-side helper to POST an activity payload to your backend (no Base44).

const API_BASE = (import.meta.env?.VITE_API_BASE || "/api").replace(/\/+$/, "");

function getAuthHeader() {
  const token = localStorage.getItem("token"); // adjust if you store auth elsewhere
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Send an activity payload to the backend.
 * @param {object} activity - e.g. { action: 'VIEWED_PAGE', details: {...} }
 * @param {object} [opts]
 * @param {string} [opts.token] - optional bearer token override
 * @returns {Promise<object>} parsed JSON from server
 */
export async function logActivity(activity, opts = {}) {
  if (!activity || typeof activity !== "object") {
    throw new Error("logActivity: activity must be an object");
  }

  const headers = {
    "Content-Type": "application/json",
    ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : getAuthHeader()),
  };

  const res = await fetch(`${API_BASE}/activity`, {
    method: "POST",
    headers,
    body: JSON.stringify(activity),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`logActivity failed: ${res.status} ${text}`);
  }

  return res.json();
}
