// src/pages/registry.js
// Every page of the system, who owns it, and its direct link.
// Direct links work WITHOUT logging in (presentation rule: your pages must not depend on a groupmate's login page):
//   resident pages: http://localhost:5173/?page=<id>
//   staff pages:    http://localhost:5173/?role=staff&page=<id>
// Open http://localhost:5173/?page=all to see the list of every page.
import { IconHome, IconFile, IconSearch, IconBell, IconUser, IconArchive } from '../components/ui';
import DashboardTab from './resident/DashboardTab';
import RequestTab from './resident/RequestTab';
import TrackTab from './resident/TrackTab';
import NotificationsTab from './resident/NotificationsTab';
import ArchiveTab from './resident/ArchiveTab';
import ProfileTab from './resident/ProfileTab';
import RequestsTab from './staff/RequestsTab';
import ReportsTab from './staff/ReportsTab';
import AnnouncementsTab from './staff/AnnouncementsTab';
import StaffNotificationsTab from './staff/NotificationsTab';
import ActivityTab from './staff/ActivityTab';

export const OWNERS = {
  salado: 'Samuel O. Salado',
  rafanan: 'James Carl P. Rafanan',
  sanchez: 'Sean Anthony P. Sanchez',
};

export const RESIDENT_PAGES = [
  { id: 'dashboard', label: 'Dashboard', short: 'Home', icon: IconHome, owner: 'salado', Component: DashboardTab },
  { id: 'request', label: 'Request Document', short: 'Request', icon: IconFile, owner: 'salado', Component: RequestTab },
  { id: 'track', label: 'Track Requests', short: 'Track', icon: IconSearch, owner: 'salado', Component: TrackTab },
  { id: 'notifications', label: 'Notifications', short: 'Alerts', icon: IconBell, owner: 'salado', Component: NotificationsTab },
  { id: 'archive', label: 'Archive', short: 'Archive', icon: IconArchive, owner: 'sanchez', Component: ArchiveTab },
  { id: 'profile', label: 'My Profile', short: 'Profile', icon: IconUser, owner: 'sanchez', Component: ProfileTab },
];

export const STAFF_PAGES = [
  { id: 'requests', label: 'Requests', owner: 'rafanan', Component: RequestsTab },
  { id: 'reports', label: 'Reports', owner: 'rafanan', Component: ReportsTab },
  { id: 'notifications', label: 'Notifications', owner: 'rafanan', Component: StaffNotificationsTab },
  { id: 'announcements', label: 'Announcements', owner: 'rafanan', Component: AnnouncementsTab },
  { id: 'activity', label: 'Activity log', owner: 'sanchez', Component: ActivityTab },
];
