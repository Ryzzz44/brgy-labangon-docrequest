// src/pages/resident/ArchiveTab.jsx
// OWNER: Sean Anthony P. Sanchez (UC-07 Archive or Delete Completed Request)
// Top: finished requests that can be archived. Bottom: the archive, where requests can be restored or deleted.
import React, { useEffect, useState } from 'react';
import { Modal, StatusBadge, IconArchive, IconTrash, formatDate, btnPrimary, btnSecondary, btnDanger, cardCls } from '../../components/ui';
import { getManagedRequests, archiveRequest, unarchiveRequest, deleteRequest } from '../../api/requestManagement';

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
  const [completed, setCompleted] = useState([]);
  const [archived, setArchived] = useState([]);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    try {
      const [done, arch] = await Promise.all([getManagedRequests('completed'), getManagedRequests('archived')]);
      setCompleted(done);
      setArchived(arch);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  // Runs an action, shows a message, and reloads both lists.
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
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">Archive</h1>
        <p className="text-sm text-slate-500 mt-1">Keep your list tidy by archiving requests that are finished.</p>
      </div>

      <section className={`${cardCls} p-6`}>
        <h2 className="text-sm font-semibold text-slate-900">Finished requests</h2>
        <p className="text-xs text-slate-500 mt-0.5">Released, rejected or cancelled requests you can archive.</p>
        {completed.length === 0 && <p className="text-sm text-slate-400 py-4">Nothing to archive.</p>}
        <ul className="divide-y divide-slate-100">
          {completed.map((r) => (
            <RequestRow key={r.id} r={r}>
              <button onClick={() => act(() => archiveRequest(r.id), 'Moved to archive.')} className={`${btnSecondary} ${small}`}>
                <IconArchive className="w-4 h-4" /> Archive
              </button>
            </RequestRow>
          ))}
        </ul>
      </section>

      <section className={`${cardCls} p-6`}>
        <h2 className="text-sm font-semibold text-slate-900">Archived ({archived.length})</h2>
        {archived.length === 0 && <p className="text-sm text-slate-400 py-4">Your archive is empty.</p>}
        <ul className="divide-y divide-slate-100">
          {archived.map((r) => (
            <RequestRow key={r.id} r={r}>
              <button onClick={() => act(() => unarchiveRequest(r.id), 'Restored.')} className={`${btnSecondary} ${small}`}>Restore</button>
              <button onClick={() => setDeleting(r)} className={`${btnDanger} ${small}`}>
                <IconTrash className="w-4 h-4" /> Delete
              </button>
            </RequestRow>
          ))}
        </ul>
      </section>

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