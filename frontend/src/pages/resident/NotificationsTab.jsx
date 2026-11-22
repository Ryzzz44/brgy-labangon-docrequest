// src/pages/resident/NotificationsTab.jsx
// OWNER: Samuel Salado  (UC-02)
// Reference design: reference/firebase-version/components/ResidentPortal.jsx (Notifications section)
import React from 'react';
import TaskPlaceholder from '../../components/TaskPlaceholder';

export default function NotificationsTab() {
  return (
    <TaskPlaceholder title="Notifications" owner="Samuel Salado" issue="UC-02">
      List of status changes. Mark as seen with PATCH /api/resident/requests/{id}/seen.
    </TaskPlaceholder>
  );
}
