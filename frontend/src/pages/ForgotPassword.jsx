// src/pages/ForgotPassword.jsx
// TODO (Salado - issue "Forgot password"): replace this with a working reset flow.
import React from 'react';
import AuthShell from '../components/AuthShell';
import { btnPrimary } from '../components/ui';

export default function ForgotPassword({ onBack, onLegal }) {
  return (
    <AuthShell maxWidth="max-w-md" onLegal={onLegal} onBack={onBack}>
      <div className="space-y-1.5">
        <h2 className="font-display text-3xl text-slate-900">Forgot your password?</h2>
        <p className="text-sm text-slate-500">
          Please visit the Barangay Labangon hall with a valid ID and the staff will help you reset it.
        </p>
      </div>
      <button onClick={onBack} className={`${btnPrimary} w-full py-3`}>Back to log in</button>
    </AuthShell>
  );
}
