// src/pages/staff/AnnouncementsTab.jsx
// OWNER: James Carl P. Rafanan (UC-09 Post Announcement)
// Staff write a notice, pick how strong it is and how long it shows, and send it to every resident.
import React, { useEffect, useState } from 'react';
import { formatDate, inputCls, labelCls, btnPrimary, btnSecondary, btnDanger, cardCls } from '../../components/ui';
import { LEVELS } from '../../components/Announcements';
import { getAllAnnouncements, postAnnouncement, endAnnouncement, deleteAnnouncement } from '../../api/announcements';

const DURATIONS = [
  { hours: 1, label: '1 hour' },
  { hours: 24, label: '24 hours' },
  { hours: 72, label: '3 days' },
  { hours: 168, label: '7 days' },
  { hours: 0, label: 'Until I end it' },
];

export default function AnnouncementsTab({ showToast }) {
  const [list, setList] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [level, setLevel] = useState('important');
  const [hours, setHours] = useState(24);
  const [sending, setSending] = useState(false);

  const load = () => getAllAnnouncements().then(setList).catch((err) => showToast(err.message, 'error'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const send = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await postAnnouncement(title, message, level, hours);
      showToast('Announcement sent to all residents.');
      setTitle('');
      setMessage('');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const act = async (fn, okMessage) => {
    try {
      await fn();
      showToast(okMessage);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const isLive = (a) => a.active && (!a.expiresAt || new Date(a.expiresAt) > new Date());

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <form onSubmit={send} className={`${cardCls} p-6 space-y-4 lg:col-span-2 h-fit`}>
        <h2 className="text-base font-semibold text-slate-900">New announcement</h2>
        <div>
          <label className={labelCls}>Level</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(LEVELS).map(([key, L]) => (
              <button type="button" key={key} onClick={() => setLevel(key)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold ring-1 ${level === key ? L.chip + ' ring-2' : 'ring-slate-200 text-slate-500'}`}>
                {L.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">Urgent also shows a pop-up residents must acknowledge.</p>
        </div>
        <div>
          <label className={labelCls}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120}
            placeholder="e.g. System maintenance tonight" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} maxLength={2000}
            placeholder="The portal will be offline from 10 PM and back at 8 AM tomorrow." className={`${inputCls} resize-none`} />
        </div>
        <div>
          <label className={labelCls}>Show for</label>
          <select value={hours} onChange={(e) => setHours(Number(e.target.value))} className={inputCls}>
            {DURATIONS.map((d) => <option key={d.hours} value={d.hours}>{d.label}</option>)}
          </select>
        </div>
        <button type="submit" disabled={sending} className={`${btnPrimary} w-full py-3`}>
          {sending ? 'Sending...' : 'Send to all residents'}
        </button>
      </form>

      <div className={`${cardCls} p-6 lg:col-span-3 space-y-4`}>
        <h2 className="text-base font-semibold text-slate-900">Posted announcements</h2>
        {list.length === 0 && <p className="text-sm text-slate-400">Nothing posted yet.</p>}
        <ul className="space-y-3">
          {list.map((a) => {
            const L = LEVELS[a.level] || LEVELS.info;
            return (
              <li key={a.id} className="rounded-2xl ring-1 ring-slate-100 p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${L.chip}`}>{L.label}</span>
                  <span className={`text-[10px] font-semibold ${isLive(a) ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isLive(a) ? 'Showing' : 'Ended'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                <p className="text-sm text-slate-600 whitespace-pre-line">{a.message}</p>
                <p className="text-[11px] text-slate-400">
                  {a.createdBy} &middot; {formatDate(a.createdAt)}
                  {a.expiresAt && <> &middot; until {formatDate(a.expiresAt)}</>}
                </p>
                <div className="flex gap-2 pt-1">
                  {isLive(a) && (
                    <button onClick={() => act(() => endAnnouncement(a.id), 'Announcement ended.')} className={`${btnSecondary} !py-1.5 !px-3 text-xs`}>End now</button>
                  )}
                  <button onClick={() => act(() => deleteAnnouncement(a.id), 'Announcement deleted.')} className={`${btnDanger} !py-1.5 !px-3 text-xs`}>Delete</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}