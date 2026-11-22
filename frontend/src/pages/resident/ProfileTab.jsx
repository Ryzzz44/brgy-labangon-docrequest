// src/pages/resident/ProfileTab.jsx
// OWNER: Sean Anthony Sanchez  (Profile)
// Reference design: reference/firebase-version/components/ResidentPortal.jsx (Profile section)
import React from 'react';
import TaskPlaceholder from '../../components/TaskPlaceholder';

export default function ProfileTab() {
  return (
    <TaskPlaceholder title="My profile" owner="Sean Anthony Sanchez" issue="Profile">
      Edit name, address, contact number, ID; change password.
    </TaskPlaceholder>
  );
}
