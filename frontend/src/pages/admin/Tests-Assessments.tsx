import { useState } from "react";
import AdminLayout from "../../common/AdminLayout";
import {
  Filter,
  FileText,
  Clock,
  Calendar as CalendarIcon,
} from "lucide-react";

const templates = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  title: "React Frontend Assessment",
  role: "Frontend Developer",
  tech: "React and JavaScript",
  duration: "60 min",
  questions: "35 questions",
  lastUsed: "Last Use: 3 days ago",
  level: i % 3 === 0 ? "Advanced" : "Intermediate",
  score: i % 2 === 0 ? "85%" : "75%",
}));

const TestsAssessments = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");

  return (
    <AdminLayout
      heading="Tests & Assessments"
      subheading="Create and manage assessments"
      showSearch={false}
      activeMenuItem={activeMenuItem}
      onMenuItemClick={setActiveMenuItem}
    >
      {/* Tabs and Filter Button */}
      <div className="flex items-center justify-between mb-6">
        {/* Left: Tabs */}
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "create"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Create Assessments
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "templates"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Tests Templates
          </button>
        </div>

        {/* Right: Filter Button */}
        <button
          className={`${activeTab === "templates" ? "hidden" : "flex"} items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors`}
        >
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Create Assessments Tab */}
      {activeTab === "create" && (
        <div className="bg-white rounded-lg p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Create New Assessment
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Set up a new MCQ-based assessment for your candidates
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Row 1: Add Candidates, Start Date, End Date */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Candidates
                  <span className="ml-2 text-xs text-indigo-600">
                    1 Candidate Added
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Select Candidates to invite"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Pick a date"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Pick a date"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Row 2: Test Title, No. of questions */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Frontend Developer Assessment"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No. of questions
                </label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none appearance-none bg-white">
                  <option>e.g., 20</option>
                  <option>10</option>
                  <option>20</option>
                  <option>30</option>
                  <option>40</option>
                  <option>50</option>
                </select>
              </div>
            </div>

            {/* Row 3: Primary Skill, Passing Score% */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Skill
                </label>
                <input
                  type="text"
                  placeholder="e.g., Frontend Developer Assessment"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Score%
                </label>
                <input
                  type="text"
                  placeholder="e.g., 70"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Row 4: Secondary Skill, Select exam level */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Skill (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Frontend Developer Assessment"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select exam level
                </label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none appearance-none bg-white">
                  <option>e.g., Easy</option>
                  <option>Easy</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            {/* Row 5: Duration */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none appearance-none bg-white">
                  <option>Select duration</option>
                  <option>30 min</option>
                  <option>60 min</option>
                  <option>90 min</option>
                  <option>120 min</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="h-4 w-4" />
                Generate & Save as template
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate & Send Invites
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tests Templates Tab */}
      {activeTab === "templates" && (
        <div>
          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header Badges */}
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    {item.score}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      item.level === "Advanced"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {item.level}
                  </span>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">{item.role}</p>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{item.tech}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{item.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{item.questions}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{item.lastUsed}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                    Use
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    📄
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default TestsAssessments;
