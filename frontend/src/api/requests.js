// src/api/requests.js - Salado's API calls (ResidentRequestController in the backend).
import { useCallback, useEffect, useState } from 'react';
import { api } from './client';

// POST /api/resident/requests -> the new request (with its reference number)
export const submitRequest = (documentType, purpose, validIdImage) =>
  api.post('/api/resident/requests', { documentType, purpose, validIdImage });

// GET /api/resident/requests -> my requests, newest first
export const getMyRequests = () => api.get('/api/resident/requests');

// PATCH /api/resident/requests/{id}/seen -> mark one notification as read
export const markSeen = (id) => api.patch(`/api/resident/requests/${id}/seen`);

// PATCH /api/resident/requests/seen-all -> mark every notification as read
export const markAllSeen = () => api.patch('/api/resident/requests/seen-all');

// PATCH /api/resident/requests/{id}/clear-notification -> X button: delete one notification
export const clearNotification = (id) => api.patch(`/api/resident/requests/${id}/clear-notification`);

// PATCH /api/resident/requests/clear-notifications -> "Delete all" notifications
export const clearAllNotifications = () => api.patch('/api/resident/requests/clear-notifications');

// A status update the resident has not read yet (also used for the red badge and pop-ups).
export const isUnreadUpdate = (r) => r.status !== 'Pending' && r.status !== r.residentSeenStatus;

// Hook: loads my requests and reloads them every 15 seconds, so status changes made by staff appear by themselves.
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
    const timer = setInterval(reload, 15000);
    return () => clearInterval(timer); // stop when the page closes
  }, [reload]);

  return { requests, loading, error, reload };
}