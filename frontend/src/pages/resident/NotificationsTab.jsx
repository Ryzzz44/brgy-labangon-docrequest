// src/pages/resident/NotificationsTab.jsx
// OWNER: Samuel O. Salado (UC-02 Track Request Status: notifications)
// A notification = a request whose status changed after submission.
// Unread = the status is different from residentSeenStatus (the last status the resident has seen).
import React from 'react';
import { StatusBadge, formatDate, btnSecondary, cardCls } from '../../components/ui';
import { useMyRequests, markSeen, markAllSeen } from '../../api/requests';

const MESSAGES = {
  Processed: 'was verified and is now being prepared.',
  'Ready for Pickup': 'is ready for pickup at the barangay hall.',
  Released: 'has been released to you.',
  Rejected: 'was rejected.',
  Cancelled: 'was cancelled.',
};

export default function NotificationsTab({ showToast }) {
  const { requests, loading, reload } = useMyRequests();

  // Only requests that moved past "Pending" have something to report.
  const notifications = requests.filter((r) => r.status !== 'Pending');
  const isUnread = (r) => r.status !== r.residentSeenStatus;
  const unreadCount = notifications.filter(isUnread).length;

  const openNotification = async (r) => {
    if (!isUnread(r)) return;
    try {
      await markSeen(r.id);
      reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const readAll = async () => {
    try {
      await markAllSeen();
      reload();
      showToast('All notifications marked as read.');
    } catch (err) {
      showToast(err.message, 'error');
    }
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
        {unreadCount > 0 && <button onClick={readAll} className={btnSecondary}>Mark all as read</button>}
      </div>

      {loading && <div className={`${cardCls} p-10 text-center text-sm text-slate-400`}>Loading...</div>}
      {!loading && notifications.length === 0 && (
        <div className={`${cardCls} p-10 text-center text-sm text-slate-400`}>No updates yet.</div>
      )}

      <div className="space-y-3">
        {notifications.map((r) => (
          <button
            key={r.id}
            onClick={() => openNotification(r)}
            className={`${cardCls} w-full text-left p-5 flex items-start gap-4 ${isUnread(r) ? 'ring-2 ring-brand/30' : ''}`}
          >
            <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${isUnread(r) ? 'bg-brand' : 'bg-slate-200'}`} />
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
          </button>
        ))}
      </div>
    </div>
  );
}