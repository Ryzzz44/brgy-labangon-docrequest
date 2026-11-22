// src/pages/ForgotPassword.jsx
// OWNER: Samuel O. Salado (FR Objective 1, Transaction 1: reset a forgotten password by email)
// The resident types their email; the backend emails a one-time link that opens ResetPassword.jsx.
import React, { useState } from 'react';
import AuthShell from '../components/AuthShell';
import { inputCls, labelCls, btnPrimary, btnSecondary } from '../components/ui';
import { forgotPassword } from '../api/auth';

export default function ForgotPassword({ onBack, onLegal, onError }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentMessage, setSentMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await forgotPassword(email.trim());
      setSentMessage(res.message);
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell maxWidth="max-w-md" onLegal={onLegal} onBack={onBack}>
      <div className="space-y-1.5">
        <h2 className="font-display text-3xl text-slate-900">Forgot your password?</h2>
        <p className="text-sm text-slate-500">
          Enter the email you registered with and we will send you a link to choose a new password.
        </p>
      </div>

      {sentMessage ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4 text-sm text-emerald-800">{sentMessage}</div>
          <p className="text-xs text-slate-500">The link works once and expires after 30 minutes.</p>
          <div className="flex gap-2">
            <button onClick={() => setSentMessage(null)} className={btnSecondary}>Send again</button>
            <button onClick={onBack} className={`${btnPrimary} flex-1`}>Back to log in</button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              autoComplete="email" placeholder="you@example.com" className={inputCls} />
          </div>
          <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-3`}>
            {busy ? 'Sending...' : 'Send reset link'}
          </button>
          <p className="text-center text-xs text-slate-500">
            No access to your email? Visit the Barangay Labangon hall with a valid ID.
          </p>
        </form>
      )}
    </AuthShell>
  );
}
