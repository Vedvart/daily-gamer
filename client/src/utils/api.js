// API utility for making requests to the backend

const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.status = status;
    this.details = details;
    this.isApiError = true;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Remove Content-Type for GET requests without body
  if (!options.body && config.headers['Content-Type']) {
    delete config.headers['Content-Type'];
  }

  // Stringify body if it's an object
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);

    // Handle no-content responses
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'An error occurred',
        response.status,
        data.details
      );
    }

    return data;
  } catch (error) {
    if (error.isApiError) {
      throw error;
    }
    // Network or parsing error
    throw new ApiError(
      error.message || 'Network error',
      0,
      null
    );
  }
}

// HTTP method helpers
const api = {
  get: (endpoint, params = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    ).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return request(url);
  },

  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),

  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),

  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),

  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

// User API
export const userApi = {
  list: (limit) => api.get('/users', { limit }),
  getById: (id) => api.get(`/users/${id}`),
  getByUsername: (username) => api.get(`/users/username/${username}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  checkUsername: (id, username) => api.get(`/users/${id}/check-username`, { username }),
};

// Results API
export const resultsApi = {
  list: (filters) => api.get('/results', filters),
  getToday: (userId) => api.get(`/results/today/${userId}`),
  getById: (id) => api.get(`/results/${id}`),
  getHistogram: (userId, gameId) => api.get(`/results/histogram/${userId}/${gameId}`),
  getStats: (userId, gameId) => api.get(`/results/stats/${userId}/${gameId}`),
  getLeaderboard: (gameId, date, userIds) =>
    api.get('/results/leaderboard', { gameId, date, userIds: userIds?.join(',') }),
  getHistoricalLeaderboard: (gameId, userIds, limit) =>
    api.get('/results/leaderboard/historical', { gameId, userIds: userIds?.join(','), limit }),
  create: (data) => api.post('/results', data),
  delete: (id) => api.delete(`/results/${id}`),
  deleteByUnique: (userId, gameId, puzzleNumber) =>
    api.delete(`/results/${userId}/${gameId}/${puzzleNumber}`),
};

// Groups API
export const groupsApi = {
  list: (params) => api.get('/groups', params),
  getUserGroups: (userId) => api.get(`/groups/user/${userId}`),
  getById: (id, userId) => api.get(`/groups/${id}`, { userId }),
  getByInviteCode: (code) => api.get(`/groups/invite/${code}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.patch(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),

  // Membership
  getMembers: (groupId) => api.get(`/groups/${groupId}/members`),
  join: (groupId, userId, password) => api.post(`/groups/${groupId}/join`, { userId, password }),
  leave: (groupId, userId) => api.post(`/groups/${groupId}/leave`, { userId }),
  updateMemberRole: (groupId, userId, role) =>
    api.patch(`/groups/${groupId}/members/${userId}`, { role }),
  removeMember: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`),

  // Invites
  getInvites: (groupId) => api.get(`/groups/${groupId}/invites`),
  createInvite: (groupId, userId, invitedBy) =>
    api.post(`/groups/${groupId}/invites`, { userId, invitedBy }),
  getUserInvites: (userId) => api.get(`/groups/invites/user/${userId}`),
  respondToInvite: (groupId, userId, accept) =>
    api.post(`/groups/${groupId}/invites/${userId}/respond`, { accept }),

  // Leaderboard
  getLeaderboard: (groupId, type, gameId, date) =>
    api.get(`/groups/${groupId}/leaderboard`, { type, gameId, date }),
};

// Discussions API
export const discussionsApi = {
  getThreads: (groupId, params) => api.get(`/groups/${groupId}/threads`, params),
  getThread: (groupId, threadId, params) =>
    api.get(`/groups/${groupId}/threads/${threadId}`, params),
  getDailyThread: (groupId, gameId, date, userId) =>
    api.get(`/groups/${groupId}/threads/daily/${gameId}/${date}`, { userId }),
  createThread: (groupId, data) => api.post(`/groups/${groupId}/threads`, data),
  updateThread: (groupId, threadId, data) =>
    api.patch(`/groups/${groupId}/threads/${threadId}`, data),
  deleteThread: (groupId, threadId) => api.delete(`/groups/${groupId}/threads/${threadId}`),

  // Comments
  addComment: (groupId, threadId, data) =>
    api.post(`/groups/${groupId}/threads/${threadId}/comments`, data),
  updateComment: (groupId, threadId, commentId, content) =>
    api.patch(`/groups/${groupId}/threads/${threadId}/comments/${commentId}`, { content }),
  deleteComment: (groupId, threadId, commentId) =>
    api.delete(`/groups/${groupId}/threads/${threadId}/comments/${commentId}`),
};

// Health check
export const healthApi = {
  check: () => api.get('/health'),
};

export { ApiError };
export default api;
