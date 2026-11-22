// src/components/TaskPlaceholder.jsx
// Shown on screens that a team member has not built yet. Delete it from your screen when you start.
import React from 'react';
import { cardCls } from './ui';

export default function TaskPlaceholder({ title, owner, issue, children }) {
  return (
    <div className={`${cardCls} p-8 space-y-3 max-w-3xl`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">To build</p>
      <h2 className="font-display text-3xl text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500">
        Assigned to <span className="font-semibold text-slate-800">{owner}</span>
        {issue && <> &middot; see GitHub issue <span className="font-mono">{issue}</span></>}
      </p>
      {children && <div className="text-sm text-slate-600 leading-relaxed">{children}</div>}
    </div>
  );
}
