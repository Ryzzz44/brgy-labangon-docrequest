// src/pages/staff/ActivityTab.jsx
// OWNER: Sean Anthony Sanchez  (Transaction history)
// Reference design: reference/firebase-version/components/StaffDashboard.jsx (Notifications tab)
import React from 'react';
import TaskPlaceholder from '../../components/TaskPlaceholder';

export default function ActivityTab() {
  return (
    <TaskPlaceholder title="Activity log" owner="Sean Anthony Sanchez" issue="Transaction history">
      Every action from the transaction_history table, newest first.
    </TaskPlaceholder>
  );
}
