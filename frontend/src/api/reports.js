// src/api/reports.js - Rafanan's API call (ReportController in the backend).
import { api } from './client';

// GET /api/staff/reports?period=month&date=2026-11-22
export const getReport = (period, date) => api.get(`/api/staff/reports?period=${period}&date=${date}`);