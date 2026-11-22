// src/pages/staff/NotificationsTab.jsx
// OWNER: James Carl P. Rafanan (UC-05 Review & Verify: know when residents submit, edit or cancel)
// New items (since this browser last opened the page) are highlighted. X removes one, "Delete all" clears
// the list. Only the notification is removed; the request and the activity log stay.
import React, { useEffect, useState } from 'react';
import { Modal, IconX, IconTrash, formatDate, btnPrimary, btnSecondary, cardCls } from '../../components/ui';
import {
  useStaffNotifications, dismissStaffNotification, dismissAllStaffNotifications,
  getLastSeen, markStaffNotificationsSeen, isNewNotification,
} from '../../api/staffNotifications';

export const NOTIF_TITLE = {
  SUBMITTED: 'New request',
  UPDATED: 'Request updated',
  CANCELLED: 'Request cancelled',
};

const TONE = {
  SUBMITTED: 'bg-amber-100 text-amber-700',
  UPDATED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
};

export default function NotificationsTab({ showToast }) {
  const { items, loading, reload } = useStaffNotifications();
  const [lastSeen] = useState(getLastSeen); // what was "new" when the page opened stays highlighted
  const [confirmClear, setConfirmClear] = useState(false);

  // Opening this page counts as reading the notifications (clears the red badge).
  useEffect(() => { markStaffNotificationsSeen(); }, [items]);

  const run = async (fn, okMessage) => {
    try {
      await fn();
      reload();
      showToast(okMessage);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className={`${cardCls} p-6 space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
          <p className="text-xs text-slate-500 mt-0.5">New, updated and cancelled requests from residents.</p>
        </div>
        <button onClick={() => setConfirmClear(true)} disabled={items.length === 0}
          className={`${btnSecondary} !py-2 text-xs disabled:opacity-40`}>
          <IconTrash className="w-4 h-4" /> Delete all
        </button>
      </div>

      {loading && <p className="text-sm text-slate-400 py-6 text-center">Loading...</p>}
      {!loading && items.length === 0 && <p className="text-sm text-slate-400 py-6 text-center">No notifications.</p>}

      <ul className="divide-y divide-slate-100">
        {items.map((n) => {
          const isNew = isNewNotification(n, lastSeen);
          return (
            <li key={n.id} className={`py-3.5 flex items-start gap-3 ${isNew ? 'bg-brand-soft/40 -mx-3 px-3 rounded-2xl' : ''}`}>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${TONE[n.actionType] || 'bg-slate-100 text-slate-600'}`}>
                {NOTIF_TITLE[n.actionType] || 'Resident activity'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800">
                  <span className="font-semibold">{n.actorName}</span> &middot; <span className="font-mono text-xs">{n.referenceNumber}</span>
                  {isNew && <span className="ml-2 text-[10px] font-bold uppercase text-brand">New</span>}
                </p>
                {n.remarks && <p className="text-xs text-slate-500 mt-0.5">{n.remarks}</p>}
                <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(n.timestamp)}</p>
              </div>
              <button
                onClick={() => run(() => dismissStaffNotification(n.id), 'Notification deleted.')}
                aria-label="Delete notification"
                className="text-slate-400 hover:text-rose-600 p-1 rounded-full"
              >
                <IconX className="w-4 h-4" />
              </button>
            </li>
          );
        })}
      </ul>

      {confirmClear && (
        <Modal title="Delete all notifications?" onClose={() => setConfirmClear(false)} maxWidth="max-w-md">
          <p className="text-sm text-slate-600">
            This clears {items.length} notification{items.length === 1 ? '' : 's'}. Requests and the activity log are not changed.
          </p>
          <div className="flex gap-2 pt-5">
            <button onClick={() => setConfirmClear(false)} className={btnSecondary}>Keep them</button>
            <button
              onClick={() => { setConfirmClear(false); run(dismissAllStaffNotifications, 'All notifications deleted.'); }}
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
