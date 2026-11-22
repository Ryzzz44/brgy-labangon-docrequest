// src/api/staff.js - Rafanan's API calls (StaffRequestController in the backend).
import { api } from './client';

// GET /api/staff/requests -> every request, newest first
export const getAllRequests = () => api.get('/api/staff/requests');

// PATCH /api/staff/requests/{id}/seen -> staff opened this request
export const markSeenByStaff = (id) => api.patch(`/api/staff/requests/${id}/seen`);

// PATCH /api/staff/requests/{id}/status -> move to the next status (reason only for "Rejected")
export const updateStatus = (id, status, reason) =>
  api.patch(`/api/staff/requests/${id}/status`, { status, reason });