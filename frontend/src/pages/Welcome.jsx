// src/pages/Welcome.jsx - public landing page.
import React from 'react';
import HeroScene from '../components/HeroScene';
import { BrandMark, IconArrowLeft, IconBell, StatusBadge } from '../components/ui';
import { DOCUMENT_TYPES } from '../utils/constants';

export default function Welcome({ onLogin, onRegister, onLegal }) {
  return (
    <div className="min-h-screen overflow-x-clip">
      {/* Floating glass nav */}
      <header className="fixed top-3 inset-x-3 z-40 flex justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-5xl flex items-center justify-between gap-3 rounded-full bg-white/70 backdrop-blur-xl ring-1 ring-slate-900/[0.06] shadow-soft pl-2.5 pr-2 py-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandMark size="w-8 h-8" />
            <span className="font-semibold text-slate-900 text-sm tracking-tight truncate">Barangay Labangon</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => onLogin()} className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-full hover:bg-white">Log in</button>
            <button onClick={() => onRegister()} className="text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full">
              <span className="sm:hidden">Sign up</span><span className="hidden sm:inline">Create account</span>
            </button>
          </div>
        </div>
      </header>

      {/* TODO (Rafanan, announcements task): show <AnnouncementStack items={announcements} /> here. */}

      {/* Hero stage */}
      <section className="p-3 pt-3">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#0B0B1A] text-white">
          <div className="absolute -top-48 right-[-8rem] w-[36rem] h-[36rem] rounded-full bg-brand/55 blur-[130px]" />
          <div className="absolute -bottom-56 -left-32 w-[30rem] h-[30rem] rounded-full bg-[#A78BFA]/25 blur-[130px]" />
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_60%_40%,black_20%,transparent_70%)]" />

          <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-28 pb-10 md:pt-36 md:pb-16 grid lg:grid-cols-12 gap-6 lg:gap-4 items-center">
            <div className="hero-rise lg:col-span-7 space-y-7 text-center lg:text-left">
              <p className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white/60">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-60 animate-ping" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </span>
                Official Barangay Portal
              </p>
              <h1 className="font-display text-[2.9rem] leading-[0.98] sm:text-7xl lg:text-[5.75rem]">
                Barangay<br className="hidden lg:block" /> papers,<br />
                <span className="bg-gradient-to-r from-[#B7B2FF] via-white to-[#FFD3BA] bg-clip-text text-transparent">minus the queue.</span>
              </h1>
              <p className="text-base md:text-lg text-white/65 leading-relaxed max-w-md mx-auto lg:mx-0">
                Request clearances and certificates online, follow every step in real time, and pick them up the moment they are ready.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button onClick={() => onRegister()} className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 text-sm font-semibold pl-8 pr-6 py-3.5 rounded-full hover:bg-white/90 shadow-lift group">
                  Get started
                  <IconArrowLeft className="w-4 h-4 rotate-180 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
                <button onClick={() => onLogin()} className="inline-flex items-center justify-center gap-2 text-white text-sm font-semibold px-8 py-3.5 rounded-full ring-1 ring-white/25 hover:bg-white/10">
                  Log in
                </button>
              </div>
            </div>

            {/* 3D scene (falls back to a static tracker card if WebGL is unavailable) */}
            <div className="lg:col-span-5 relative">
              <HeroScene
                className="relative h-[380px] sm:h-[480px] lg:h-[600px] -mx-4 sm:mx-0 lg:-ml-24"
                fallback={
                  <div className="h-full flex items-center justify-center px-4">
                    <div className="w-full max-w-sm rounded-[1.75rem] bg-white/[0.07] ring-1 ring-white/15 p-6">
                      <p className="text-[11px] uppercase tracking-widest text-white/50">Request</p>
                      <p className="font-display text-2xl mt-1">Barangay Clearance</p>
                      <p className="text-[11px] font-mono text-white/50 mt-1">BR-{new Date().getFullYear()}-004512</p>
                      <div className="mt-5 grid grid-cols-4 gap-1.5">
                        <span className="h-1.5 rounded-full bg-brand" /><span className="h-1.5 rounded-full bg-brand" />
                        <span className="h-1.5 rounded-full bg-brand" /><span className="h-1.5 rounded-full bg-white/15" />
                      </div>
                      <div className="mt-5"><StatusBadge status="Ready for Pickup" /></div>
                    </div>
                  </div>
                }
              />
              <div className="pointer-events-none absolute left-2 sm:left-0 bottom-4 lg:bottom-10 bg-white text-slate-900 rounded-2xl shadow-lift p-3 pr-5 flex items-center gap-3 float-slower">
                <span className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <IconBell className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold">Ready for pickup</p>
                  <p className="text-[11px] text-slate-500">Your clearance is ready</p>
                </div>
              </div>
            </div>
          </div>

          {/* Document marquee */}
          <div className="marquee relative border-t border-white/10 overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
            <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
              {[...DOCUMENT_TYPES, ...DOCUMENT_TYPES, ...DOCUMENT_TYPES, ...DOCUMENT_TYPES].map((d, i) => (
                <span key={i} className="font-display text-lg text-white/55 flex items-center gap-10">
                  {d}
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 md:px-10">
        {/* Documents: editorial index */}
        <section className="reveal pt-24 pb-12 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-brand">01 &mdash; Documents</p>
            <h2 className="font-display text-4xl md:text-5xl text-slate-900 mt-4 leading-[1.05]">What you can request</h2>
            <p className="text-sm text-slate-500 mt-4 max-w-xs">Pick a document, file it online, and collect it at the barangay hall.</p>
          </div>
          <ul className="lg:col-span-8 border-t border-slate-900/10">
            {DOCUMENT_TYPES.map((d, i) => (
              <li key={d} className="border-b border-slate-900/10">
                <button
                  onClick={() => onRegister()}
                  className="group w-full flex items-center gap-5 py-6 text-left !transition-none"
                >
                  <span className="font-mono text-xs text-slate-400 w-8">0{i + 1}</span>
                  <span className="font-display text-2xl md:text-3xl text-slate-900 flex-1 group-hover:translate-x-2 transition-transform duration-300 ease-out">{d}</span>
                  <span className="w-11 h-11 rounded-full ring-1 ring-slate-900/15 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white group-hover:ring-slate-900 transition-[background-color,color,box-shadow] duration-200">
                    <IconArrowLeft className="w-4 h-4 rotate-180" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="reveal py-16 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-brand">02 &mdash; Process</p>
            <h2 className="font-display text-4xl md:text-5xl text-slate-900 mt-4 leading-[1.05]">Three steps, no queue</h2>
          </div>
          <div className="lg:col-span-8 grid sm:grid-cols-3 gap-4">
            {[
              ['1', 'Register', 'Create your account with your details and a valid ID.', 'bg-lilac'],
              ['2', 'Request', 'Choose the document you need and submit it anytime.', 'bg-peach'],
              ['3', 'Track and receive', 'Follow the status and pick it up when it is ready.', 'bg-mint'],
            ].map(([n, t, d, bg]) => (
              <div key={n} className={`${bg} lift rounded-3xl p-6 min-h-[240px] flex flex-col justify-between`}>
                <span className="font-display text-6xl text-slate-900/80 leading-none">{n}</span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{t}</h3>
                  <p className="text-sm text-slate-700/80 mt-1.5 leading-relaxed">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final call to action */}
        <section className="reveal pb-16">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#0B0B1A] text-white px-6 py-16 md:px-16 md:py-24 text-center">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] rounded-full bg-brand/45 blur-[120px]" />
            <div className="relative">
              <h2 className="font-display text-4xl md:text-7xl leading-[1.02]">Skip the line <span className="text-white/60">today.</span></h2>
              <p className="text-white/60 mt-5 max-w-md mx-auto text-sm md:text-base">Create your free account and file your first request in minutes.</p>
              <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => onRegister()} className="bg-white text-slate-900 text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-white/90 shadow-lift">Create account</button>
                <button onClick={() => onLogin()} className="text-white text-sm font-semibold px-8 py-3.5 rounded-full ring-1 ring-white/25 hover:bg-white/10">Log in</button>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-8 border-t border-slate-900/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-2"><BrandMark size="w-5 h-5" /> Barangay Labangon Information System</span>
          <span className="flex items-center gap-4">
            <button onClick={() => onLegal('privacy')} className="hover:text-slate-600 underline underline-offset-2">Privacy Notice</button>
            <button onClick={() => onLegal('terms')} className="hover:text-slate-600 underline underline-offset-2">Terms of Use</button>
            <span>&copy; {new Date().getFullYear()}</span>
          </span>
        </footer>
      </div>
    </div>
  );
}
