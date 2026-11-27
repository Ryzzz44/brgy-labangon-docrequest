// src/pages/resident/TrackTab.jsx
// OWNERS: Samuel O. Salado (UC-02 Track Request Status)
//         Sean Anthony P. Sanchez (UC-04 Modify / UC-03 Cancel Pending Request, UC-07 Archive)
// Shows the resident's active requests with a progress bar.
// Pending requests can be edited or cancelled here; finished ones can be moved to the Archive.
// Data: GET /api/resident/requests (useMyRequests), changes go through api/requestManagement.js.
import React, { useState } from 'react';
import UploadBox from '../../components/UploadBox';
import {
  Modal, StatusBadge, IconArchive, formatDate, inputCls, labelCls, btnPrimary, btnSecondary, btnDanger, cardCls,
} from '../../components/ui';
import { DOCUMENT_TYPES, PROGRESS_STEPS, COMPLETED_STATUSES } from '../../utils/constants';
import { compressImage } from '../../utils/image';
import { useMyRequests } from '../../api/requests';
import { editRequest, cancelRequest, archiveRequest } from '../../api/requestManagement';

const small = '!py-1.5 !px-3 text-xs';

export default function TrackTab({ showToast }) {
  const { requests, loading, error, reload } = useMyRequests();
  const [editing, setEditing] = useState(null);       // request being edited
  const [form, setForm] = useState({ documentType: '', purpose: '', validIdImage: '' });
  const [cancelling, setCancelling] = useState(null); // request waiting for cancel confirmation
  const [saving, setSaving] = useState(false);

  // Archived requests belong to the Archive page, so they are hidden here.
  const active = requests.filter((r) => !r.archivedByResident);
  const archivedCount = requests.length - active.length;

  // Runs an action, shows a message and reloads the list. Returns true when it worked.
  const run = async (fn, okMessage) => {
    setSaving(true);
    try {
      await fn();
      showToast(okMessage);
      reload();
      return true;
    } catch (err) {
      showToast(err.message, 'error'); // e.g. staff already processed it
      return false;
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Edit (UC-04) ---------- */
  const openEdit = (r) => {
    setEditing(r);
    setForm({ documentType: r.documentType, purpose: r.purpose, validIdImage: '' });
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return showToast('Please choose an image file.', 'error');
    try {
      const dataUrl = await compressImage(file);
      setForm((f) => ({ ...f, validIdImage: dataUrl }));
    } catch {
      showToast('Could not read that image.', 'error');
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    const ok = await run(() => editRequest(editing.id, form.documentType, form.purpose, form.validIdImage), 'Request updated.');
    if (ok) setEditing(null);
  };

  /* ---------- Cancel (UC-03) ---------- */
  const confirmCancel = async () => {
    const ok = await run(() => cancelRequest(cancelling.id), 'Request cancelled.');
    if (ok) setCancelling(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">Track requests</h1>
        <p className="text-sm text-slate-500 mt-1">Follow each application from submission to release.</p>
      </div>

      {loading && <div className={`${cardCls} p-10 text-center text-sm text-slate-400`}>Loading your requests...</div>}
      {error && <div className={`${cardCls} p-6 text-center text-sm text-rose-600`}>{error}</div>}
      {!loading && !error && active.length === 0 && (
        <div className={`${cardCls} p-10 text-center text-sm text-slate-400`}>
          {archivedCount > 0 ? 'Nothing active right now. Completed requests are in your archive.' : 'No requests yet.'}
        </div>
      )}

      <div className="space-y-3">
        {active.map((r) => {
          const stepIndex = PROGRESS_STEPS.indexOf(r.status); // -1 for Rejected / Cancelled
          return (
            <div key={r.id} className={`${cardCls} p-5 space-y-4`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-mono text-brand">{r.referenceNumber}</p>
                  <h3 className="text-sm font-semibold text-slate-900 mt-0.5">{r.documentType}</h3>
                  <p className="text-xs text-slate-500 mt-1">{r.purpose}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Filed {formatDate(r.createdAt)}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              {stepIndex >= 0 && (
                <div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PROGRESS_STEPS.map((s, i) => (
                      <div key={s} className={`h-1 rounded-full ${i <= stepIndex ? 'bg-brand' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                    {PROGRESS_STEPS.map((s, i) => (
                      <span key={s} className={`text-[10px] ${i <= stepIndex ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                        {s === 'Pending' ? 'Submitted' : s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {r.status === 'Rejected' && r.rejectionReason && (
                <p className="text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                  Reason: {r.rejectionReason}
                </p>
              )}

              {/* Pending: the resident can still change or withdraw it */}
              {r.status === 'Pending' && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => openEdit(r)} className={`${btnSecondary} ${small}`}>Edit details</button>
                  <button onClick={() => setCancelling(r)} className={`${btnDanger} ${small}`}>Cancel request</button>
                </div>
              )}

              {/* Finished: tidy it away into the Archive */}
              {COMPLETED_STATUSES.includes(r.status) && (
                <div className="flex pt-1">
                  <button onClick={() => run(() => archiveRequest(r.id), 'Moved to archive.')} disabled={saving}
                    className={`${btnSecondary} ${small}`}>
                    <IconArchive className="w-4 h-4" /> Archive
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <Modal title="Edit request" subtitle={editing.referenceNumber} onClose={() => setEditing(null)} maxWidth="max-w-lg">
          <form onSubmit={saveEdit} className="space-y-4">
            <div>
              <label className={labelCls}>Document type</label>
              <select value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })} className={inputCls}>
                {DOCUMENT_TYPES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Purpose</label>
              <textarea value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} required rows={3} maxLength={500}
                className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>New valid ID (optional)</label>
              <UploadBox value={form.validIdImage} onChange={handleImage}
                onClear={form.validIdImage ? () => setForm({ ...form, validIdImage: '' }) : null} label="Replace the ID photo" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className={btnSecondary}>Close</button>
              <button type="submit" disabled={saving} className={`${btnPrimary} flex-1`}>Save changes</button>
            </div>
          </form>
        </Modal>
      )}

      {cancelling && (
        <Modal title="Cancel this request?" subtitle={cancelling.referenceNumber} onClose={() => setCancelling(null)} maxWidth="max-w-md">
          <p className="text-sm text-slate-600">Your request for {cancelling.documentType} will be withdrawn. This cannot be undone.</p>
          <div className="flex gap-2 pt-5">
            <button onClick={() => setCancelling(null)} className={btnSecondary}>Keep request</button>
            <button onClick={confirmCancel} disabled={saving} className={`${btnPrimary} flex-1 !bg-rose-600 hover:!bg-rose-700`}>Cancel request</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
