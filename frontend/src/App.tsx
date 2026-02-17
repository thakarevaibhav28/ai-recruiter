import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./pages/admin/AdminDashboard";
import Candidate from "./pages/admin/AdminCandidate";
import Reports from "./pages/admin/ReportsInsights";
import AIVideoInterview from "./pages/admin/AIVideoInterview";
import TestsAssessments from "./pages/admin/Tests-Assessments";
import LoginPage from "./pages/admin/AdminLogin";
import ProtectedRoute from "./routes/ProtectedRoute";
import PageNotFound from "./common/PageNotFound";

function App() {
  return (
    <Router>
         <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute  />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/candidates" element={<Candidate />} />
          <Route path="/admin/tests" element={<TestsAssessments />} />
          <Route path="/admin/video" element={<AIVideoInterview />} />
          <Route path="/admin/reports" element={<Reports />} />
        </Route>

        {/* ✅ 404 Route (Always Last) */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
