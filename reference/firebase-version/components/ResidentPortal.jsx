// src/components/ResidentPortal.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  updateProfile,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  updateDoc,
  setDoc,
  getDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import HeroScene from './HeroScene';
import { useAnnouncements, AnnouncementStack, AnnouncementFeed } from './Announcements';
import { LegalModal, LEGAL_VERSION } from './Legal';
import { auth, db } from '../firebase';
import {
  IconHome, IconFile, IconSearch, IconBell, IconUser, IconLogout,
  IconUpload, IconArrowLeft, IconCheck, IconLock, IconArchive, IconTrash, IconX, NavBadge, NotificationPopups,
  inputCls, labelCls, btnPrimary, btnSecondary, btnDanger, cardCls,
  formatDate, tsMillis, BrandMark, StatusBadge, Toast, LoadingOverlay, Splash, Modal, StatCard,
  authErrorMessage,
} from './ui';

const DOCUMENT_TYPES = [
  'Barangay Clearance',
  'Certificate of Residency',
  'Certificate of Indigency',
  'First Time Job Seeker Certificate',
];

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', short: 'Home', icon: IconHome },
  { id: 'request', label: 'Request Document', short: 'Request', icon: IconFile },
  { id: 'track', label: 'Track Requests', short: 'Track', icon: IconSearch },
  { id: 'notifications', label: 'Notifications', short: 'Alerts', icon: IconBell },
  { id: 'archive', label: 'Archive', short: 'Archive', icon: IconArchive },
  { id: 'profile', label: 'My Profile', short: 'Profile', icon: IconUser },
];

const COMPLETED_STATUSES = ['Released', 'Rejected', 'Cancelled'];

const PROGRESS_STEPS = ['Pending', 'Processed', 'Ready for Pickup', 'Released'];

const NOTIFICATION_TEXT = {
  Pending: 'was submitted and is awaiting verification.',
  Processed: 'was verified and is now being prepared.',
  'Ready for Pickup': 'is ready for pickup at the barangay hall.',
  Released: 'has been released to you.',
  Rejected: 'was rejected.',
  Cancelled: 'was cancelled.',
};

// Resize + compress so the image stays well under Firestore's 1 MB document limit
const compressImage = (file, maxDim = 900, quality = 0.7) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

