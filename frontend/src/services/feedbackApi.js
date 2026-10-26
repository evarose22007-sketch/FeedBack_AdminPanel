// every request to the backend //
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace(/\/+$/, '');
export class RequestError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.fields = fields;
  }
}
async function call(path, method = 'GET', payload) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers: payload ? { 'Content-Type': 'application/json' } : undefined,
      body: payload ? JSON.stringify(payload) : undefined,
    });
  } catch {
    throw new RequestError('Cannot reach the server. Make sure the backend is running.');
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new RequestError(body.message || `Request failed (${response.status})`, body.fields);
  return body;
}
export const fetchCourses = () => call('/courses');
export const fetchAllFeedback = () => call('/feedback');
export const fetchFeedback = (id) => call(`/feedback/${id}`);
export const createFeedback = (data) => call('/feedback', 'POST', data);
export const updateFeedback = (id, data) => call(`/feedback/${id}`, 'PUT', data);
export const removeFeedback = (id) => call(`/feedback/${id}`, 'DELETE');