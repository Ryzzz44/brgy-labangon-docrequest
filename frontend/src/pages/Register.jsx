// src/pages/Register.jsx - resident sign-up. Calls POST /api/auth/register.
import React, { useState } from 'react';
import AuthShell from '../components/AuthShell';
import UploadBox from '../components/UploadBox';
import { inputCls, labelCls, btnPrimary } from '../components/ui';
import { registerResident } from '../api/auth';
import { compressImage } from '../utils/image';

export default function Register({ onSuccess, onBack, onLogin, onLegal, onError }) {
  const [form, setForm] = useState({
    fullName: '', address: '', contactNumber: '', email: '', password: '', validIdImage: '',
  });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return onError('Please choose an image file.');
    if (file.size > 8 * 1024 * 1024) return onError('Image is too large (max 8 MB).');
    try {
      const dataUrl = await compressImage(file);
      setForm((f) => ({ ...f, validIdImage: dataUrl }));
    } catch {
      onError('Could not read that image.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.validIdImage) return onError('Please upload proof of residency.');
    if (!consent) return onError('Please accept the Privacy Notice and Terms to continue.');
    setBusy(true);
    try {
      onSuccess(await registerResident({ ...form, email: form.email.trim(), consent }));
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell maxWidth="max-w-lg" onLegal={onLegal} onBack={onBack}>
      <div className="space-y-1.5">
        <h2 className="font-display text-3xl text-slate-900">Create your account</h2>
        <p className="text-sm text-slate-500">It takes about two minutes. You will need a valid ID photo.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Full name</label>
          <input type="text" value={form.fullName} onChange={set('fullName')} required placeholder="Juan Dela Cruz" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Complete address</label>
          <input type="text" value={form.address} onChange={set('address')} required placeholder="House no., street, purok" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Contact number</label>
          <input type="tel" value={form.contactNumber} onChange={set('contactNumber')} required pattern="09[0-9]{9}"
            title="11 digits starting with 09" placeholder="09123456789" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" placeholder="you@example.com" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Password</label>
          <input type="password" value={form.password} onChange={set('password')} required minLength={8}
            autoComplete="new-password" placeholder="At least 8 characters" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Proof of residency</label>
          <UploadBox
            value={form.validIdImage}
            onChange={handleImage}
            onClear={() => setForm((f) => ({ ...f, validIdImage: '' }))}
            label="Upload your ID or utility bill"
          />
        </div>
        <label className="flex items-start gap-3 text-xs text-slate-600 leading-relaxed cursor-pointer">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-[#4D55F5] shrink-0" />
          <span>
            I have read the{' '}
            <button type="button" onClick={() => onLegal('privacy')} className="font-semibold text-brand underline underline-offset-2">Privacy Notice</button>
            {' '}and{' '}
            <button type="button" onClick={() => onLegal('terms')} className="font-semibold text-brand underline underline-offset-2">Terms of Use</button>
            , and I consent to Barangay Labangon processing my personal data to handle my document requests.
          </span>
        </label>
        <button type="submit" disabled={!consent || busy} className={`${btnPrimary} w-full py-3`}>
          {busy ? 'Creating your account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Already have an account?{' '}
        <button onClick={onLogin} className="font-medium text-brand hover:underline">Log in</button>
      </p>
    </AuthShell>
  );
}
