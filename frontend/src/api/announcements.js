// src/api/announcements.js - Rafanan's API calls (AnnouncementController in the backend).
import { api } from './client';

export const getActiveAnnouncements = () => api.get('/api/announcements/active');          // anyone
export const getAllAnnouncements = () => api.get('/api/staff/announcements');              // staff
export const postAnnouncement = (title, message, level, durationHours) =>
  api.post('/api/staff/announcements', { title, message, level, durationHours });
export const endAnnouncement = (id) => api.patch(`/api/staff/announcements/${id}/deactivate`);
export const deleteAnnouncement = (id) => api.del(`/api/staff/announcements/${id}`);