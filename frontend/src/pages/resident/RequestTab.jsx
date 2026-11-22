// src/pages/resident/RequestTab.jsx
// OWNER: Samuel Salado  (UC-01)
// Reference design: reference/firebase-version/components/ResidentPortal.jsx (Request section)
import React from 'react';
import TaskPlaceholder from '../../components/TaskPlaceholder';

export default function RequestTab() {
  return (
    <TaskPlaceholder title="Request a document" owner="Samuel Salado" issue="UC-01">
      Form: document type, purpose, valid ID. Calls POST /api/resident/requests and shows the reference number.
    </TaskPlaceholder>
  );
}
