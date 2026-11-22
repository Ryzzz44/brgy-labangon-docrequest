// src/pages/staff/ReportsTab.jsx
// OWNER: James Carl Rafanan  (UC-08)
// Reference design: reference/firebase-version/components/StaffReports.jsx
import React from 'react';
import TaskPlaceholder from '../../components/TaskPlaceholder';

export default function ReportsTab() {
  return (
    <TaskPlaceholder title="Reports" owner="James Carl Rafanan" issue="UC-08">
      Printable report by month, week or year: totals by status and document type.
    </TaskPlaceholder>
  );
}
