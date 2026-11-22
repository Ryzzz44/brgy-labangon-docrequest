// src/pages/staff/ActivityTab.jsx
// OWNER: Sean Anthony P. Sanchez (Activity log / transaction history)
// Shows every action taken on any request (who, what, when), newest first, with search and a role filter.
import React, { useEffect, useState } from 'react';
import { formatDate, inputCls, cardCls } from '../../components/ui';
import { getHistory } from '../../api/history';

const ACTION_COLORS = {
  SUBMITTED: 'bg-amber-50 text-amber-700',
  UPDATED: 'bg-slate-100 text-slate-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
  PROCESSED: 'bg-blue-50 text-blue-700',
  READY_FOR_PICKUP: 'bg-indigo-50 text-indigo-700',
  RELEASED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-rose-50 text-rose-700',
};

export default function ActivityTab({ showToast }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');

  useEffect(() => {
    getHistory().then(setRows).catch((err) => showToast(err.message, 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const term = search.trim().toLowerCase();
  const shown = rows.filter((h) =>
    (role === 'All' || h.actorRole === role) &&
    (!term || h.referenceNumber.toLowerCase().includes(term) || h.actorName.toLowerCase().includes(term)));

  return (
    <div className={`${cardCls} p-6 space-y-4`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reference number or name" className={`${inputCls} flex-1`} />
        <select value={role} onChange={(e) => setRole(e.target.value)} className={`${inputCls} sm:w-44`}>
          <option>All</option>
          <option>Resident</option>
          <option>Staff</option>
        </select>
      </div>

      <p className="text-xs text-slate-500">{shown.length} of {rows.length} actions</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
              <th className="py-2 pr-3">When</th>
              <th className="py-2 pr-3">Reference</th>
              <th className="py-2 pr-3">Action</th>
              <th className="py-2 pr-3">By</th>
              <th className="py-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((h) => (
              <tr key={h.id} className="border-b border-slate-100 align-top">
                <td className="py-2.5 pr-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(h.timestamp)}</td>
                <td className="py-2.5 pr-3 font-mono text-xs">{h.referenceNumber}</td>
                <td className="py-2.5 pr-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ACTION_COLORS[h.actionType] || 'bg-slate-100'}`}>
                    {h.actionType.replaceAll('_', ' ')}
                  </span>
                </td>
                <td className="py-2.5 pr-3 whitespace-nowrap">{h.actorName} <span className="text-[11px] text-slate-400">({h.actorRole})</span></td>
                <td className="py-2.5 text-slate-600">{h.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}