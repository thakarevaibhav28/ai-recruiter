import { Route, Routes } from "react-router-dom";
import ToastProvider from "../common/ToastProvider";
function AdminRoutes() {
  return (
    <>
      <ToastProvider />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/user/system-check" element={<SystemCompatibilityCheck />} />
      <Route
        path="/user/Identity-verification"
        element={<IdentityVerification />}
      />
      <Route
        path="/user/selfie-verification"
        element={<SelfieVerification />}
      />
      <Route
        path="/user/interview-instruction"
        element={<InterviewInstructions />}
      />
      <Route path="/user/mcq-assessment" element={<MCQAssessment />} />
      <Route path="/user/video-interview" element={<VideoInterview />} />{" "}
      <Route
        path="/user/assessment-complete"
        element={<AssessmentCompleted />}
      />{" "}
      <Route path="/user/session-end" element={<SessionEnded />} />
    </>
  );
}

export default AdminRoutes;

