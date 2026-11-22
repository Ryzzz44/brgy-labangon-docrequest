// src/pages/staff/StaffDashboard.jsx
// Layout for logged-in staff: dark header + tab bar. Each tab is its own file (see TASKS.md for owners).
import React, { useEffect, useRef, useState } from 'react';
import { BrandMark, IconLogout, NavBadge, NotificationPopups } from '../../components/ui';
import { STAFF_PAGES as TABS } from '../registry';
import { useStaffNotifications, getLastSeen, isNewNotification } from '../../api/staffNotifications';
import { NOTIF_TITLE } from './NotificationsTab';

export default function StaffDashboard({ staff, onLogout, showToast }) {
  const [tab, setTab] = useState('requests');
  const { Component: Tab } = TABS.find((t) => t.id === tab);

  // Staff notifications (Rafanan): red badge on the tab and a pop-up for each new resident action.
  const { items, loading } = useStaffNotifications(); // ← fixed
  const lastSeen = getLastSeen();
  const unreadCount = tab === 'notifications' ? 0 : items.filter((n) => isNewNotification(n, lastSeen)).length;
  const [popups, setPopups] = useState([]);
  const popped = useRef(null);
  useEffect(() => {
    if (loading) return; // ← fixed: wait until the first list has arrived
    if (popped.current === null) { // first load: no pop-ups for old items, only for ones arriving later
      popped.current = new Set(items.map((n) => n.id));
      return;
    }
    const fresh = items.filter((n) => !popped.current.has(n.id));
    fresh.forEach((n) => popped.current.add(n.id));
    if (fresh.length === 0 || tab === 'notifications') return;
    setPopups((prev) => [
      ...prev,
      ...fresh.map((n) => ({
        id: n.id,
        title: NOTIF_TITLE[n.actionType] || 'Resident activity',
        body: `${n.actorName} · ${n.referenceNumber}`,
      })),
    ].slice(-3));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, loading]); // ← fixed

  return (
    <div className="min-h-screen p-4 md:p-8">
      <NotificationPopups
        items={popups}
        onDismiss={(id) => setPopups((prev) => prev.filter((p) => p.id !== id))}
        onView={() => { setPopups([]); setTab('notifications'); }}
      />
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
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                tab === t.id ? 'bg-brand-soft text-brand' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t.label}
              {t.id === 'notifications' && <NavBadge count={unreadCount} />}
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
