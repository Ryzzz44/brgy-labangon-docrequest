// src/components/ui.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

/* ---------- Icons (stroke, no emojis) ---------- */
const Svg = ({ children, className = 'w-[18px] h-[18px]' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IconHome = (p) => <Svg {...p}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></Svg>;
export const IconFile = (p) => <Svg {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h6" /></Svg>;
export const IconSearch = (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>;
export const IconBell = (p) => <Svg {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></Svg>;
export const IconUser = (p) => <Svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Svg>;
export const IconLogout = (p) => <Svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></Svg>;
export const IconList = (p) => <Svg {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></Svg>;
export const IconLock = (p) => <Svg {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Svg>;
export const IconUpload = (p) => <Svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></Svg>;
export const IconArrowLeft = (p) => <Svg {...p}><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></Svg>;
export const IconX = (p) => <Svg {...p}><path d="M18 6 6 18M6 6l12 12" /></Svg>;
export const IconArchive = (p) => <Svg {...p}><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" /><path d="M10 13h4" /></Svg>;
export const IconPrinter = (p) => <Svg {...p}><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></Svg>;
export const IconDownload = (p) => <Svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></Svg>;
export const IconTrash = (p) => <Svg {...p}><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></Svg>;
export const IconCheck = (p) => <Svg {...p}><path d="m5 12 5 5L20 7" /></Svg>;

/* ---------- Shared class strings ---------- */
export const inputCls =
  'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-[border-color,box-shadow] duration-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed';
export const labelCls = 'block text-xs font-medium text-slate-600 mb-1.5';
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm hover:shadow-lift disabled:opacity-60 disabled:cursor-not-allowed';
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold px-5 py-2.5 rounded-full ring-1 ring-slate-200 disabled:opacity-60';
export const btnDanger =
  'inline-flex items-center justify-center gap-2 bg-white hover:bg-rose-50 text-rose-600 text-sm font-semibold px-5 py-2.5 rounded-full ring-1 ring-rose-200 disabled:opacity-60';
export const cardCls = 'bg-white rounded-3xl shadow-soft ring-1 ring-slate-900/[0.04]';

/* ---------- Helpers ---------- */
// The backend sends dates as ISO text, e.g. "2026-11-22T16:30:00".
export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }) : 'Just now';

export const tsMillis = (iso) => (iso ? new Date(iso).getTime() : Number.MAX_SAFE_INTEGER);

/* ---------- Brand mark: uses /logo.png, falls back to initials ---------- */
export function BrandMark({ size = 'w-9 h-9' }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`${size} rounded-xl bg-gradient-to-br from-brand to-[#8B7CF8] text-white flex items-center justify-center text-xs font-semibold`}>
        BL
      </div>
    );
  }
  return (
    <img
      src="/logo.png"
      alt="Barangay Labangon seal"
      onError={() => setFailed(true)}
      className={`${size} object-contain`}
    />
  );
}

/* ---------- Status badge ---------- */
const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Processed: 'bg-blue-50 text-blue-700 border-blue-200',
  'Ready for Pickup': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Released: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  Cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};
const STATUS_DOT = {
  Pending: 'bg-amber-500',
  Processed: 'bg-blue-500',
  'Ready for Pickup': 'bg-indigo-500',
  Released: 'bg-emerald-500',
  Rejected: 'bg-rose-500',
  Cancelled: 'bg-slate-400',
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap ${
        STATUS_STYLES[status] || STATUS_STYLES.Cancelled
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] || STATUS_DOT.Cancelled}`} />
      {status}
    </span>
  );
}

/* ---------- Toast ---------- */
export function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className={`toast-enter fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-full text-sm font-medium shadow-lift max-w-[90vw] text-center ${
        type === 'success' ? 'bg-slate-900 text-white' : 'bg-rose-600 text-white'
      }`}
    >
      {message}
    </div>
  );
}

/* ---------- Splash (first load) ---------- */
export function Splash() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-8 px-6">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <span className="splash-ring absolute inset-0 rounded-full bg-brand/20" />
        <div className="splash-logo relative w-20 h-20 rounded-3xl bg-white shadow-lift ring-1 ring-slate-900/5 flex items-center justify-center">
          <BrandMark size="w-11 h-11" />
        </div>
      </div>
      <div className="splash-text text-center">
        <p className="font-display text-xl font-semibold text-slate-900">Barangay Labangon</p>
        <p className="text-xs text-slate-500 mt-1">Document request portal</p>
      </div>
      <div className="relative w-28 h-[3px] rounded-full bg-slate-200 overflow-hidden" role="progressbar" aria-label="Loading">
        <span className="splash-bar absolute inset-y-0 left-0 w-1/3 rounded-full bg-brand" />
      </div>
    </div>
  );
}

/* ---------- Loading overlay (busy actions) ---------- */
export function LoadingOverlay({ label = 'Please wait...' }) {
  return (
    <div className="backdrop-enter fixed inset-0 z-[120] bg-white/80 backdrop-blur-md flex items-center justify-center p-6" role="status">
      <div className="modal-enter bg-white rounded-3xl shadow-lift ring-1 ring-slate-900/5 px-7 py-6 flex items-center gap-4">
        <span className="w-5 h-5 rounded-full border-[2.5px] border-slate-200 border-t-brand animate-spin" />
        <p className="text-sm font-medium text-slate-700">{label}</p>
      </div>
    </div>
  );
}

/* ---------- Modal ---------- */
// Drawn directly inside <body> (a "portal"), so it always covers the whole page,
// including the announcement banners, no matter which page opened it.
export function Modal({ title, subtitle, onClose, children, maxWidth = 'max-w-2xl' }) {
  return createPortal(
    <div
      className="backdrop-enter fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden"
    >
      <div className={`modal-enter bg-white rounded-3xl w-full ${maxWidth} max-h-[90vh] flex flex-col shadow-2xl`}>
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            {subtitle && <p className="text-xs font-mono text-brand mb-0.5">{subtitle}</p>}
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100"
          >
            <IconX />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/* ---------- Stat card (pastel tiles) ---------- */
const TONES = {
  white: 'bg-white',
  lilac: 'bg-lilac',
  peach: 'bg-peach',
  mint: 'bg-mint',
  butter: 'bg-butter',
  ice: 'bg-ice',
};

export function StatCard({ label, value, hint, tone = 'white' }) {
  return (
    <div className={`${TONES[tone] || TONES.white} rounded-3xl p-5 shadow-soft ring-1 ring-slate-900/[0.03] lift`}>
      <p className="text-xs font-medium text-slate-600">{label}</p>
      <p className="font-display text-4xl font-semibold text-slate-900 mt-3 tabular-nums">{value}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

/* ---------- Friendly error messages ---------- */
// The backend already sends a readable message ({ message: '...' }); api/client.js puts it on err.message.
export const authErrorMessage = (err) => err?.message || 'Something went wrong. Please try again.';

/* ---------- Red notification badge ---------- */
export function NavBadge({ count, className = '' }) {
  if (!count) return null;
  return (
    <span className={`inline-flex ${className}`}>
      <span className="relative flex min-w-[18px] h-[18px]">
        <span className="absolute inset-0 rounded-full bg-rose-400 opacity-60 animate-ping" />
        <span className="relative min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none flex items-center justify-center ring-2 ring-white">
          {count > 9 ? '9+' : count}
        </span>
      </span>
    </span>
  );
}

/* ---------- Pop-up notifications ---------- */
const POPUP_TONE = {
  Pending: 'bg-amber-100 text-amber-700',
  Processed: 'bg-blue-100 text-blue-700',
  'Ready for Pickup': 'bg-indigo-100 text-indigo-700',
  Released: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-700',
  Cancelled: 'bg-slate-100 text-slate-600',
};

export function NotificationPopups({ items, onDismiss, onView }) {
  if (!items.length) return null;
  return (
    <div className="fixed z-[110] top-4 right-4 left-4 sm:left-auto sm:w-80 space-y-3 pointer-events-none">
      {items.map((n) => (
        <div
          key={n.id}
          role="alert"
          className="pointer-events-auto animate-pop bg-white rounded-2xl shadow-lift ring-1 ring-slate-900/5 p-4 flex gap-3"
        >
          <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${POPUP_TONE[n.status] || 'bg-brand-soft text-brand'}`}>
            <IconBell className="w-4 h-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">{n.title}</p>
            <p className="text-xs text-slate-600 mt-0.5 break-words">{n.body}</p>
            <button onClick={() => onView(n)} className="text-xs font-semibold text-brand hover:underline mt-2">
              View update
            </button>
          </div>
          <button onClick={() => onDismiss(n.id)} aria-label="Dismiss" className="text-slate-400 hover:text-slate-700 self-start p-0.5">
            <IconX className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
