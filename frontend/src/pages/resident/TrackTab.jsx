// src/pages/resident/TrackTab.jsx
// OWNER: Samuel Salado (UC-02)
// Reference design: reference/firebase-version/components/ResidentPortal.jsx (Track section)
import React from 'react';
import TaskPlaceholder from '../../components/TaskPlaceholder';

export default function TrackTab() {
  return (
    <TaskPlaceholder title="Track requests" owner="Samuel Salado" issue="UC-02">
      Active requests with a progress bar (Pending, Processed, Ready for Pickup, Released) and the rejection reason if rejected.
    </TaskPlaceholder>
  );
}
