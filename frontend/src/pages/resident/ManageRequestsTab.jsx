// src/pages/resident/ManageRequestsTab.jsx
// OWNER: Sean Anthony P. Sanchez (UC-04 Modify Pending Request, UC-03 Cancel Pending Request)
// Lists the resident's Pending requests. Each one can be edited or cancelled while it is still Pending.
import React, { useEffect, useState } from 'react';
import UploadBox from '../../components/UploadBox';
import { Modal, StatusBadge, formatDate, inputCls, labelCls, btnPrimary, btnSecondary, btnDanger, cardCls } from '../../components/ui';
import { DOCUMENT_TYPES } from '../../utils/constants';
import { compressImage } from '../../utils/image';
import { getManagedRequests, editRequest, cancelRequest } from '../../api/requestManagement';
import { onLive } from '../../api/live';

export default function ManageRequestsTab({ showToast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);      // request being edited
  const [form, setForm] = useState({ documentType: '', purpose: '', validIdImage: '' });
  const [cancelling, setCancelling] = useState(null); // request waiting for cancel confirmation
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setRequests(await getManagedRequests('pending'));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  // Load now, and again whenever the server says requests changed (for example staff processed one).
  useEffect(() => {
    load();
    return onLive('requests', load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (r) => {
    setEditing(r);
    setForm({ documentType: r.documentType, purpose: r.purpose, validIdImage: '' });
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      setForm((f) => ({ ...f, validIdImage: dataUrl }));
    } catch {
      showToast('Could not read that image.', 'error');
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await editRequest(editing.id, form.documentType, form.purpose, form.validIdImage);
      showToast('Request updated.');
      setEditing(null);
      load();
    } catch (err) {
      showToast(err.message, 'error'); // e.g. staff already processed it
    } finally {
      setSaving(false);
    }
  };

  const confirmCancel = async () => {
    setSaving(true);
    try {
      await cancelRequest(cancelling.id);
      showToast('Request cancelled.');
      setCancelling(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">Manage requests</h1>
        <p className="text-sm text-slate-500 mt-1">You can edit or cancel a request until the barangay starts processing it.</p>
      </div>

      {loading && <div className={`${cardCls} p-10 text-center text-sm text-slate-400`}>Loading...</div>}
      {!loading && requests.length === 0 && (
        <div className={`${cardCls} p-10 text-center text-sm text-slate-400`}>No pending requests to manage.</div>
      )}

      <div className="space-y-3">
        {requests.map((r) => (
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
            <div className="flex gap-2">
              <button onClick={() => openEdit(r)} className={`${btnSecondary} !py-1.5 !px-3 text-xs`}>Edit details</button>
              <button onClick={() => setCancelling(r)} className={`${btnDanger} !py-1.5 !px-3 text-xs`}>Cancel request</button>
            </div>
          </div>
        ))}
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
