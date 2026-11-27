// src/api/requests.js - Salado's API calls (ResidentRequestController in the backend).
import { useCallback, useEffect, useState } from 'react';
import { api } from './client';
import { onLive } from './live';

// After a change (submit, read, delete), every part of the page that shows my requests
// (the page itself, the sidebar badge, the pop-ups) reloads at once.
const CHANGED = 'requests:changed';
const andRefresh = (promise) =>
  promise.then((result) => {
    window.dispatchEvent(new Event(CHANGED));
    return result;
  });

// POST /api/resident/requests -> the new request (with its reference number)
export const submitRequest = (documentType, purpose, validIdImage) =>
  andRefresh(api.post('/api/resident/requests', { documentType, purpose, validIdImage }));

// GET /api/resident/requests -> my requests, newest first
export const getMyRequests = () => api.get('/api/resident/requests');

// PATCH /api/resident/requests/{id}/seen -> mark one notification as read
export const markSeen = (id) => andRefresh(api.patch(`/api/resident/requests/${id}/seen`));

// PATCH /api/resident/requests/seen-all -> mark every notification as read
export const markAllSeen = () => andRefresh(api.patch('/api/resident/requests/seen-all'));

// PATCH /api/resident/requests/{id}/clear-notification -> X button: delete one notification
export const clearNotification = (id) => andRefresh(api.patch(`/api/resident/requests/${id}/clear-notification`));

// PATCH /api/resident/requests/clear-notifications -> "Delete all" notifications
export const clearAllNotifications = () => andRefresh(api.patch('/api/resident/requests/clear-notifications'));

// A status update the resident has not read yet (also used for the red badge and pop-ups).
export const isUnreadUpdate = (r) => r.status !== 'Pending' && r.status !== r.residentSeenStatus;

// Hook: loads my requests and reloads them right away when the server says requests changed (live update),
// for example when staff mark one as Processed. A slow 30-second check is kept as a backup.
// Usage in a page: const { requests, loading, error, reload } = useMyRequests();
export function useMyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      setRequests(await getMyRequests());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    const timer = setInterval(reload, 30000);
    const stopLive = onLive('requests', reload);
    window.addEventListener(CHANGED, reload); // reload right after my own change (read, delete)
    return () => {
      clearInterval(timer); // stop when the page closes
      stopLive();
      window.removeEventListener(CHANGED, reload);
    };
  }, [reload]);

  return { requests, loading, error, reload };
}
