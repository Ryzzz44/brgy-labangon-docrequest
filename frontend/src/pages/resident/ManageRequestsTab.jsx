// src/pages/resident/ManageRequestsTab.jsx
// OWNER: Sean Anthony Sanchez (UC-03 Cancel, UC-04 Modify)
// Lists the resident's PENDING requests with Edit and Cancel. Loads its own data from
// Sean's endpoint, so it does not depend on Salado's Track page.
// Reference design: reference/firebase-version/components/ResidentPortal.jsx (edit / cancel modals)
import React from 'react';
import TaskPlaceholder from '../../components/TaskPlaceholder';

export default function ManageRequestsTab() {
  return (
    <TaskPlaceholder title="Manage pending requests" owner="Sean Anthony Sanchez" issue="UC-03, UC-04">
      Pending requests with Edit (change type, purpose, ID) and Cancel (with confirmation).
    </TaskPlaceholder>
  );
}
