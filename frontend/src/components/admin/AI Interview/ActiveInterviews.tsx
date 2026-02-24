import { Button } from "../../../ui/button";
import { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  Calendar as CalendarIcon,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Users,
} from "lucide-react";
import { adminService } from "../../../services/service/adminService";

interface ActiveInterviewsProps {
  onNavigateToInterviewSetup: (assessment: any) => void;
  onEditInterview: (assessment: any) => void;
}

const ActiveInterviews: React.FC<ActiveInterviewsProps> = ({
  onNavigateToInterviewSetup,
  onEditInterview,
}) => {
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [assessments, setAssessments] = useState<any[]>([]);
  console.log("Assessments:", assessments);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<any>(null);

  const handleViewCandidates = async (assessment: any) => {
    const res = await adminService.getDraft(assessment._id);
    setSelectedInterview(res.data);
    setIsResultOpen(true);
  };
  useEffect(() => {
    let isMounted = true;

    const loadAssessments = async () => {
      setTemplatesLoading(true);
      try {
        const res: any = await adminService.getDraft();
        console.log("API Response:", res);
        if (isMounted) {
          setAssessments(res.drafts);
        }
      } catch (error) {
        console.error("Error fetching assessments:", error);
      } finally {
        setTemplatesLoading(false);
      }
    };

    loadAssessments();

    return () => {
      isMounted = false;
    };
  }, []);

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);

    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  return (
    <div className=" flex  ">
      <div className="w-full">
        <div className="pt-12">
          {templatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-5 w-12 bg-gray-200 rounded-full" />
                    <div className="h-5 w-20 bg-gray-200 rounded-full" />
                  </div>
                  <div className="mb-4 space-y-2">
                    <div className="h-5 w-3/4 bg-gray-200 rounded" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-2/3 bg-gray-200 rounded" />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <div className="flex-1 h-9 bg-gray-200 rounded-lg" />
                    <div className="h-9 w-10 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : assessments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center w-full">
              <FileText className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No templates yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Create an assessment and save it as a template
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assessments.map((assessment: any) => (
                <div
                  key={assessment._id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Top badges */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {assessment.passing_score || 60}%
                    </span>

                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        assessment.difficulty === "Advanced"
                          ? "bg-orange-100 text-orange-600"
                          : assessment.difficulty === "Easy"
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {assessment.difficulty}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {assessment.test_title || assessment.position}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {assessment.primary_skill}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    {assessment.secondary_skill && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{assessment.secondary_skill}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{assessment.duration}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {assessment.no_of_questions ||
                            assessment.numberOfQuestions}{" "}
                          questions
                        </span>
                      </div>
                    </div>

                    {assessment.createdAt && (
                      <p className="text-xs text-gray-400">
                        Created{" "}
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => onNavigateToInterviewSetup(assessment)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Use
                    </button>
                    <button
                      onClick={() => handleViewCandidates(assessment)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      title="View Candidates"
                    >
                      <Users className="h-4 w-4" />
                    </button>
                    {/* NEW: spinner on the edit button while that specific item is loading */}
                    <button
                      onClick={() => onEditInterview(assessment)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      📄
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= CANDIDATE MODAL ================= */}
      {isResultOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsResultOpen(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
                 <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedInterview?.position}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Candidate Details
                  </p>
                </div>

                <button
                  onClick={() => setIsResultOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {selectedInterview.candidates &&
                selectedInterview.candidates.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            S.No
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            UserName
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Email
                          </th>
                          {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Password</th> */}
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Start Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            End Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Interview Link
                          </th> */}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedInterview.candidates.map(
                          (candidate: any, index: number) => (
                            <tr
                              key={candidate._id || index}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                                {candidate.candidateId.name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                                {candidate.candidateId.email}
                              </td>
                              {/* <td className="px-4 py-3 text-sm text-gray-900 font-mono">{candidate.password}</td> */}
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(
                                  candidate.start_Date,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(
                                  candidate.end_Date,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    candidate.status === "completed"
                                      ? "bg-green-100 text-green-700"
                                      : candidate.status === "in_progress"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {candidate.status.charAt(0).toUpperCase() +
                                    candidate.status.slice(1)}
                                </span>
                              </td>
                              {/* <td className="px-4 py-3 text-sm">
                                <a
                                  href={candidate.interviewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800 underline"
                                >
                                  Open Link
                                </a>
                              </td> */}
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">
                      No candidates assigned
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Candidates will appear here once they are invited
                    </p>
                  </div>
                )}
              </div>

              {/* <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button onClick={closeCandidateModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Close
              </button>
            </div> */}
            </div>
          </div>
      )}

      {isReminderOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Send Interview Reminders
              </h2>
              <button
                onClick={() => setIsReminderOpen(false)}
                className="text-red-500 text-2xl font-bold hover:opacity-75"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This will send email reminders to all 6 pending candidates for the
              Frontend Developer position. The reminder will include the
              interview link and instructions.
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                className="text-sm"
                onClick={() => setIsReminderOpen(false)}
              >
                Cancel
              </Button>
              <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm">
                Send Reminders
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveInterviews;