// src/pages/resident/TrackTab.jsx
// OWNER: Samuel Salado (UC-02). Sean Sanchez adds Edit/Cancel through <RequestActions /> (UC-03/04).
// Reference design: reference/firebase-version/components/ResidentPortal.jsx (Track section)
import React from 'react';
import TaskPlaceholder from '../../components/TaskPlaceholder';

export default function TrackTab() {
  return (
    <TaskPlaceholder title="Track requests" owner="Samuel Salado" issue="UC-02">
      Active requests with a progress bar (Pending, Processed, Ready for Pickup, Released).
      Each card renders &lt;RequestActions request=... /&gt; from Sean's RequestActions.jsx for the Edit and Cancel buttons.
    </TaskPlaceholder>
  );
}
