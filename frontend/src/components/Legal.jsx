// src/components/Legal.jsx
// Privacy Notice and Terms of Use shown in a modal. Replace the [bracketed] items with your
// barangay's real details and have the barangay / city legal office review the final text.
import React from 'react';
import { Modal } from './ui';

export const LEGAL_VERSION = '2026-11';

const Section = ({ title, children }) => (
  <section className="space-y-1.5">
    <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
    <div className="text-sm text-slate-600 leading-relaxed space-y-2">{children}</div>
  </section>
);

const Bullets = ({ items }) => (
  <ul className="list-disc pl-5 space-y-1">
    {items.map((t) => <li key={t}>{t}</li>)}
  </ul>
);

function PrivacyNotice() {
  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-400">Version {LEGAL_VERSION}. Issued under the Data Privacy Act of 2012 (Republic Act No. 10173).</p>

      <Section title="Who we are">
        <p>Barangay Labangon ("we") operates this portal so residents can request barangay documents online. We are the personal information controller for the data you give us here.</p>
      </Section>

      <Section title="What we collect">
        <Bullets items={[
          'Full name, complete address, contact number and email address.',
          'A photo of a valid ID or proof of residency that you upload.',
          'Your requests: document type, purpose, reference number, status and timestamps.',
          'Actions taken on your requests by you or barangay staff (audit log).',
        ]} />
      </Section>

      <Section title="Why we collect it">
        <Bullets items={[
          'To verify that you are a resident and to prepare the documents you request.',
          'To tell you when your request changes status or is ready for pickup.',
          'To keep an accurate record of transactions, as required for barangay operations and reporting.',
        ]} />
        <p>We do not sell your data and we do not use it for advertising.</p>
      </Section>

      <Section title="Who can see it">
        <p>Only authorized barangay staff can view residents' records, and only to process requests. We disclose data to other government offices or authorities only when the law requires it. Records are stored in the barangay's own MySQL database, and the website and server are run by the barangay or its authorized hosting providers under their security terms.</p>
      </Section>

      <Section title="How long we keep it">
        <p>We keep records for as long as needed to provide the service and to meet records-retention rules for barangay documents. After that they are securely deleted or anonymized. [Barangay: state your retention period here.]</p>
      </Section>

      <Section title="How we protect it">
        <p>Access is limited to signed-in users and authorized staff, connections are encrypted (HTTPS), and database rules restrict each resident to their own records. No system is perfectly secure; if a breach affecting your data occurs, we will notify you and the National Privacy Commission as the law requires.</p>
      </Section>

      <Section title="Your rights">
        <p>You may ask to access, correct, or object to the processing of your personal data, to withdraw your consent, and to request deletion where the law allows. You may also file a complaint with the National Privacy Commission (privacy.gov.ph).</p>
      </Section>

      <Section title="Cookies and local storage">
        <p>This portal does not use advertising or tracking cookies. It uses only what is needed to keep you signed in (a sign-in token saved in your browser) and small browser-storage items for your own convenience, such as dismissed staff notifications. You can clear these in your browser settings.</p>
      </Section>

      <Section title="Contact our Data Protection Officer">
        <p>[Name of Data Protection Officer], Barangay Labangon Hall, [address]. Email: [dpo email]. Phone: [number].</p>
      </Section>
    </div>
  );
}

function Terms() {
  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-400">Version {LEGAL_VERSION}</p>

      <Section title="Using the portal">
        <p>This portal is for residents of Barangay Labangon to request barangay documents. By creating an account you confirm that the information and ID you provide are true and belong to you.</p>
      </Section>

      <Section title="Your account">
        <Bullets items={[
          'Keep your password private. You are responsible for activity under your account.',
          'Tell us right away if you think someone else has accessed your account.',
          'One person, one account. Do not register for someone else without their permission.',
        ]} />
      </Section>

      <Section title="Requests and documents">
        <p>Submitting a request does not guarantee approval. Barangay staff verify each request and may reject it, for example when information is incomplete or cannot be verified. Documents are released at the barangay hall when marked Ready for Pickup; bring a valid ID.</p>
      </Section>

      <Section title="Acceptable use">
        <Bullets items={[
          'Do not provide false information or forged documents; this may be punishable by law.',
          'Do not attempt to access other residents\' data, disrupt the service, or probe it for weaknesses.',
          'Do not upload harmful files or anything unrelated to your request.',
        ]} />
      </Section>

      <Section title="Suspension">
        <p>We may suspend or remove accounts that break these terms or put other residents' data at risk.</p>
      </Section>

      <Section title="Availability and changes">
        <p>We try to keep the portal available but cannot promise uninterrupted service. We may update these terms and the Privacy Notice; the version date above shows the latest one.</p>
      </Section>

      <Section title="Privacy">
        <p>How we handle your personal data is explained in the Privacy Notice.</p>
      </Section>
    </div>
  );
}

export function LegalModal({ doc, onClose }) {
  if (!doc) return null;
  const isPrivacy = doc === 'privacy';
  return (
    <Modal title={isPrivacy ? 'Privacy Notice' : 'Terms of Use'} subtitle="Barangay Labangon" onClose={onClose} maxWidth="max-w-xl">
      {isPrivacy ? <PrivacyNotice /> : <Terms />}
    </Modal>
  );
}
