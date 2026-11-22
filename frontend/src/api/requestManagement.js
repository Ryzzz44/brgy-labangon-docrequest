// src/api/requestManagement.js - Sanchez's API calls (RequestManagementController in the backend).
import { api } from './client';

// GET /api/resident/manage/requests?view=pending|archived
export const getManagedRequests = (view) => api.get(`/api/resident/manage/requests?view=${view}`);

// PUT /api/resident/manage/requests/{id} -> edit a pending request
export const editRequest = (id, documentType, purpose, validIdImage) =>
  api.put(`/api/resident/manage/requests/${id}`, { documentType, purpose, validIdImage });

// POST /api/resident/manage/requests/{id}/cancel -> cancel a pending request
export const cancelRequest = (id) => api.post(`/api/resident/manage/requests/${id}/cancel`);