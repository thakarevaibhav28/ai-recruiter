import { useState } from "react";
import AdminLayout from "../../common/AdminLayout";
import {
  Upload,
  Sparkles,
  Mail,
  Calendar,
  Copy,
  Send,
  Search,
  Filter,
  FileText,
} from "lucide-react";

const AIVideoInterview = () => {
  const [activeTab, setActiveTab] = useState("setup");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [interviewLink, setInterviewLink] = useState("");

  const handleGenerateAndSend = () => {
    // Generate a sample interview link
    const link = "ai.interview.co/616a407b@gmail.com";
    setInterviewLink(link);
    setShowEmailForm(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(interviewLink);
    // You can add a toast notification here
  };

  return (
    <AdminLayout
      heading="AI Video Interview"
      subheading="AI-powered video interviews with HuggingFace"
      showSearch={false}
    >
      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        {/* Tabs */}
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("setup")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === "setup"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Interview Setup
          </button>

          <button
            onClick={() => setActiveTab("template")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === "template"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            AI Interview Template
          </button>
        </div>

        {/* Right Side Controls */}
        {activeTab === "template" && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search"
                className="pl-9 pr-4 py-2 w-64 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
              />
            </div>

            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        )}
      </div>

      {/* Interview Setup Tab */}
      {activeTab === "setup" && (
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - AI Generator */}
          <div className="space-y-6">
            {/* AI Generator Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    AI - Powered Interview Generator
                  </h3>
                  <p className="text-sm text-gray-500">
                    Auto generate interview using intelligent questions
                  </p>
                </div>
              </div>

              {/* Job Descriptions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Descriptions
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Drag and drop your Job descriptions file here, or
                      </p>
                      <label className="mt-2 inline-block">
                        <span className="text-sm text-indigo-600 font-medium cursor-pointer hover:text-indigo-700">
                          Browse Files
                        </span>
                        <input type="file" className="hidden" />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Supported: PDF, DOC, TXT, max 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Description Text */}
              <div className="mb-6">
                <textarea
                  placeholder="Paste your job descriptions here..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Dropdowns */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Questions
                  </label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none bg-white">
                    <option>Select Duration</option>
                    <option>5 Questions</option>
                    <option>10 Questions</option>
                    <option>15 Questions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none bg-white">
                    <option>Select Level</option>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="h-4 w-4" />
                  Generate & Save as template
                </button>
                <button
                  onClick={handleGenerateAndSend}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate & Send Invites
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Email Invitations */}
          <div className="space-y-6">
            {!showEmailForm ? (
              /* Initial State */
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Email Invitations
                    </h3>
                    <p className="text-sm text-gray-500">
                      Customize and send interview invitations
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Mail className="h-16 w-16 text-gray-300 mb-4" />
                  <h4 className="text-base font-medium text-gray-900 mb-2">
                    Ready To Send Invitations ?
                  </h4>
                  <p className="text-sm text-gray-500">
                    Generate AI questions first to create email templates
                  </p>
                </div>
              </div>
            ) : (
              /* Email Form State */
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Email Invitations
                    </h3>
                    <p className="text-sm text-gray-500">
                      Customize and send interview invitations
                    </p>
                  </div>
                </div>

                {/* Candidates */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Candidates
                    </label>
                    <span className="text-xs text-indigo-600">
                      1 Candidate Added
                    </span>
                  </div>
                  <input
                    type="text"
                    defaultValue="Select candidates to invite"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  />
                </div>

                {/* Subject Line */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    defaultValue="Invitation to complete your AI video Interview"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  />
                </div>

                {/* Message Body */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Body
                  </label>
                  <textarea
                    rows={6}
                    defaultValue={`Hi [Candidate Name],

You have been invited to complete an AI- powered interview for the [Job-title ] position. Please use the link below to complete the interview by [Date].

[Interview link]`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* Auto Generated Link */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto - Generated Interview Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={interviewLink}
                      readOnly
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-600"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </button>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Pick a date"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Mail className="h-4 w-4" />
                    Preview Email
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                    <Send className="h-4 w-4" />
                    Send Invitations
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Interview Template Tab */}
      {activeTab === "template" && (
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-white rounded-lg border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">
                  React Frontend Assessment
                </h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <FileText className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">Frontend Developer</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Skillset</span>
                  <span className="text-gray-900">React, JavaScript,HTML</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">15 questions</span>
                  <span className="text-gray-900">2025-07-05</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-4">Last Use:3 days ago</p>

              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                Use
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AIVideoInterview;
