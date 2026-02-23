import React from "react";
import { X, FileText, Download } from "lucide-react";

interface ViewCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateData: any;
}

const ViewCandidateModal: React.FC<ViewCandidateModalProps> = ({
  isOpen,
  onClose,
  candidateData,
}) => {
  if (!isOpen || !candidateData) return null;

  const { candidate, summary, interviews } = candidateData;

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleDownload = (pdfPath: string) => {
    const link = document.createElement("a");
    link.href = `${BASE_URL}/${pdfPath}`;
    link.download = pdfPath.split("/").pop() || "scorecard.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Candidate Profile
            </h2>
            <p className="text-sm text-gray-500">
              Complete performance overview
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-8">

          {/* ================= BASIC INFO ================= */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

            <div className="grid grid-cols-3 gap-4">
              <InfoCard label="Name" value={candidate.name} />
              <InfoCard label="Email" value={candidate.email} />
              <InfoCard label="Phone" value={candidate.mobile} />
              <InfoCard label="Role" value={candidate.role} />
              <InfoCard
                label="Experience"
                value={`${candidate.year_of_experience} years`}
              />
              <InfoCard label="Skills" value={candidate.key_Skills} />
            </div>
          </div>

          {/* ================= SUMMARY ================= */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>

            <div className="grid grid-cols-3 gap-4">
              <StatCard
                title="Total Interviews"
                value={summary.totalInterviews}
              />
              <StatCard title="Completed" value={summary.completed} />
              <StatCard title="Passed" value={summary.passed} />
            </div>
          </div>

          {/* ================= INTERVIEW TABLE ================= */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Interview History
            </h3>

            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 text-left">Title</th>
                    <th className="px-5 py-3 text-left">Type</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Score</th>
                    <th className="px-5 py-3 text-left">Result</th>
                    <th className="px-5 py-3 text-left">Scorecard</th>
                  </tr>
                </thead>

                <tbody>
                  {interviews.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-6 text-gray-400"
                      >
                        No interview records found
                      </td>
                    </tr>
                  ) : (
                    interviews.map((interview: any) => {
                      const passed =
                        interview.score >= interview.passingScore;

                      return (
                        <tr
                          key={interview.interviewId}
                          className="border-b border-gray-200 hover:bg-gray-50 transition"
                        >
                          <td className="px-5 py-4 font-medium">
                            {interview.title}
                          </td>

                          <td className="px-5 py-4">
                            <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full">
                              {interview.examType}
                            </span>
                          </td>

                          <td className="px-5 py-4 capitalize">
                            {interview.status}
                          </td>

                          <td className="px-5 py-4">
                            {interview.score} / {interview.passingScore}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                passed
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {passed ? "Passed" : "Failed"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {interview.pdfPath ? (
                              <button
                                onClick={() =>
                                  handleDownload(interview.pdfPath)
                                }
                                className="flex items-center gap-2 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                              >
                                <Download size={14} />
                                Download
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                Not Available
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= SMALL COMPONENTS ================= */

const InfoCard = ({ label, value }: any) => (
  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="font-medium text-gray-900">{value}</div>
  </div>
);

const StatCard = ({ title, value }: any) => (
  <div className="bg-indigo-50 rounded-xl p-6 text-center shadow-sm">
    <div className="text-sm text-gray-600 mb-1">{title}</div>
    <div className="text-3xl font-bold text-indigo-600">{value}</div>
  </div>
);

export default ViewCandidateModal;