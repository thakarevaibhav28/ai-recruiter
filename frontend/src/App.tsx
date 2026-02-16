import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./pages/admin/AdminDashboard";
import Candidate from "./pages/admin/AdminCandidate";
import Reports from "./pages/admin/ReportsInsights";
import AIVideoInterview from "./pages/admin/AIVideoInterview";

import TestsAssessments from "./pages/admin/Tests-Assessments";

import "./App.css";
import LoginPage from "./pages/admin/adminLogin";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin/login" element={<LoginPage />} />

          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/candidates" element={<Candidate />} />
          <Route path="/admin/tests" element={<TestsAssessments />} />
          <Route path="/admin/video" element={<AIVideoInterview />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<Reports />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
