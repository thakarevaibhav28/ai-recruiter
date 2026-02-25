import React, { useMemo, useState } from "react";
import { X, Download, Loader2 } from "lucide-react";

interface ViewCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateData: any;
}

const ROWS_PER_PAGE = 5;

const ViewCandidateModal: React.FC<ViewCandidateModalProps> = ({
  isOpen,
  onClose,
  candidateData,
}) => {
  if (!isOpen || !candidateData) return null;

  const { candidate, summary, interviews } = candidateData;
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [examFilter, setExamFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [page, setPage] = useState(1);
  // const [downloadingId, setDownloadingId] = useState<string | null>(null);

  /* ================= DOWNLOAD HANDLER ================= */
  // const handleDownload = (pdfPath: string) => {
  //   const link = document.createElement("a");
  //   link.href = `${BASE_URL}/${pdfPath}`;
  //   link.download = pdfPath.split("/").pop() || "scorecard.pdf";
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };
  /* ================= FILTER LOGIC ================= */
  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview: any) => {
      const passed = interview.score >= interview.passingScore;

      const examMatch =
        examFilter === "all" || interview.examType === examFilter;

      const resultMatch =
        resultFilter === "all" ||
        (resultFilter === "pass" && passed) ||
        (resultFilter === "fail" && !passed);

      return examMatch && resultMatch;
    });
  }, [interviews, examFilter, resultFilter]);
  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredInterviews.length / ROWS_PER_PAGE);

  const paginatedData = filteredInterviews.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );
  console.log("filteredInterviews", paginatedData);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold">Candidate Profile</h2>
            <p className="text-sm text-gray-500">
              Complete performance overview
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-8">
          {/* ================= BASIC INFO ================= */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
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

          {/* ================= FILTERS ================= */}
          <div className="flex gap-4 items-center justify-end">
            <select
              value={examFilter}
              onChange={(e) => {
                setExamFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-200 px-4 py-2 rounded-lg text-sm outline-none"
            >
              <option value="all">All Exam Types</option>
              <option value="MCQ">MCQ</option>
              <option value="AI">AI</option>
            </select>

            <select
              value={resultFilter}
              onChange={(e) => {
                setResultFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-200 px-4 py-2 rounded-lg text-sm outline-none"
            >
              <option value="all">All Results</option>
              <option value="pass">Passed</option>
              <option value="fail">Failed</option>
            </select>
          </div>

          {/* ================= INTERVIEW TABLE ================= */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
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
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-400">
                      No interview records found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((interview: any) => {
                    const passed = interview.score >= interview.passingScore;
                    // const isDownloading = downloadingId === interview.interviewId;

                    return (
                      <tr
                        key={interview.interviewId}
                        className="border-b border-gray-200 hover:bg-gray-50"
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
                             <a
                        href={interview.pdfPath}
                        download
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                      >
                        Download Scorecard
                      </a>
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

          {/* ================= PAGINATION ================= */}
          {totalPages > 1 && (
            <div className="flex justify-end items-center gap-2 pt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border border-gray-200 rounded disabled:opacity-40"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded ${
                    page === p
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border border-gray-200 rounded disabled:opacity-40"
              >
                ›
              </button>
            </div>
          )}
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
