// src/components/AuthShell.jsx - two-panel layout used by login, register and forgot-password pages.
import React from 'react';
import HeroScene from './HeroScene';
import { BrandMark, IconCheck, IconLock, IconFile, IconArrowLeft, cardCls } from './ui';

export default function AuthShell({ children, onBack, onLegal, maxWidth = 'max-w-md' }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel (desktop) */}
      <div className="hidden lg:flex relative overflow-hidden m-4 rounded-[2rem] bg-[#0B0B1A] text-white p-12 flex-col justify-between">
        <div className="absolute -right-24 -top-24 w-[26rem] h-[26rem] rounded-full bg-brand/50 blur-[110px]" />
        <div className="absolute -left-20 bottom-0 w-80 h-80 rounded-full bg-[#A78BFA]/25 blur-[110px]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px]" />

        <div className="relative flex items-center gap-3">
          <div className="bg-white rounded-2xl p-2"><BrandMark size="w-8 h-8" /></div>
          <span className="font-semibold tracking-tight">Barangay Labangon</span>
        </div>

        <HeroScene className="relative flex-1 min-h-[280px] -mx-6 my-2" fallback={<div className="h-full" />} />

        <div className="relative space-y-4">
          <h2 className="font-display text-4xl leading-[1.08]">
            Your barangay,<br />
            <span className="text-white/60">a few taps away.</span>
          </h2>
          <ul className="flex flex-wrap gap-2 text-xs text-white/80">
            {['Request online', 'Live status', 'Pickup alerts'].map((t) => (
              <li key={t} className="flex items-center gap-1.5 bg-white/10 ring-1 ring-white/15 rounded-full pl-2 pr-3.5 py-1.5">
                <IconCheck className="w-3 h-3 text-emerald-300" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form side */}
      <div className="relative flex flex-col min-h-screen lg:min-h-0 overflow-hidden">
        {/* Soft pastel backdrop */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-lilac blur-3xl opacity-80" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-peach blur-3xl opacity-70" />
        <div className="absolute top-1/3 right-8 w-56 h-56 rounded-full bg-mint blur-3xl opacity-60 hidden lg:block" />

        {/* Compact brand banner (phones and tablets) */}
        <div className="lg:hidden relative m-3 mb-0 overflow-hidden rounded-3xl bg-[#0B0B1A] text-white px-5 py-5">
          <div className="absolute -right-10 -top-16 w-48 h-48 rounded-full bg-brand/60 blur-[70px]" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="bg-white rounded-xl p-1.5"><BrandMark size="w-7 h-7" /></div>
                <span className="text-sm font-semibold truncate">Barangay Labangon</span>
              </div>
              <p className="font-display text-2xl leading-[1.1] mt-4">
                Your barangay,<br /><span className="text-white/60">a few taps away.</span>
              </p>
            </div>
            <div className="relative w-24 h-24 shrink-0" aria-hidden="true">
              <span className="absolute left-0 top-3 w-14 h-[4.5rem] rounded-xl bg-[#FFE5D6] -rotate-12 shadow-lg" />
              <span className="absolute right-0 top-1 w-14 h-[4.5rem] rounded-xl bg-[#E7E5FF] rotate-12 shadow-lg" />
              <span className="absolute left-1/2 -translate-x-1/2 top-4 w-14 h-[4.5rem] rounded-xl bg-white shadow-xl p-2 space-y-1.5">
                <span className="block h-1.5 w-8 rounded-full bg-slate-200" />
                <span className="block h-1.5 w-6 rounded-full bg-slate-200" />
                <span className="block h-1.5 w-full rounded-full bg-brand mt-3" />
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className={`tab-enter w-full ${maxWidth} space-y-5`}>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur rounded-full px-4 py-2 shadow-soft"
            >
              <IconArrowLeft className="w-4 h-4" /> Back to home
            </button>
            <div className={`${cardCls} p-6 sm:p-9 space-y-6`}>{children}</div>

            {/* Reassurance row */}
            <ul className="grid grid-cols-3 gap-2 text-center">
              {[
                [IconLock, 'Secure sign-in'],
                [IconCheck, 'Staff verified'],
                [IconFile, 'Free for residents'],
              ].map(([Icon, t]) => (
                <li key={t} className="flex flex-col items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <span className="w-8 h-8 rounded-full bg-white shadow-soft flex items-center justify-center text-brand"><Icon className="w-4 h-4" /></span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="text-center text-xs text-slate-500">Need help? Visit the Barangay Labangon hall during office hours.</p>
            <p className="text-center text-[11px] text-slate-400">
              <button type="button" onClick={() => onLegal('terms')} className="underline underline-offset-2 hover:text-slate-600">Terms of Use</button>
              {' '}&middot;{' '}
              <button type="button" onClick={() => onLegal('privacy')} className="underline underline-offset-2 hover:text-slate-600">Privacy Notice</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
