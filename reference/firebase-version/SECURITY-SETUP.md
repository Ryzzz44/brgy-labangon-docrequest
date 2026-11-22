# Security setup (do this before going live)

## 1. Publish the Firestore rules
Firebase console > Firestore Database > Rules > paste the contents of `firestore.rules` > Publish.
Until you do this, the database is not protected by these rules.

## 2. Create staff accounts
1. Firebase console > Authentication > Users > Add user (staff email + strong password).
2. Copy that user's UID.
3. Firestore Database > Start collection `Staff` > Document ID = the UID > add a field `name` (string).
Only people with a `Staff/{uid}` document can open the staff dashboard or read residents' data.
Staff sign in at `https://your-site/?role=staff`. The old PIN and `VITE_STAFF_PIN` are no longer used.

## 3. Lock down Firebase
- Authentication > Settings > Authorized domains: keep only `localhost` (dev) and your Netlify domain.
- Google Cloud console > APIs & Services > Credentials > your browser API key > restrict to HTTP referrers (your Netlify domain).
- Turn on Firebase App Check (reCAPTCHA) for Firestore and Authentication.
- Authentication > Settings > Password policy: require a longer password.
- Turn on two-step verification for the Firebase/Google admin account and the Netlify account.

## 4. Netlify
- `netlify.toml` sets HTTPS headers and a content-security-policy. If you change the services the app calls, update the policy.
- Never commit `.env` files. Add environment variables in Netlify > Site settings.

## 5. Legal text
Edit the [bracketed] items in `src/components/Legal.jsx` (DPO name/contact, retention period) and have the barangay or city legal office review it. Ask your DPO whether the barangay must register with the National Privacy Commission.

## 6. Later improvements
- Store valid-ID photos in Firebase Storage with private rules instead of inside Firestore documents.
- Schedule regular Firestore exports as backups.
- Write a short breach-response plan (who to call; notify the NPC and affected residents).
