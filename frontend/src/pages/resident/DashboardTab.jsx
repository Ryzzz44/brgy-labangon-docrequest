// src/pages/resident/DashboardTab.jsx
// OWNER: Samuel O. Salado (UC-02 Track Request Status: overview)
// Greeting, request counts, the 3 latest requests and the barangay announcements.
// Data: useMyRequests() and GET /api/announcements/active (public).
import React, { useEffect, useState } from 'react';
import { StatCard, StatusBadge, formatDate, btnPrimary, btnSecondary, cardCls } from '../../components/ui';
import { useMyRequests } from '../../api/requests';
import { getActiveAnnouncements } from '../../api/announcements';
import { LEVELS } from '../../components/Announcements';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function DashboardTab({ profile, goTo }) {
  const { requests } = useMyRequests();
  const [announcements, setAnnouncements] = useState([]);
  useEffect(() => {
    getActiveAnnouncements().then(setAnnouncements).catch(() => setAnnouncements([]));
  }, []);
  const count = (...statuses) => requests.filter((r) => statuses.includes(r.status)).length;
  const firstName = (profile?.fullName || 'Resident').split(' ')[0];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#0B0B1A] text-white p-7 md:p-10">
        <div className="absolute -right-16 -top-24 w-72 h-72 rounded-full bg-brand/50 blur-[90px]" />
        <div className="relative space-y-4">
          <p className="text-sm text-white/60">{greeting()},</p>
          <h1 className="font-display text-4xl md:text-5xl">{firstName}</h1>
          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={() => goTo('request')} className={`${btnPrimary} !bg-white !text-slate-900`}>Request a document</button>
            <button onClick={() => goTo('track')} className={`${btnSecondary} !bg-transparent !text-white !ring-white/25`}>Track requests</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="In progress" value={count('Pending', 'Processed')} hint="Pending or being prepared" tone="butter" />
        <StatCard label="Ready for pickup" value={count('Ready for Pickup')} hint="Bring a valid ID" tone="lilac" />
        <StatCard label="Released" value={count('Released')} hint="Completed requests" tone="mint" />
      </div>

      <div className={`${cardCls} p-6 space-y-4`}>
        <h2 className="text-sm font-semibold text-slate-900">Latest requests</h2>
        {requests.length === 0 && <p className="text-sm text-slate-400">No requests yet.</p>}
        <ul className="divide-y divide-slate-100">
          {requests.slice(0, 3).map((r) => (
            <li key={r.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{r.documentType}</p>
                <p className="text-[11px] text-slate-400">{r.referenceNumber} &middot; {formatDate(r.createdAt)}</p>
              </div>
              <StatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      </div>

      <div className={`${cardCls} p-6 space-y-4`}>
        <h2 className="text-sm font-semibold text-slate-900">Barangay announcements</h2>
        {announcements.length === 0 && <p className="text-sm text-slate-400">No announcements right now.</p>}
        <ul className="space-y-3">
          {announcements.map((a) => (
            <li key={a.id} className={`rounded-2xl px-4 py-3 ${(LEVELS[a.level] || LEVELS.info).banner}`}>
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="text-sm mt-0.5 whitespace-pre-line">{a.message}</p>
              <p className="text-[11px] opacity-70 mt-1">{formatDate(a.createdAt)}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
