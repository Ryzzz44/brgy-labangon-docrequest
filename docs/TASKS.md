# Task split

Based on the objectives and use cases in `SaladoRafananSanchez-updated.xlsx`.
Each task is also a GitHub Issue assigned to its owner.

**Already done in the base project (shared, on `main`):** project setup, MySQL connection, all entities
(tables), repositories, JWT login, security rules, register / login / staff login (API and screens),
welcome page, resident and staff layouts, `RequestView` (shared JSON shape), `RequestLookupService`
(load a request + ownership check), `TransactionLogService` (audit log).

Endpoints under `/api/resident/**` need a resident token; `/api/staff/**` need a staff token
(already enforced in `SecurityConfig`). In a controller, get the logged-in user with
`@AuthenticationPrincipal AuthUser user`.

---

## Samuel O. Salado: Objective 1, Resident Request Module
Branch: `feature/salado-resident-request`

### S1. Submit Document Request (UC-01)
Backend: `dto/SubmitRequestBody.java`, `service/ResidentRequestService.java`, `controller/ResidentRequestController.java`
- `POST /api/resident/requests` body `{ documentType, purpose, validIdImage? }`
  - documentType must be one of the 4 types; purpose required (max 500).
  - If `validIdImage` is empty, use the resident's registration ID.
  - Generate a unique `referenceNumber` like `BR-2026-004512`.
  - Status `PENDING`, `seenByStaff = false`; log `SUBMITTED` with `TransactionLogService`.
  - Return `RequestView`.

Frontend: `api/requests.js`, `pages/resident/RequestTab.jsx`
- Form (type, purpose, optional different ID), then show the reference number.

### S2. Track Request Status (UC-02)
- `GET /api/resident/requests`: my requests, newest first (`findByResidentIdAndDeletedByResidentFalseOrderByCreatedAtDesc`).
- `GET /api/resident/requests/{id}` (use `RequestLookupService`).
- Frontend: `useMyRequests()` hook in `api/requests.js` that reloads every 15 seconds; `TrackTab.jsx`
  with progress bar and rejection reason; render `<RequestActions request={r} onChanged={reload} showToast={showToast} />` on each card.

### S3. Notifications and Dashboard (UC-02)
- `PATCH /api/resident/requests/{id}/seen` and `PATCH /api/resident/requests/seen-all`: set `residentSeenStatus = status`.
- Frontend: `NotificationsTab.jsx` (unread = `status != residentSeenStatus`), unread badge in the nav, `DashboardTab.jsx` (greeting + counts).

### S4. Forgot password (optional)
- Simple version: staff can reset a resident's password at the hall. Advanced: email link with Spring Mail.

---

## James Carl P. Rafanan: Objective 2, Staff Releasing Module
Branch: `feature/rafanan-staff-releasing`

### R1. Review & Verify Request (UC-05)
Backend: `dto/StatusUpdateBody.java`, `service/StaffRequestService.java`, `controller/StaffRequestController.java`
- `GET /api/staff/requests`: all requests (`findAllByOrderByCreatedAtDesc`) as `RequestView`.
- `PATCH /api/staff/requests/{id}/seen`: `seenByStaff = true`.
- `PATCH /api/staff/requests/{id}/status` body `{ status, reason? }`. Allowed moves only:
  - PENDING -> PROCESSED or REJECTED
  - PROCESSED -> READY_FOR_PICKUP or REJECTED
  - REJECTED needs a non-blank `reason` (save in `rejectionReason`).
  - Anything else -> `409 CONFLICT`. Log the action with `TransactionLogService`.
- Frontend: `api/staff.js`, `pages/staff/RequestsTab.jsx` (stat cards, search, filter, detail modal with ID image).

### R2. Release Document (UC-06)
- `PATCH /api/staff/requests/{id}/status` with `RELEASED`, allowed only from READY_FOR_PICKUP.
- Search by reference number; "Mark as released" button; log `RELEASED`.

### R3. Generate Transaction Report (UC-08)
- `GET /api/staff/reports?period=month|week|year&date=2026-11-22`: totals by status and by document type for that period.
- Frontend: `pages/staff/ReportsTab.jsx`, printable (`print:` Tailwind classes).

### R4. Post Announcement (UC-09)
Backend: `dto/AnnouncementBody.java`, `service/AnnouncementService.java`, `controller/AnnouncementController.java`
- `GET /api/announcements/active` (public): active and not expired.
- `GET /api/staff/announcements`, `POST /api/staff/announcements` `{ title, message, level, durationHours? }`,
  `PATCH /api/staff/announcements/{id}/deactivate`, `DELETE /api/staff/announcements/{id}`.
- Frontend: `pages/staff/AnnouncementsTab.jsx`, `components/Announcements.jsx` (banner),
  and place the banner where the two `TODO (Rafanan)` comments are (Welcome.jsx, ResidentPortal.jsx).

---

## Sean Anthony P. Sanchez: Objective 3, Request Management Module
Branch: `feature/sanchez-request-management`

### N1. Modify Pending Request (UC-04)
Backend: `dto/EditRequestBody.java`, `service/RequestManagementService.java`, `controller/RequestManagementController.java`
- `PUT /api/resident/requests/{id}` body `{ documentType, purpose, validIdImage? }`.
  - Only the owner, only while `PENDING`, else `409 CONFLICT` "Only pending requests can be edited."
  - Set `seenByStaff = false`; log `UPDATED`.

### N2. Cancel Pending Request (UC-03)
- `POST /api/resident/requests/{id}/cancel`: only while `PENDING`; status `CANCELLED`; log `CANCELLED`.
- Frontend: `pages/resident/RequestActions.jsx` (Edit + Cancel buttons and modals), `api/requestManagement.js`.

### N3. Archive or Delete Completed Request (UC-07)
- `PATCH /api/resident/requests/{id}/archive` and `/unarchive`: only when status is final (Released, Rejected, Cancelled).
- `DELETE /api/resident/requests/{id}`: soft delete (`deletedByResident = true`), only when final.
- Frontend: `pages/resident/ArchiveTab.jsx`.

### N4. Profile and password
- `PUT /api/resident/profile` `{ fullName, address, contactNumber, validIdImage? }`.
- `PUT /api/resident/password` `{ currentPassword, newPassword }` (check with `PasswordEncoder.matches`).
- Frontend: `pages/resident/ProfileTab.jsx`, `api/profile.js`.

### N5. Activity log (transaction history)
- `GET /api/staff/history`: every `transaction_history` row, newest first, with the request's reference number.
- Frontend: `pages/staff/ActivityTab.jsx`.

---

## Order of work

1. Everyone: run the base project (README steps 1 to 4) and log in as resident and as staff.
2. Build the backend endpoints first and test them in Postman (log in, copy the `token`, add header `Authorization: Bearer <token>`).
3. Build the screens. Copy the look from `reference/firebase-version/`.
4. Open a PR into `dev` per finished task. When all are merged and tested, PR `dev` into `main`.
