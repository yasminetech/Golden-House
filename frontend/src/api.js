export const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5500/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` })
  };

  const response = await fetch(`${apiBase}${endpoint}`, {
    ...options,
    headers
  });

  // Try to parse JSON body, but provide graceful fallback
  const parseBody = async () => {
    try {
      return await response.json();
    } catch (e) {
      return { error: response.statusText || 'Unknown error' };
    }
  };

  const body = await parseBody();
  if (!response.ok) {
    // Throw parsed error object to be handled by callers
    const err = body && (body.error || body.message) ? body : { error: body };
    throw err;
  }

  return body;
};
