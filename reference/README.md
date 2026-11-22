# Reference: the Firebase version

This folder is the earlier Firebase version of the system (the one shown to Barangay Labangon).
It is **not** built or run. Use it only to copy screen designs (JSX + Tailwind classes) into the new
React pages, then replace the Firebase calls with calls to our Spring Boot API (`frontend/src/api/`).

| Old file | New place |
|---|---|
| `components/ResidentPortal.jsx` (Dashboard / Request / Track / Notifications sections) | `frontend/src/pages/resident/*Tab.jsx` (Salado) |
| `components/ResidentPortal.jsx` (Edit/Cancel modals, Archive, Profile) | `RequestActions.jsx`, `ArchiveTab.jsx`, `ProfileTab.jsx` (Sanchez) |
| `components/StaffDashboard.jsx`, `StaffReports.jsx`, `Announcements.jsx` | `frontend/src/pages/staff/*Tab.jsx`, `components/Announcements.jsx` (Rafanan) |
