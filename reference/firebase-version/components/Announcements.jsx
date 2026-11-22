// src/components/Announcements.jsx
// Staff-to-resident announcements. Staff compose them (Urgent / Important / Info) and every
// resident sees them live: Urgent opens a pop-up that must be acknowledged and stays as a red
// banner, Important shows an amber banner, Info is a quiet card on the dashboard.
import React, { useEffect, useState } from 'react';
import {
  collection, query, orderBy, limit, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { Modal, IconBell, IconX, IconTrash, IconCheck, inputCls, labelCls, btnPrimary, btnSecondary, btnDanger, cardCls } from './ui';

export const LEVELS = {
  urgent: {
    label: 'Urgent',
    hint: 'Pop-up that residents must acknowledge, plus a red banner until it expires.',
    chip: 'bg-rose-100 text-rose-700 ring-rose-200',
    banner: 'bg-rose-600 text-white',
    icon: 'bg-rose-100 text-rose-700',
    ring: 'ring-rose-300 bg-rose-50',
  },
  important: {
    label: 'Important',
    hint: 'Amber banner at the top of the portal that residents can dismiss.',
    chip: 'bg-amber-100 text-amber-800 ring-amber-200',
    banner: 'bg-amber-100 text-amber-900 ring-1 ring-amber-200',
    icon: 'bg-amber-100 text-amber-700',
    ring: 'ring-amber-300 bg-amber-50',
  },
  info: {
    label: 'Info',
    hint: 'Light blue banner at the top, dismissible. No pop-up.',
    chip: 'bg-brand-soft text-brand ring-indigo-200',
    banner: 'bg-brand-soft text-slate-800 ring-1 ring-indigo-100',
    icon: 'bg-brand-soft text-brand',
    ring: 'ring-indigo-300 bg-brand-soft/50',
  },
};

const DURATIONS = [
  { id: '1h', label: '1 hour', ms: 3600e3 },
  { id: '6h', label: '6 hours', ms: 6 * 3600e3 },
  { id: '24h', label: '24 hours', ms: 24 * 3600e3 },
  { id: '3d', label: '3 days', ms: 3 * 24 * 3600e3 },
  { id: '7d', label: '7 days', ms: 7 * 24 * 3600e3 },
  { id: 'none', label: 'Until I end it', ms: null },
];

const readSet = (key) => {
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); } catch { return new Set(); }
};
const writeSet = (key, set) => {
  try { localStorage.setItem(key, JSON.stringify([...set])); } catch { /* storage may be blocked */ }
};

const fmt = (d) =>
  d ? d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';

/* Live list of announcements. `activeOnly` hides ended and expired ones (for residents). */
export function useAnnouncements(db, { activeOnly = true } = {}) {
  const [items, setItems] = useState([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'Announcements'), orderBy('created_at', 'desc'), limit(30));
    return onSnapshot(
      q,
      (snap) =>
        setItems(
          snap.docs.map((d) => {
            const x = d.data({ serverTimestamps: 'estimate' });
            return {
              id: d.id,
              ...x,
              createdAt: x.created_at?.toDate ? x.created_at.toDate() : new Date(),
              expiresAt: x.expires_at?.toDate ? x.expires_at.toDate() : null,
            };
          })
        ),
      (err) => console.error('Announcements error:', err)
    );
  }, [db]);

  // Re-check expiry every minute
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const now = Date.now();
  const isLive = (a) => a.active !== false && (!a.expiresAt || a.expiresAt.getTime() > now);
  void tick;
  return activeOnly ? items.filter(isLive) : items.map((a) => ({ ...a, live: isLive(a) }));
}

/* ---------- Resident side ---------- */

