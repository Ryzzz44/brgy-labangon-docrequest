// src/components/StaffDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { staffDb as db } from '../staffFirebase';
import {
  IconList, IconLogout, IconSearch, IconBell, IconTrash, IconX,
  inputCls, labelCls, btnPrimary, btnSecondary, btnDanger, cardCls,
  formatDate, BrandMark, StatusBadge, Toast, Modal, StatCard, NavBadge, NotificationPopups,
} from './ui';
import StaffReports from './StaffReports';
import { StaffAnnouncements } from './Announcements';

const COMPLETED = ['Released', 'Rejected', 'Cancelled'];
const TABS = [
  { id: 'requests', label: 'Requests' },
  { id: 'reports', label: 'Reports' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'notifications', label: 'Notifications' },
];

const toDate = (ts) => (ts?.toDate ? ts.toDate() : new Date());
const shortDate = (d) => d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
const fullDay = (d) => d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
const timeOf = (d) => d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });

const NOTIF_TITLE = {
  SUBMITTED: 'New request',
  UPDATED: 'Request details updated',
  CANCELLED: 'Request cancelled',
};

// Staff notification state lives in this browser (staff share a PIN, there are no staff accounts)
const loadJSON = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const saveJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: ignore */
  }
};

export default function StaffDashboard({ onLogout }) {
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [residents, setResidents] = useState(new Map());
  const [auditLogs, setAuditLogs] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState('active'); // active | archive
  const [selectedReq, setSelectedReq] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [toast, setToast] = useState({ message: null, type: 'success' });

  // Notifications
  const [dismissed, setDismissed] = useState(() => new Set(loadJSON('staff_notif_dismissed', [])));
  const [lastSeen, setLastSeen] = useState(() => {
    const saved = Number(loadJSON('staff_notif_last_seen', 0));
    if (saved) return saved;
    const t = Date.now();
    saveJSON('staff_notif_last_seen', t);
    return t;
  });
  const [highlight, setHighlight] = useState(new Set());
  const [popups, setPopups] = useState([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const mountedAt = useRef(Date.now());
  const poppedRef = useRef(new Set());

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: null, type }), 4000);
  };

  /* ---------- Listeners ---------- */
  useEffect(() => {
    const q = query(collection(db, 'DocumentRequest'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => setRequests(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error('Requests listener error:', err)
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'TransactionHistory'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => setAuditLogs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error('Audit listener error:', err)
    );
    return () => unsub();
  }, []);

  // Saved resident profiles (needs read access in your Firestore rules; the report falls back to request data)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'Residents'),
      (snapshot) => setResidents(new Map(snapshot.docs.map((d) => [d.id, { id: d.id, ...d.data() }]))),
      (err) => console.warn('Residents listener error (profile details will use request data):', err.code)
    );
    return () => unsub();
  }, []);

  /* ---------- Notifications (resident actions) ---------- */
  const reqById = new Map(requests.map((r) => [r.id, r]));
  const notifs = auditLogs.filter((l) => l.actor_role === 'Resident' && !dismissed.has(l.id));
  const unreadCount = notifs.filter((l) => toDate(l.timestamp).getTime() > lastSeen).length;

  // Pop up when a resident does something while the dashboard is open
  useEffect(() => {
    const fresh = notifs.filter(
      (l) => l.timestamp?.toMillis && l.timestamp.toMillis() > mountedAt.current && !poppedRef.current.has(l.id)
    );
    if (fresh.length === 0) return;
    fresh.forEach((l) => poppedRef.current.add(l.id));
    if (tab === 'notifications') return;
    const items = fresh.map((l) => ({
      id: l.id,
      title: NOTIF_TITLE[l.action_type] || 'Resident activity',
      body: `${l.actor_name}: ${l.remarks || ''}`,
      status: null,
    }));
    setPopups((prev) => [...prev, ...items].slice(-3));
    items.forEach((i) => setTimeout(() => setPopups((prev) => prev.filter((x) => x.id !== i.id)), 10000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditLogs]);

  // Opening the tab marks everything as seen, but keeps the new ones highlighted
  useEffect(() => {
    if (tab !== 'notifications') {
      if (highlight.size) setHighlight(new Set());
      return;
    }
    const unread = notifs.filter((l) => toDate(l.timestamp).getTime() > lastSeen);
    if (unread.length === 0) return;
    setHighlight((prev) => new Set([...prev, ...unread.map((l) => l.id)]));
    setPopups([]);
    const t = Date.now();
    setLastSeen(t);
    saveJSON('staff_notif_last_seen', t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, auditLogs]);

  const dismissOne = (id) => {
    const next = new Set(dismissed).add(id);
    setDismissed(next);
    saveJSON('staff_notif_dismissed', [...next]);
  };

  const dismissAll = () => {
    const next = new Set(dismissed);
    notifs.forEach((l) => next.add(l.id));
    setDismissed(next);
    saveJSON('staff_notif_dismissed', [...next]);
    setConfirmClear(false);
    showToast('All notifications deleted.');
  };

  /* ---------- Request actions ---------- */
  const log = (reqItem, action_type, remarks) =>
    addDoc(collection(db, 'TransactionHistory'), {
      request_id: reqItem.id,
      actor_name: 'Barangay Secretary',
      actor_role: 'Staff',
      action_type,
      timestamp: serverTimestamp(),
      remarks,
    });

  const search = searchQuery.toLowerCase();
  const filteredRequests = requests.filter((r) => {
    const matches =
      (r.reference_number || '').toLowerCase().includes(search) ||
      (r.resident_name || '').toLowerCase().includes(search);
    const done = COMPLETED.includes(r.status);
    return matches && (viewTab === 'active' ? !done : done);
  });

  const countOf = (s) => requests.filter((r) => r.status === s).length;
  const activeCount = requests.filter((r) => !COMPLETED.includes(r.status)).length;
  const archiveCount = requests.length - activeCount;

  const handleOpenReview = async (req) => {
    setSelectedReq(req);
    setShowRejectInput(false);
    setRejectionReason('');
    if (req.has_staff_seen_update === false) {
      try {
        await updateDoc(doc(db, 'DocumentRequest', req.id), { has_staff_seen_update: true });
      } catch (err) {
        console.error('Failed to clear update flag:', err);
      }
    }
  };

  const closeReview = () => {
    setSelectedReq(null);
    setShowRejectInput(false);
    setRejectionReason('');
  };

  const handleApproveAndProcess = async () => {
    if (!selectedReq) return;
    const latest = requests.find((r) => r.id === selectedReq.id);
    if (!latest || latest.status !== 'Pending') {
      showToast('This request is no longer pending.', 'error');
      closeReview();
      return;
    }
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'DocumentRequest', latest.id), { status: 'Processed', updated_at: serverTimestamp() });
      await log(latest, 'PROCESSED', `ID verified for ${latest.resident_name}. Document is now being processed / printed.`);
      closeReview();
      showToast('Request approved and moved to processing.');
    } catch (err) {
      console.error('Processing error:', err);
      showToast('Failed to update status.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetReadyForPickup = async (reqItem) => {
    try {
      await updateDoc(doc(db, 'DocumentRequest', reqItem.id), { status: 'Ready for Pickup', updated_at: serverTimestamp() });
      await log(reqItem, 'READY_FOR_PICKUP', `Document marked Ready for Pickup for ${reqItem.resident_name}. Resident notified.`);
    } catch (err) {
      console.error('Ready for pickup error:', err);
      showToast('Failed to update status.', 'error');
    }
  };

  const handleMarkAsReleased = async (reqItem) => {
    try {
      await updateDoc(doc(db, 'DocumentRequest', reqItem.id), { status: 'Released', updated_at: serverTimestamp() });
      await log(reqItem, 'RELEASED', `Printed document handed over and released to ${reqItem.resident_name}.`);
    } catch (err) {
      console.error('Release error:', err);
      showToast('Failed to mark as released.', 'error');
    }
  };

  const handleReject = async () => {
    if (!selectedReq) return;
    if (!rejectionReason.trim()) {
      showToast('Please provide a rejection reason.', 'error');
      return;
    }
    const latest = requests.find((r) => r.id === selectedReq.id);
    if (!latest || latest.status !== 'Pending') {
      showToast('This request is no longer pending.', 'error');
      closeReview();
      return;
    }
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'DocumentRequest', latest.id), {
        status: 'Rejected',
        rejection_reason: rejectionReason.trim(),
        updated_at: serverTimestamp(),
      });
      await log(latest, 'REJECTED', `Rejected: ${rejectionReason.trim()}`);
      closeReview();
      showToast('Request rejected.');
    } catch (err) {
      console.error('Rejection error:', err);
      showToast('Failed to reject the request.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  /* ---------- UI helpers ---------- */
  const queueTab = (id, label, count) => (
    <button
      onClick={() => setViewTab(id)}
      className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
        viewTab === id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      {label} <span className="tabular-nums opacity-70">({count})</span>
    </button>
  );

  const liveReq = selectedReq ? requests.find((r) => r.id === selectedReq.id) || selectedReq : null;
  const isCancelledLive = liveReq?.status === 'Cancelled';
  const isPendingLive = liveReq?.status === 'Pending';
  const hasResidentUpdated = liveReq?.has_staff_seen_update === false;

  return (
    <div className="min-h-screen text-slate-800 p-5 md:p-8 print:p-0">
      <Toast message={toast.message} type={toast.type} />
      <NotificationPopups
        items={popups}
        onDismiss={(id) => setPopups((prev) => prev.filter((x) => x.id !== id))}
        onView={(n) => { setPopups((prev) => prev.filter((x) => x.id !== n.id)); setTab('notifications'); }}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <header className="relative overflow-hidden rounded-[2rem] bg-[#0B0B1A] text-white flex flex-col md:flex-row md:items-center justify-between gap-5 px-6 py-6 md:px-8 print:hidden">
          <div className="absolute -right-16 -top-24 w-72 h-72 rounded-full bg-brand/50 blur-[90px]" />
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative flex items-center gap-4">
            <div className="bg-white rounded-2xl p-2"><BrandMark size="w-9 h-9" /></div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl leading-tight">Barangay Labangon</h1>
              <p className="text-xs text-white/60 mt-0.5">Staff dashboard &middot; Releasing and verification</p>
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <button onClick={() => setShowAuditModal(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-full ring-1 ring-white/20 hover:bg-white/10">
              <IconList /> Audit log ({auditLogs.length})
            </button>
            <button onClick={onLogout} className="inline-flex items-center gap-2 text-sm font-semibold bg-white text-slate-900 px-5 py-2.5 rounded-full hover:bg-white/90">
              <IconLogout /> Lock session
            </button>
          </div>
        </header>

        <nav className="flex items-center gap-1 bg-white rounded-full p-1.5 shadow-soft w-fit max-w-full overflow-x-auto print:hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                tab === t.id ? 'bg-brand-soft text-brand' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t.label}
              {t.id === 'notifications' && unreadCount > 0 && <NavBadge count={unreadCount} />}
            </button>
          ))}
        </nav>

        <div key={tab} className="tab-enter space-y-6">
        {/* ===== REQUESTS ===== */}
        {tab === 'requests' && (
          <>
            <div className="stagger grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Pending review" value={countOf('Pending')} tone="butter" />
              <StatCard label="Processing" value={countOf('Processed')} tone="ice" />
              <StatCard label="Ready for pickup" value={countOf('Ready for Pickup')} tone="lilac" />
              <StatCard label="Released" value={countOf('Released')} tone="mint" />
            </div>

            <div className={`${cardCls} flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2`}>
              <div className="flex gap-1">
                {queueTab('active', 'Active queue', activeCount)}
                {queueTab('archive', 'Archive', archiveCount)}
              </div>
              <div className="relative sm:w-72 px-1 sm:px-0 pb-1 sm:pb-0 sm:mr-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none hidden sm:block">
                  <IconSearch className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search reference or name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${inputCls} sm:pl-9`}
                />
              </div>
            </div>

            <div className={`${cardCls} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider">
                      <th className="px-5 py-3 font-medium">Reference</th>
                      <th className="px-5 py-3 font-medium">Resident</th>
                      <th className="px-5 py-3 font-medium">Document</th>
                      <th className="px-5 py-3 font-medium">Purpose</th>
                      <th className="px-5 py-3 font-medium">Filed</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-5 py-14 text-center text-slate-400">
                          {viewTab === 'active' ? 'No active requests in the queue.' : 'No archived requests found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-xs font-medium text-brand whitespace-nowrap">{req.reference_number}</td>
                          <td className="px-5 py-3.5 font-medium text-slate-900">{req.resident_name}</td>
                          <td className="px-5 py-3.5 text-slate-600">{req.document_type}</td>
                          <td className="px-5 py-3.5 text-slate-500 max-w-[220px]">
                            <p className="truncate">{req.purpose}</p>
                            {req.status === 'Rejected' && req.rejection_reason && (
                              <p className="truncate text-xs text-rose-600">Reason: {req.rejection_reason}</p>
                            )}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <p className="text-xs text-slate-700">{fullDay(toDate(req.created_at))}</p>
                            <p className="text-[11px] text-slate-400">{timeOf(toDate(req.created_at))}</p>
                          </td>
                          <td className="px-5 py-3.5"><StatusBadge status={req.status} /></td>
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            {req.status === 'Pending' && (
                              <div className="flex items-center justify-end gap-2">
                                {req.has_staff_seen_update === false && (
                                  <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                    Updated
                                  </span>
                                )}
                                <button onClick={() => handleOpenReview(req)} className={`${btnPrimary} !py-1.5 !px-3 text-xs`}>
                                  Review
                                </button>
                              </div>
                            )}
                            {req.status === 'Processed' && (
                              <button onClick={() => handleSetReadyForPickup(req)} className={`${btnPrimary} !py-1.5 !px-3 text-xs`}>
                                Set ready for pickup
                              </button>
                            )}
                            {req.status === 'Ready for Pickup' && (
                              <button onClick={() => handleMarkAsReleased(req)} className={`${btnPrimary} !py-1.5 !px-3 text-xs !bg-emerald-600 hover:!bg-emerald-700`}>
                                Mark as released
                              </button>
                            )}
                            {COMPLETED.includes(req.status) && (
                              <span className="text-xs text-slate-400">Archived</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ===== REPORTS ===== */}
        {tab === 'reports' && (
          <StaffReports requests={requests} auditLogs={auditLogs} residents={residents} />
        )}

        {/* ===== ANNOUNCEMENTS ===== */}
        {tab === 'announcements' && (
          <StaffAnnouncements db={db} showToast={showToast} />
        )}

        {/* ===== NOTIFICATIONS ===== */}
        {tab === 'notifications' && (
          <div className={`${cardCls} overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
                <p className="text-xs text-slate-400 mt-0.5">New requests, edits and cancellations from residents.</p>
              </div>
              <button
                onClick={() => setConfirmClear(true)}
                disabled={notifs.length === 0}
                className={`${btnDanger} !py-2 text-xs`}
              >
                <IconTrash className="w-4 h-4" /> Delete all
              </button>
            </div>

            {notifs.length === 0 ? (
              <p className="px-6 py-14 text-center text-sm text-slate-400">You are all caught up.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifs.map((l) => {
                  const r = reqById.get(l.request_id);
                  const d = toDate(l.timestamp);
                  return (
                    <li
                      key={l.id}
                      className={`flex items-start gap-4 px-6 py-4 ${highlight.has(l.id) ? 'bg-brand-soft/60' : ''}`}
                    >
                      <span className="w-9 h-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center shrink-0 mt-0.5">
                        <IconBell className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {NOTIF_TITLE[l.action_type] || 'Resident activity'}
                          {highlight.has(l.id) && (
                            <span className="ml-2 inline-block text-[10px] font-semibold text-white bg-rose-500 px-2 py-0.5 rounded-full align-middle">New</span>
                          )}
                        </p>
                        <p className="text-sm text-slate-600 mt-0.5 break-words">
                          {l.actor_name}: {l.remarks}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {r && <span className="font-mono text-brand mr-2">{r.reference_number}</span>}
                          {shortDate(d)} &middot; {timeOf(d)}
                        </p>
                      </div>
                      <button
                        onClick={() => dismissOne(l.id)}
                        aria-label="Delete notification"
                        className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <IconX className="w-4 h-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Delete all notifications confirmation */}
      {confirmClear && (
        <Modal title="Delete all notifications?" onClose={() => setConfirmClear(false)} maxWidth="max-w-md">
          <p className="text-sm text-slate-600">
            This clears {notifs.length} notification{notifs.length === 1 ? '' : 's'} from this browser. Requests and the audit log are not affected.
          </p>
          <div className="flex gap-2 pt-5">
            <button onClick={() => setConfirmClear(false)} className={btnSecondary}>Cancel</button>
            <button onClick={dismissAll} className={`${btnPrimary} flex-1 !bg-rose-600 hover:!bg-rose-700`}>Delete all</button>
          </div>
        </Modal>
      )}

      {/* Review modal */}
      {liveReq && (
        <Modal title="Verify ID and process application" subtitle={liveReq.reference_number} onClose={closeReview}>
          <div className="space-y-5">
            {hasResidentUpdated && !isCancelledLive && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-900">
                <p className="font-semibold">Resident updated application details</p>
                <p className="mt-0.5">The document type or purpose was modified. Review the details below before processing.</p>
              </div>
            )}
            {isCancelledLive && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-xs text-rose-800">
                <p className="font-semibold">Request cancelled by resident</p>
                <p className="mt-0.5">This application was cancelled. Actions are disabled.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-2.5 text-sm">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Application details</p>
                {[
                  ['Applicant', liveReq.resident_name],
                  ['Address', liveReq.address],
                  ['Contact', liveReq.contact_number],
                  ['Document', liveReq.document_type],
                  ['Purpose', liveReq.purpose],
                  ['Filed', formatDate(liveReq.created_at)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[11px] text-slate-400">{k}</p>
                    <p className="text-slate-900 break-words">{v || '-'}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-2">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Valid ID</p>
                {liveReq.valid_id_url ? (
                  <img
                    src={liveReq.valid_id_url}
                    alt="Uploaded resident ID"
                    className="max-h-56 w-full object-contain rounded-xl border border-slate-200 bg-white"
                  />
                ) : (
                  <div className="py-12 text-sm text-slate-400 text-center">No ID image attached</div>
                )}
              </div>
            </div>

            {showRejectInput && isPendingLive && (
              <div>
                <label className={labelCls}>Reason for rejection</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Blurred ID photo, address mismatch"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className={inputCls}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              {isPendingLive && !showRejectInput && (
                <>
                  <button type="button" onClick={() => setShowRejectInput(true)} className={btnDanger}>Reject</button>
                  <button type="button" onClick={handleApproveAndProcess} disabled={isProcessing} className={`${btnPrimary} flex-1`}>
                    {isProcessing ? 'Processing...' : 'Approve and start processing'}
                  </button>
                </>
              )}
              {isPendingLive && showRejectInput && (
                <>
                  <button type="button" onClick={() => setShowRejectInput(false)} className={btnSecondary}>Back</button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isProcessing}
                    className={`${btnPrimary} flex-1 !bg-rose-600 hover:!bg-rose-700`}
                  >
                    {isProcessing ? 'Rejecting...' : 'Confirm rejection'}
                  </button>
                </>
              )}
              {!isPendingLive && (
                <button type="button" onClick={closeReview} className={`${btnSecondary} w-full`}>Close</button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Audit log modal */}
      {showAuditModal && (
        <Modal title="Transaction log" subtitle="Audit trail" onClose={() => setShowAuditModal(false)}>
          {auditLogs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No activity recorded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 -my-2">
              {auditLogs.map((l) => (
                <li key={l.id} className="py-3 space-y-0.5">
                  <div className="flex justify-between gap-3 text-[11px]">
                    <span className="text-slate-400">{formatDate(l.timestamp)}</span>
                    <span className="font-mono font-medium text-brand">{l.action_type}</span>
                  </div>
                  <p className="text-sm text-slate-800">{l.actor_name} <span className="text-slate-400">({l.actor_role})</span></p>
                  <p className="text-xs text-slate-500">{l.remarks}</p>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </div>
  );
}
