import { useState } from "react";
import AdminLayout from "../../common/AdminLayout";
import {
  Search,
  SlidersHorizontal,
  Download,
  Eye,
  Calendar,
  Clock,
  MessageSquare,
  TrendingUp,
  Users,
  CheckCircle,
  FileText,
} from "lucide-react";

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

const candidates = [
  {
    name: "Yash Sharma",
    role: "Frontend Developer",
    score: "79%",
    status: "L1 Pass",
    submitted: "Dec21,2025",
    duration: "18 min",
    responses: 5,
    tech: "86.0%",
    comm: "90%",
    conf: "High",
    rel: "87%",
    highlight: true,
    summary:
      "Strong candidate with excellent communication and solid technical knowledge. Demonstrates good problem-solving abilities and shows enthusiasm for the role.",
  },
  {
    name: "Yash Sharma",
    role: "Frontend Developer",
    score: "79%",
    status: "Pending Review",
    submitted: "Dec21,2025",
    duration: "18 min",
    responses: 5,
  },
  {
    name: "Yash Sharma",
    role: "Frontend Developer",
    score: "79%",
    status: "Pending Review",
    submitted: "Dec21,2025",
    duration: "18 min",
    responses: 5,
  },
];

const mcqResults = [
  {
    id: 1,
    name: "Priya Sharma",
    email: "priyasharma@gmail.com",
    test: "Senior Frontend Developer",
    score: "87%",
    marks: "23/25",
    duration: "58 mins",
    completed: "Dec 28, 2:00PM",
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priyasharma@gmail.com",
    test: "Senior Frontend Developer",
    score: "Not Taken",
    marks: "22/25",
    duration: "45 mins",
    completed: "Dec 28, 2:00PM",
  },
  {
    id: 3,
    name: "Priya Sharma",
    email: "priyasharma@gmail.com",
    test: "Senior Frontend Developer",
    score: "95%",
    marks: "21/25",
    duration: "62 Mins",
    completed: "Dec 28, 2:00PM",
  },
];

const ReportsInsights = () => {
  const [activeTab, setActiveTab] = useState("ai");

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
            onClick={() => setActiveTab("ai")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "ai"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            AI Interview Result
          </button>

          <button
            onClick={() => setActiveTab("mcq")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "mcq"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            MCQ Test Result
          </button>
        </div>
      </div>

      {/* AI Interview Tab */}
      {activeTab === "ai" && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              AI Interview Result & L1 Screening
            </h2>
            <p className="text-sm text-gray-500">
              Showing 1-3 of 15 candidates
            </p>
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

          {/* Candidate Cards */}
          <div className="space-y-4">
            {candidates.map((candidate, i) => (
              <div
                key={i}
                className={`bg-white rounded-lg p-6 border ${
                  candidate.highlight
                    ? "border-indigo-500 border-2"
                    : "border-gray-200"
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-linear-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      YS
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {candidate.name}
                      </h3>
                      <p className="text-sm text-gray-500">{candidate.role}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Submitted: {candidate.submitted}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Duration: {candidate.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          Responses: {candidate.responses}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        candidate.status === "L1 Pass"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {candidate.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      Overall AI Score: {candidate.score}
                    </span>
                  </div>
                </div>

                {/* Expanded Content */}
                {candidate.highlight && (
                  <>
                    {/* Score Cards */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {[
                        { label: "Technical Skills", value: candidate.tech },
                        { label: "Communication", value: candidate.comm },
                        {
                          label: "Confidence",
                          value: candidate.conf,
                          highlight: true,
                        },
                        { label: "Relevance", value: candidate.rel },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-lg p-4 text-center"
                        >
                          <p className="text-xs text-gray-500 mb-1">
                            {item.label}
                          </p>
                          <p
                            className={`text-base font-semibold ${
                              item.highlight
                                ? "text-green-600"
                                : "text-gray-900"
                            }`}
                          >
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Assessment Summary */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <p className="text-xs text-gray-500 mb-1 font-medium">
                        Assessment summary
                      </p>
                      <p className="text-sm text-gray-700">
                        "{candidate.summary}"
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                        <Eye className="h-4 w-4" />
                        View Detailed Scorecard
                      </button>
                      <button className="flex items-center gap-2 px-5 py-2.5 text-gray-700 bg-white border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        <FileText className="h-4 w-4" />
                        AI Analysis Details
                      </button>
                      <button className="flex items-center gap-2 px-5 py-2.5 text-gray-700 bg-white border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        <MessageSquare className="h-4 w-4" />
                        Add Comments
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MCQ Test Tab */}
      {activeTab === "mcq" && (
        <div className="space-y-4">
          {/* Filters Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-900">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </div>
            <div className="grid grid-cols-5 gap-4 mb-4">
              <input
                placeholder="Enter Candidates name..."
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
              <input
                placeholder="All Score"
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
              <input
                placeholder="All Types"
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Start date"
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="End Date"
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Clear All
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-900">
                MCQ Test Result
              </h3>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                Export Result
              </button>
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
                  {mcqResults.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {row.id}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {row.name}
                        </div>
                        <div className="text-xs text-gray-500">{row.email}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {row.test}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {row.score}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {row.marks}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {row.duration}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {row.completed}
                      </td>
                      <td className="px-4 py-4">
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                          <Eye className="h-3.5 w-3.5" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ReportsInsights;
