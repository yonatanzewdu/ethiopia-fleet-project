let inMemoryToken = null;

export function setToken(token) {
  inMemoryToken = token;
}

export function getToken() {
  return inMemoryToken;
}

export function clearToken() {
  inMemoryToken = null;
}

// UPDATE THIS LINE: Replace the fallback string with your actual Render Backend URL!
const API = import.meta.env.VITE_API_URL || https://ethiopia-fleet-project.onrender.com ;

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

export { API };
