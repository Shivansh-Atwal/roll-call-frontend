export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api');

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    // If the backend already provides success field, return as is
    if (data.hasOwnProperty('success')) {
      return data;
    }
    
    // Otherwise, add success field for backward compatibility
    return { success: true, ...data };
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error.message };
  }
};

// Authentication API
export const authAPI = {
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  updateProfile: (profileData) => apiCall('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),

  changePassword: (passwordData) => apiCall('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  }),

  getProfile: () => apiCall('/auth/profile'),
};

// Events API
export const eventsAPI = {
  createEvent: (eventData) => apiCall('/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  }),

  getEvents: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/events?${queryString}`);
  },

  getAllEvents: () => apiCall('/events/all'),

  getActiveEvents: () => apiCall('/events/active'),

  getEvent: (eventId) => apiCall(`/events/${eventId}`),

  getUpcomingEventsCount: () => apiCall('/events/upcoming/count'),

  updateEvent: (eventId, eventData) => apiCall(`/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  }),

  deleteEvent: (eventId) => apiCall(`/events/${eventId}`, {
    method: 'DELETE',
  }),


  getActiveEvents: () => apiCall('/events/active'),

  getEventStats: () => apiCall('/events/stats/overview'),
};

// Attendance API
export const attendanceAPI = {
  markAttendance: (attendanceData) => apiCall('/attendance/mark', {
    method: 'POST',
    body: JSON.stringify(attendanceData),
  }),

  getUserAttendance: (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/attendance/user/${userId}?${queryString}`);
  },

  getEventAttendance: (eventId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/attendance/event/${eventId}?${queryString}`);
  },

  getAttendanceReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/attendance/report?${queryString}`);
  },

  generatePDFReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/attendance/report/pdf?${queryString}`);
  },

  bulkMarkAttendance: (bulkData) => apiCall('/attendance/bulk-mark', {
    method: 'POST',
    body: JSON.stringify(bulkData),
  }),

  getAttendanceStats: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/attendance/stats?${queryString}`);
  },

  getUserAttendanceStats: (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/attendance/user-stats/${userId}?${queryString}`);
  },

  getEventAttendanceStats: (eventId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/attendance/event-stats/${eventId}?${queryString}`);
  },
};

// QR Code API
export const qrAPI = {
  generateUserQR: (userId) => apiCall(`/qr/generate/${userId}`),

  scanQR: (qrData) => apiCall('/qr/scan', {
    method: 'POST',
    body: JSON.stringify({ qrData }),
  }),

  getUserQR: (userId) => apiCall(`/qr/user/${userId}`),

  regenerateQR: (userId) => apiCall(`/qr/regenerate/${userId}`, {
    method: 'POST',
  }),

  validateQR: (qrData) => apiCall('/qr/validate', {
    method: 'POST',
    body: JSON.stringify({ qrData }),
  }),
};

// Users API (Admin only)
export const usersAPI = {
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/users?${queryString}`);
  },

  getUser: (userId) => apiCall(`/users/${userId}`),

  updateUser: (userId, userData) => apiCall(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),

  deleteUser: (userId) => apiCall(`/users/${userId}`, {
    method: 'DELETE',
  }),

  getUserStats: () => apiCall('/users/stats/overview'),

  getUsersByTrade: (trade, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/users/trade/${trade}?${queryString}`);
  },
};

// Notices API
export const noticesAPI = {
  getUpcomingNotices: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/notices?${queryString}`);
  },

  getNoticesByType: (type, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/notices/type/${type}?${queryString}`);
  },

  getTodayEvents: () => apiCall('/notices/today'),

  getWeeklySchedule: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/notices/weekly?${queryString}`);
  },

  getNextWeekEvents: () => apiCall('/notices/next-week'),

  getNextMonthEvents: () => apiCall('/notices/next-month'),
};

// Teams API
export const teamsAPI = {
  createTeam: (teamData) => apiCall('/teams/create', {
    method: 'POST',
    body: JSON.stringify(teamData),
  }),

  getAllTeams: () => apiCall('/teams/all'),

  getMyTeams: () => apiCall('/teams/my-teams'),

  getTeam: (teamId) => apiCall(`/teams/${teamId}`),

  getTeamMembers: (teamId) => apiCall(`/teams/${teamId}/members`),

  addMembersToTeam: (teamId, memberIds) => apiCall(`/teams/${teamId}/add-members`, {
    method: 'POST',
    body: JSON.stringify({ memberIds }),
  }),

  removeMemberFromTeam: (teamId, memberId) => apiCall(`/teams/${teamId}/members/${memberId}`, {
    method: 'DELETE',
  }),

  updateTeam: (teamId, teamData) => apiCall(`/teams/${teamId}`, {
    method: 'PUT',
    body: JSON.stringify(teamData),
  }),

  deleteTeam: (teamId) => apiCall(`/teams/${teamId}`, {
    method: 'DELETE',
  }),

  markTeamAttendance: (attendanceData) => apiCall('/attendance/mark-team', {
    method: 'POST',
    body: JSON.stringify(attendanceData),
  }),
};

// Health check API
export const healthAPI = {
  check: () => apiCall('/api/health'),
  testCors: () => apiCall('/api/test-cors'),
};

export default {
  auth: authAPI,
  events: eventsAPI,
  attendance: attendanceAPI,
  qr: qrAPI,
  users: usersAPI,
  notices: noticesAPI,
  health: healthAPI,
};
