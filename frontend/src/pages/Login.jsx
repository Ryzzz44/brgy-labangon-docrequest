// src/pages/Login.jsx - resident login. Calls POST /api/auth/login.
import React, { useState } from 'react';
import AuthShell from '../components/AuthShell';
import { inputCls, labelCls, btnPrimary } from '../components/ui';
import { loginResident } from '../api/auth';

export default function Login({ onSuccess, onBack, onRegister, onForgot, onLegal, onError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      onSuccess(await loginResident(email.trim(), password));
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell maxWidth="max-w-md" onLegal={onLegal} onBack={onBack}>
      <div className="space-y-1.5">
        <h2 className="font-display text-3xl text-slate-900">Welcome back</h2>
        <p className="text-sm text-slate-500">Log in to track your requests and pick up updates.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            autoComplete="email" placeholder="you@example.com" className={inputCls} />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-slate-600">Password</label>
            <button type="button" onClick={onForgot} className="text-xs font-semibold text-brand hover:underline">
              Forgot password?
            </button>
          </div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            autoComplete="current-password" placeholder="Enter your password" className={inputCls} />
        </div>
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-3`}>
          {busy ? 'Signing in...' : 'Log in'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <button onClick={onRegister} className="font-medium text-brand hover:underline">Register</button>
      </p>
    </AuthShell>
  );
}