function UploadBox({ value, onChange, onClear, label }) {
  return (
    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center bg-slate-50/70">
      {value ? (
        <div className="space-y-3">
          <img src={value} alt="Uploaded ID preview" className="max-h-32 mx-auto rounded-md border border-slate-200 bg-white object-contain" />
          <div className="flex items-center justify-center gap-4 text-xs font-medium">
            <label className="text-brand hover:underline cursor-pointer">
              Replace
              <input type="file" accept="image/*" onChange={onChange} className="hidden" />
            </label>
            {onClear && (
              <button type="button" onClick={onClear} className="text-slate-500 hover:text-rose-600">
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <label className="cursor-pointer block space-y-2">
          <span className="w-10 h-10 bg-white shadow-soft text-slate-500 rounded-xl flex items-center justify-center mx-auto">
            <IconUpload />
          </span>
          <span className="text-sm font-medium text-slate-700 block">{label}</span>
          <span className="text-xs text-slate-400 block">PNG or JPG, resized automatically</span>
          <input type="file" accept="image/*" onChange={onChange} className="hidden" />
        </label>
      )}
    </div>
  );
}

function AuthShell({ children, onBack, onLegal, maxWidth = 'max-w-md' }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel (desktop) */}
      <div className="hidden lg:flex relative overflow-hidden m-4 rounded-[2rem] bg-[#0B0B1A] text-white p-12 flex-col justify-between">
        <div className="absolute -right-24 -top-24 w-[26rem] h-[26rem] rounded-full bg-brand/50 blur-[110px]" />
        <div className="absolute -left-20 bottom-0 w-80 h-80 rounded-full bg-[#A78BFA]/25 blur-[110px]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px]" />

        <div className="relative flex items-center gap-3">
          <div className="bg-white rounded-2xl p-2"><BrandMark size="w-8 h-8" /></div>
          <span className="font-semibold tracking-tight">Barangay Labangon</span>
        </div>

        <HeroScene className="relative flex-1 min-h-[280px] -mx-6 my-2" fallback={<div className="h-full" />} />

        <div className="relative space-y-4">
          <h2 className="font-display text-4xl leading-[1.08]">
            Your barangay,<br />
            <span className="text-white/60">a few taps away.</span>
          </h2>
          <ul className="flex flex-wrap gap-2 text-xs text-white/80">
            {['Request online', 'Live status', 'Pickup alerts'].map((t) => (
              <li key={t} className="flex items-center gap-1.5 bg-white/10 ring-1 ring-white/15 rounded-full pl-2 pr-3.5 py-1.5">
                <IconCheck className="w-3 h-3 text-emerald-300" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form side */}
      <div className="relative flex flex-col min-h-screen lg:min-h-0 overflow-hidden">
        {/* Soft pastel backdrop */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-lilac blur-3xl opacity-80" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-peach blur-3xl opacity-70" />
        <div className="absolute top-1/3 right-8 w-56 h-56 rounded-full bg-mint blur-3xl opacity-60 hidden lg:block" />

        {/* Compact brand banner (phones and tablets) */}
        <div className="lg:hidden relative m-3 mb-0 overflow-hidden rounded-3xl bg-[#0B0B1A] text-white px-5 py-5">
          <div className="absolute -right-10 -top-16 w-48 h-48 rounded-full bg-brand/60 blur-[70px]" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="bg-white rounded-xl p-1.5"><BrandMark size="w-7 h-7" /></div>
                <span className="text-sm font-semibold truncate">Barangay Labangon</span>
              </div>
              <p className="font-display text-2xl leading-[1.1] mt-4">
                Your barangay,<br /><span className="text-white/60">a few taps away.</span>
              </p>
            </div>
            <div className="relative w-24 h-24 shrink-0" aria-hidden="true">
              <span className="absolute left-0 top-3 w-14 h-[4.5rem] rounded-xl bg-[#FFE5D6] -rotate-12 shadow-lg" />
              <span className="absolute right-0 top-1 w-14 h-[4.5rem] rounded-xl bg-[#E7E5FF] rotate-12 shadow-lg" />
              <span className="absolute left-1/2 -translate-x-1/2 top-4 w-14 h-[4.5rem] rounded-xl bg-white shadow-xl p-2 space-y-1.5">
                <span className="block h-1.5 w-8 rounded-full bg-slate-200" />
                <span className="block h-1.5 w-6 rounded-full bg-slate-200" />
                <span className="block h-1.5 w-full rounded-full bg-brand mt-3" />
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className={`tab-enter w-full ${maxWidth} space-y-5`}>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur rounded-full px-4 py-2 shadow-soft"
            >
              <IconArrowLeft className="w-4 h-4" /> Back to home
            </button>
            <div className={`${cardCls} p-6 sm:p-9 space-y-6`}>{children}</div>

            {/* Reassurance row */}
            <ul className="grid grid-cols-3 gap-2 text-center">
              {[
                [IconLock, 'Secure sign-in'],
                [IconCheck, 'Staff verified'],
                [IconFile, 'Free for residents'],
              ].map(([Icon, t]) => (
                <li key={t} className="flex flex-col items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <span className="w-8 h-8 rounded-full bg-white shadow-soft flex items-center justify-center text-brand"><Icon className="w-4 h-4" /></span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="text-center text-xs text-slate-500">Need help? Visit the Barangay Labangon hall during office hours.</p>
            <p className="text-center text-[11px] text-slate-400">
              <button type="button" onClick={() => onLegal('terms')} className="underline underline-offset-2 hover:text-slate-600">Terms of Use</button>
              {' '}&middot;{' '}
              <button type="button" onClick={() => onLegal('privacy')} className="underline underline-offset-2 hover:text-slate-600">Privacy Notice</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResidentPortal() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [viewState, setViewState] = useState('welcome'); // welcome | login | register | portal
  const [busyLabel, setBusyLabel] = useState(null);

  // Auth inputs
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [legalDoc, setLegalDoc] = useState(null); // 'privacy' | 'terms' | null
  const [consent, setConsent] = useState(false);
  const announcements = useAnnouncements(db);

  // Profile data (persisted in Firestore: Residents/{uid})
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [proofUrl, setProofUrl] = useState('');

  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');

  // Request form
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0]);
  const [purpose, setPurpose] = useState('');
  const [requestIdUrl, setRequestIdUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);

  // Edit / cancel
  const [editingReq, setEditingReq] = useState(null);
  const [editType, setEditType] = useState('');
  const [editPurpose, setEditPurpose] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);

  // Security form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Data and alerts
  const [requests, setRequests] = useState([]);

  // Notifications
  const [confirm, setConfirm] = useState(null); // { title, body, label, onConfirm }
  const [popups, setPopups] = useState([]);
  const [highlightIds, setHighlightIds] = useState(new Set());
  const poppedRef = useRef(new Set());
  const [toast, setToast] = useState({ message: null, type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: null, type }), 4000);
  };

  /* ---------- Auth state + profile load ---------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setViewState('portal');
        try {
          const snap = await getDoc(doc(db, 'Residents', user.uid));
          if (snap.exists()) {
            const p = snap.data();
            setFullName(p.full_name || user.displayName || '');
            setAddress(p.address || '');
            setContactNumber(p.contact_number || '');
            setProofUrl(p.valid_id_url || '');
          } else if (user.displayName) {
            setFullName(user.displayName);
          }
        } catch (err) {
          console.error('Profile load error:', err);
        }
      } else {
        setViewState((v) => (v === 'login' || v === 'register' || v === 'forgot' ? v : 'welcome'));
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  /* ---------- Requests listener (sorted client-side: no composite index needed) ---------- */
  useEffect(() => {
    if (!currentUser) {
      setRequests([]);
      return;
    }
    const q = query(collection(db, 'DocumentRequest'), where('resident_uid', '==', currentUser.uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((r) => !r.deleted_by_resident);
        data.sort((a, b) => tsMillis(b.created_at) - tsMillis(a.created_at));
        setRequests(data);
      },
      (error) => console.error('Firestore error:', error)
    );
    return () => unsub();
  }, [currentUser]);

  /* ---------- Auth handlers ---------- */
  const resetAuthInputs = () => {
    setAuthEmail('');
    setAuthPassword('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setBusyLabel('Signing in...');
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
      resetAuthInputs();
      setActiveTab('dashboard');
    } catch (err) {
      showToast(authErrorMessage(err), 'error');
    } finally {
      setBusyLabel(null);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!proofUrl) return showToast('Please upload proof of residency.', 'error');
    if (!consent) return showToast('Please accept the Privacy Notice and Terms to continue.', 'error');

    setBusyLabel('Creating your account...');
    try {
      const cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      await updateProfile(cred.user, { displayName: fullName });
      await setDoc(doc(db, 'Residents', cred.user.uid), {
        full_name: fullName,
        email: authEmail,
        address,
        contact_number: contactNumber,
        valid_id_url: proofUrl,
        consent_version: LEGAL_VERSION,
        consent_at: serverTimestamp(),
        created_at: serverTimestamp(),
      });
      resetAuthInputs();
      setActiveTab('dashboard');
      showToast('Account created. Welcome to the Barangay Portal.');
    } catch (err) {
      showToast(authErrorMessage(err), 'error');
    } finally {
      setBusyLabel(null);
    }
  };

  const [resetSent, setResetSent] = useState(false);

  const openForgot = () => { setResetSent(false); setViewState('forgot'); };

  const handleForgotPassword = async (e) => {
    e?.preventDefault?.();
    const email = authEmail.trim();
    if (!email) return showToast('Enter your email address first.', 'error');
    setBusyLabel('Sending reset link...');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      // Do not reveal whether an account exists; only surface problems the user can fix.
      if (err?.code === 'auth/invalid-email' || err?.code === 'auth/network-request-failed' || err?.code === 'auth/too-many-requests') {
        showToast(authErrorMessage(err), 'error');
      } else {
        setResetSent(true);
      }
    } finally {
      setBusyLabel(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setFullName(''); setAddress(''); setContactNumber(''); setProofUrl('');
      setRequestIdUrl(''); setPurpose(''); setSubmittedRef(null);
      poppedRef.current = new Set(); setPopups([]); setHighlightIds(new Set()); setActiveTab('dashboard');
      setViewState('welcome');
      showToast('Signed out.');
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- Image upload ---------- */
  const handleImageUpload = (setter) => async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return showToast('Please choose an image file.', 'error');
    if (file.size > 8 * 1024 * 1024) return showToast('Image is too large (max 8 MB).', 'error');
    try {
      setter(await compressImage(file));
    } catch {
      showToast('Could not read that image.', 'error');
    }
  };

  /* ---------- Request handlers ---------- */
  const effectiveId = requestIdUrl || proofUrl;

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !address || !contactNumber) {
      showToast('Complete your name, address and contact in My Profile first.', 'error');
      setActiveTab('profile');
      return;
    }
    if (!effectiveId) return showToast('Please upload a valid ID.', 'error');

    setIsSubmitting(true);
    try {
      const refNumber = `BR-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      const docRef = await addDoc(collection(db, 'DocumentRequest'), {
        resident_uid: currentUser.uid,
        reference_number: refNumber,
        resident_name: fullName,
        address,
        contact_number: contactNumber,
        document_type: documentType,
        purpose,
        valid_id_url: effectiveId,
        status: 'Pending',
        has_staff_seen_update: true,
        resident_seen_status: 'Pending',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      await addDoc(collection(db, 'TransactionHistory'), {
        request_id: docRef.id,
        actor_name: fullName,
        actor_role: 'Resident',
        action_type: 'SUBMITTED',
        timestamp: serverTimestamp(),
        remarks: `Submitted request for ${documentType}`,
      });
      setSubmittedRef(refNumber);
      setPurpose('');
      setRequestIdUrl('');
    } catch (err) {
      console.error(err);
      showToast('Submission failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (r) => {
    setEditingReq(r);
    setEditType(r.document_type);
    setEditPurpose(r.purpose);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const latest = requests.find((r) => r.id === editingReq.id);
    if (!latest || latest.status !== 'Pending') {
      showToast('This request can no longer be edited.', 'error');
      setEditingReq(null);
      return;
    }
    try {
      await updateDoc(doc(db, 'DocumentRequest', editingReq.id), {
        document_type: editType,
        purpose: editPurpose,
        has_staff_seen_update: false,
        updated_at: serverTimestamp(),
      });
      await addDoc(collection(db, 'TransactionHistory'), {
        request_id: editingReq.id,
        actor_name: fullName || 'Resident',
        actor_role: 'Resident',
        action_type: 'UPDATED',
        timestamp: serverTimestamp(),
        remarks: `Resident updated request details (${editType}).`,
      });
      setEditingReq(null);
      showToast('Request updated.');
    } catch (err) {
      console.error(err);
      showToast('Could not update the request.', 'error');
    }
  };

  const handleCancelConfirm = async () => {
    const target = cancelTarget;
    const latest = requests.find((r) => r.id === target.id);
    if (!latest || latest.status !== 'Pending') {
      showToast('This request can no longer be cancelled.', 'error');
      setCancelTarget(null);
      return;
    }
    try {
      await updateDoc(doc(db, 'DocumentRequest', target.id), {
        status: 'Cancelled',
        resident_seen_status: 'Cancelled',
        updated_at: serverTimestamp(),
      });
      await addDoc(collection(db, 'TransactionHistory'), {
        request_id: target.id,
        actor_name: fullName || 'Resident',
        actor_role: 'Resident',
        action_type: 'CANCELLED',
        timestamp: serverTimestamp(),
        remarks: `Resident cancelled request ${target.reference_number}.`,
      });
      setCancelTarget(null);
      showToast('Request cancelled.');
    } catch (err) {
      console.error(err);
      showToast('Could not cancel the request.', 'error');
    }
  };

  /* ---------- Archive handlers ---------- */
  const handleArchive = async (r) => {
    try {
      await updateDoc(doc(db, 'DocumentRequest', r.id), { archived_by_resident: true });
      showToast('Moved to archive.');
    } catch (err) {
      console.error(err);
      showToast('Could not archive this request.', 'error');
    }
  };

  const handleUnarchive = async (r) => {
    try {
      await updateDoc(doc(db, 'DocumentRequest', r.id), { archived_by_resident: false });
      showToast('Restored to Track Requests.');
    } catch (err) {
      console.error(err);
      showToast('Could not restore this request.', 'error');
    }
  };

  /* ---------- Delete handlers (soft delete: staff records stay intact) ---------- */
  const handleDeleteArchived = (r) =>
    setConfirm({
      title: 'Delete this request?',
      body: `${r.reference_number} (${r.document_type}) will be removed from your account. The barangay keeps its own record.`,
      label: 'Delete',
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, 'DocumentRequest', r.id), { deleted_by_resident: true });
          showToast('Request deleted.');
        } catch (err) {
          console.error(err);
          showToast('Could not delete this request.', 'error');
        }
      },
    });

  const handleDeleteAllArchived = () =>
    setConfirm({
      title: 'Delete everything in your archive?',
      body: `${archivedRequests.length} archived request${archivedRequests.length === 1 ? '' : 's'} will be removed from your account. The barangay keeps its own records.`,
      label: 'Delete all',
      onConfirm: async () => {
        try {
          await Promise.all(
            archivedRequests.map((r) => updateDoc(doc(db, 'DocumentRequest', r.id), { deleted_by_resident: true }))
          );
          showToast('Archive cleared.');
        } catch (err) {
          console.error(err);
          showToast('Could not clear the archive.', 'error');
        }
      },
    });

  const clearNotification = (r) =>
    updateDoc(doc(db, 'DocumentRequest', r.id), {
      resident_notif_cleared_status: r.status,
      resident_seen_status: r.status,
    });

  const handleDeleteNotification = async (r) => {
    try {
      await clearNotification(r);
    } catch (err) {
      console.error(err);
      showToast('Could not delete this notification.', 'error');
    }
  };

  const handleDeleteAllNotifications = () =>
    setConfirm({
      title: 'Delete all notifications?',
      body: `${notifRequests.length} notification${notifRequests.length === 1 ? '' : 's'} will be cleared. You will still be notified about future status changes.`,
      label: 'Delete all',
      onConfirm: async () => {
        try {
          await Promise.all(notifRequests.map(clearNotification));
          showToast('Notifications cleared.');
        } catch (err) {
          console.error(err);
          showToast('Could not clear notifications.', 'error');
        }
      },
    });

  /* ---------- Profile handlers ---------- */
  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(auth.currentUser, { displayName: fullName });
      await setDoc(
        doc(db, 'Residents', currentUser.uid),
        {
          full_name: fullName,
          email: currentUser.email,
          address,
          contact_number: contactNumber,
          valid_id_url: proofUrl,
        },
        { merge: true }
      );
      showToast('Profile saved.');
    } catch (err) {
      console.error(err);
      showToast('Could not save your profile.', 'error');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!currentPassword) return showToast('Enter your current password.', 'error');
    if (newPassword.length < 6) return showToast('New password needs at least 6 characters.', 'error');
    if (newPassword !== confirmPassword) return showToast('Passwords do not match.', 'error');
    try {
      const cred = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPassword);
      showToast('Password updated.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      showToast(authErrorMessage(err), 'error');
    }
  };

  /* ---------- Derived ---------- */
  const inProgress = requests.filter((r) => ['Pending', 'Processed'].includes(r.status)).length;
  const readyCount = requests.filter((r) => r.status === 'Ready for Pickup').length;
  const completed = requests.filter((r) => r.status === 'Released').length;
  const memberSince = currentUser?.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
    : '';

  const seenStatus = (r) => r.resident_seen_status ?? 'Pending';
  const unreadRequests = requests.filter((r) => r.status !== seenStatus(r));
  const unreadCount = unreadRequests.length;
  const trackRequests = requests.filter((r) => !r.archived_by_resident);
  const archivedRequests = requests.filter((r) => r.archived_by_resident);
  const notifRequests = requests
    .filter((r) => r.resident_notif_cleared_status !== r.status)
    .sort((a, b) => tsMillis(b.updated_at || b.created_at) - tsMillis(a.updated_at || a.created_at));

  // Pop up once for every new status change
  useEffect(() => {
    if (!currentUser) return;
    const fresh = unreadRequests.filter((r) => !poppedRef.current.has(`${r.id}:${r.status}`));
    if (fresh.length === 0) return;
    fresh.forEach((r) => poppedRef.current.add(`${r.id}:${r.status}`));
    if (activeTab === 'notifications') return;

    const items =
      fresh.length > 2
        ? [{ id: `summary-${Date.now()}`, title: 'New updates', body: `You have ${fresh.length} new request updates.`, status: null }]
        : fresh.map((r) => ({
            id: `${r.id}:${r.status}`,
            title: r.document_type,
            body: `${r.reference_number} ${NOTIFICATION_TEXT[r.status] || `is now ${r.status}.`}`,
            status: r.status,
          }));
    setPopups((prev) => [...prev, ...items].slice(-3));
    items.forEach((i) => setTimeout(() => setPopups((prev) => prev.filter((x) => x.id !== i.id)), 10000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests, currentUser]);

  // Opening the Notifications tab marks everything as seen (and remembers which were new)
  useEffect(() => {
    if (activeTab !== 'notifications') {
      if (highlightIds.size) setHighlightIds(new Set());
      return;
    }
    if (unreadRequests.length === 0) return;
    setPopups([]);
    setHighlightIds((prev) => new Set([...prev, ...unreadRequests.map((r) => r.id)]));
    Promise.all(
      unreadRequests.map((r) => updateDoc(doc(db, 'DocumentRequest', r.id), { resident_seen_status: r.status }))
    ).catch((err) => console.error('Could not mark notifications as seen:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, requests]);

  if (!authReady) {
    return <Splash />;
  }

  return (
    <div className="min-h-screen bg-canvas text-slate-800">
      <Toast message={toast.message} type={toast.type} />
      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
      {viewState === 'portal' && (
        <NotificationPopups
          items={popups}
          onDismiss={(id) => setPopups((prev) => prev.filter((x) => x.id !== id))}
          onView={(n) => { setPopups((prev) => prev.filter((x) => x.id !== n.id)); setActiveTab('notifications'); }}
        />
      )}
      {busyLabel && <LoadingOverlay label={busyLabel} />}

      {/* ============ WELCOME ============ */}
      {viewState === 'welcome' && (
        <div className="min-h-screen overflow-x-clip">
          {/* Floating glass nav */}
          <header className="fixed top-3 inset-x-3 z-40 flex justify-center pointer-events-none">
            <div className="pointer-events-auto w-full max-w-5xl flex items-center justify-between gap-3 rounded-full bg-white/70 backdrop-blur-xl ring-1 ring-slate-900/[0.06] shadow-soft pl-2.5 pr-2 py-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <BrandMark size="w-8 h-8" />
                <span className="font-semibold text-slate-900 text-sm tracking-tight truncate">Barangay Labangon</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => setViewState('login')} className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-full hover:bg-white">Log in</button>
                <button onClick={() => setViewState('register')} className="text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full">
                  <span className="sm:hidden">Sign up</span><span className="hidden sm:inline">Create account</span>
                </button>
              </div>
            </div>
          </header>

          {announcements.length > 0 && (
            <div className="fixed top-[4.5rem] inset-x-3 z-30 flex justify-center pointer-events-none">
              <div className="pointer-events-auto w-full max-w-5xl"><AnnouncementStack items={announcements} /></div>
            </div>
          )}

          {/* Hero stage */}
          <section className="p-3 pt-3">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#0B0B1A] text-white">
              <div className="absolute -top-48 right-[-8rem] w-[36rem] h-[36rem] rounded-full bg-brand/55 blur-[130px]" />
              <div className="absolute -bottom-56 -left-32 w-[30rem] h-[30rem] rounded-full bg-[#A78BFA]/25 blur-[130px]" />
              <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_60%_40%,black_20%,transparent_70%)]" />

              <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-28 pb-10 md:pt-36 md:pb-16 grid lg:grid-cols-12 gap-6 lg:gap-4 items-center">
                <div className="hero-rise lg:col-span-7 space-y-7 text-center lg:text-left">
                  <p className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white/60">
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-60 animate-ping" />
                      <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </span>
                    Official Barangay Portal
                  </p>
                  <h1 className="font-display text-[2.9rem] leading-[0.98] sm:text-7xl lg:text-[5.75rem]">
                    Barangay<br className="hidden lg:block" /> papers,<br />
                    <span className="bg-gradient-to-r from-[#B7B2FF] via-white to-[#FFD3BA] bg-clip-text text-transparent">minus the queue.</span>
                  </h1>
                  <p className="text-base md:text-lg text-white/65 leading-relaxed max-w-md mx-auto lg:mx-0">
                    Request clearances and certificates online, follow every step in real time, and pick them up the moment they are ready.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <button onClick={() => setViewState('register')} className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 text-sm font-semibold pl-8 pr-6 py-3.5 rounded-full hover:bg-white/90 shadow-lift group">
                      Get started
                      <IconArrowLeft className="w-4 h-4 rotate-180 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                    <button onClick={() => setViewState('login')} className="inline-flex items-center justify-center gap-2 text-white text-sm font-semibold px-8 py-3.5 rounded-full ring-1 ring-white/25 hover:bg-white/10">
                      Log in
                    </button>
                  </div>
                </div>

                {/* 3D scene (falls back to a static tracker card if WebGL is unavailable) */}
                <div className="lg:col-span-5 relative">
                  <HeroScene
                    className="relative h-[380px] sm:h-[480px] lg:h-[600px] -mx-4 sm:mx-0 lg:-ml-24"
                    fallback={
                      <div className="h-full flex items-center justify-center px-4">
                        <div className="w-full max-w-sm rounded-[1.75rem] bg-white/[0.07] ring-1 ring-white/15 p-6">
                          <p className="text-[11px] uppercase tracking-widest text-white/50">Request</p>
                          <p className="font-display text-2xl mt-1">Barangay Clearance</p>
                          <p className="text-[11px] font-mono text-white/50 mt-1">BR-{new Date().getFullYear()}-004512</p>
                          <div className="mt-5 grid grid-cols-4 gap-1.5">
                            <span className="h-1.5 rounded-full bg-brand" /><span className="h-1.5 rounded-full bg-brand" />
                            <span className="h-1.5 rounded-full bg-brand" /><span className="h-1.5 rounded-full bg-white/15" />
                          </div>
                          <div className="mt-5"><StatusBadge status="Ready for Pickup" /></div>
                        </div>
                      </div>
                    }
                  />
                  <div className="pointer-events-none absolute left-2 sm:left-0 bottom-4 lg:bottom-10 bg-white text-slate-900 rounded-2xl shadow-lift p-3 pr-5 flex items-center gap-3 float-slower">
                    <span className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <IconBell className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold">Ready for pickup</p>
                      <p className="text-[11px] text-slate-500">Your clearance is ready</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document marquee */}
              <div className="marquee relative border-t border-white/10 overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
                <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
                  {[...DOCUMENT_TYPES, ...DOCUMENT_TYPES, ...DOCUMENT_TYPES, ...DOCUMENT_TYPES].map((d, i) => (
                    <span key={i} className="font-display text-lg text-white/55 flex items-center gap-10">
                      {d}
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="max-w-6xl mx-auto px-5 md:px-10">
            {/* Documents: editorial index */}
            <section className="reveal pt-24 pb-12 grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-brand">01 &mdash; Documents</p>
                <h2 className="font-display text-4xl md:text-5xl text-slate-900 mt-4 leading-[1.05]">What you can request</h2>
                <p className="text-sm text-slate-500 mt-4 max-w-xs">Pick a document, file it online, and collect it at the barangay hall.</p>
              </div>
              <ul className="lg:col-span-8 border-t border-slate-900/10">
                {DOCUMENT_TYPES.map((d, i) => (
                  <li key={d} className="border-b border-slate-900/10">
                    <button
                      onClick={() => setViewState('register')}
                      className="group w-full flex items-center gap-5 py-6 text-left !transition-none"
                    >
                      <span className="font-mono text-xs text-slate-400 w-8">0{i + 1}</span>
                      <span className="font-display text-2xl md:text-3xl text-slate-900 flex-1 group-hover:translate-x-2 transition-transform duration-300 ease-out">{d}</span>
                      <span className="w-11 h-11 rounded-full ring-1 ring-slate-900/15 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white group-hover:ring-slate-900 transition-[background-color,color,box-shadow] duration-200">
                        <IconArrowLeft className="w-4 h-4 rotate-180" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* How it works */}
            <section className="reveal py-16 grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-brand">02 &mdash; Process</p>
                <h2 className="font-display text-4xl md:text-5xl text-slate-900 mt-4 leading-[1.05]">Three steps, no queue</h2>
              </div>
              <div className="lg:col-span-8 grid sm:grid-cols-3 gap-4">
                {[
                  ['1', 'Register', 'Create your account with your details and a valid ID.', 'bg-lilac'],
                  ['2', 'Request', 'Choose the document you need and submit it anytime.', 'bg-peach'],
                  ['3', 'Track and receive', 'Follow the status and pick it up when it is ready.', 'bg-mint'],
                ].map(([n, t, d, bg]) => (
                  <div key={n} className={`${bg} lift rounded-3xl p-6 min-h-[240px] flex flex-col justify-between`}>
                    <span className="font-display text-6xl text-slate-900/80 leading-none">{n}</span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{t}</h3>
                      <p className="text-sm text-slate-700/80 mt-1.5 leading-relaxed">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Final call to action */}
            <section className="reveal pb-16">
              <div className="relative overflow-hidden rounded-[2rem] bg-[#0B0B1A] text-white px-6 py-16 md:px-16 md:py-24 text-center">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] rounded-full bg-brand/45 blur-[120px]" />
                <div className="relative">
                  <h2 className="font-display text-4xl md:text-7xl leading-[1.02]">Skip the line <span className="text-white/60">today.</span></h2>
                  <p className="text-white/60 mt-5 max-w-md mx-auto text-sm md:text-base">Create your free account and file your first request in minutes.</p>
                  <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => setViewState('register')} className="bg-white text-slate-900 text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-white/90 shadow-lift">Create account</button>
                    <button onClick={() => setViewState('login')} className="text-white text-sm font-semibold px-8 py-3.5 rounded-full ring-1 ring-white/25 hover:bg-white/10">Log in</button>
                  </div>
                </div>
              </div>
            </section>

            <footer className="py-8 border-t border-slate-900/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-2"><BrandMark size="w-5 h-5" /> Barangay Labangon Information System</span>
              <span className="flex items-center gap-4">
                <button onClick={() => setLegalDoc('privacy')} className="hover:text-slate-600 underline underline-offset-2">Privacy Notice</button>
                <button onClick={() => setLegalDoc('terms')} className="hover:text-slate-600 underline underline-offset-2">Terms of Use</button>
                <span>&copy; {new Date().getFullYear()}</span>
              </span>
            </footer>
          </div>
        </div>
      )}

      {/* ============ LOGIN ============ */}
      {viewState === 'login' && (
        <AuthShell maxWidth="max-w-md" onLegal={setLegalDoc} onBack={() => setViewState('welcome')}>
          <div className="space-y-1.5">
            <h2 className="font-display text-3xl text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-500">Log in to track your requests and pick up updates.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required
                autoComplete="email" placeholder="you@example.com" className={inputCls} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-600">Password</label>
                <button type="button" onClick={openForgot} className="text-xs font-semibold text-brand hover:underline">
                  Forgot password?
                </button>
              </div>
              <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required
                autoComplete="current-password" placeholder="Enter your password" className={inputCls} />
            </div>
            <button type="submit" className={`${btnPrimary} w-full py-3`}>Log in</button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <button onClick={() => setViewState('register')} className="font-medium text-brand hover:underline">Register</button>
          </p>
        </AuthShell>
      )}

      {/* ============ FORGOT PASSWORD ============ */}
      {viewState === 'forgot' && (
        <AuthShell maxWidth="max-w-md" onLegal={setLegalDoc} onBack={() => setViewState('login')}>
          {resetSent ? (
            <div className="space-y-5 text-center">
              <span className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <IconCheck className="w-6 h-6" />
              </span>
              <div className="space-y-1.5">
                <h2 className="font-display text-3xl text-slate-900">Check your email</h2>
                <p className="text-sm text-slate-500">
                  If an account exists for <span className="font-semibold text-slate-700">{authEmail.trim()}</span>, we sent a link to reset your password. It may take a minute. Check your spam folder too.
                </p>
              </div>
              <button onClick={() => setViewState('login')} className={`${btnPrimary} w-full py-3`}>Back to log in</button>
              <button onClick={() => setResetSent(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Use a different email</button>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <h2 className="font-display text-3xl text-slate-900">Reset your password</h2>
                <p className="text-sm text-slate-500">Enter the email you registered with and we will send you a link to choose a new password.</p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required autoFocus
                    autoComplete="email" placeholder="you@example.com" className={inputCls} />
                </div>
                <button type="submit" className={`${btnPrimary} w-full py-3`}>Send reset link</button>
              </form>
              <p className="text-center text-xs text-slate-500">
                Remembered it?{' '}
                <button onClick={() => setViewState('login')} className="font-semibold text-brand hover:underline">Log in</button>
              </p>
            </>
          )}
        </AuthShell>
      )}

      {/* ============ REGISTER ============ */}
      {viewState === 'register' && (
        <AuthShell maxWidth="max-w-lg" onLegal={setLegalDoc} onBack={() => setViewState('welcome')}>
          <div className="space-y-1.5">
            <h2 className="font-display text-3xl text-slate-900">Create your account</h2>
            <p className="text-sm text-slate-500">It takes about two minutes. You will need a valid ID photo.</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Full name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                placeholder="Juan Dela Cruz" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Complete address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required
                placeholder="House no., street, purok" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Contact number</label>
              <input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required
                placeholder="09123456789" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required
                autoComplete="email" placeholder="you@example.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required
                minLength={6} autoComplete="new-password" placeholder="At least 6 characters" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Proof of residency</label>
              <UploadBox
                value={proofUrl}
                onChange={handleImageUpload(setProofUrl)}
                onClear={() => setProofUrl('')}
                label="Upload your ID or utility bill"
              />
            </div>
            <label className="flex items-start gap-3 text-xs text-slate-600 leading-relaxed cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-[#4D55F5] shrink-0"
              />
              <span>
                I have read the{' '}
                <button type="button" onClick={() => setLegalDoc('privacy')} className="font-semibold text-brand underline underline-offset-2">Privacy Notice</button>
                {' '}and{' '}
                <button type="button" onClick={() => setLegalDoc('terms')} className="font-semibold text-brand underline underline-offset-2">Terms of Use</button>
                , and I consent to Barangay Labangon processing my personal data to handle my document requests.
              </span>
            </label>
            <button type="submit" disabled={!consent} className={`${btnPrimary} w-full py-3`}>Create account</button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <button onClick={() => setViewState('login')} className="font-medium text-brand hover:underline">Log in</button>
          </p>
        </AuthShell>
      )}

      {/* ============ PORTAL ============ */}
      {viewState === 'portal' && currentUser && (
        <div className="min-h-screen md:flex">
          {/* Sidebar (desktop) */}
          <aside className="hidden md:flex w-64 shrink-0 bg-white rounded-3xl shadow-soft flex-col justify-between py-6 px-4 h-[calc(100vh-2rem)] sticky top-4 m-4 mr-0">
            <div className="space-y-8">
              <div className="flex items-center gap-3 px-2">
                <BrandMark />
                <div className="leading-tight">
                  <p className="font-display text-lg text-slate-900">Barangay Labangon</p>
                  <p className="text-[11px] text-slate-400">Resident portal</p>
                </div>
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition ${
                      activeTab === id ? 'bg-brand-soft text-brand' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon /> {label}
                    {id === 'notifications' && unreadCount > 0 && <NavBadge count={unreadCount} className="ml-auto" />}
                  </button>
                ))}
              </nav>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition">
              <IconLogout /> Log out
            </button>
          </aside>

          {/* Top nav (mobile) */}
          <div className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                <BrandMark size="w-8 h-8" />
                <span className="text-sm font-semibold text-slate-900">Barangay Labangon</span>
              </div>
              <button onClick={handleLogout} aria-label="Log out" className="text-slate-500 p-1.5"><IconLogout /></button>
            </div>
          </div>

          <main className="flex-1 min-w-0 p-5 pb-28 md:p-10">
            <AnnouncementStack items={announcements} className="sticky top-16 md:top-4 z-20 max-w-5xl mx-auto mb-6" />
            <div key={activeTab} className="tab-enter">
            {/* ---- Dashboard ---- */}
            {activeTab === 'dashboard' && (
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="relative overflow-hidden rounded-[2rem] bg-[#0B0B1A] text-white p-7 md:p-10">
                  <div className="absolute -right-16 -top-24 w-80 h-80 rounded-full bg-brand/55 blur-[90px]" />
                  <div className="absolute -left-10 -bottom-32 w-72 h-72 rounded-full bg-[#A78BFA]/25 blur-[90px]" />
                  <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
                  <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-end">
                    <div className="space-y-3 max-w-lg">
                      <p className="text-[11px] font-medium text-white/60 uppercase tracking-[0.2em]">Resident dashboard</p>
                      <h1 className="font-display text-3xl md:text-5xl leading-[1.05]">
                        {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
                        {fullName ? `, ${fullName.split(' ')[0]}` : ''}
                      </h1>
                      <p className="text-sm md:text-base text-white/65">
                        {readyCount > 0
                          ? `${readyCount} document${readyCount === 1 ? ' is' : 's are'} ready for pickup.`
                          : inProgress > 0
                            ? `${inProgress} request${inProgress === 1 ? ' is' : 's are'} being processed.`
                            : 'Everything is up to date. Need a document?'}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('request')}
                      className="group inline-flex items-center justify-center gap-2 bg-white text-slate-900 text-sm font-semibold pl-6 pr-5 py-3 rounded-full hover:bg-white/90 shadow-lift"
                    >
                      New request
                      <IconArrowLeft className="w-4 h-4 rotate-180 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>

                <div className="stagger grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total requests" value={requests.length} tone="lilac" />
                  <StatCard label="In progress" value={inProgress} tone="butter" />
                  <StatCard label="Ready for pickup" value={readyCount} tone="ice" />
                  <StatCard label="Completed" value={completed} tone="mint" />
                </div>

                <AnnouncementFeed items={announcements} />

                <div className={`${cardCls} overflow-hidden`}>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-900">Recent requests</h2>
                    <button onClick={() => setActiveTab('request')} className="text-xs font-medium text-brand hover:underline">
                      New request
                    </button>
                  </div>
                  {requests.length === 0 ? (
                    <p className="px-6 py-10 text-sm text-center text-slate-400">You have not filed any requests yet.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {requests.slice(0, 5).map((r) => (
                        <li key={r.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors">
                          <div className="flex items-center gap-4 min-w-0">
                            <span className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center shrink-0"><IconFile className="w-4 h-4" /></span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{r.document_type}</p>
                              <p className="text-xs font-mono text-slate-400">{r.reference_number}</p>
                            </div>
                          </div>
                          <StatusBadge status={r.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* ---- Request ---- */}
            {activeTab === 'request' && (
              <div className="max-w-xl mx-auto space-y-6">
                <div>
                  <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">Request a document</h1>
                  <p className="text-sm text-slate-500 mt-1">Your name, address and contact come from your profile.</p>
                </div>

                <div className={`${cardCls} p-6 md:p-8`}>
                  {submittedRef ? (
                    <div className="py-6 text-center space-y-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <IconCheck className="w-6 h-6" />
                      </div>
                      <h2 className="text-lg font-semibold text-slate-900">Request submitted</h2>
                      <p className="text-sm text-slate-500">
                        Reference number{' '}
                        <span className="font-mono font-medium text-brand">{submittedRef}</span>
                      </p>
                      <div className="flex justify-center gap-2 pt-2">
                        <button onClick={() => setSubmittedRef(null)} className={btnSecondary}>File another</button>
                        <button onClick={() => { setSubmittedRef(null); setActiveTab('track'); }} className={btnPrimary}>Track request</button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleRequestSubmit} className="space-y-5">
                      <div>
                        <label className={labelCls}>Document type</label>
                        <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className={inputCls}>
                          {DOCUMENT_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Purpose</label>
                        <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} required rows={3}
                          placeholder="e.g. Employment, bank requirement" className={`${inputCls} resize-none`} />
                      </div>
                      <div>
                        <label className={labelCls}>Valid ID</label>
                        <UploadBox
                          value={effectiveId}
                          onChange={handleImageUpload(setRequestIdUrl)}
                          onClear={requestIdUrl ? () => setRequestIdUrl('') : null}
                          label="Upload a valid ID"
                        />
                        {!requestIdUrl && proofUrl && (
                          <p className="text-xs text-slate-400 mt-1.5">Using the ID saved on your profile.</p>
                        )}
                      </div>
                      <button type="submit" disabled={isSubmitting} className={`${btnPrimary} w-full py-3`}>
                        {isSubmitting ? 'Submitting...' : 'Submit request'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* ---- Track ---- */}
            {activeTab === 'track' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">Track requests</h1>
                  <p className="text-sm text-slate-500 mt-1">Follow each application from submission to release.</p>
                </div>

                {trackRequests.length === 0 ? (
                  <div className={`${cardCls} p-10 text-center text-sm text-slate-400`}>
                    {archivedRequests.length > 0 ? 'Nothing active right now. Completed requests are in your archive.' : 'No applications found.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trackRequests.map((r) => {
                      const stepIdx = PROGRESS_STEPS.indexOf(r.status);
                      const isPending = r.status === 'Pending';
                      return (
                        <div key={r.id} className={`${cardCls} p-5 space-y-4`}>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-mono text-brand">{r.reference_number}</p>
                              <h3 className="text-sm font-semibold text-slate-900 mt-0.5">{r.document_type}</h3>
                              <p className="text-xs text-slate-500 mt-1">{r.purpose}</p>
                              <p className="text-[11px] text-slate-400 mt-1">Filed {formatDate(r.created_at)}</p>
                            </div>
                            <StatusBadge status={r.status} />
                          </div>

                          {stepIdx >= 0 && (
                            <div>
                              <div className="grid grid-cols-4 gap-1.5">
                                {PROGRESS_STEPS.map((s, i) => (
                                  <div key={s} className={`h-1 rounded-full ${i <= stepIdx ? 'bg-brand' : 'bg-slate-200'}`} />
                                ))}
                              </div>
                              <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                                {PROGRESS_STEPS.map((s, i) => (
                                  <span key={s} className={`text-[10px] ${i <= stepIdx ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                                    {s === 'Pending' ? 'Submitted' : s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {r.status === 'Rejected' && r.rejection_reason && (
                            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                              Reason: {r.rejection_reason}
                            </p>
                          )}

                          {isPending && (
                            <div className="flex gap-2 pt-1">
                              <button onClick={() => openEdit(r)} className={`${btnSecondary} !py-1.5 !px-3 text-xs`}>Edit details</button>
                              <button onClick={() => setCancelTarget(r)} className={`${btnDanger} !py-1.5 !px-3 text-xs`}>Cancel request</button>
                            </div>
                          )}

                          {COMPLETED_STATUSES.includes(r.status) && (
                            <div className="flex pt-1">
                              <button onClick={() => handleArchive(r)} className={`${btnSecondary} !py-1.5 !px-3 text-xs`}>
                                <IconArchive className="w-4 h-4" /> Archive
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ---- Archive ---- */}
            {activeTab === 'archive' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">Archive</h1>
                    <p className="text-sm text-slate-500 mt-1">Completed requests you have tidied away. Restore or delete them anytime.</p>
                  </div>
                  {archivedRequests.length > 0 && (
                    <button onClick={handleDeleteAllArchived} className={`${btnDanger} !py-2 text-xs`}>
                      <IconTrash className="w-4 h-4" /> Delete all
                    </button>
                  )}
                </div>

                {archivedRequests.length === 0 ? (
                  <div className={`${cardCls} p-10 text-center space-y-2`}>
                    <span className="w-11 h-11 rounded-2xl bg-brand-soft text-brand flex items-center justify-center mx-auto">
                      <IconArchive />
                    </span>
                    <p className="text-sm font-medium text-slate-700">Your archive is empty</p>
                    <p className="text-xs text-slate-400">Released, rejected or cancelled requests can be archived from Track Requests.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {archivedRequests.map((r) => (
                      <div key={r.id} className={`${cardCls} p-5 flex flex-wrap items-center justify-between gap-3`}>
                        <div className="min-w-0">
                          <p className="text-xs font-mono text-brand">{r.reference_number}</p>
                          <h3 className="text-sm font-semibold text-slate-900 mt-0.5">{r.document_type}</h3>
                          <p className="text-xs text-slate-500 mt-1 truncate">{r.purpose}</p>
                          <p className="text-[11px] text-slate-400 mt-1">Filed {formatDate(r.created_at)}</p>
                          {r.status === 'Rejected' && r.rejection_reason && (
                            <p className="text-xs text-rose-600 mt-1">Reason: {r.rejection_reason}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={r.status} />
                          <button onClick={() => handleUnarchive(r)} className={`${btnSecondary} !py-1.5 !px-3 text-xs`}>
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeleteArchived(r)}
                            aria-label="Delete request"
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ---- Notifications ---- */}
            {activeTab === 'notifications' && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">Notifications</h1>
                    <p className="text-sm text-slate-500 mt-1">Status updates for your requests.</p>
                  </div>
                  {notifRequests.length > 0 && (
                    <button onClick={handleDeleteAllNotifications} className={`${btnDanger} !py-2 text-xs`}>
                      <IconTrash className="w-4 h-4" /> Delete all
                    </button>
                  )}
                </div>
                <div className={`${cardCls} overflow-hidden`}>
                  {notifRequests.length === 0 ? (
                    <p className="p-10 text-center text-sm text-slate-400">No notifications.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {notifRequests.map((r) => (
                        <li key={r.id} className={`flex items-start gap-4 px-6 py-4 ${highlightIds.has(r.id) ? 'bg-brand-soft/60' : ''}`}>
                          <span className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0 mt-0.5">
                            <IconBell className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm text-slate-700">
                              Your request <span className="font-mono font-medium text-slate-900">{r.reference_number}</span> for{' '}
                              {r.document_type} {NOTIFICATION_TEXT[r.status] || `is now ${r.status}.`}
                            </p>
                            {r.status === 'Rejected' && r.rejection_reason && (
                              <p className="text-xs text-slate-500 mt-0.5">Reason: {r.rejection_reason}</p>
                            )}
                            <p className="text-[11px] text-slate-400 mt-1">
                              {formatDate(r.updated_at || r.created_at)}
                              {highlightIds.has(r.id) && (
                                <span className="ml-2 inline-block text-[10px] font-semibold text-white bg-rose-500 px-2 py-0.5 rounded-full align-middle">New</span>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteNotification(r)}
                            aria-label="Delete notification"
                            className="ml-auto shrink-0 p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <IconX className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* ---- Profile ---- */}
            {activeTab === 'profile' && (
              <div className="max-w-5xl mx-auto space-y-6">
                <div>
                  <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">My profile</h1>
                  <p className="text-sm text-slate-500 mt-1">Manage your personal information and security.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className={`${cardCls} lg:col-span-3 p-5 space-y-4`}>
                    <div className="w-14 h-14 rounded-full bg-brand-soft text-brand flex items-center justify-center text-lg font-semibold mx-auto">
                      {(fullName || currentUser.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-900 break-words">{fullName || 'Resident'}</p>
                      <p className="text-xs text-slate-400 break-all mt-0.5">{currentUser.email}</p>
                      {memberSince && <p className="text-[11px] text-slate-400 mt-2">Member since {memberSince}</p>}
                    </div>
                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-[11px] font-medium text-slate-500 mb-2">ID on file</p>
                      <UploadBox
                        value={proofUrl}
                        onChange={handleImageUpload(setProofUrl)}
                        label="Upload ID"
                      />
                    </div>
                  </div>

                  <div className={`${cardCls} lg:col-span-5 p-6 space-y-5`}>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">Personal information</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Used to fill in your document requests</p>
                    </div>
                    <form onSubmit={handleProfileSave} className="space-y-4">
                      <div>
                        <label className={labelCls}>Full name</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Email</label>
                        <input type="email" value={currentUser.email || ''} disabled className={inputCls} />
                        <p className="text-[11px] text-slate-400 mt-1">Email cannot be changed.</p>
                      </div>
                      <div>
                        <label className={labelCls}>Contact number</label>
                        <input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="09123456789" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Address</label>
                        <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
                          placeholder="Complete home address" className={`${inputCls} resize-none`} />
                      </div>
                      <button type="submit" className={`${btnPrimary} w-full`}>Save changes</button>
                    </form>
                  </div>

                  <div className={`${cardCls} lg:col-span-4 p-6 space-y-5`}>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">Security</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Change your password</p>
                    </div>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div>
                        <label className={labelCls}>Current password</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                          autoComplete="current-password" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>New password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                          autoComplete="new-password" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Confirm new password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password" className={inputCls} />
                      </div>
                      <button type="submit" className={`${btnSecondary} w-full`}>Update password</button>
                    </form>
                  </div>
                </div>
              </div>
            )}
            </div>
          </main>

          {/* Bottom tab bar (phones) */}
          <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 grid grid-cols-6 px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {NAV_ITEMS.map(({ id, short, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                aria-label={short}
                className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] font-medium transition ${
                  activeTab === id ? 'text-brand' : 'text-slate-500'
                }`}
              >
                <span className="relative">
                  <Icon />
                  {id === 'notifications' && unreadCount > 0 && (
                    <NavBadge count={unreadCount} className="absolute -top-2 -right-3" />
                  )}
                </span>
                {short}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Edit request modal */}
      {editingReq && (
        <Modal title="Edit request" subtitle={editingReq.reference_number} onClose={() => setEditingReq(null)} maxWidth="max-w-lg">
          <form onSubmit={handleEditSave} className="space-y-4">
            <div>
              <label className={labelCls}>Document type</label>
              <select value={editType} onChange={(e) => setEditType(e.target.value)} className={inputCls}>
                {DOCUMENT_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Purpose</label>
              <textarea value={editPurpose} onChange={(e) => setEditPurpose(e.target.value)} required rows={3}
                className={`${inputCls} resize-none`} />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditingReq(null)} className={btnSecondary}>Close</button>
              <button type="submit" className={`${btnPrimary} flex-1`}>Save changes</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Generic delete confirmation */}
      {confirm && (
        <Modal title={confirm.title} onClose={() => setConfirm(null)} maxWidth="max-w-md">
          <p className="text-sm text-slate-600">{confirm.body}</p>
          <div className="flex gap-2 pt-5">
            <button onClick={() => setConfirm(null)} className={btnSecondary}>Cancel</button>
            <button
              onClick={async () => { const c = confirm; setConfirm(null); await c.onConfirm(); }}
              className={`${btnPrimary} flex-1 !bg-rose-600 hover:!bg-rose-700`}
            >
              {confirm.label}
            </button>
          </div>
        </Modal>
      )}

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <Modal title="Cancel this request?" subtitle={cancelTarget.reference_number} onClose={() => setCancelTarget(null)} maxWidth="max-w-md">
          <p className="text-sm text-slate-600">
            Your request for {cancelTarget.document_type} will be withdrawn. This cannot be undone.
          </p>
          <div className="flex gap-2 pt-5">
            <button onClick={() => setCancelTarget(null)} className={btnSecondary}>Keep request</button>
            <button onClick={handleCancelConfirm} className={`${btnPrimary} flex-1 !bg-rose-600 hover:!bg-rose-700`}>Cancel request</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
