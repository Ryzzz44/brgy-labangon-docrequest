// src/pages/resident/RequestTab.jsx
// OWNER: Samuel O. Salado (UC-01 Submit Document Request)
// Form to request a document. Sends it to POST /api/resident/requests and shows the reference number.
import React, { useState } from 'react';
import UploadBox from '../../components/UploadBox';
import { IconCheck, inputCls, labelCls, btnPrimary, btnSecondary, cardCls } from '../../components/ui';
import { DOCUMENT_TYPES } from '../../utils/constants';
import { compressImage } from '../../utils/image';
import { submitRequest } from '../../api/requests';

export default function RequestTab({ showToast, goTo }) {
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0]);
  const [purpose, setPurpose] = useState('');
  const [idImage, setIdImage] = useState('');          // empty = use the ID saved at registration
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);

  // Read the chosen photo and shrink it before sending.
  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return showToast('Please choose an image file.', 'error');
    try {
      setIdImage(await compressImage(file));
    } catch {
      showToast('Could not read that image.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const saved = await submitRequest(documentType, purpose, idImage);
      setSubmittedRef(saved.referenceNumber);
      setPurpose('');
      setIdImage('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
              Reference number <span className="font-mono font-medium text-brand">{submittedRef}</span>
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button onClick={() => setSubmittedRef(null)} className={btnSecondary}>File another</button>
              <button onClick={() => goTo('track')} className={btnPrimary}>Track request</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelCls}>Document type</label>
              <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className={inputCls}>
                {DOCUMENT_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Purpose</label>
              <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} required rows={3} maxLength={500}
                placeholder="e.g. Employment, bank requirement" className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Valid ID (optional)</label>
              <UploadBox
                value={idImage}
                onChange={handleImage}
                onClear={idImage ? () => setIdImage('') : null}
                label="Upload a different valid ID"
              />
              {!idImage && <p className="text-xs text-slate-400 mt-1.5">If you skip this, the ID from your registration is used.</p>}
            </div>
            <button type="submit" disabled={submitting} className={`${btnPrimary} w-full py-3`}>
              {submitting ? 'Submitting...' : 'Submit request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}