// src/pages/ResetPassword.jsx
// OWNER: Samuel O. Salado (FR Objective 1, Transaction 1: reset a forgotten password by email)
// Opened from the email link: http://localhost:5173/?reset=<token>
import React, { useState } from 'react';
import AuthShell from '../components/AuthShell';
import { inputCls, labelCls, btnPrimary } from '../components/ui';
import { resetPassword } from '../api/auth';

export default function ResetPassword({ token, onDone, onLegal, onError }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return onError('Your new password must have at least 8 characters.');
    if (password !== confirm) return onError('The two passwords do not match.');
    setBusy(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell maxWidth="max-w-md" onLegal={onLegal} onBack={onDone}>
      <div className="space-y-1.5">
        <h2 className="font-display text-3xl text-slate-900">{done ? 'Password changed' : 'Choose a new password'}</h2>
        <p className="text-sm text-slate-500">
          {done ? 'You can now log in with your new password.' : 'Use at least 8 characters.'}
        </p>
      </div>

      {done ? (
        <button onClick={onDone} className={`${btnPrimary} w-full py-3`}>Go to log in</button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>New password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              autoComplete="new-password" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Confirm new password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
              autoComplete="new-password" className={inputCls} />
          </div>
          <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-3`}>
            {busy ? 'Saving...' : 'Save new password'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
