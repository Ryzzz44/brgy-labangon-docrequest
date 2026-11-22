// src/pages/staff/StaffDashboard.jsx
// Layout for logged-in staff: dark header + tab bar. Each tab is its own file (see TASKS.md for owners).
import React, { useState } from 'react';
import { BrandMark, IconLogout } from '../../components/ui';
import RequestsTab from './RequestsTab';
import ReportsTab from './ReportsTab';
import AnnouncementsTab from './AnnouncementsTab';
import ActivityTab from './ActivityTab';

const TABS = [
  { id: 'requests', label: 'Requests', Tab: RequestsTab },
  { id: 'reports', label: 'Reports', Tab: ReportsTab },
  { id: 'announcements', label: 'Announcements', Tab: AnnouncementsTab },
  { id: 'activity', label: 'Activity log', Tab: ActivityTab },
];

export default function StaffDashboard({ staff, onLogout, showToast }) {
  const [tab, setTab] = useState('requests');
  const { Tab } = TABS.find((t) => t.id === tab);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="relative overflow-hidden rounded-[2rem] bg-[#0B0B1A] text-white flex flex-col md:flex-row md:items-center justify-between gap-5 px-6 py-6 md:px-8 print:hidden">
          <div className="absolute -right-16 -top-24 w-72 h-72 rounded-full bg-brand/50 blur-[90px]" />
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative flex items-center gap-4">
            <div className="bg-white rounded-2xl p-2"><BrandMark size="w-9 h-9" /></div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl leading-tight">Barangay Labangon</h1>
              <p className="text-xs text-white/60 mt-0.5">Staff dashboard &middot; {staff?.fullName}</p>
            </div>
          </div>
          <button onClick={onLogout} className="relative inline-flex items-center gap-2 text-sm font-semibold bg-white text-slate-900 px-5 py-2.5 rounded-full hover:bg-white/90 w-fit">
            <IconLogout /> Log out
          </button>
        </header>

        <nav className="flex items-center gap-1 bg-white rounded-full p-1.5 shadow-soft w-fit max-w-full overflow-x-auto print:hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                tab === t.id ? 'bg-brand-soft text-brand' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div key={tab} className="tab-enter space-y-6">
          <Tab staff={staff} showToast={showToast} />
        </div>
      </div>
    </div>
  );
}
