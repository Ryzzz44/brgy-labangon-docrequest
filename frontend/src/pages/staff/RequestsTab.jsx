// src/pages/staff/RequestsTab.jsx
// OWNER: James Carl Rafanan  (UC-05, UC-06)
// Reference design: reference/firebase-version/components/StaffDashboard.jsx
import React from 'react';
import TaskPlaceholder from '../../components/TaskPlaceholder';

export default function RequestsTab() {
  return (
    <TaskPlaceholder title="Requests" owner="James Carl Rafanan" issue="UC-05, UC-06">
      All requests with search and filters. Process, mark ready, reject with reason, mark as released.
    </TaskPlaceholder>
  );
}
