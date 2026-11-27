// src/pages/resident/ArchiveTab.jsx
// OWNER: Sean Anthony P. Sanchez (UC-07 Archive or Delete Completed Request)
// Requests the resident archived from Track Requests. Each one can be restored or deleted (soft delete:
// it disappears from the resident's list, but the barangay keeps the record).
import React, { useEffect, useState } from 'react';
import { Modal, StatusBadge, IconArchive, IconTrash, formatDate, btnPrimary, btnSecondary, btnDanger, cardCls } from '../../components/ui';
import { getManagedRequests, unarchiveRequest, deleteRequest, deleteAllArchived } from '../../api/requestManagement';
import { onLive } from '../../api/live';

function RequestRow({ r, children }) {
  return (
    <li className="py-3.5 flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{r.documentType}</p>
        <p className="text-[11px] text-slate-400 font-mono">{r.referenceNumber} &middot; {formatDate(r.createdAt)}</p>
      </div>
      <StatusBadge status={r.status} />
      <div className="flex gap-2">{children}</div>
    </li>
  );
}

export default function ArchiveTab({ showToast }) {
  const [archived, setArchived] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const load = async () => {
    try {
      setArchived(await getManagedRequests('archived'));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  // Load now, and again whenever the server says requests changed (for example staff processed one).
  useEffect(() => {
    load();
    return onLive('requests', load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Runs an action, shows a message, and reloads the list.
  const act = async (fn, okMessage) => {
    try {
      await fn();
      showToast(okMessage);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const small = '!py-1.5 !px-3 text-xs';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">Archive</h1>
          <p className="text-sm text-slate-500 mt-1">Completed requests you have tidied away. Restore or delete them anytime.</p>
        </div>
        {archived.length > 0 && (
          <button onClick={() => setConfirmDeleteAll(true)} className={`${btnDanger} ${small}`}>
            <IconTrash className="w-4 h-4" /> Delete all
          </button>
        )}
      </div>

      {archived.length === 0 ? (
        <div className={`${cardCls} p-10 text-center space-y-2`}>
          <span className="w-11 h-11 rounded-2xl bg-brand-soft text-brand flex items-center justify-center mx-auto">
            <IconArchive />
          </span>
          <p className="text-sm font-medium text-slate-700">Your archive is empty</p>
          <p className="text-xs text-slate-400">Released, rejected or cancelled requests can be archived from Track Requests.</p>
        </div>
      ) : (
        <section className={`${cardCls} p-6`}>
          <ul className="divide-y divide-slate-100">
            {archived.map((r) => (
              <RequestRow key={r.id} r={r}>
                <button onClick={() => act(() => unarchiveRequest(r.id), 'Restored to Track Requests.')} className={`${btnSecondary} ${small}`}>Restore</button>
                <button onClick={() => setDeleting(r)} className={`${btnDanger} ${small}`}>
                  <IconTrash className="w-4 h-4" /> Delete
                </button>
              </RequestRow>
            ))}
          </ul>
        </section>
      )}

      {confirmDeleteAll && (
        <Modal title="Delete all archived requests?" onClose={() => setConfirmDeleteAll(false)} maxWidth="max-w-md">
          <p className="text-sm text-slate-600">
            {archived.length} request{archived.length === 1 ? '' : 's'} will be removed from your list. The barangay keeps its own record.
          </p>
          <div className="flex gap-2 pt-5">
            <button onClick={() => setConfirmDeleteAll(false)} className={btnSecondary}>Keep them</button>
            <button
              onClick={() => {
                setConfirmDeleteAll(false);
                act(deleteAllArchived, 'Archive cleared.');
              }}
              className={`${btnPrimary} flex-1 !bg-rose-600 hover:!bg-rose-700`}
            >
              Delete all
            </button>
          </div>
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete this request?" subtitle={deleting.referenceNumber} onClose={() => setDeleting(null)} maxWidth="max-w-md">
          <p className="text-sm text-slate-600">It will be removed from your list. The barangay keeps its own record.</p>
          <div className="flex gap-2 pt-5">
            <button onClick={() => setDeleting(null)} className={btnSecondary}>Keep it</button>
            <button
              onClick={() => { const r = deleting; setDeleting(null); act(() => deleteRequest(r.id), 'Request deleted.'); }}
              className={`${btnPrimary} flex-1 !bg-rose-600 hover:!bg-rose-700`}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
