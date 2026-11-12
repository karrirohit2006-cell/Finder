const API_BASE = '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('back2you_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('back2you_token', token);
  } else {
    localStorage.removeItem('back2you_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'An error occurred';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch {
      errorDetail = response.statusText || `Request failed with status ${response.status}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),
  changePassword: (data: any) => request<any>('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),

  // Profile & Stats
  getProfile: () => request<any>('/users/profile'),
  updateProfile: (data: any) => request<any>('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getDashboardStats: () => request<any>('/users/stats'),
  getUserHistory: () => request<any>('/users/history'),

  // Lost Reports
  getLostReports: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/lost-reports${qs}`);
  },
  getLostReport: (id: string | number) => request<any>(`/lost-reports/${id}`),
  createLostReport: (data: any) => request<any>('/lost-reports', { method: 'POST', body: JSON.stringify(data) }),
  updateLostReport: (id: number, data: any) => request<any>(`/lost-reports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  withdrawLostReport: (id: number) => request<any>(`/lost-reports/${id}/withdraw`, { method: 'POST' }),

  // Found Reports
  getFoundReports: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/found-reports${qs}`);
  },
  getFoundReport: (id: string | number) => request<any>(`/found-reports/${id}`),
  createFoundReport: (data: any) => request<any>('/found-reports', { method: 'POST', body: JSON.stringify(data) }),
  updateFoundReport: (id: number, data: any) => request<any>(`/found-reports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  withdrawFoundReport: (id: number) => request<any>(`/found-reports/${id}/withdraw`, { method: 'POST' }),

  // Uploads
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<any>('/uploads/image', {
      method: 'POST',
      body: formData,
    });
  },

  // Image & Keyword Search
  searchByImage: async (formData: FormData) => {
    return request<any[]>('/search/by-image', {
      method: 'POST',
      body: formData,
    });
  },

  // Recovery Requests
  getMyRecoveryRequests: (statusFilter?: string) => {
    const qs = statusFilter ? `?status_filter=${statusFilter}` : '';
    return request<any[]>(`/recovery${qs}`);
  },
  getRecoveryRequest: (idOrCode: string) => request<any>(`/recovery/${idOrCode}`),
  createRecoveryRequest: (data: { lost_report_id: number; found_report_id: number; message?: string }) =>
    request<any>('/recovery', { method: 'POST', body: JSON.stringify(data) }),
  acceptRecovery: (idOrCode: string) => request<any>(`/recovery/${idOrCode}/accept`, { method: 'POST' }),
  rejectRecovery: (idOrCode: string) => request<any>(`/recovery/${idOrCode}/reject`, { method: 'POST' }),
  cancelRecovery: (idOrCode: string) => request<any>(`/recovery/${idOrCode}/cancel`, { method: 'POST' }),
  confirmReturn: (idOrCode: string) => request<any>(`/recovery/${idOrCode}/confirm-return`, { method: 'POST' }),

  // Messaging
  getConversations: () => request<any[]>('/messages/conversations'),
  getMessages: (convId: number) => request<any[]>(`/messages/conversations/${convId}`),
  sendMessage: (convId: number, content: string) =>
    request<any>(`/messages/conversations/${convId}`, { method: 'POST', body: JSON.stringify({ content }) }),

  // Notifications
  getNotifications: () => request<any[]>('/notifications'),
  getUnreadNotificationCount: () => request<{ unread_count: number }>('/notifications/unread-count'),
  markNotificationRead: (id: number) => request<any>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'POST' }),

  // Feedback
  getPublicFeedback: () => request<any[]>('/feedback'),
  getFeedbackSummary: () => request<{ total_feedbacks: number; average_rating: number }>('/feedback/summary'),
  submitFeedback: (data: { recovery_request_id: number; rating: number; comment: string; recovery_experience?: string }) =>
    request<any>('/feedback', { method: 'POST', body: JSON.stringify(data) }),

  // Locations & Campus
  getCampusLocations: () => request<any[]>('/locations'),
  getStudentServices: () => request<any>('/student-services'),

  // Safety & Moderation
  reportUser: (data: { reported_user_id?: number; conversation_id?: number; reason: string; details: string }) =>
    request<any>('/safety/report-user', { method: 'POST', body: JSON.stringify(data) }),
  blockUser: (blockedId: number) => request<any>('/safety/block-user', { method: 'POST', body: JSON.stringify({ blocked_id: blockedId }) }),
  unblockUser: (userId: number) => request<any>(`/safety/unblock-user/${userId}`, { method: 'DELETE' }),
};
