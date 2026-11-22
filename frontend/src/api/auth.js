// src/api/auth.js - calls AuthController in the backend.
import { api, setToken } from './client';
import { LEGAL_VERSION } from '../components/Legal';

const saveSession = (res) => {
  setToken(res.token);
  return res; // { token, role: 'RESIDENT' | 'STAFF', user: {...} }
};

export const registerResident = (form) =>
  api.post('/api/auth/register', { ...form, consentVersion: LEGAL_VERSION }).then(saveSession);

export const loginResident = (email, password) =>
  api.post('/api/auth/login', { email, password }).then(saveSession);

export const loginStaff = (email, password) =>
  api.post('/api/auth/staff/login', { email, password }).then(saveSession);

export const fetchMe = () => api.get('/api/auth/me');

export const logout = () => setToken(null);


// Forgot password (Salado): step 1 emails a reset link, step 2 saves the new password.
export const forgotPassword = (email) => api.post('/api/auth/forgot-password', { email });
export const resetPassword = (token, newPassword) => api.post('/api/auth/reset-password', { token, newPassword });
