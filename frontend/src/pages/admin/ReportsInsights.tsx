import { useState, useEffect } from "react";
import AdminLayout from "../../common/AdminLayout";
import { useAdminSocket } from "../../hooks/useAdminSocket";
import {
  Search,
  SlidersHorizontal,
  Eye,
  Calendar,
  Clock,
  MessageSquare,
  TrendingUp,
  Users,
  CheckCircle,
  FileText,
  X,
} from "lucide-react";
import { adminService } from "../../services/service/adminService";

interface ScoreType {
  _id: string;
  totalScore: number;
  maxScore: number;
  summary: string;
  pdfPath: string;
  createdAt: string;
  candidateId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  interviewId: {
    test_title?: string;
    position?: string;
    duration: string;
    examType: string;
    difficulty?: string;
    passing_score?: number;
  };
  updatedAt: string;
  examType?: string;
  feedback?: any;
  behaviorReport?: any;
  interview_id?: any;
  transcript?: any[];
  completedAt?: string;
  score?: number;
  scores?: any[];
}

const stats = [
  {
    title: "Average AI Score",
    value: "86.0%",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "L1 Pass Rate",
    value: "75%",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "AI Interviews Completed",
    value: "15",
    icon: CheckCircle,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    title: "L1 Pass Rate",
    value: "75%",
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

const TableSkeleton = () => {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          {[...Array(8)].map((__, j) => (
            <td key={j} className="px-4 py-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

const ReportsInsights = () => {
  const [activeTab, setActiveTab] = useState<"AI" | "MCQ">("AI");
  const [scores, setScores] = useState<ScoreType[]>([]);
  const [selectedScore, setSelectedScore] = useState<ScoreType | null>(null);
  const [showDetailedScorecard, setShowDetailedScorecard] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    minScore: "",
    maxScore: "",
    startDate: "",
    endDate: "",
  });

  const filteredScores = scores.filter((row) => {
    if (row.examType !== "MCQ" && activeTab === "MCQ") return false;

    const percentage = Math.round((row.totalScore / row.maxScore) * 100);

    const matchesName =
      !filters.name ||
      row.candidateId?.name?.toLowerCase().includes(filters.name.toLowerCase());

    const matchesMin =
      !filters.minScore || percentage >= Number(filters.minScore);

    const matchesMax =
      !filters.maxScore || percentage <= Number(filters.maxScore);

    const rowDate = new Date(row.updatedAt).getTime();
    const start = filters.startDate
      ? new Date(filters.startDate).getTime()
      : null;
    const end = filters.endDate ? new Date(filters.endDate).getTime() : null;

    const matchesStart = !start || rowDate >= start;
    const matchesEnd = !end || rowDate <= end;

    return (
      matchesName && matchesMin && matchesMax && matchesStart && matchesEnd
    );
  });

  const fetchScores = async (type: "AI" | "MCQ") => {
    try {
      setLoading(true);
      const res = await adminService.getScore(type);

      if (res?.success) {
        if (type === "AI" && res.data) {
          setScores(res.data || []);
        } else {
          setScores(res.scores || []);
        }
      }
    } catch (err) {
      console.error("Error fetching scores:", err);
      setScores([]);
    } finally {
      setLoading(false);
    }
  };
  useAdminSocket({
    "interview-submitted": () => {
      fetchScores(activeTab);
    },
  });
  useEffect(() => {
    fetchScores(activeTab);
  }, [activeTab]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || "NA"
    );
  };

  const handleViewDetailedScorecard = (result: ScoreType) => {
    setSelectedScore(result);
    setShowDetailedScorecard(true);
  };

  const handleViewAIAnalysis = (result: ScoreType) => {
    setSelectedScore(result);
    setShowAIAnalysis(true);
  };

  return (
    <AdminLayout
      heading="Reports & Insights"
      subheading="View Reports and Insights"
      showSearch={false}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} rounded-lg p-2.5`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("AI")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "AI"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            AI Interview Result
          </button>

          <button
            onClick={() => setActiveTab("MCQ")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "MCQ"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            MCQ Test Result
          </button>
        </div>
      </div>

      {/* AI Interview Tab */}
      {activeTab === "AI" && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              AI Interview Result & L1 Screening
            </h2>
            <div className="text-sm text-gray-500">
              Showing 1-{scores.length} of {scores.length} candidates
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex justify-end gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search"
                className="pl-9 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
              Status
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {/* No Data State */}
          {!loading && scores.length === 0 && (
            <div className="w-full flex items-center justify-center py-12 text-gray-500">
              No Data Available
            </div>
          )}

          {/* AI Interview Results Cards */}
          <div className="space-y-4">
            {!loading &&
              scores.map((result) => {
                const candidate =
                  result.interview_id?.candidates?.[0]?.candidateId;
                const feedback = result.feedback;

                return (
                  <div
                    key={result._id}
                    className="bg-white rounded-xl p-6 border-2 border-indigo-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-lg font-semibold">
                          {getInitials(feedback?.candidateName || "NA")}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {feedback?.candidateName || "Unknown Candidate"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {feedback?.role || "N/A"}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Submitted:{" "}
                              {formatDate(
                                result.completedAt || result.createdAt,
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              Duration: {result.interview_id?.duration || "N/A"}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3.5 w-3.5" />
                              Responses: {result.transcript?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                            feedback?.overallVerdict === "accept" ||
                            feedback?.overallVerdict === "hire"
                              ? "bg-green-100 text-green-700"
                              : feedback?.overallVerdict === "reject"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {feedback?.overallVerdict}
                        </span>
                        <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
                          Overall AI Score: {result.score || 0}%
                        </span>
                      </div>
                    </div>

                    {/* Score Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                        <p className="text-xs text-gray-600 mb-2 font-medium">
                          Technical Skills
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {feedback?.technicalScore || 0}%
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                        <p className="text-xs text-gray-600 mb-2 font-medium">
                          Communication
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {feedback?.speechPatterns?.clarityScore || 0}%
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                        <p className="text-xs text-gray-600 mb-2 font-medium">
                          Confidence
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          {feedback?.confidenceLabel || "N/A"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                        <p className="text-xs text-gray-600 mb-2 font-medium">
                          Relevance
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {feedback?.relevanceScore || 0}%
                        </p>
                      </div>
                    </div>

                    {/* Assessment Summary */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
                      <p className="text-xs text-gray-600 mb-2 font-semibold">
                        Assessment summary
                      </p>
                      <p className="text-sm text-gray-800 italic">
                        "{feedback?.verdictReason || "No summary available"}"
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewDetailedScorecard(result)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View Detailed Scorecard
                      </button>
                      <button
                        onClick={() => handleViewAIAnalysis(result)}
                        className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border-2 border-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        AI Analysis Details
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* MCQ Test Tab */}
      {activeTab === "MCQ" && (
        <div className="space-y-4">
          {/* Filters Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-900">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </div>

            <div className="grid grid-cols-5 gap-4 mb-4">
              <input
                placeholder="Candidate Name..."
                value={filters.name}
                onChange={(e) =>
                  setFilters({ ...filters, name: e.target.value })
                }
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none"
              />
              <input
                type="number"
                placeholder="Min Score %"
                value={filters.minScore}
                onChange={(e) =>
                  setFilters({ ...filters, minScore: e.target.value })
                }
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none"
              />
              <input
                type="number"
                placeholder="Max Score %"
                value={filters.maxScore}
                onChange={(e) =>
                  setFilters({ ...filters, maxScore: e.target.value })
                }
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none"
              />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setFilters({
                    name: "",
                    minScore: "",
                    maxScore: "",
                    startDate: "",
                    endDate: "",
                  })
                }
                className="px-4 py-2 text-sm bg-blue-700 text-white rounded-lg"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-900">
                MCQ Test Result
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sr. No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidates
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Marks
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <TableSkeleton />
                  ) : filteredScores.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-6 text-gray-500"
                      >
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    filteredScores.map((row, i) => (
                      <tr key={row._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm">{i + 1}</td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium">
                            {row.candidateId.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {row.candidateId.email}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {row.interviewId.test_title}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {Math.round((row.totalScore / row.maxScore) * 100)}%
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {row.totalScore}/{row.maxScore}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {row.interviewId.duration}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {formatDate(row.updatedAt)}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => setSelectedScore(row)}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* MCQ Modal */}
            {selectedScore && selectedScore.examType === "MCQ" && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white w-[1200px] max-h-[95vh] overflow-y-auto rounded-xl shadow-2xl p-6 relative animate-fadeIn">
                  <button
                    onClick={() => setSelectedScore(null)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
                  >
                    ✕
                  </button>

                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Exam Detailed Report
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedScore.interviewId.test_title}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Candidate Details
                      </h3>
                      <p>
                        <strong>Name:</strong> {selectedScore.candidateId.name}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {selectedScore.candidateId.email}
                      </p>
                      <p>
                        <strong>Role:</strong> {selectedScore.candidateId.role}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Exam Details
                      </h3>
                      <p>
                        <strong>Difficulty:</strong>{" "}
                        {selectedScore.interviewId.difficulty}
                      </p>
                      <p>
                        <strong>Duration:</strong>{" "}
                        {selectedScore.interviewId.duration}
                      </p>
                      <p>
                        <strong>Passing Score:</strong>{" "}
                        {selectedScore.interviewId.passing_score}%
                      </p>
                      <p>
                        <strong>Completed:</strong>{" "}
                        {formatDate(selectedScore.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-5 rounded-lg mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Overall Score
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-indigo-600">
                          {Math.round(
                            (selectedScore.totalScore /
                              selectedScore.maxScore) *
                              100,
                          )}
                          %
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedScore.totalScore}/{selectedScore.maxScore}
                        </p>
                      </div>
                      <a
                        href={selectedScore.pdfPath}
                        download
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                      >
                        Download Scorecard
                      </a>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      AI Assessment Summary
                    </h3>
                    <p className="text-sm text-gray-700">
                      {selectedScore.summary}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                      Question Wise Analysis
                    </h3>
                    <div className="space-y-4">
                      {selectedScore.scores?.map((q, index) => {
                        const question = q.questionId;
                        const candidateAnswer = question.answers?.find(
                          (a: any) =>
                            a.candidateId === selectedScore.candidateId._id,
                        );
                        const isCorrect =
                          candidateAnswer?.answerText ===
                          question.correctAnswer;

                        return (
                          <div
                            key={q._id}
                            className="border border-gray-100 rounded-lg p-4 bg-gray-50"
                          >
                            <p className="font-medium text-gray-900 mb-2">
                              Q{index + 1}. {question.questionText}
                            </p>
                            {question.options && (
                              <div className="space-y-1 mb-3">
                                {question.options.map(
                                  (opt: string, i: number) => (
                                    <div
                                      key={i}
                                      className={`text-sm px-3 py-1 rounded-md ${
                                        opt === question.correctAnswer
                                          ? "bg-green-100 text-green-700"
                                          : opt === candidateAnswer?.answerText
                                            ? "bg-red-100 text-red-700"
                                            : "bg-white"
                                      }`}
                                    >
                                      {opt}
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-sm">
                                <span className="font-medium">
                                  Candidate Answer:
                                </span>{" "}
                                {candidateAnswer?.answerText || "Not Answered"}
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                                    isCorrect
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {isCorrect ? "Correct" : "Wrong"}
                                </span>
                                <span className="text-sm font-semibold">
                                  Score: {q.score}
                                </span>
                              </div>
                            </div>
                            {q.feedback && (
                              <p className="mt-2 text-sm text-gray-600">
                                Feedback: {q.feedback}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Scorecard Modal */}
      {showDetailedScorecard && selectedScore && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Detailed Scorecard -{" "}
                  {selectedScore.interview_id?.candidates?.[0]?.candidateId
                    ?.name || "Candidate"}
                </h2>
              </div>
              <button
                onClick={() => setShowDetailedScorecard(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              {/* Overall Performance */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Overall Performance
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-semibold">✓</span>
                      <span className="text-sm font-medium text-gray-700">
                        L1 Screening: PASSED
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-indigo-600">
                      {selectedScore.score ||
                        selectedScore.feedback?.totalScore ||
                        0}
                      %
                    </div>
                    <div className="text-sm text-gray-600">AI Score</div>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Technical Assessment */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Technical Assessment
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        Problem Solving
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: "90%" }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          90%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        Code Quality
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: "85%" }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          85%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        System Design
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-500 rounded-full"
                            style={{ width: "80%" }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          80%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Communication Skills */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Communication Skills
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        Clarity of Expression
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: "90%" }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          90%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        Technical Explanation
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: "90%" }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          90%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        Listening Skills
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: "90%" }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          90%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Strengths and Areas for Improvement */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-green-800 mb-4">
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-green-700">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>Excellent problem-solving approach</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-green-700">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>Clear and concise communication</span>
                    </li>

                    <li className="flex items-start gap-2 text-sm text-green-700">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span> Strong understanding of React concepts</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-green-700">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>Good knowledge of modern web technologies</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="text-lg font-bold text-red-800 mb-4">
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {selectedScore.feedback?.technicalCompetency
                      ?.filter((t: any) => t.status === "bad")
                      .slice(0, 3)
                      .map((item: any, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-red-700"
                        >
                          <span className="text-red-600 mt-0.5">•</span>
                          <span>{item.title || item.description}</span>
                        </li>
                      )) || (
                      <>
                        <li className="flex items-start gap-2 text-sm text-red-700">
                          <span className="text-red-600 mt-0.5">•</span>
                          <span>System design could be more detail</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Details Modal */}
      {showAIAnalysis && selectedScore && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  AI Analysis Details -{" "}
                  {selectedScore.interview_id?.candidates?.[0]?.candidateId
                    ?.name || "Candidate"}
                </h2>
              </div>
              <button
                onClick={() => setShowAIAnalysis(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              {/* AI Confidence Analysis */}
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    AI Confidence Analysis
                  </h3>
                  <span className="px-4 py-1.5 bg-purple-200 text-purple-800 text-sm font-bold rounded-full">
                    High Confidence:{" "}
                    {selectedScore.feedback?.confidenceScore || 94}%
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Our AI model analyzed speech patterns, response timing,
                  technical accuracy, and communication clarity to generate this
                  assessment with high confidence.
                </p>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Behavioral Insights */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Behavioral Insights
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {selectedScore.feedback?.behavioralInsights
                      ?.slice(0, 3)
                      .map((insight: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle
                            className={`h-5 w-5 mt-0.5 ${insight.status === "good" ? "text-green-600" : "text-yellow-600"}`}
                          />
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              {insight.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      )) || (
                      <>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              Confident Communication
                            </p>
                            <p className="text-xs text-gray-600">
                              Minimal hesitation, clear articulation
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              Structured Thinking
                            </p>
                            <p className="text-xs text-gray-600">
                              Logical flow in problem-solving approach
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Technical Competency */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Technical Competency
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {selectedScore.feedback?.technicalCompetency
                      ?.slice(0, 3)
                      .map((comp: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle
                            className={`h-5 w-5 mt-0.5 ${comp.status === "good" ? "text-green-600" : "text-yellow-600"}`}
                          />
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              {comp.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              {comp.description}
                            </p>
                          </div>
                        </div>
                      )) || (
                      <>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              Strong Fundamentals
                            </p>
                            <p className="text-xs text-gray-600">
                              Solid understanding of core concepts
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              Practical Experience
                            </p>
                            <p className="text-xs text-gray-600">
                              Real-world examples and applications
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Speech Pattern Analysis */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Speech Pattern Analysis
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedScore.feedback?.speechPatterns?.clarityScore ||
                        0}
                      %
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Clarity Score
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-3xl font-bold text-green-600">
                      {selectedScore.feedback?.speechPatterns
                        ?.avgResponseTime || "1.2"}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Avg Response Time
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600">
                      {selectedScore.feedback?.confidenceScore || 89}%
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Confidence Level
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="text-3xl font-bold text-orange-600">
                      {selectedScore.feedback?.speechPatterns
                        ?.complexityScore || "4.2"}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Complexity Score
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  AI Recommendations
                </h3>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-700 font-bold text-xs">!</span>
                  </div>
                  <p className="text-sm text-gray-800">
                    {selectedScore.feedback?.recommendations?.[0] ||
                      "Proceed to next round: Candidate shows strong potential and aligns well with role requirements."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ReportsInsights;
