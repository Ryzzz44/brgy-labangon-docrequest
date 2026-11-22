// src/pages/StandalonePage.jsx
// Opens ONE page by itself, without logging in, for individual presentations:
//   /?page=track   /?page=manage   /?role=staff&page=reports
// If nobody is logged in, the page gets the sample profile (stand-in) and the backend's demo mode
// answers its API calls as the demo resident / first staff account.
import React from 'react';
import { BrandMark, cardCls } from '../components/ui';
import { RESIDENT_PAGES, STAFF_PAGES, OWNERS } from './registry';
import sampleProfile from '../data/sample-profile.json';
import sampleStaff from '../data/sample-staff.json';

const link = (area, id) => (area === 'staff' ? `?role=staff&page=${id}` : `?page=${id}`);

function PageIndex() {
  return (
    <div className="min-h-screen p-5 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div>
            <h1 className="font-display text-3xl text-slate-900">All pages</h1>
            <p className="text-sm text-slate-500">Each link opens one page on its own, no login needed.</p>
          </div>
        </div>
        {Object.entries(OWNERS).map(([key, name]) => (
          <div key={key} className={`${cardCls} p-6 space-y-3`}>
            <h2 className="font-semibold text-slate-900">{name}</h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {[...RESIDENT_PAGES.map((p) => ['resident', p]), ...STAFF_PAGES.map((p) => ['staff', p])]
                .filter(([, p]) => p.owner === key)
                .map(([area, p]) => (
                  <li key={area + p.id}>
                    <a href={link(area, p.id)} className="flex items-center justify-between rounded-2xl ring-1 ring-slate-200 px-4 py-3 text-sm hover:bg-brand-soft hover:text-brand">
                      <span className="font-medium">{p.label}</span>
                      <span className="text-[11px] uppercase tracking-wider text-slate-400">{area}</span>
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StandalonePage({ area, id, session, showToast }) {
  const pages = area === 'staff' ? STAFF_PAGES : RESIDENT_PAGES;
  const page = pages.find((p) => p.id === id);
  if (!page) return <PageIndex />;

  const { Component } = page;
  const loggedIn = session && session.role === (area === 'staff' ? 'STAFF' : 'RESIDENT');
  const goTo = (next) => { window.location.search = link(area, next); };

  return (
    <div className="min-h-screen p-5 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="font-display text-lg text-slate-900 leading-tight">{page.label}</p>
              <p className="text-xs text-slate-500">{OWNERS[page.owner]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {!loggedIn && <span className="rounded-full bg-butter px-3 py-1.5 font-semibold text-amber-800">Demo mode, no login</span>}
            <a href="?page=all" className="rounded-full bg-white px-3 py-1.5 font-semibold text-slate-600 shadow-soft hover:text-slate-900">All pages</a>
          </div>
        </header>
        <div className="tab-enter">
          {area === 'staff'
            ? <Component staff={loggedIn ? session.user : sampleStaff} showToast={showToast} />
            : <Component profile={loggedIn ? session.user : sampleProfile} onProfileChange={() => {}} showToast={showToast} goTo={goTo} />}
        </div>
      </div>
    </div>
  );
}
