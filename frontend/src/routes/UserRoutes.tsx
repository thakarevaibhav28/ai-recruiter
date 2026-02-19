import { Route, Routes } from "react-router-dom";
// import ProtectedRoute from "../routes/ProtectedRoute";
import PageNotFound from "../common/PageNotFound";
import ToastProvider from "../common/ToastProvider";
import UserLogin from "../pages/user/UserLogin";
import SystemCompatibilityCheck from "../pages/user/Systemcompatibilitycheck";
import IdentityVerification from "../pages/user/Identityverification";
import SelfieVerification from "../pages/user/Selfieverification";
import InterviewInstructions from "../pages/user/Interviewinstructions";
import MCQAssessment from "../pages/user/MCQAssessment";
import AssessmentCompleted from "../pages/user/AssessmentCompleted";
import SessionEnded from "../pages/user/SessionEnded";
import VideoInterview from "../pages/user/VideoInterview";
function App() {
  return (
    <>
      <ToastProvider />
      <Routes>
        {/* User Routes */}
        <Route path="/user/login/:id" element={<UserLogin />} />

        {/* <Route element={<ProtectedRoute redirectTo="/user/login" />}> */}
          <Route
            path="/user/:id/system-check"
            element={<SystemCompatibilityCheck />}
          />
          <Route
            path="/user/:id/Identity-verification"
            element={<IdentityVerification />}
          />
          <Route
            path="/user/:id/selfie-verification"
            element={<SelfieVerification />}
          />
          <Route
            path="/user/:id/interview-instruction"
            element={<InterviewInstructions />}
          />
          <Route path="/user/:id/mcq-assessment" element={<MCQAssessment />} />
          <Route
            path="/user/:id/video-interview"
            element={<VideoInterview />}
          />{" "}
          <Route
            path="/user/:id/assessment-complete"
            element={<AssessmentCompleted />}
          />{" "}
          <Route path="/user/:id/session-end" element={<SessionEnded />} />
        {/* </Route> */}
        {/* 404 Route */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
