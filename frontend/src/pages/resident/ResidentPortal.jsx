// src/pages/resident/ResidentPortal.jsx
// Layout for logged-in residents: sidebar (desktop), bottom tabs (phone), and the active tab.
// Each tab lives in its own file (listed in ../registry.js) so team members do not edit the same file.
import React, { useEffect, useRef, useState } from 'react';
import { BrandMark, IconLogout, NavBadge, NotificationPopups } from '../../components/ui';
import { RESIDENT_PAGES as NAV_ITEMS } from '../registry';
import { useMyRequests, isUnreadUpdate } from '../../api/requests';
import { AnnouncementStack } from '../../components/Announcements';

const POPUP_TEXT = {
  Processed: 'was verified and is being prepared.',
  'Ready for Pickup': 'is ready for pickup at the barangay hall.',
  Released: 'has been released.',
  Rejected: 'was rejected. Open Notifications for the reason.',
  Cancelled: 'was cancelled.',
};

export default function ResidentPortal({ profile, onProfileChange, onLogout, showToast }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { Component: Tab } = NAV_ITEMS.find((n) => n.id === activeTab);

  // Unread status updates (Salado): red badge on "Notifications" and a pop-up for each new one.
  const { requests } = useMyRequests();
  const unread = requests.filter(isUnreadUpdate);
  const [popups, setPopups] = useState([]);
  const popped = useRef(new Set());

  useEffect(() => {
    const fresh = unread.filter((r) => !popped.current.has(`${r.id}:${r.status}`));
    if (fresh.length === 0) return;
    fresh.forEach((r) => popped.current.add(`${r.id}:${r.status}`));
    if (activeTab === 'notifications') return; // already looking at them
    setPopups((prev) => [
      ...prev,
      ...fresh.map((r) => ({
        id: `${r.id}:${r.status}`,
        status: r.status,
        title: `${r.documentType}: ${r.status}`,
        body: `${r.referenceNumber} ${POPUP_TEXT[r.status] || `is now ${r.status}.`}`,
      })),
    ].slice(-3));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]);

  // On the Notifications page the updates are already in view, so close the pop-ups.
  useEffect(() => {
    if (activeTab === 'notifications') setPopups([]);
  }, [activeTab]);

  const badgeFor = (id) => (id === 'notifications' ? unread.length : 0);

  // Props every tab receives.
  const tabProps = { profile, onProfileChange, showToast, goTo: setActiveTab };

  return (
    <div className="min-h-screen md:flex">
      <NotificationPopups
        items={popups}
        onDismiss={(id) => setPopups((prev) => prev.filter((p) => p.id !== id))}
        onView={() => { setPopups([]); setActiveTab('notifications'); }}
      />

      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 shrink-0 bg-white rounded-3xl shadow-soft flex-col justify-between py-6 px-4 h-[calc(100vh-2rem)] sticky top-4 m-4 mr-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <BrandMark />
            <div className="leading-tight">
              <p className="font-display text-lg text-slate-900">Barangay Labangon</p>
              <p className="text-[11px] text-slate-400">Resident portal</p>
            </div>
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition ${
                  activeTab === id ? 'bg-brand-soft text-brand' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon /> {label}
                <NavBadge count={badgeFor(id)} className="ml-auto" />
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition"
        >
          <IconLogout /> Log out
        </button>
      </aside>

      {/* Top bar (phone) */}
      <div className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <BrandMark size="w-8 h-8" />
            <span className="text-sm font-semibold text-slate-900">Barangay Labangon</span>
          </div>
          <button onClick={onLogout} aria-label="Log out" className="text-slate-500 p-1.5"><IconLogout /></button>
        </div>
      </div>

      <main className="flex-1 min-w-0 p-5 pb-28 md:p-10">
        {/* Announcements from staff (Rafanan, UC-09) */}
        <AnnouncementStack className="sticky top-16 md:top-4 z-20 max-w-5xl mx-auto mb-6" />
        <div key={activeTab} className="tab-enter max-w-5xl mx-auto">
          <Tab {...tabProps} />
        </div>
      </main>

      {/* Bottom tab bar (phone) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 grid grid-cols-7 px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map(({ id, short, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            aria-label={short}
            className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] font-medium transition ${
              activeTab === id ? 'text-brand' : 'text-slate-500'
            }`}
          >
            <span className="relative">
              <Icon />
              <NavBadge count={badgeFor(id)} className="absolute -top-2 -right-3" />
            </span>
            {short}
          </button>
        ))}
      </nav>
    </div>
  );
}
