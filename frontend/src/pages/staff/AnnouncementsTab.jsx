// src/pages/staff/AnnouncementsTab.jsx
// OWNER: James Carl Rafanan  (UC-09)
// Reference design: reference/firebase-version/components/Announcements.jsx
import React from 'react';
import TaskPlaceholder from '../../components/TaskPlaceholder';

export default function AnnouncementsTab() {
  return (
    <TaskPlaceholder title="Announcements" owner="James Carl Rafanan" issue="UC-09">
      Post Urgent / Important / Info notices with a duration; residents see them as banners.
    </TaskPlaceholder>
  );
}
