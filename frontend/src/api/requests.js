// src/api/requests.js - Salado's API calls (ResidentRequestController in the backend).
import { api } from './client';

// POST /api/resident/requests -> the new request (with its reference number)
export const submitRequest = (documentType, purpose, validIdImage) =>
  api.post('/api/resident/requests', { documentType, purpose, validIdImage });

// GET /api/resident/requests -> my requests, newest first
export const getMyRequests = () => api.get('/api/resident/requests');