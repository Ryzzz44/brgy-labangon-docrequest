// src/api/staffNotifications.js - Rafanan's API calls (StaffNotificationController in the backend).
import { useCallback, useEffect, useState } from 'react';
import { api } from './client';
import { onLive } from './live';

// GET /api/staff/notifications -> what residents did lately (submitted, updated, cancelled), newest first
export const getStaffNotifications = () => api.get('/api/staff/notifications');

// DELETE /api/staff/notifications/{id} -> X button
export const dismissStaffNotification = (id) => api.del(`/api/staff/notifications/${id}`);

// DELETE /api/staff/notifications -> "Delete all"
export const dismissAllStaffNotifications = () => api.del('/api/staff/notifications');

// "Unread" = newer than the last time this browser opened the Notifications page.
const LAST_SEEN_KEY = 'staff_notif_last_seen';
export const getLastSeen = () => {
  try { return Number(localStorage.getItem(LAST_SEEN_KEY) || 0); } catch { return 0; }
};
export const markStaffNotificationsSeen = () => {
  try { localStorage.setItem(LAST_SEEN_KEY, String(Date.now())); } catch { /* storage blocked */ }
};
export const isNewNotification = (n, lastSeen) => new Date(n.timestamp).getTime() > lastSeen;

// Hook: loads the notifications and reloads them right away when a resident submits, edits or cancels
// (live update from the server). A slow 30-second check is kept as a backup.
export function useStaffNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setItems(await getStaffNotifications());
    } catch {
      /* keep the old list if the server is busy */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    const timer = setInterval(reload, 30000);
    const stopLive = onLive('requests', reload);
    return () => {
      clearInterval(timer);
      stopLive();
    };
  }, [reload]);

  return { items, loading, reload };
}
