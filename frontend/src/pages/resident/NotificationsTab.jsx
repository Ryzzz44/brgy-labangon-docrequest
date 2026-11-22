// src/pages/resident/NotificationsTab.jsx
// OWNER: Samuel O. Salado (UC-02 Track Request Status: notifications)
// A notification = a request whose status changed after submission.
// Unread = the status is different from residentSeenStatus (the last status the resident has seen).
// X deletes one notification and "Delete all" clears the list; a newer status change shows up again.
import React, { useState } from 'react';
import { Modal, StatusBadge, IconX, IconTrash, formatDate, btnPrimary, btnSecondary, cardCls } from '../../components/ui';
import { useMyRequests, markSeen, markAllSeen, clearNotification, clearAllNotifications, isUnreadUpdate } from '../../api/requests';

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

  // Only requests that moved past "Pending" have something to report, unless the resident deleted that update.
  const notifications = requests.filter((r) => r.status !== 'Pending' && r.notifClearedStatus !== r.status);
  const unreadCount = notifications.filter(isUnreadUpdate).length;

  // Runs an API call, then reloads the list.
  const run = async (fn, okMessage) => {
    try {
      await fn();
      reload();
      if (okMessage) showToast(okMessage);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openNotification = (r) => {
    if (isUnreadUpdate(r)) run(() => markSeen(r.id));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'You are all caught up.'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={() => run(markAllSeen, 'All notifications marked as read.')} className={btnSecondary}>
              Mark all as read
            </button>
          )}
          <button onClick={() => setConfirmClear(true)} disabled={notifications.length === 0}
            className={`${btnSecondary} disabled:opacity-40`}>
            <IconTrash className="w-4 h-4" /> Delete all
          </button>
        </div>
      </div>

      {loading && <div className={`${cardCls} p-10 text-center text-sm text-slate-400`}>Loading...</div>}
      {!loading && notifications.length === 0 && (
        <div className={`${cardCls} p-10 text-center text-sm text-slate-400`}>No updates yet.</div>
      )}

      <div className="space-y-3">
        {notifications.map((r) => (
          <div
            key={r.id}
            role="button"
            tabIndex={0}
            onClick={() => openNotification(r)}
            onKeyDown={(e) => e.key === 'Enter' && openNotification(r)}
            className={`${cardCls} w-full text-left p-5 flex items-start gap-4 cursor-pointer ${isUnreadUpdate(r) ? 'ring-2 ring-brand/30' : ''}`}
          >
            <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${isUnreadUpdate(r) ? 'bg-brand' : 'bg-slate-200'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800">
                Your <span className="font-semibold">{r.documentType}</span> ({r.referenceNumber}) {MESSAGES[r.status]}
              </p>
              {r.status === 'Rejected' && r.rejectionReason && (
                <p className="text-xs text-rose-700 mt-1">Reason: {r.rejectionReason}</p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">{formatDate(r.updatedAt)}</p>
            </div>
            <StatusBadge status={r.status} />
            <button
              onClick={(e) => { e.stopPropagation(); run(() => clearNotification(r.id), 'Notification deleted.'); }}
              aria-label="Delete notification"
              className="text-slate-400 hover:text-rose-600 p-1 -m-1 rounded-full"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {confirmClear && (
        <Modal title="Delete all notifications?" onClose={() => setConfirmClear(false)} maxWidth="max-w-md">
          <p className="text-sm text-slate-600">
            {notifications.length} notification{notifications.length === 1 ? '' : 's'} will be cleared.
            Your requests are not affected, and you will still be notified about new status changes.
          </p>
          <div className="flex gap-2 pt-5">
            <button onClick={() => setConfirmClear(false)} className={btnSecondary}>Keep them</button>
            <button
              onClick={() => { setConfirmClear(false); run(clearAllNotifications, 'Notifications cleared.'); }}
              className={`${btnPrimary} flex-1 !bg-rose-600 hover:!bg-rose-700`}
            >
              Delete all
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
