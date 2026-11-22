// src/pages/resident/ArchiveTab.jsx
// OWNER: Sean Anthony Sanchez  (UC-07)
// Reference design: reference/firebase-version/components/ResidentPortal.jsx (Archive section)
import React from 'react';
import TaskPlaceholder from '../../components/TaskPlaceholder';

export default function ArchiveTab() {
  return (
    <TaskPlaceholder title="Archive" owner="Sean Anthony Sanchez" issue="UC-07">
      Finished requests the resident archived. Restore or delete.
    </TaskPlaceholder>
  );
}
