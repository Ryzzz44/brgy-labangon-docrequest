// src/api/profile.js - Sanchez's API calls (ProfileController in the backend).
import { api } from './client';

export const getProfile = () => api.get('/api/resident/profile');
export const updateProfile = (profile) => api.put('/api/resident/profile', profile);
export const changePassword = (currentPassword, newPassword) =>
  api.put('/api/resident/password', { currentPassword, newPassword });