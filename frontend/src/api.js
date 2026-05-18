export const apiBase =
  process.env.REACT_APP_API_URL ||
  'https://golden-house-production.up.railway.app/api';

export const getFullImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/150';
  if (url.startsWith('http')) return url;
  const backendUrl = apiBase.replace('/api', '');
  return `${backendUrl}${url}`;
};

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

  const parseBody = async () => {
    try {
      return await response.json();
    } catch (e) {
      return { error: response.statusText || 'Unknown error' };
    }
  };

  const body = await parseBody();

  if (!response.ok) {
    const err =
      body && (body.error || body.message)
        ? body
        : { error: body };

    throw err;
  }

  return body;
};