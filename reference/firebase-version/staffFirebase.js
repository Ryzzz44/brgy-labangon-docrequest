// src/staffFirebase.js
// A second Firebase app instance used only by the staff dashboard. It keeps its own sign-in
// session, so a resident logging in (or out) in another tab never signs staff out, and the
// other way around. It reuses the same project settings as ./firebase.
import { getApps, getApp, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { auth as residentAuth } from './firebase';

const NAME = 'staff';
const app = getApps().some((a) => a.name === NAME)
  ? getApp(NAME)
  : initializeApp(residentAuth.app.options, NAME);

export const staffAuth = getAuth(app);
export const staffDb = getFirestore(app);
