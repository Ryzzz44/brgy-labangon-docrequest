// src/pages/resident/DashboardTab.jsx
// OWNER: Samuel Salado  (UC-02)
// Reference design: reference/firebase-version/components/ResidentPortal.jsx (Dashboard section)
import React from 'react';
import TaskPlaceholder from '../../components/TaskPlaceholder';

export default function DashboardTab() {
  return (
    <TaskPlaceholder title="Dashboard" owner="Samuel Salado" issue="UC-02">
      Greeting, counts of in-progress / ready / released requests, latest requests.
    </TaskPlaceholder>
  );
}
