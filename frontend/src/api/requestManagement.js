// src/api/requestManagement.js - Sanchez's API calls (RequestManagementController in the backend).
import { api } from './client';

// GET /api/resident/manage/requests?view=pending|completed|archived
export const getManagedRequests = (view) => api.get(`/api/resident/manage/requests?view=${view}`);

// PUT /api/resident/manage/requests/{id} -> edit a pending request
export const editRequest = (id, documentType, purpose, validIdImage) =>
  api.put(`/api/resident/manage/requests/${id}`, { documentType, purpose, validIdImage });

// POST /api/resident/manage/requests/{id}/cancel -> cancel a pending request
export const cancelRequest = (id) => api.post(`/api/resident/manage/requests/${id}/cancel`);

// PATCH .../{id}/archive and .../{id}/unarchive -> move a finished request in or out of the archive
export const archiveRequest = (id) => api.patch(`/api/resident/manage/requests/${id}/archive`);
export const unarchiveRequest = (id) => api.patch(`/api/resident/manage/requests/${id}/unarchive`);

// DELETE /api/resident/manage/requests/{id} -> remove a finished request from my list
export const deleteRequest = (id) => api.del(`/api/resident/manage/requests/${id}`);

// DELETE /api/resident/manage/requests/archived -> "Delete all" in the archive ({ deleted: n })
export const deleteAllArchived = () => api.del('/api/resident/manage/requests/archived');
