import { useState, useEffect } from "react";
import AdminLayout from "../../common/AdminLayout";
import {
  Filter,
  FileText,
  Clock,
  Calendar as CalendarIcon,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import axios from "axios";

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
  const [formData, setFormData] = useState({
    candidates: [],
    startDate: "",
    endDate: "",
    testTitle: "",
    noOfQuestions: "",
    primarySkill: "",
    passingScore: "",
    secondarySkill: "",
    examLevel: "",
    duration: "",
    jobDescription: null,
  });
  const [errors, setErrors] = useState({});
  const [candidatesList, setCandidatesList] = useState<any>();
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Fetch candidates from API
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get("/api/candidates");
      if(response.data.length === 0){
      setCandidatesList(response.data);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleFileUpload = (e:any) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          jobDescription: "Please upload a PDF or DOC file",
        }));
        return;
      }
      handleInputChange("jobDescription", file);
    }
  };
  console.log("!11111111111111",candidatesList)

  const removeFile = () => {
    handleInputChange("jobDescription", null);
    // Reset file input
    document.getElementById("jd-upload").value = "";
  };

  const toggleCandidateSelection = (candidate:any) => {
    const isSelected = formData.candidates.some(
      (c:any) => c._id === candidate._id
    );
    if (isSelected) {
      handleInputChange(
        "candidates",
        formData.candidates.filter((c:any) => c._id !== candidate._id)
      );
    } else {
      handleInputChange("candidates", [...formData.candidates, candidate]);
    }
  };

  const removeCandidateChip = (candidateId:any) => {
    handleInputChange(
      "candidates",
      formData.candidates.filter((c:any) => c._id !== candidateId)
    );
  };

  const filteredCandidates = candidatesList?.filter((candidate:any) =>
    `${candidate.name} ${candidate.email}`
      .toLowerCase()
      .includes(candidateSearch.toLowerCase())
  );

  const validateForm = (requireCandidates = false) => {
    const newErrors = {};

    if (requireCandidates && formData.candidates.length === 0) {
      newErrors.candidates =
        "Please select at least one candidate to send invites";
    }
    if (!formData.startDate)
      newErrors.startDate = "Start date is required";
    if (!formData.endDate) 
      newErrors.endDate = "End date is required";
    if (!formData.testTitle)
      newErrors.testTitle = "Test title is required";
    if (!formData.noOfQuestions)
      newErrors.noOfQuestions = "Number of questions is required";
    if (!formData.primarySkill)
      newErrors.primarySkill = "Primary skill is required";
    if (!formData.passingScore)
      newErrors.passingScore = "Passing score is required";
    if (!formData.examLevel)
      newErrors.examLevel = "Exam level is required";
    if (!formData.duration) 
      newErrors.duration = "Duration is required";

    // Validate date range
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    // Validate passing score
    if (formData.passingScore) {
      const score = parseInt(formData.passingScore);
      if (isNaN(score) || score < 0 || score > 100) {
        newErrors.passingScore = "Score must be between 0 and 100";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateAndSave = async () => {
    if (!validateForm(false)) {
      setSubmitStatus({
        type: "error",
        message: "Please fill all required fields correctly",
      });
      setTimeout(() => setSubmitStatus(null), 4000);
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("difficulty", formData.examLevel);
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("test_title", formData.testTitle);
      formDataToSend.append("no_of_questions", formData.noOfQuestions);
      formDataToSend.append("primary_skill", formData.primarySkill);
      formDataToSend.append("secondary_skill", formData.secondarySkill || "");
      formDataToSend.append("passing_score", formData.passingScore);
      if (formData.jobDescription) {
        formDataToSend.append("jobDescription", formData.jobDescription);
      }

      const response = await axios.post(
        "http://192.168.31.223:3000/api/admin/assessment/template",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSubmitStatus({
        type: "success",
        message: "Assessment template created successfully!",
      });
      setTimeout(() => {
        setSubmitStatus(null);
        // Reset form
        setFormData({
          candidates: [],
          startDate: "",
          endDate: "",
          testTitle: "",
          noOfQuestions: "",
          primarySkill: "",
          passingScore: "",
          secondarySkill: "",
          examLevel: "",
          duration: "",
          jobDescription: null,
        });
      }, 2000);
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to create template",
      });
      setTimeout(() => setSubmitStatus(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAndSendInvites = async () => {
    if (!validateForm(true)) {
      setSubmitStatus({
        type: "error",
        message: "Please fill all required fields and select candidates",
      });
      setTimeout(() => setSubmitStatus(null), 4000);
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("difficulty", formData.examLevel);
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("test_title", formData.testTitle);
      formDataToSend.append("no_of_questions", formData.noOfQuestions);
      formDataToSend.append("primary_skill", formData.primarySkill);
      formDataToSend.append("secondary_skill", formData.secondarySkill || "");
      formDataToSend.append("passing_score", formData.passingScore);
      formDataToSend.append("start_date", formData.startDate);
      formDataToSend.append("end_date", formData.endDate);
      formDataToSend.append(
        "candidates",
        JSON.stringify(formData.candidates.map((c) => c._id))
      );
      if (formData.jobDescription) {
        formDataToSend.append("jobDescription", formData.jobDescription);
      }

      const response = await axios.post(
        "/api/assessments/send-invites",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSubmitStatus({
        type: "success",
        message: `Invitations sent successfully to ${formData.candidates.length} candidate(s)!`,
      });
      setTimeout(() => {
        setSubmitStatus(null);
        // Reset form
        setFormData({
          candidates: [],
          startDate: "",
          endDate: "",
          testTitle: "",
          noOfQuestions: "",
          primarySkill: "",
          passingScore: "",
          secondarySkill: "",
          examLevel: "",
          duration: "",
          jobDescription: null,
        });
      }, 2000);
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to send invites",
      });
      setTimeout(() => setSubmitStatus(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      heading="Tests & Assessments"
      subheading="Create and manage assessments"
      showSearch={false}
      activeMenuItem={activeMenuItem}
      onMenuItemClick={setActiveMenuItem}
    >
      {/* Status Toast */}
      {submitStatus && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            submitStatus.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {submitStatus.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <span
            className={`text-sm font-medium ${
              submitStatus.type === "success"
                ? "text-green-800"
                : "text-red-800"
            }`}
          >
            {submitStatus.message}
          </span>
        </div>
      )}

      {/* Tabs and Filter Button */}

      <div className="flex items-center justify-between mb-6 ">
        {/* Left: Tabs */}
        <div className="inline-flex bg-white rounded-lg p-2">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "create"
                ? "bg-[#F4F7FE] text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Create Assessments
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "templates"
                ? "bg-[#F4F7FE] text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Tests Templates
          </button>
        </div>

        {/* Right: Filter Button */}
        <button
          className={`${
            activeTab === "templates" ? "hidden" : "flex"
          } items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors`}
        >
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Create Assessments Tab */}
      {activeTab === "create" && (
        <>
          <div className=" rounded-lg p-5 bg-white">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6 ">
              <div className="w-12 h-12 rounded flex items-center justify-center text-white shrink-0">
                <img src={Brain} alt="" />
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
              {/* Candidates Multiselect */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Candidates
                  <span className="ml-2 text-xs text-gray-500">
                    (Optional)
                  </span>
                  {formData.candidates.length > 0 && (
                    <span className="ml-2 text-xs text-indigo-600">
                      {formData.candidates.length} Selected
                    </span>
                  )}
                </label>
                <div
                  className={`w-full min-h-[42px] px-3 py-2 border rounded-lg cursor-pointer transition-all ${
                    errors.candidates
                      ? "border-red-300 bg-red-50 ring-2 ring-red-100"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setShowCandidateDropdown(!showCandidateDropdown)}
                >
                  {formData.candidates.length === 0 ? (
                    <span className="text-gray-400 text-sm">
                      Select Candidates to invite
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.candidates.map((candidate) => (
                        <span
                          key={candidate._id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md"
                        >
                          {candidate.name}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-indigo-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCandidateChip(candidate._id);
                            }}
                          />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {errors.candidates && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {errors.candidates}
                    </span>
                  </div>
                )}

                {/* Dropdown */}
                {showCandidateDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search candidates..."
                        value={candidateSearch}
                        onChange={(e) => setCandidateSearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredCandidates.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No candidates found
                        </div>
                      ) : (
                        filteredCandidates.map((candidate) => (
                          <div
                            key={candidate._id}
                            className={`px-4 py-2 cursor-pointer transition-colors ${
                              formData.candidates.some(
                                (c) => c._id === candidate._id
                              )
                                ? "bg-indigo-50 hover:bg-indigo-100"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCandidateSelection(candidate);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {candidate.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {candidate.email}
                                </div>
                              </div>
                              {formData.candidates.some(
                                (c) => c._id === candidate._id
                              ) && (
                                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${
                      errors.startDate
                        ? "border-red-300 bg-red-50 ring-2 ring-red-100 focus:ring-red-200"
                        : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    }`}
                  />
                  {errors.startDate && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <span className="text-xs text-red-600">
                        {errors.startDate}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${
                      errors.endDate
                        ? "border-red-300 bg-red-50 ring-2 ring-red-100 focus:ring-red-200"
                        : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    }`}
                  />
                  {errors.endDate && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <span className="text-xs text-red-600">
                        {errors.endDate}
                      </span>
                    </div>
                  )}
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
                  value={formData.testTitle}
                  onChange={(e) =>
                    handleInputChange("testTitle", e.target.value)
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${
                    errors.testTitle
                      ? "border-red-300 bg-red-50 ring-2 ring-red-100 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  }`}
                />
                {errors.testTitle && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {errors.testTitle}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No. of questions
                </label>
                <select
                  value={formData.noOfQuestions}
                  onChange={(e) =>
                    handleInputChange("noOfQuestions", e.target.value)
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none appearance-none bg-white transition-all ${
                    errors.noOfQuestions
                      ? "border-red-300 bg-red-50 ring-2 ring-red-100 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  }`}
                >
                  <option value="">Select number of questions</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="40">40</option>
                  <option value="50">50</option>
                </select>
                {errors.noOfQuestions && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {errors.noOfQuestions}
                    </span>
                  </div>
                )}
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
                  placeholder="e.g., React.js"
                  value={formData.primarySkill}
                  onChange={(e) =>
                    handleInputChange("primarySkill", e.target.value)
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${
                    errors.primarySkill
                      ? "border-red-300 bg-red-50 ring-2 ring-red-100 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  }`}
                />
                {errors.primarySkill && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {errors.primarySkill}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Score%
                </label>
                <input
                  type="number"
                  placeholder="e.g., 70"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={(e) =>
                    handleInputChange("passingScore", e.target.value)
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${
                    errors.passingScore
                      ? "border-red-300 bg-red-50 ring-2 ring-red-100 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  }`}
                />
                {errors.passingScore && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {errors.passingScore}
                    </span>
                  </div>
                )}
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
                  placeholder="e.g., TypeScript"
                  value={formData.secondarySkill}
                  onChange={(e) =>
                    handleInputChange("secondarySkill", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select exam level
                </label>
                <select
                  value={formData.examLevel}
                  onChange={(e) =>
                    handleInputChange("examLevel", e.target.value)
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none appearance-none bg-white transition-all ${
                    errors.examLevel
                      ? "border-red-300 bg-red-50 ring-2 ring-red-100 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  }`}
                >
                  <option value="">Select difficulty level</option>
                  <option value="Easy">Easy</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                {errors.examLevel && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {errors.examLevel}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Row 5: Duration, Upload JD */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) =>
                    handleInputChange("duration", e.target.value)
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none appearance-none bg-white transition-all ${
                    errors.duration
                      ? "border-red-300 bg-red-50 ring-2 ring-red-100 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  }`}
                >
                  <option value="">Select duration</option>
                  <option value="30 min">30 min</option>
                  <option value="60 min">60 min</option>
                  <option value="90 min">90 min</option>
                  <option value="120 min">120 min</option>
                </select>
                {errors.duration && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {errors.duration}
                    </span>
                  </div>
                )}
              </div>

              {/* Upload JD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Job Description (Optional)
                </label>
                {!formData.jobDescription ? (
                  <label
                    htmlFor="jd-upload"
                    className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                      errors.jobDescription
                        ? "border-red-300 bg-red-50 hover:bg-red-100"
                        : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                    }`}
                  >
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Upload PDF or DOC
                    </span>
                    <input
                      id="jd-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm text-gray-700 truncate max-w-[200px]">
                        {formData.jobDescription.name}
                      </span>
                    </div>
                    <button
                      onClick={removeFile}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {errors.jobDescription && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {errors.jobDescription}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleGenerateAndSave}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-4 w-4" />
                {loading ? "Saving..." : "Generate & Save as template"}
              </button>
              <button
                onClick={handleGenerateAndSendInvites}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
                {loading ? "Sending..." : "Generate & Send Invites"}
              </button>
            </div>
          </div>
          </div>
          </>
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