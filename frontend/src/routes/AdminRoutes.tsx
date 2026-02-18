import { Route, Routes } from "react-router-dom";
import Dashboard from "../pages/admin/AdminDashboard";
import Candidate from "../pages/admin/AdminCandidate";
import Reports from "../pages/admin/ReportsInsights";
import AIVideoInterview from "../pages/admin/AIVideoInterview";
import TestsAssessments from "../pages/admin/Tests-Assessments";
import LoginPage from "../pages/admin/AdminLogin";
import ProtectedRoute from "../routes/ProtectedRoute";
import PageNotFound from "../common/PageNotFound";
import ToastProvider from "../common/ToastProvider";
function AdminRoutes() {
  return (
    <>
      <ToastProvider />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute redirectTo="/admin/login" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/candidates" element={<Candidate />} />
          <Route path="/tests" element={<TestsAssessments />} />
          <Route path="/video" element={<AIVideoInterview />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        {/* ✅ 404 Route (Always Last) */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default AdminRoutes;
