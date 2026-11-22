// src/pages/resident/ProfileTab.jsx
// OWNER: Sean Anthony P. Sanchez (My Profile)
// Edit name, address, contact number and valid ID, and change the password.
import React, { useEffect, useState } from 'react';
import UploadBox from '../../components/UploadBox';
import { inputCls, labelCls, btnPrimary, btnSecondary, cardCls } from '../../components/ui';
import { compressImage } from '../../utils/image';
import { getProfile, updateProfile, changePassword } from '../../api/profile';

export default function ProfileTab({ showToast, onProfileChange }) {
  const [form, setForm] = useState(null); // null until the profile is loaded
  const [newIdImage, setNewIdImage] = useState('');
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile()
      .then((p) => setForm({ fullName: p.fullName, email: p.email, address: p.address, contactNumber: p.contactNumber, validIdImage: p.validIdImage }))
      .catch((err) => showToast(err.message, 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setNewIdImage(await compressImage(file));
    } catch {
      showToast('Could not read that image.', 'error');
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile({
        fullName: form.fullName, address: form.address, contactNumber: form.contactNumber, validIdImage: newIdImage,
      });
      setForm({ ...form, validIdImage: updated.validIdImage });
      setNewIdImage('');
      onProfileChange?.(updated); // lets the rest of the app show the new name
      showToast('Profile saved.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) return showToast('The new passwords do not match.', 'error');
    try {
      await changePassword(passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirm: '' });
      showToast('Password updated.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!form) return <div className={`${cardCls} p-10 text-center text-sm text-slate-400 max-w-3xl mx-auto`}>Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">My profile</h1>
        <p className="text-sm text-slate-500 mt-1">These details appear on every document you request.</p>
      </div>

      <form onSubmit={saveProfile} className={`${cardCls} p-6 md:p-8 space-y-4`}>
        <h2 className="text-sm font-semibold text-slate-900">Personal details</h2>
        <div>
          <label className={labelCls}>Email (cannot be changed)</label>
          <input value={form.email} disabled className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Full name</label>
          <input value={form.fullName} onChange={set('fullName')} required maxLength={120} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Complete address</label>
          <input value={form.address} onChange={set('address')} required maxLength={255} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Contact number</label>
          <input value={form.contactNumber} onChange={set('contactNumber')} required pattern="09[0-9]{9}"
            title="11 digits starting with 09" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Valid ID</label>
          <UploadBox value={newIdImage || form.validIdImage} onChange={handleImage}
            onClear={newIdImage ? () => setNewIdImage('') : null} label="Upload a valid ID" />
        </div>
        <button type="submit" disabled={saving} className={`${btnPrimary} w-full py-3`}>
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      <form onSubmit={savePassword} className={`${cardCls} p-6 md:p-8 space-y-4`}>
        <h2 className="text-sm font-semibold text-slate-900">Change password</h2>
        <input type="password" placeholder="Current password" value={passwords.current} required autoComplete="current-password"
          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className={inputCls} />
        <input type="password" placeholder="New password (at least 8 characters)" value={passwords.next} required minLength={8}
          autoComplete="new-password" onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} className={inputCls} />
        <input type="password" placeholder="Repeat the new password" value={passwords.confirm} required minLength={8}
          autoComplete="new-password" onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className={inputCls} />
        <button type="submit" className={`${btnSecondary} w-full`}>Update password</button>
      </form>
    </div>
  );
}