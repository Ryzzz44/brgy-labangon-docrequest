// src/components/Announcements.jsx
// OWNER: James Carl P. Rafanan (UC-09 Post Announcement: what residents see)
// Banners at the top of the welcome page and resident portal. Urgent ones also open a pop-up
// that the resident must acknowledge once. Data: GET /api/announcements/active (no login needed).
import React, { useEffect, useState } from 'react';
import { IconBell, IconX, btnPrimary } from './ui';
import { getActiveAnnouncements, ANNOUNCEMENTS_CHANNEL } from '../api/announcements';

export const LEVELS = {
  urgent: { label: 'Urgent', banner: 'bg-rose-600 text-white', chip: 'bg-rose-100 text-rose-700 ring-rose-200' },
  important: { label: 'Important', banner: 'bg-amber-100 text-amber-900 ring-1 ring-amber-200', chip: 'bg-amber-100 text-amber-800 ring-amber-200' },
  info: { label: 'Info', banner: 'bg-brand-soft text-slate-800 ring-1 ring-indigo-100', chip: 'bg-brand-soft text-brand ring-indigo-200' },
};

// Remember which announcements this browser dismissed or acknowledged.
const readSet = (key) => {
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); } catch { return new Set(); }
};
const writeSet = (key, set) => {
  try { localStorage.setItem(key, JSON.stringify([...set])); } catch { /* storage blocked */ }
};

// Loads active announcements now, every 3 seconds, when the resident comes back to the tab,
// and right away when staff post one from another tab of this browser.
export function useActiveAnnouncements() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const load = () => getActiveAnnouncements().then(setItems).catch(() => {});
    load();
    const timer = setInterval(load, 3000);
    window.addEventListener('focus', load);

    let channel = null;
    try {
      channel = new BroadcastChannel(ANNOUNCEMENTS_CHANNEL);
      channel.onmessage = load;
    } catch { /* old browser: the timer still works */ }

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', load);
      if (channel) channel.close();
    };
  }, []);
  return items;
}

export function AnnouncementStack({ className = '' }) {
  const items = useActiveAnnouncements();
  const [dismissed, setDismissed] = useState(() => readSet('ann_dismissed'));
  const [acked, setAcked] = useState(() => readSet('ann_acked'));

  const urgentToAck = items.find((a) => a.level === 'urgent' && !acked.has(a.id));
  const banners = items.filter((a) => a.level === 'urgent' || !dismissed.has(a.id));

  const remember = (set, setter, key, id) => {
    const next = new Set(set);
    next.add(id);
    setter(next);
    writeSet(key, next);
  };

  return (
    <>
      {banners.length > 0 && (
        <div className={`space-y-2 ${className}`}>
          {banners.map((a) => (
            <div key={a.id} role="status" className={`tab-enter rounded-2xl px-4 py-3 flex items-start gap-3 ${(LEVELS[a.level] || LEVELS.info).banner}`}>
              <IconBell className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-snug">{a.title}</p>
                <p className="text-sm opacity-90 mt-0.5 whitespace-pre-line break-words">{a.message}</p>
              </div>
              {a.level !== 'urgent' && (
                <button onClick={() => remember(dismissed, setDismissed, 'ann_dismissed', a.id)} aria-label="Dismiss" className="shrink-0 p-1 -m-1 opacity-60 hover:opacity-100">
                  <IconX className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {urgentToAck && (
        <div className="backdrop-enter fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
          <div className="modal-enter w-full max-w-md rounded-[2rem] bg-white shadow-2xl overflow-hidden">
            <div className="bg-rose-600 text-white px-6 py-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Urgent announcement</p>
            </div>
            <div className="p-6 space-y-3">
              <h3 className="font-display text-2xl text-slate-900">{urgentToAck.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line break-words">{urgentToAck.message}</p>
              <button onClick={() => remember(acked, setAcked, 'ann_acked', urgentToAck.id)} className={`${btnPrimary} w-full py-3 mt-2`}>
                I understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
