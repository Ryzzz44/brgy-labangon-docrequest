// src/pages/resident/TrackTab.jsx
// OWNER: Samuel O. Salado (UC-02 Track Request Status)
// Shows the resident's active requests with a progress bar. Data: GET /api/resident/requests (useMyRequests).
import React from 'react';
import { StatusBadge, formatDate, cardCls } from '../../components/ui';
import { PROGRESS_STEPS } from '../../utils/constants';
import { useMyRequests } from '../../api/requests';

export default function TrackTab() {
  const { requests, loading, error } = useMyRequests();

  // Archived requests belong to the Archive page, so they are hidden here.
  const active = requests.filter((r) => !r.archivedByResident);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">Track requests</h1>
        <p className="text-sm text-slate-500 mt-1">Follow each application from submission to release.</p>
      </div>

      {loading && <div className={`${cardCls} p-10 text-center text-sm text-slate-400`}>Loading your requests...</div>}
      {error && <div className={`${cardCls} p-6 text-center text-sm text-rose-600`}>{error}</div>}
      {!loading && !error && active.length === 0 && (
        <div className={`${cardCls} p-10 text-center text-sm text-slate-400`}>No active requests yet.</div>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}