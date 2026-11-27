// src/api/client.js
// One place that talks to the Spring Boot backend.
// Every member's feature calls api.get / api.post / api.put / api.patch / api.del from here.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
// Residents and staff keep separate logins (the staff pages have ?role=staff in the address),
// so both can stay logged in at the same time in different tabs of the same browser.
const AREA = new URLSearchParams(window.location.search).get('role') === 'staff' ? 'staff' : 'resident';
const TOKEN_KEY = `brgy_token_${AREA}`;

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (token) => {
  try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY); } catch { /* private mode */ }
};

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  // Token expired or invalid: forget it so the app shows the login page again.
  if (res.status === 401 && token) {
    setToken(null);
    window.dispatchEvent(new Event('auth:expired'));
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body ?? {}),
  put: (path, body) => request('PUT', path, body ?? {}),
  patch: (path, body) => request('PATCH', path, body ?? {}),
  del: (path) => request('DELETE', path),
};
