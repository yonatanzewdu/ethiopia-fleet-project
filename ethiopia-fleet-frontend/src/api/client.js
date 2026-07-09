let inMemoryToken = null;

export function setToken(token) {
  inMemoryToken = token;
  try {
    sessionStorage.setItem('fleet_token', token);
  } catch {
    // sessionStorage unavailable (e.g. private mode) — token will only
    // survive for this page load, same as before this fix
  }
}

export function getToken() {
  if (!inMemoryToken) {
    try {
      inMemoryToken = sessionStorage.getItem('fleet_token');
    } catch {
      inMemoryToken = null;
    }
  }
  return inMemoryToken;
}

export function clearToken() {
  inMemoryToken = null;
  try {
    sessionStorage.removeItem('fleet_token');
  } catch {}
}

const API = import.meta.env.VITE_API_URL || 'https://ethiopia-fleet-project.onrender.com';

let onUnauthorized = () => {};
export function registerUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function handleResponse(res, { skipAuthRedirect = false } = {}) {
  if (res.status === 401 && !skipAuthRedirect) {
    onUnauthorized();
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return res.json().catch(() => ({}));
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const get = (path) =>
  fetch(`${API}${path}`, { headers: authHeaders() }).then(handleResponse);

export const post = (path, body) =>
  fetch(`${API}${path}`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  }).then((res) => handleResponse(res, { skipAuthRedirect: path === '/auth/login' }));

export const patch = (path, body) =>
  fetch(`${API}${path}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  }).then(handleResponse);

export const put = (path, body) =>
  fetch(`${API}${path}`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  }).then(handleResponse);

export const del = (path) =>
  fetch(`${API}${path}`, { method: 'DELETE', headers: authHeaders() }).then(
    handleResponse,
  );

export const postForm = (path, formData) =>
  fetch(`${API}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  }).then(handleResponse);

// Binary download — returns a Blob instead of parsed JSON.
// Used for PDF report endpoints.
export async function getBlob(path) {
  const res = await fetch(`${API}${path}`, { headers: authHeaders() });
  if (res.status === 401) {
    onUnauthorized();
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return res.blob();
}

export { API };
