// src/App.jsx
// Decides which screen to show:
//   ?role=staff in the URL -> staff login / staff dashboard
//   otherwise              -> welcome, login, register, or the resident portal
// The login token is kept in localStorage; on reload we ask GET /api/auth/me who it belongs to.
import React, { useEffect, useState } from 'react';
import { Splash, Toast } from './components/ui';
import { LegalModal } from './components/Legal';
import { fetchMe, logout } from './api/auth';
import { getToken } from './api/client';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResidentPortal from './pages/resident/ResidentPortal';
import StaffLogin from './pages/staff/StaffLogin';
import StaffDashboard from './pages/staff/StaffDashboard';

const isStaffPage = new URLSearchParams(window.location.search).get('role') === 'staff';

export default function App() {
  const [session, setSession] = useState(null); // { role: 'RESIDENT' | 'STAFF', user: {...} }
  const [ready, setReady] = useState(false);
  const [view, setView] = useState('welcome'); // welcome | login | register | forgot
  const [legalDoc, setLegalDoc] = useState(null);
  const [toast, setToast] = useState({ message: null, type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: null, type }), 4000);
  };
  const showError = (message) => showToast(message, 'error');

  // Restore the session after a page refresh.
  useEffect(() => {
    if (!getToken()) return setReady(true);
    fetchMe()
      .then((res) => setSession({ role: res.role, user: res.user }))
      .catch(() => logout())
      .finally(() => setReady(true));
  }, []);

  // client.js fires this when the backend says the token expired.
  useEffect(() => {
    const onExpired = () => { setSession(null); setView('login'); showError('Your session expired. Please log in again.'); };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const handleLoggedIn = (res) => {
    setSession({ role: res.role, user: res.user });
    showToast(`Welcome, ${res.user.fullName.split(' ')[0]}.`);
  };

  const handleLogout = () => {
    logout();
    setSession(null);
    setView('welcome');
    showToast('Signed out.');
  };

  if (!ready) return <Splash />;

  let screen;
  if (isStaffPage) {
    screen = session?.role === 'STAFF'
      ? <StaffDashboard staff={session.user} onLogout={handleLogout} showToast={showToast} />
      : <StaffLogin onSuccess={handleLoggedIn} />;
  } else if (session?.role === 'RESIDENT') {
    screen = (
      <ResidentPortal
        profile={session.user}
        onProfileChange={(user) => setSession((s) => ({ ...s, user }))}
        onLogout={handleLogout}
        showToast={showToast}
      />
    );
  } else {
    const common = { onLegal: setLegalDoc, onError: showError };
    screen = {
      welcome: <Welcome onLogin={() => setView('login')} onRegister={() => setView('register')} onLegal={setLegalDoc} />,
      login: <Login {...common} onSuccess={handleLoggedIn} onBack={() => setView('welcome')}
        onRegister={() => setView('register')} onForgot={() => setView('forgot')} />,
      register: <Register {...common} onSuccess={handleLoggedIn} onBack={() => setView('welcome')} onLogin={() => setView('login')} />,
      forgot: <ForgotPassword {...common} onBack={() => setView('login')} />,
    }[view];
  }

  return (
    <div className="min-h-screen bg-canvas text-slate-800">
      <Toast message={toast.message} type={toast.type} />
      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
      {screen}
    </div>
  );
}
