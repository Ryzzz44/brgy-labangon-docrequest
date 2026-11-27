// src/pages/staff/RequestsTab.jsx
// OWNER: James Carl P. Rafanan (UC-05 Review & Verify Request, UC-06 Release Document)
// Staff see every request, open one to check the details and ID, then move it to the next status.
import React, { useEffect, useState } from 'react';
import {
  StatCard, StatusBadge, Modal, formatDate, inputCls, labelCls, btnPrimary, btnSecondary, btnDanger, cardCls,
} from '../../components/ui';
import { STATUSES } from '../../utils/constants';
import { getAllRequests, markSeenByStaff, updateStatus } from '../../api/staff';
import { onLive } from '../../api/live';

// The button staff click for each status, and the status it moves the request to.
const NEXT_STEP = {
  Pending: { label: 'Mark as processed', to: 'Processed' },
  Processed: { label: 'Mark ready for pickup', to: 'Ready for Pickup' },
  'Ready for Pickup': { label: 'Mark as released', to: 'Released' },
};
const CAN_REJECT = ['Pending', 'Processed'];

export default function RequestsTab({ showToast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState(null);       // request shown in the modal
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setRequests(await getAllRequests());
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load once, then reload right away whenever the server says requests changed (live update).
  // A slow 30-second check is kept as a backup.
  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    const stopLive = onLive('requests', load);
    return () => {
      clearInterval(timer);
      stopLive();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openRequest = async (r) => {
    setSelected(r);
    setRejecting(false);
    setReason('');
    if (!r.seenByStaff) {
      await markSeenByStaff(r.id).catch(() => {});
      load();
    }
  };

  const changeStatus = async (to, rejectReason) => {
    setSaving(true);
    try {
      const updated = await updateStatus(selected.id, to, rejectReason);
      showToast(`${updated.referenceNumber} is now ${updated.status}.`);
      setSelected(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const count = (status) => requests.filter((r) => r.status === status).length;
  const term = search.trim().toLowerCase();
  const shown = requests.filter((r) =>
    (statusFilter === 'All' || r.status === statusFilter) &&
    (!term || r.referenceNumber.toLowerCase().includes(term) || r.residentName.toLowerCase().includes(term)));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending review" value={count('Pending')} tone="butter" />
        <StatCard label="Processing" value={count('Processed')} tone="ice" />
        <StatCard label="Ready for pickup" value={count('Ready for Pickup')} tone="lilac" />
        <StatCard label="Released" value={count('Released')} tone="mint" />
      </div>

      <div className={`${cardCls} p-5 space-y-4`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference number or resident name" className={`${inputCls} flex-1`} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputCls} sm:w-56`}>
            <option>All</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading && <p className="text-sm text-slate-400 py-6 text-center">Loading requests...</p>}
        {!loading && shown.length === 0 && <p className="text-sm text-slate-400 py-6 text-center">No requests found.</p>}

        <ul className="divide-y divide-slate-100">
          {shown.map((r) => (
            <li key={r.id}>
              <button onClick={() => openRequest(r)} className="w-full text-left py-3.5 flex items-center gap-4 hover:bg-slate-50 rounded-xl px-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${r.seenByStaff ? 'bg-transparent' : 'bg-brand'}`} title="New" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{r.residentName} &middot; {r.documentType}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{r.referenceNumber} &middot; {formatDate(r.createdAt)}</p>
                </div>
                <StatusBadge status={r.status} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selected && (
        <Modal title={selected.documentType} subtitle={selected.referenceNumber} onClose={() => setSelected(null)}>
          <div className="grid md:grid-cols-2 gap-6">
            <dl className="space-y-3 text-sm">
              <div><dt className={labelCls}>Resident</dt><dd className="text-slate-900">{selected.residentName}</dd></div>
              <div><dt className={labelCls}>Address</dt><dd className="text-slate-900">{selected.residentAddress}</dd></div>
              <div><dt className={labelCls}>Contact number</dt><dd className="text-slate-900">{selected.residentContactNumber}</dd></div>
              <div><dt className={labelCls}>Purpose</dt><dd className="text-slate-900">{selected.purpose}</dd></div>
              <div><dt className={labelCls}>Filed</dt><dd className="text-slate-900">{formatDate(selected.createdAt)}</dd></div>
              <div><dt className={labelCls}>Status</dt><dd><StatusBadge status={selected.status} /></dd></div>
              {selected.rejectionReason && (
                <div><dt className={labelCls}>Rejection reason</dt><dd className="text-rose-700">{selected.rejectionReason}</dd></div>
              )}
            </dl>
            <div>
              <p className={labelCls}>Valid ID</p>
              {selected.validIdImage
                ? <img src={selected.validIdImage} alt="Resident's valid ID" className="w-full rounded-2xl ring-1 ring-slate-200 bg-slate-50 object-contain max-h-72" />
                : <p className="text-sm text-slate-400">No ID uploaded.</p>}
            </div>
          </div>

          {rejecting ? (
            <div className="mt-6 space-y-3">
              <label className={labelCls}>Reason for rejecting (the resident will see this)</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={500}
                className={`${inputCls} resize-none`} placeholder="e.g. The uploaded ID is not readable." />
              <div className="flex gap-2">
                <button onClick={() => setRejecting(false)} className={btnSecondary}>Back</button>
                <button onClick={() => changeStatus('Rejected', reason)} disabled={saving || !reason.trim()}
                  className={`${btnPrimary} flex-1 !bg-rose-600 hover:!bg-rose-700`}>Reject request</button>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-2">
              {NEXT_STEP[selected.status] && (
                <button onClick={() => changeStatus(NEXT_STEP[selected.status].to)} disabled={saving} className={`${btnPrimary} flex-1`}>
                  {NEXT_STEP[selected.status].label}
                </button>
              )}
              {CAN_REJECT.includes(selected.status) && (
                <button onClick={() => setRejecting(true)} className={btnDanger}>Reject</button>
              )}
              {!NEXT_STEP[selected.status] && (
                <p className="text-sm text-slate-500">This request is {selected.status.toLowerCase()} and can no longer change.</p>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
