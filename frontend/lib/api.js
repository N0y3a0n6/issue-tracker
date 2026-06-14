const BASE_URL = 'http://localhost:4000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  // Projects
  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (body) => request('/projects', { method: 'POST', body: JSON.stringify(body) }),
  updateProject: (id, body) => request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Issues
  getIssues: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/issues${query ? '?' + query : ''}`);
  },
  createIssue: (body) => request('/issues', { method: 'POST', body: JSON.stringify(body) }),
  updateIssue: (id, body) => request(`/issues/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteIssue: (id) => request(`/issues/${id}`, { method: 'DELETE' }),
};
