import api from './axios';

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.patch('/auth/profile', profileData)
};

export const groundsApi = {
  list: (params) => api.get('/grounds', { params }),
  getById: (id) => api.get(`/grounds/${id}`),
  create: (groundData) => api.post('/grounds', groundData),
  update: (id, groundData) => api.patch(`/grounds/${id}`, groundData),
  delete: (id) => api.delete(`/grounds/${id}`)
};

export const slotsApi = {
  getGroundSlots: (groundId, date) => api.get(`/grounds/${groundId}/slots`, { params: { date } }),
  create: (slotData) => api.post('/slots', slotData),
  batchGenerate: (batchData) => api.post('/slots/batch', batchData),
  delete: (id) => api.delete(`/slots/${id}`)
};

export const bookingsApi = {
  create: (bookingData) => api.post('/bookings', bookingData),
  list: (params) => api.get('/bookings', { params }),
  listAll: (params) => api.get('/bookings/admin/all', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason })
};

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard')
};