// Banners (Urgent can't be dismissed) + the Urgent pop-up that must be acknowledged once.
export function AnnouncementStack({ items, className = '' }) {
  const [dismissed, setDismissed] = useState(() => readSet('ann_dismissed'));
  const [acked, setAcked] = useState(() => readSet('ann_acked'));

  const urgentToAck = items.find((a) => a.level === 'urgent' && !acked.has(a.id));
  const banners = items.filter((a) => a.level === 'urgent' || !dismissed.has(a.id));

  const ack = (id) => {
    const next = new Set(acked); next.add(id); setAcked(next); writeSet('ann_acked', next);
  };
  const dismiss = (id) => {
    const next = new Set(dismissed); next.add(id); setDismissed(next); writeSet('ann_dismissed', next);
  };

  return (
    <>
      {banners.length > 0 && (
        <div className={`space-y-2 ${className}`}>
          {banners.map((a) => {
            const L = LEVELS[a.level] || LEVELS.info;
            return (
              <div key={a.id} role={a.level === 'urgent' ? 'alert' : 'status'} className={`tab-enter rounded-2xl px-4 py-3 flex items-start gap-3 ${L.banner}`}>
                <IconBell className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-snug">{a.title}</p>
                  <p className="text-sm opacity-90 mt-0.5 whitespace-pre-line break-words">{a.message}</p>
                </div>
                {a.level !== 'urgent' && (
                  <button onClick={() => dismiss(a.id)} aria-label="Dismiss announcement" className="shrink-0 p-1 -m-1 opacity-60 hover:opacity-100">
                    <IconX className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {urgentToAck && (
        <div className="backdrop-enter fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="urgent-title">
          <div className="modal-enter w-full max-w-md rounded-[2rem] bg-white shadow-2xl overflow-hidden">
            <div className="bg-rose-600 text-white px-6 py-5 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><IconBell className="w-5 h-5" /></span>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Urgent announcement</p>
                <p className="text-xs text-white/80">{fmt(urgentToAck.createdAt)}</p>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <h3 id="urgent-title" className="font-display text-2xl text-slate-900">{urgentToAck.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line break-words">{urgentToAck.message}</p>
              <button onClick={() => ack(urgentToAck.id)} className={`${btnPrimary} w-full py-3 mt-2`}>I understand</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Dashboard card: every live announcement, newest first.
export function AnnouncementFeed({ items }) {
  if (!items.length) return null;
  return (
    <div className={`${cardCls} overflow-hidden`}>
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Announcements</h2>
      </div>
      <ul className="divide-y divide-slate-100">
        {items.slice(0, 5).map((a) => {
          const L = LEVELS[a.level] || LEVELS.info;
          return (
            <li key={a.id} className="px-6 py-4 flex gap-4">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${L.icon}`}><IconBell className="w-4 h-4" /></span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${L.chip}`}>{L.label}</span>
                </div>
                <p className="text-sm text-slate-600 mt-0.5 whitespace-pre-line break-words">{a.message}</p>
                <p className="text-[11px] text-slate-400 mt-1">{fmt(a.createdAt)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- Staff side ---------- */

export function StaffAnnouncements({ db, actorName = 'Barangay Staff', showToast }) {
  const all = useAnnouncements(db, { activeOnly: false });
  const [level, setLevel] = useState('important');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState('24h');
  const [confirmSend, setConfirmSend] = useState(false);
  const [busy, setBusy] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  const canSend = title.trim().length > 2 && message.trim().length > 4;

  const send = async () => {
    setBusy(true);
    try {
      const d = DURATIONS.find((x) => x.id === duration);
      await addDoc(collection(db, 'Announcements'), {
        title: title.trim(),
        message: message.trim(),
        level,
        active: true,
        created_by: actorName,
        created_at: serverTimestamp(),
        expires_at: d?.ms ? Timestamp.fromMillis(Date.now() + d.ms) : null,
      });
      setTitle(''); setMessage(''); setLevel('important'); setDuration('24h');
      showToast?.('Announcement sent to all residents.');
    } catch (err) {
      console.error('Announcement send failed:', err);
      const why = err?.code === 'permission-denied'
        ? 'Permission denied: publish the updated Firestore rules and make sure this account has a Staff document.'
        : `Could not send the announcement (${err?.code || 'unknown error'}).`;
      showToast?.(why, 'error');
    } finally {
      setBusy(false);
      setConfirmSend(false);
    }
  };

  const endNow = async (a) => {
    try { await updateDoc(doc(db, 'Announcements', a.id), { active: false }); showToast?.('Announcement ended.'); }
    catch { showToast?.('Could not end the announcement.', 'error'); }
  };
  const remove = async () => {
    try { await deleteDoc(doc(db, 'Announcements', removeTarget.id)); showToast?.('Announcement deleted.'); }
    catch { showToast?.('Could not delete the announcement.', 'error'); }
    setRemoveTarget(null);
  };

  const L = LEVELS[level];

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Compose */}
      <div className={`${cardCls} lg:col-span-3 p-6 space-y-5`}>
        <div>
          <h2 className="font-display text-2xl text-slate-900">New announcement</h2>
          <p className="text-sm text-slate-500 mt-0.5">Residents see it instantly on their portal, including the sign-in page.</p>
        </div>

        <div>
          <label className={labelCls}>How strongly should it alert?</label>
          <div className="grid sm:grid-cols-3 gap-2">
            {Object.entries(LEVELS).map(([id, v]) => (
              <button
                key={id}
                type="button"
                onClick={() => setLevel(id)}
                className={`text-left rounded-2xl p-3.5 ring-1 transition-colors ${level === id ? v.ring + ' ring-2' : 'ring-slate-200 hover:bg-slate-50'}`}
              >
                <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ${v.chip}`}>{v.label}</span>
                <p className="text-xs text-slate-500 mt-2 leading-snug">{v.hint}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={90} placeholder="System maintenance tonight" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={4}
            placeholder="The portal will be offline tonight for maintenance and will be back tomorrow at 8:00 AM."
            className={inputCls} />
          <p className="text-[11px] text-slate-400 mt-1 text-right">{message.length}/500</p>
        </div>
        <div>
          <label className={labelCls}>Show for</label>
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className={inputCls}>
            {DURATIONS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>

        {/* Live preview */}
        {(title || message) && (
          <div>
            <p className={labelCls}>Preview</p>
            <div className={`rounded-2xl px-4 py-3 flex items-start gap-3 ${L.banner}`}>
              <IconBell className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-bold">{title || 'Title'}</p>
                <p className="text-sm opacity-90 mt-0.5 whitespace-pre-line break-words">{message || 'Message'}</p>
              </div>
            </div>
          </div>
        )}

        <button
          disabled={!canSend || busy}
          onClick={() => (level === 'urgent' ? setConfirmSend(true) : send())}
          className={`${btnPrimary} w-full py-3`}
        >
          {busy ? 'Sending...' : `Send ${L.label.toLowerCase()} announcement`}
        </button>
      </div>

      {/* History */}
      <div className={`${cardCls} lg:col-span-2 overflow-hidden self-start`}>
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Sent announcements</h2>
        </div>
        {all.length === 0 ? (
          <p className="px-5 py-10 text-sm text-center text-slate-400">Nothing sent yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
            {all.map((a) => {
              const V = LEVELS[a.level] || LEVELS.info;
              return (
                <li key={a.id} className="px-5 py-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${V.chip}`}>{V.label}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.live ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {a.live ? 'Live' : 'Ended'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 break-words">{a.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 break-words">{a.message}</p>
                  <p className="text-[11px] text-slate-400">
                    {fmt(a.createdAt)}{a.expiresAt ? ` · until ${fmt(a.expiresAt)}` : ''}
                  </p>
                  <div className="flex gap-2 pt-1">
                    {a.live && <button onClick={() => endNow(a)} className="text-xs font-semibold text-slate-600 hover:text-slate-900 ring-1 ring-slate-200 rounded-full px-3 py-1.5">End now</button>}
                    <button onClick={() => setRemoveTarget(a)} className="text-xs font-semibold text-rose-600 hover:bg-rose-50 ring-1 ring-rose-200 rounded-full px-3 py-1.5 inline-flex items-center gap-1">
                      <IconTrash className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {confirmSend && (
        <Modal title="Send urgent announcement?" onClose={() => setConfirmSend(false)} maxWidth="max-w-md">
          <p className="text-sm text-slate-600">
            Every resident will get a pop-up they must acknowledge, and a red banner at the top of the portal. Use this for real emergencies and outages.
          </p>
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => setConfirmSend(false)} className={btnSecondary}>Cancel</button>
            <button onClick={send} disabled={busy} className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full">
              <IconCheck className="w-4 h-4" /> Send now
            </button>
          </div>
        </Modal>
      )}
      {removeTarget && (
        <Modal title="Delete this announcement?" onClose={() => setRemoveTarget(null)} maxWidth="max-w-md">
          <p className="text-sm text-slate-600">It disappears for everyone and can't be recovered.</p>
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => setRemoveTarget(null)} className={btnSecondary}>Cancel</button>
            <button onClick={remove} className={btnDanger}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
