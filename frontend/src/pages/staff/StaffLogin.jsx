// src/pages/staff/StaffLogin.jsx - staff sign-in. Calls POST /api/auth/staff/login.
import React, { useState } from 'react';
import { BrandMark, IconLock, inputCls } from '../../components/ui';
import { loginStaff } from '../../api/auth';

export default function StaffLogin({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      onSuccess(await loginStaff(email.trim(), password));
    } catch (err) {
      setError(err.message);
    } finally {
      setPassword('');
      setBusy(false);
    }
  };

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
          <input type="email" required autoComplete="username" placeholder="Staff email" value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }} className={inputCls} />
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <IconLock className="w-4 h-4" />
            </span>
            <input type="password" required autoComplete="current-password" placeholder="Password" value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }} className={`${inputCls} pl-10`} />
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
