// src/components/UploadBox.jsx - photo picker with preview (valid ID / proof of residency).
import React from 'react';
import { IconUpload } from './ui';

export default function UploadBox({ value, onChange, onClear, label }) {
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
