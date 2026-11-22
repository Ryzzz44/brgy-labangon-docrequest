// src/api/history.js - Sanchez's API call (ActivityController in the backend).
import { api } from './client';

// GET /api/staff/history -> every action on every request, newest first
export const getHistory = () => api.get('/api/staff/history');