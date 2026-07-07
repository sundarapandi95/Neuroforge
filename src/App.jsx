import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import OrgAdminRoute from './components/OrgAdminRoute.jsx'
import AppLayout from './components/AppLayout.jsx'
import './App.css'

import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import SelectOrgPage from './pages/SelectOrgPage.jsx'
import AcceptInvitePage from './pages/AcceptInvitePage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import OrgMembersPage from './pages/OrgMembersPage.jsx'
import TeamsPage from './pages/TeamsPage.jsx'
import InvitesPage from './pages/InvitesPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import NewProjectPage from './pages/NewProjectPage.jsx'
import BacklogPage from './pages/BacklogPage.jsx'
import SprintsPage from './pages/SprintsPage.jsx'
import SprintBoardPage from './pages/SprintBoardPage.jsx'
import RepoSettingsPage from './pages/RepoSettingsPage.jsx'
import TaskDetailPage from './pages/TaskDetailPage.jsx'
import TestCasesPage from './pages/TestCasesPage.jsx'
import TestRunPage from './pages/TestRunPage.jsx'
import CoveragePage from './pages/CoveragePage.jsx'
import BugsPage from './pages/BugsPage.jsx'
import BugBoardPage from './pages/BugBoardPage.jsx'
import BugDetailPage from './pages/BugDetailPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public / unauthenticated */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/select-org" element={<SelectOrgPage />} />
          <Route path="/invite/:token" element={<AcceptInvitePage />} />

          {/* Authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/org/members" element={<OrgMembersPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
<Route path="/projects/new" element={<NewProjectPage />} />
<Route path="/projects/:projectId" element={<ProjectDetailPage />} />
<Route path="/backlog" element={<BacklogPage />} />
<Route path="/sprints" element={<SprintsPage />} />
<Route path="/sprints/:sprintId" element={<SprintBoardPage />} />
<Route path="/repo" element={<RepoSettingsPage />} />
<Route path="/tasks/:taskId" element={<TaskDetailPage />} />
<Route path="/testcases" element={<TestCasesPage />} />
<Route path="/testruns" element={<TestRunPage />} />
<Route path="/coverage" element={<CoveragePage />} />
<Route path="/bugs" element={<BugsPage />} />
<Route path="/bugs/board" element={<BugBoardPage />} />
<Route path="/bugs/:bugId" element={<BugDetailPage />} />
<Route path="/analytics" element={<AnalyticsPage />} />
<Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/org/teams" element={<TeamsPage />} />
              <Route element={<OrgAdminRoute />}>
                <Route path="/org/invites" element={<InvitesPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
