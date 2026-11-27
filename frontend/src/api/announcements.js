// src/api/announcements.js - Rafanan's API calls (AnnouncementController in the backend).
import { api } from './client';

// When staff post, end or delete an announcement, tell the other tabs of this browser
// (for example a resident tab) so they reload right away instead of waiting for the timer.
export const ANNOUNCEMENTS_CHANNEL = 'announcements:changed';
const andTellOtherTabs = (promise) =>
  promise.then((result) => {
    try {
      const channel = new BroadcastChannel(ANNOUNCEMENTS_CHANNEL);
      channel.postMessage('changed');
      channel.close();
    } catch { /* old browser: the timer will still catch it */ }
    return result;
  });

export const getActiveAnnouncements = () => api.get('/api/announcements/active');          // anyone
export const getAllAnnouncements = () => api.get('/api/staff/announcements');              // staff
export const postAnnouncement = (title, message, level, durationHours) =>
  andTellOtherTabs(api.post('/api/staff/announcements', { title, message, level, durationHours }));
export const endAnnouncement = (id) => andTellOtherTabs(api.patch(`/api/staff/announcements/${id}/deactivate`));
export const deleteAnnouncement = (id) => andTellOtherTabs(api.del(`/api/staff/announcements/${id}`));
