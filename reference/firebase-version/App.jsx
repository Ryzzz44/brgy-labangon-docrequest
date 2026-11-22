// src/App.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { staffAuth as auth, staffDb as db } from './staffFirebase';
import ResidentPortal from './components/ResidentPortal';
import StaffDashboard from './components/StaffDashboard';
import { BrandMark, IconLock, inputCls, LoadingOverlay } from './components/ui';

/*
 * Staff access: staff sign in with a Firebase Auth account, and that account must have a
 * matching document at Staff/{uid} in Firestore (created by an administrator in the Firebase
 * console). The Firestore security rules check the same document, so access is enforced by the
 * server, not just hidden in the browser. See SECURITY-SETUP.md.
 */
function StaffGate() {
  const [state, setState] = useState('checking'); // checking | signedOut | staff
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const verifyStaff = async (user) => {
    try {
      const snap = await getDoc(doc(db, 'Staff', user.uid));
      return snap.exists();
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return setState('signedOut');
      if (await verifyStaff(user)) setState('staff');
      else {
        await signOut(auth);
        setState('signedOut');
      }
    });
    return unsub;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!(await verifyStaff(cred.user))) {
        await signOut(auth);
        setError('This account does not have staff access.');
      }
    } catch {
      setError('Incorrect email or password.');
    } finally {
      setPassword('');
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth); // stays on ?role=staff, so the sign-in screen shows again
  };

  if (state === 'checking') return <LoadingOverlay label="Checking access..." />;
  if (state === 'staff') return <StaffDashboard onLogout={handleLogout} />;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0B1A] text-white flex items-center justify-center p-4">
      <div className="absolute -top-40 -right-32 w-[34rem] h-[34rem] rounded-full bg-brand/50 blur-[130px]" />
      <div className="absolute -bottom-48 -left-24 w-[28rem] h-[28rem] rounded-full bg-[#A78BFA]/25 blur-[130px]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="tab-enter relative w-full max-w-sm rounded-[2rem] bg-white/[0.07] backdrop-blur-xl ring-1 ring-white/15 p-8 space-y-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white rounded-2xl p-2.5"><BrandMark size="w-10 h-10" /></div>
          <div>
            <h1 className="font-display text-3xl">Staff sign-in</h1>
            <p className="text-sm text-white/60 mt-1">Authorized barangay personnel only.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <input
            type="email"
            required
            autoComplete="username"
            placeholder="Staff email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            className={inputCls}
          />
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <IconLock className="w-4 h-4" />
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className={`${inputCls} pl-10`}
            />
          </div>
          {error && <p role="alert" className="text-xs font-medium text-rose-300 text-center">{error}</p>}
          <button type="submit" disabled={busy} className="w-full bg-white text-slate-900 text-sm font-semibold py-3 rounded-full hover:bg-white/90 shadow-lift disabled:opacity-60">
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  const isStaffParam = new URLSearchParams(window.location.search).get('role') === 'staff';
  return isStaffParam ? <StaffGate /> : <ResidentPortal />;
}

export default App;
