// src/pages/resident/NotificationsTab.jsx
// OWNER: Samuel O. Salado (UC-02 Track Request Status: notifications)
// A notification = a request whose status changed after submission.
// Opening this page marks every update as read (clears the red badge), but the ones that were new
// stay highlighted with a "New" tag while the page is open, like the Firebase version.
// X deletes one notification and "Delete all" clears the list; a newer status change shows up again.
import React, { useEffect, useRef, useState } from 'react';
import { Modal, StatusBadge, IconBell, IconX, IconTrash, formatDate, btnPrimary, btnSecondary, cardCls } from '../../components/ui';
import { useMyRequests, markAllSeen, clearNotification, clearAllNotifications, isUnreadUpdate } from '../../api/requests';

const MESSAGES = {
  Processed: 'was verified and is now being prepared.',
  'Ready for Pickup': 'is ready for pickup at the barangay hall.',
  Released: 'has been released to you.',
  Rejected: 'was rejected.',
  Cancelled: 'was cancelled.',
};

export default function NotificationsTab({ showToast }) {
  const { requests, loading, reload } = useMyRequests();
  const [confirmClear, setConfirmClear] = useState(false);
  const [newIds, setNewIds] = useState(new Set());     // highlighted with "New" while the page is open
  const [removed, setRemoved] = useState(new Set());   // hidden right away when X is clicked

  // Only requests that moved past "Pending" have something to report, unless the resident deleted that update.
  const notifications = requests.filter(
    (r) => r.status !== 'Pending' && r.notifClearedStatus !== r.status && !removed.has(`${r.id}:${r.status}`));

  // Opening the page (or a new update arriving while it is open) marks the updates as read,
  // but remembers which ones were new so they keep the "New" tag.
  const marked = useRef(new Set()); // updates already sent to the server as read (never send twice)
  useEffect(() => {
    const unread = notifications.filter((r) => isUnreadUpdate(r) && !marked.current.has(`${r.id}:${r.status}`));
    if (unread.length === 0) return;
    const keys = unread.map((r) => `${r.id}:${r.status}`);
    keys.forEach((k) => marked.current.add(k));
    setNewIds((prev) => new Set([...prev, ...keys]));
    markAllSeen().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]);

  // X: hide it on the screen at once, then tell the server. If the server says no, show it again.
  const deleteOne = async (r) => {
    const key = `${r.id}:${r.status}`;
    setRemoved((prev) => new Set(prev).add(key));
    try {
      await clearNotification(r.id);
      showToast('Notification deleted.');
    } catch (err) {
      setRemoved((prev) => { const next = new Set(prev); next.delete(key); return next; });
      showToast(err.message, 'error');
    }
  };

  const deleteAll = async () => {
    setConfirmClear(false);
    try {
      await clearAllNotifications();
      reload();
      showToast('Notifications cleared.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">Status updates for your requests.</p>
        </div>
        {notifications.length > 0 && (
          <button onClick={() => setConfirmClear(true)} className={`${btnSecondary} !py-2 text-xs`}>
            <IconTrash className="w-4 h-4" /> Delete all
          </button>
        )}
      </div>

      {loading && <div className={`${cardCls} p-10 text-center text-sm text-slate-400`}>Loading...</div>}
      {!loading && notifications.length === 0 && (
        <div className={`${cardCls} p-10 text-center text-sm text-slate-400`}>No notifications.</div>
      )}

      {notifications.length > 0 && (
        <ul className={`${cardCls} overflow-hidden divide-y divide-slate-100`}>
          {notifications.map((r) => {
            const isNew = newIds.has(`${r.id}:${r.status}`);
            return (
              <li key={r.id} className={`flex items-start gap-4 px-6 py-4 ${isNew ? 'bg-brand-soft/60' : ''}`}>
                <span className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0 mt-0.5">
                  <IconBell className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">
                    Your <span className="font-semibold text-slate-900">{r.documentType}</span>{' '}
                    (<span className="font-mono">{r.referenceNumber}</span>) {MESSAGES[r.status]}
                  </p>
                  {r.status === 'Rejected' && r.rejectionReason && (
                    <p className="text-xs text-rose-700 mt-1">Reason: {r.rejectionReason}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    {formatDate(r.statusChangedAt || r.updatedAt)}
                    {isNew && (
                      <span className="ml-2 inline-block text-[10px] font-semibold text-white bg-rose-500 px-2 py-0.5 rounded-full align-middle">New</span>
                    )}
                  </p>
                </div>
                <StatusBadge status={r.status} />
                <button
                  onClick={() => deleteOne(r)}
                  aria-label="Delete notification"
                  className="shrink-0 p-2 -my-1 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {confirmClear && (
        <Modal title="Delete all notifications?" onClose={() => setConfirmClear(false)} maxWidth="max-w-md">
          <p className="text-sm text-slate-600">
            {notifications.length} notification{notifications.length === 1 ? '' : 's'} will be cleared.
            Your requests are not affected, and you will still be notified about new status changes.
          </p>
          <div className="flex gap-2 pt-5">
            <button onClick={() => setConfirmClear(false)} className={btnSecondary}>Keep them</button>
            <button onClick={deleteAll} className={`${btnPrimary} flex-1 !bg-rose-600 hover:!bg-rose-700`}>Delete all</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
