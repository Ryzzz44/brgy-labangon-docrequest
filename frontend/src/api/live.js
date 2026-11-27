// src/api/live.js
// Live updates from the backend (Server-Sent Events), the Spring Boot version of Firebase's real-time listeners.
// Each browser tab keeps ONE connection open to GET /api/live. Whenever requests or announcements change,
// the server sends "requests" or "announcements", and every page listening with onLive(...) reloads right away,
// on every device (staff PC, resident phone, other tabs).
// Usage in a page: useEffect(() => onLive('requests', reload), []);
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const listeners = { requests: new Set(), announcements: new Set() };
let source = null;

function connect() {
  if (source || typeof EventSource === 'undefined') return;
  source = new EventSource(`${BASE_URL}/api/live`);
  Object.keys(listeners).forEach((topic) => {
    source.addEventListener(topic, () => listeners[topic].forEach((reload) => reload()));
  });
  // If the connection dropped (for example the backend restarted), the browser reconnects by itself.
  // Reload everything once when it comes back, in case a change happened while it was offline.
  let firstOpen = true;
  source.addEventListener('open', () => {
    if (!firstOpen) Object.values(listeners).forEach((set) => set.forEach((reload) => reload()));
    firstOpen = false;
  });
}

// Calls reload() whenever the server says this topic changed. Returns a function that stops listening.
export function onLive(topic, reload) {
  connect();
  listeners[topic].add(reload);
  return () => listeners[topic].delete(reload);
}
