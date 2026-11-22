// src/components/StaffReports.jsx
import React, { useState, useMemo } from 'react';
import {
  IconPrinter, IconDownload,
  inputCls, btnPrimary, btnSecondary, cardCls,
  BrandMark, StatusBadge, StatCard, Modal,
} from './ui';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_MS = 24 * 60 * 60 * 1000;

const toDate = (ts) => (ts?.toDate ? ts.toDate() : new Date());
const shortDate = (d) => d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
const fullDate = (d) => d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
const timeOf = (d) => d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
const pad = (n) => String(n).padStart(2, '0');
const toInputDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromInputDate = (v) => {
  const [y, m, d] = v.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const residentKeyOf = (r) => r.resident_uid || `name:${r.resident_name}`;

// Weeks run Monday to Sunday; week 1 is the one containing January 1
const getWeeks = (year) => {
  const jan1 = new Date(year, 0, 1);
  let start = new Date(year, 0, 1 - ((jan1.getDay() + 6) % 7));
  const yearEnd = new Date(year + 1, 0, 1);
  const weeks = [];
  while (start < yearEnd) {
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
    weeks.push({ start, end });
    start = end;
  }
  return weeks;
};

const currentWeekIndex = (year) => {
  const now = new Date();
  if (now.getFullYear() !== year) return 0;
  const idx = getWeeks(year).findIndex((w) => now >= w.start && now < w.end);
  return idx < 0 ? 0 : idx;
};

const ACTION_META = {
  SUBMITTED: { label: 'Submitted', status: 'Pending' },
  UPDATED: { label: 'Details updated', status: 'Pending' },
  PROCESSED: { label: 'Approved', status: 'Processed' },
  READY_FOR_PICKUP: { label: 'Marked ready', status: 'Ready for Pickup' },
  RELEASED: { label: 'Released', status: 'Released' },
  REJECTED: { label: 'Rejected', status: 'Rejected' },
  CANCELLED: { label: 'Cancelled', status: 'Cancelled' },
};

const selectCls = `${inputCls} !w-auto !py-2 !text-xs !font-medium`;

/* ---------- Small bar chart ---------- */
function BarChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const every = data.length > 14 ? (data.length === 24 ? 3 : 5) : 1;
  return (
    <div>
      <div className="flex items-end gap-[3px] h-28">
        {data.map((d, i) => (
          <div key={i} className="flex-1 min-w-0 h-full flex items-end" title={`${d.title}: ${d.value}`}>
            <div
              className="w-full rounded-t bg-brand/80"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 4 : 0 }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-[3px] mt-1.5 border-t border-slate-100 pt-1.5">
        {data.map((d, i) => (
          <span key={i} className="flex-1 min-w-0 text-center text-[9px] text-slate-400 truncate">
            {i % every === 0 ? d.label : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

function BreakdownList({ items }) {
  const max = Math.max(1, ...items.map(([, n]) => n));
  if (items.length === 0) return <p className="text-xs text-slate-400">No data for this period.</p>;
  return (
    <ul className="space-y-2.5">
      {items.map(([label, n]) => (
        <li key={label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-700">{label}</span>
            <span className="font-semibold text-slate-900 tabular-nums">{n}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100">
            <div className="h-1.5 rounded-full bg-brand" style={{ width: `${(n / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Avatar({ name, size = 'w-9 h-9 text-sm' }) {
  return (
    <span className={`${size} rounded-full bg-brand-soft text-brand font-semibold flex items-center justify-center shrink-0`}>
      {(name || '?').trim().charAt(0).toUpperCase()}
    </span>
  );
}

/* ---------- Resident detail ---------- */
function ResidentDetail({ resKey, requests, auditLogs, residents, onClose }) {
  const theirRequests = requests.filter((r) => residentKeyOf(r) === resKey);
  const latest = theirRequests[0];
  const stored = residents.get(resKey);
  const profile = stored || {
    full_name: latest?.resident_name,
    email: null,
    address: latest?.address,
    contact_number: latest?.contact_number,
    valid_id_url: latest?.valid_id_url,
  };
  const ids = new Set(theirRequests.map((r) => r.id));
  const history = auditLogs
    .filter((l) => ids.has(l.request_id))
    .sort((a, b) => toDate(b.timestamp) - toDate(a.timestamp));
  const reqById = new Map(theirRequests.map((r) => [r.id, r]));
  const count = (st) => theirRequests.filter((r) => r.status === st).length;
  const activeCount = theirRequests.filter((r) => ['Pending', 'Processed', 'Ready for Pickup'].includes(r.status)).length;
  const memberSince = profile.created_at?.toDate ? fullDate(profile.created_at.toDate()) : null;

  return (
    <Modal title={profile.full_name || 'Resident'} subtitle="Resident profile" onClose={onClose} maxWidth="max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Profile */}
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={profile.full_name} size="w-12 h-12 text-lg" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 break-words">{profile.full_name || 'Resident'}</p>
                {memberSince && <p className="text-[11px] text-slate-400">Member since {memberSince}</p>}
              </div>
            </div>
            {[
              ['Email', profile.email],
              ['Contact', profile.contact_number],
              ['Address', profile.address],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-[11px] text-slate-400">{k}</p>
                <p className="text-sm text-slate-900 break-words">{v || '-'}</p>
              </div>
            ))}
            {!stored && (
              <p className="text-[11px] text-slate-400">Profile details taken from the latest request (no saved profile found).</p>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">ID on file</p>
            {profile.valid_id_url ? (
              <img src={profile.valid_id_url} alt="Resident ID" className="w-full max-h-48 object-contain rounded-xl border border-slate-200 bg-white" />
            ) : (
              <p className="text-sm text-slate-400 py-6 text-center">No ID image on file</p>
            )}
          </div>
        </div>

        {/* Activity */}
        <div className="md:col-span-2 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ['Requests', theirRequests.length],
              ['In progress', activeCount],
              ['Released', count('Released')],
              ['Rejected / cancelled', count('Rejected') + count('Cancelled')],
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-50 rounded-2xl px-4 py-3">
                <p className="text-[11px] font-medium text-slate-500">{k}</p>
                <p className="font-display text-2xl font-semibold text-slate-900 tabular-nums mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 mb-2">Requests</p>
            {theirRequests.length === 0 ? (
              <p className="text-xs text-slate-400">No requests found.</p>
            ) : (
              <ul className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {theirRequests.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{r.document_type}</p>
                      <p className="text-[11px] text-slate-400">
                        <span className="font-mono text-brand">{r.reference_number}</span> &middot; {r.purpose}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 mb-2">Transaction history</p>
            {history.length === 0 ? (
              <p className="text-xs text-slate-400">No transactions recorded.</p>
            ) : (
              <ul className="space-y-0 border border-slate-100 rounded-2xl divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {history.map((l) => {
                  const d = toDate(l.timestamp);
                  const r = reqById.get(l.request_id);
                  return (
                    <li key={l.id} className="px-4 py-3">
                      <div className="flex justify-between gap-3 text-[11px]">
                        <span className="text-slate-500">{fullDate(d)} &middot; {timeOf(d)}</span>
                        <span className="font-semibold text-brand">{ACTION_META[l.action_type]?.label || l.action_type}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5">
                        <span className="font-mono">{r?.reference_number}</span> {l.remarks}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Reports tab ---------- */
export default function StaffReports({ requests, auditLogs, residents }) {
  const now = new Date();
  const [mode, setMode] = useState('month'); // day | week | month | year
  const [year, setYearState] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [weekIdx, setWeekIdx] = useState(currentWeekIndex(now.getFullYear()));
  const [day, setDay] = useState(toInputDate(now));
  const [openKey, setOpenKey] = useState(null);

  const setYear = (y) => {
    setYearState(y);
    setWeekIdx(currentWeekIndex(y));
  };

  const yearOptions = useMemo(() => {
    const set = new Set([now.getFullYear(), year]);
    requests.forEach((r) => set.add(toDate(r.created_at).getFullYear()));
    auditLogs.forEach((l) => set.add(toDate(l.timestamp).getFullYear()));
    return [...set].sort((a, b) => b - a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests, auditLogs, year]);

  const weeks = useMemo(() => getWeeks(year), [year]);

  const range = useMemo(() => {
    const yStart = new Date(year, 0, 1);
    const yEnd = new Date(year + 1, 0, 1);
    if (mode === 'year') return { start: yStart, end: yEnd, label: `Year ${year}` };
    if (mode === 'month') {
      return { start: new Date(year, month, 1), end: new Date(year, month + 1, 1), label: `${MONTHS[month]} ${year}` };
    }
    if (mode === 'week') {
      const w = weeks[Math.min(weekIdx, weeks.length - 1)];
      const start = w.start < yStart ? yStart : w.start;
      const end = w.end > yEnd ? yEnd : w.end;
      return { start, end, label: `Week ${weekIdx + 1}, ${shortDate(start)} - ${shortDate(new Date(end.getTime() - DAY_MS))}, ${year}` };
    }
    const d = day ? fromInputDate(day) : new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return {
      start,
      end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1),
      label: start.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    };
  }, [mode, year, month, weekIdx, day, weeks]);

  const reqById = useMemo(() => new Map(requests.map((r) => [r.id, r])), [requests]);

  const rows = useMemo(() => {
    return auditLogs
      .map((l) => ({ l, date: toDate(l.timestamp) }))
      .filter(({ date }) => date >= range.start && date < range.end)
      .sort((a, b) => a.date - b.date)
      .map(({ l, date }) => {
        const r = reqById.get(l.request_id);
        const meta = ACTION_META[l.action_type] || { label: l.action_type, status: r?.status };
        return {
          id: l.id,
          date,
          reference: r?.reference_number || '-',
          resident: r?.resident_name || l.actor_name,
          residentKey: r ? residentKeyOf(r) : null,
          requestId: l.request_id,
          document: r?.document_type || '-',
          purpose: r?.purpose || '-',
          action: meta.label,
          actionType: l.action_type,
          status: meta.status,
          actor: `${l.actor_name} (${l.actor_role})`,
          details: l.remarks || '',
        };
      });
  }, [auditLogs, range, reqById]);

  const stats = useMemo(() => {
    const byAction = {};
    const byDoc = {};
    const handled = new Set();
    const residentsMap = new Map();
    rows.forEach((r) => {
      byAction[r.action] = (byAction[r.action] || 0) + 1;
      if (!handled.has(r.requestId)) {
        handled.add(r.requestId);
        byDoc[r.document] = (byDoc[r.document] || 0) + 1;
      }
      if (r.residentKey) {
        const cur = residentsMap.get(r.residentKey) || { name: r.resident, count: 0 };
        cur.count += 1;
        residentsMap.set(r.residentKey, cur);
      }
    });
    const sortDesc = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]);
    return {
      handled: handled.size,
      released: byAction.Released || 0,
      byAction: sortDesc(byAction),
      byDoc: sortDesc(byDoc),
      residents: [...residentsMap.entries()].map(([key, v]) => ({ key, ...v })).sort((a, b) => b.count - a.count),
    };
  }, [rows]);

  // Volume chart: hours (day), days (week/month) or months (year)
  const chart = useMemo(() => {
    const n = mode === 'day' ? 24 : mode === 'year' ? 12 : Math.round((range.end - range.start) / DAY_MS);
    const idxOf = (d) => {
      if (mode === 'day') return d.getHours();
      if (mode === 'year') return d.getMonth();
      return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - range.start) / DAY_MS);
    };
    const data = Array.from({ length: n }, (_, i) => {
      let label;
      let title;
      if (mode === 'day') {
        label = `${i % 12 || 12}${i < 12 ? 'a' : 'p'}`;
        title = `${i % 12 || 12}${i < 12 ? ' AM' : ' PM'}`;
      } else if (mode === 'year') {
        label = MONTHS[i].slice(0, 3);
        title = MONTHS[i];
      } else {
        const d = new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate() + i);
        label = mode === 'week' ? d.toLocaleDateString('en-PH', { weekday: 'short' }) : String(d.getDate());
        title = fullDate(d);
      }
      return { label, title, value: 0 };
    });
    rows.forEach((r) => {
      const i = idxOf(r.date);
      if (data[i]) data[i].value += 1;
    });
    const peak = data.reduce((best, d) => (d.value > best.value ? d : best), { value: 0 });
    return { data, peak };
  }, [rows, mode, range]);

  const exportCsv = () => {
    const head = ['Date', 'Time', 'Reference', 'Resident', 'Document', 'Purpose', 'Action', 'Status', 'Performed by', 'Details'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [
      head.map(esc).join(','),
      ...rows.map((r) =>
        [fullDate(r.date), timeOf(r.date), r.reference, r.resident, r.document, r.purpose, r.action, r.status, r.actor, r.details]
          .map(esc)
          .join(',')
      ),
    ];
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barangay-report-${range.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const modeBtn = (id, label) => (
    <button
      key={id}
      onClick={() => setMode(id)}
      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
        mode === id ? 'bg-white text-slate-900 shadow-soft' : 'text-slate-500 hover:text-slate-900'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Controls (not printed) */}
      <div className={`${cardCls} p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 print:hidden`}>
        <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1 w-fit">
          {modeBtn('day', 'Day')}
          {modeBtn('week', 'Week')}
          {modeBtn('month', 'Month')}
          {modeBtn('year', 'Year')}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {mode === 'day' ? (
            <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className={selectCls} aria-label="Day" />
          ) : (
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={selectCls} aria-label="Year">
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
          {mode === 'month' && (
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={selectCls} aria-label="Month">
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          )}
          {mode === 'week' && (
            <select value={weekIdx} onChange={(e) => setWeekIdx(Number(e.target.value))} className={selectCls} aria-label="Week">
              {weeks.map((w, i) => {
                const yStart = new Date(year, 0, 1);
                const yEnd = new Date(year + 1, 0, 1);
                const s = w.start < yStart ? yStart : w.start;
                const e = w.end > yEnd ? yEnd : w.end;
                return (
                  <option key={i} value={i}>
                    Week {i + 1}: {shortDate(s)} - {shortDate(new Date(e.getTime() - DAY_MS))}
                  </option>
                );
              })}
            </select>
          )}
          <button onClick={exportCsv} disabled={rows.length === 0} className={`${btnSecondary} !py-2 text-xs`}>
            <IconDownload className="w-4 h-4" /> CSV
          </button>
          <button onClick={() => window.print()} className={`${btnPrimary} !py-2 text-xs`}>
            <IconPrinter className="w-4 h-4" /> Print report
          </button>
        </div>
      </div>

      {/* Report sheet (this is what prints) */}
      <div className="space-y-6">
        <div className={`${cardCls} p-6 flex flex-wrap items-center justify-between gap-4 print:shadow-none print:ring-0 print:p-0`}>
          <div className="flex items-center gap-4">
            <BrandMark size="w-12 h-12" />
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Barangay Labangon</p>
              <h2 className="font-display text-2xl font-semibold text-slate-900">Document transaction report</h2>
              <p className="text-sm text-slate-600 mt-0.5">{range.label}</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Generated {fullDate(new Date())} &middot; {timeOf(new Date())}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Transactions" value={rows.length} tone="lilac" />
          <StatCard label="Requests handled" value={stats.handled} tone="butter" />
          <StatCard label="Residents served" value={stats.residents.length} tone="ice" />
          <StatCard label="Documents released" value={stats.released} tone="mint" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:break-inside-avoid">
          <div className={`${cardCls} p-6 lg:col-span-2 print:shadow-none`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
              <p className="text-sm font-semibold text-slate-900">
                Transaction volume by {mode === 'day' ? 'hour' : mode === 'year' ? 'month' : 'day'}
              </p>
              {chart.peak.value > 0 && (
                <p className="text-xs text-slate-400">Busiest: {chart.peak.title} ({chart.peak.value})</p>
              )}
            </div>
            <BarChart data={chart.data} />
          </div>

          <div className="space-y-4">
            <div className={`${cardCls} p-6 print:shadow-none`}>
              <p className="text-sm font-semibold text-slate-900 mb-3">By action</p>
              <BreakdownList items={stats.byAction} />
            </div>
            <div className={`${cardCls} p-6 print:shadow-none`}>
              <p className="text-sm font-semibold text-slate-900 mb-3">By document type</p>
              <BreakdownList items={stats.byDoc} />
            </div>
          </div>
        </div>

        {/* Residents */}
        <div className={`${cardCls} p-6 print:shadow-none`}>
          <p className="text-sm font-semibold text-slate-900">Residents in this period</p>
          <p className="text-xs text-slate-400 mt-0.5 mb-4 print:hidden">Click a name to open the full profile.</p>
          {stats.residents.length === 0 ? (
            <p className="text-xs text-slate-400">No residents with transactions in this period.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats.residents.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setOpenKey(r.key)}
                  className="inline-flex items-center gap-2 bg-slate-50 hover:bg-brand-soft rounded-full pl-1.5 pr-4 py-1.5 transition"
                >
                  <Avatar name={r.name} size="w-7 h-7 text-xs" />
                  <span className="text-sm font-medium text-slate-800">{r.name}</span>
                  <span className="text-[11px] font-semibold text-slate-400 tabular-nums">{r.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Transactions */}
        <div className={`${cardCls} overflow-hidden print:shadow-none`}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">Transactions</p>
            <p className="text-xs text-slate-400">{rows.length} record{rows.length === 1 ? '' : 's'}, oldest first</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Date and time</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Resident</th>
                  <th className="px-4 py-3 font-medium">Document</th>
                  <th className="px-4 py-3 font-medium">Purpose</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-14 text-center text-slate-400">No transactions recorded for this period.</td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="align-top print:break-inside-avoid">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs text-slate-800">{fullDate(r.date)}</p>
                        <p className="text-[11px] text-slate-400">{timeOf(r.date)}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-brand whitespace-nowrap">{r.reference}</td>
                      <td className="px-4 py-3">
                        {r.residentKey ? (
                          <button
                            onClick={() => setOpenKey(r.residentKey)}
                            className="font-medium text-slate-900 hover:text-brand hover:underline text-left"
                          >
                            {r.resident}
                          </button>
                        ) : (
                          <span className="text-slate-700">{r.resident}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{r.document}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-[180px]">{r.purpose}</td>
                      <td className="px-4 py-3 text-slate-800 whitespace-nowrap">
                        {r.action}
                        <p className="text-[11px] text-slate-400">{r.actor}</p>
                      </td>
                      <td className="px-4 py-3">{r.status ? <StatusBadge status={r.status} /> : '-'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[240px]">{r.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {openKey && (
        <ResidentDetail
          resKey={openKey}
          requests={requests}
          auditLogs={auditLogs}
          residents={residents}
          onClose={() => setOpenKey(null)}
        />
      )}
    </div>
  );
}
