// src/pages/staff/ReportsTab.jsx
// OWNER: James Carl P. Rafanan (UC-08 Generate Transaction Report)
// Pick week / month / year and a date, see the totals, and print the report or download it as CSV (Excel).
import React, { useEffect, useState } from 'react';
import { BrandMark, IconPrinter, IconDownload, StatCard, formatDate, inputCls, labelCls, btnPrimary, btnSecondary, cardCls } from '../../components/ui';
import { getReport } from '../../api/reports';

const today = () => new Date().toLocaleDateString('en-CA'); // "2026-11-22" in local time
const niceDate = (iso) => new Date(iso).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });

// Puts a value in quotes so commas and quotes inside it do not break the CSV columns.
// A value starting with = + - @ gets a ' in front so Excel shows it as text, not as a formula.
const csvCell = (value) => {
  const text = String(value ?? '');
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

// Builds the CSV file in the browser and downloads it (opens in Excel).
function downloadCsv(report) {
  const lines = [
    ['Barangay Labangon Transaction Report'],
    ['Period', `${report.from} to ${report.to}`],
    ['Total requests', report.total],
    [],
    ['Reference', 'Resident', 'Document', 'Status', 'Filed'],
    ...report.requests.map((r) => [r.referenceNumber, r.residentName, r.documentType, r.status, formatDate(r.createdAt)]),
  ].map((row) => row.map(csvCell).join(','));
  // \ufeff tells Excel the file is UTF-8 (so names like "Peñaflor" show correctly).
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `barangay-report-${report.period}-${report.from}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsTab({ showToast }) {
  const [period, setPeriod] = useState('month');
  const [date, setDate] = useState(today());
  const [report, setReport] = useState(null);

  // Reload the report whenever the period or date changes.
  useEffect(() => {
    getReport(period, date)
      .then(setReport)
      .catch((err) => showToast(err.message, 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, date]);

  return (
    <div className="space-y-6">
      {/* Controls (hidden when printing) */}
      <div className={`${cardCls} p-5 flex flex-col sm:flex-row sm:items-end gap-3 print:hidden`}>
        <div className="sm:w-48">
          <label className={labelCls}>Period</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className={inputCls}>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
        <div className="sm:w-56">
          <label className={labelCls}>Any date in the period</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </div>
        <button onClick={() => downloadCsv(report)} disabled={!report || report.total === 0}
          className={`${btnSecondary} sm:ml-auto disabled:opacity-40`}>
          <IconDownload /> Download CSV
        </button>
        <button onClick={() => window.print()} className={btnPrimary}>
          <IconPrinter /> Print report
        </button>
      </div>

      {report && (
        <div className={`${cardCls} p-6 md:p-8 space-y-8 print:shadow-none print:ring-0`}>
          <header className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <BrandMark size="w-12 h-12" />
            <div>
              <h2 className="font-display text-2xl text-slate-900">Barangay Labangon: Transaction Report</h2>
              <p className="text-sm text-slate-500">
                {niceDate(report.from)} to {niceDate(report.to)} &middot; {report.total} request{report.total === 1 ? '' : 's'}
              </p>
            </div>
          </header>

          <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(report.byStatus).map(([status, n]) => (
              <StatCard key={status} label={status} value={n} />
            ))}
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">By document type</h3>
            {Object.keys(report.byDocumentType).length === 0 && <p className="text-sm text-slate-400">No requests in this period.</p>}
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(report.byDocumentType).map(([type, n]) => (
                  <tr key={type} className="border-b border-slate-100">
                    <td className="py-2 text-slate-700">{type}</td>
                    <td className="py-2 text-right font-semibold tabular-nums">{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">All requests</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-3">Reference</th>
                    <th className="py-2 pr-3">Resident</th>
                    <th className="py-2 pr-3">Document</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">Filed</th>
                  </tr>
                </thead>
                <tbody>
                  {report.requests.map((r) => (
                    <tr key={r.referenceNumber} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-mono text-xs">{r.referenceNumber}</td>
                      <td className="py-2 pr-3">{r.residentName}</td>
                      <td className="py-2 pr-3">{r.documentType}</td>
                      <td className="py-2 pr-3">{r.status}</td>
                      <td className="py-2 text-xs text-slate-500">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className="text-[11px] text-slate-400">Generated {new Date().toLocaleString('en-PH')}</p>
        </div>
      )}
    </div>
  );
}