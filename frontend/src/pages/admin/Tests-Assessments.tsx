import { useState, useEffect, useRef } from "react";
import AdminLayout from "../../common/AdminLayout";
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
import { adminService } from "../../services/service/adminService";

const EMPTY_FORM = {
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
  secondry_jobDescription:"",
  jobDescriptionText: "",
  secondry_jobDescription: "",
};

const TestsAssessments = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [candidatesList, setCandidatesList] = useState([]);
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [mode, setMode] = useState("create");
  const [id, setActiveAssessmentId] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [jdLoading, setJdLoading] = useState(false);
  const [jdAnalysis, setJdAnalysis] = useState(null);
  const [jdError, setJdError] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  // NEW: loaders for fetchCandidates and handleEditTemplate
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(null); // stores item._id being edited
  const candidateDropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e: any) => {
      if (candidateDropdownRef.current && !candidateDropdownRef.current.contains(e.target))
        setShowCandidateDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { fetchCandidates(); }, []);
  useEffect(() => { if (activeTab === "templates") fetchAssessments(); }, [activeTab]);

  const fetchCandidates = async () => {
    setCandidatesLoading(true);
    try {
      const response = await adminService.getAllCandidate();
      setCandidatesList(response.data?.data || response.data || []);
    } catch (err) { console.error("Error fetching candidates:", err); }
    finally { setCandidatesLoading(false); }
  };

  const fetchAssessments = async () => {
    setTemplatesLoading(true);
    try {
      const response = await adminService.getAssesments();
      setAssessments(response.data?.data || response.data || []);
    } catch (err) { console.error("Error fetching assessments:", err); }
    finally { setTemplatesLoading(false); }
  };

  const handleUseTemplate = (item) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const fmt = (d) => d.toISOString().split("T")[0];

    setFormData({
      ...EMPTY_FORM,
      testTitle: item.test_title,
      noOfQuestions: String(item.no_of_questions),
      primarySkill: item.primary_skill,
      passingScore: item.passing_score,
      secondarySkill: item.secondary_skill || "",
      examLevel: item.difficulty,
      duration: item.duration,
      secondry_jobDescription: item.secondry_jobDescription || "",
      startDate: fmt(today),
      endDate: fmt(tomorrow),
    });
    setActiveAssessmentId(item._id);
    setMode("prefill");
    setErrors({});
    setActiveTab("create");
  };

  const handleEditTemplate = async (item: any) => {
    setEditLoading(item._id);
    try {
      const response = await adminService.getAssesments(item._id);
      console.log("item in edit handler:", response);
      const data = response.data;

      if (!data) {
        showToast("error", "Assessment data not found");
        return;
      }

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const fmt = (d) => d.toISOString().split("T")[0];

      setFormData({
        ...EMPTY_FORM,
        testTitle: data.test_title || "",
        noOfQuestions: String(data.no_of_questions || ""),
        primarySkill: data.primary_skill || "",
        passingScore: data.passing_score || "",
        secondarySkill: data.secondary_skill || "",
        examLevel: data.difficulty || "",
        duration: data.duration || "",
        secondry_jobDescription: data.secondry_jobDescription || "",
        startDate: fmt(today),
        endDate: fmt(tomorrow),
      });

      setActiveAssessmentId(data._id);
      setMode("edit");
      setErrors({});
      setActiveTab("create");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load assessment for editing");
    } finally {
      setEditLoading(null);
    }
  };

  const handleResetMode = () => {
    setFormData(EMPTY_FORM);
    setMode("create");
    setActiveAssessmentId(null);
    setErrors({});
    setJdAnalysis(null);
    setJdError(null);
  };

  const handleInputChange = (field: any, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const mapExperienceToLevel = (level?: string, years?: string) => {
    if (!level && !years) return "";
    const lvl = level?.toLowerCase();
    if (lvl?.includes("entry") || lvl?.includes("junior")) return "Easy";
    if (lvl?.includes("mid")) return "Intermediate";
    if (lvl?.includes("senior") || lvl?.includes("lead")) return "Advanced";
    const y = Number(years);
    if (!isNaN(y)) {
      if (y <= 1) return "Easy";
      if (y <= 4) return "Intermediate";
      return "Advanced";
    }
    return "";
  };

  const getDefaultQuestionsByLevel = (level: string) => {
    switch (level) {
      case "Easy": return "20";
      case "Intermediate": return "30";
      case "Advanced": return "40";
      default: return "";
    }
  };

  const getDefaultDuration = (questions: string) => {
    const q = Number(questions);
    if (!q) return "";
    if (q <= 20) return "30 min";
    if (q <= 30) return "60 min";
    if (q <= 40) return "90 min";
    return "120 min";
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, jobDescription: "Please upload a PDF or DOC file" }));
      return;
    }

    handleInputChange("jobDescription", file);
    setJdAnalysis(null);
    setJdError(null);
    setJdLoading(true);

    try {
      const fd = new FormData();
      fd.append("jobDescription", file);
      const response = await adminService.analyzeJD(fd);
      const analysis = response.analysis;

      if (analysis) {
        setJdAnalysis(analysis);
        const difficulty = mapExperienceToLevel(analysis?.experienceLevel, analysis?.experienceYears) || "";
        const defaultQuestions = getDefaultQuestionsByLevel(difficulty);
        const defaultDuration = getDefaultDuration(defaultQuestions);

        setFormData((prev) => ({
          ...prev,
          jobDescription: file,
          jobDescriptionText: analysis?.fullJobDescription || "",
          testTitle: prev.testTitle || analysis?.jobTitle || "",
          secondry_jobDescription:
            prev.secondry_jobDescription ||
            analysis?.secondry_jobDescription ||
            "",
          // ── CHANGED: populate primarySkill from requiredSkills array (comma-separated)
          primarySkill:
            prev.primarySkill ||
            (analysis?.requiredSkills?.length
              ? analysis.requiredSkills.join(", ")
              : analysis?.primarySkill || ""),
          // ── CHANGED: populate secondarySkill from niceToHaveSkills array (comma-separated)
          secondarySkill:
            prev.secondarySkill ||
            (analysis?.niceToHaveSkills?.length
              ? analysis.niceToHaveSkills.join(", ")
              : analysis?.secondarySkill || ""),
        }));
      }
    } catch (err: any) {
      setJdError(err?.response?.data?.message || "Failed to analyze JD. You can proceed manually.");
    } finally {
      setJdLoading(false);
    }
  };

  const removeFile = () => {
    handleInputChange("jobDescription", null);
    handleInputChange("jobDescriptionText", "");
    setJdAnalysis(null);
    setJdError(null);
    const el = document.getElementById("jd-upload") as HTMLInputElement;
    if (el) el.value = "";
  };

  const toggleCandidateSelection = (candidate: any) => {
    const isSelected = formData.candidates.some((c: any) => c._id === candidate._id);
    handleInputChange("candidates", isSelected
      ? formData.candidates.filter((c: any) => c._id !== candidate._id)
      : [...formData.candidates, candidate]);
  };

  const removeCandidateChip = (id: any) => {
    handleInputChange("candidates", formData.candidates.filter((c: any) => c._id !== id));
  };

  const filteredCandidates = candidatesList?.filter((c: any) =>
    `${c.name} ${c.role || ""} ${c.email}`.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  const showToast = (type, message, duration = 4000) => {
    setSubmitStatus({ type, message });
    setTimeout(() => setSubmitStatus(null), duration);
  };

  const validateForm = (requireCandidates = false) => {
    const newErrors: any = {};
    if (!formData.testTitle?.trim()) newErrors.testTitle = "Test title is required";
    if (!formData.noOfQuestions) newErrors.noOfQuestions = "Number of questions is required";
    if (!formData.primarySkill?.trim()) newErrors.primarySkill = "Primary skill is required";
    if (!formData.passingScore) newErrors.passingScore = "Passing score is required";
    if (!formData.examLevel) newErrors.examLevel = "Exam level is required";
    if (!formData.duration) newErrors.duration = "Duration is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";

    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = "End date must be on or after start date";
    }

    if (formData.passingScore) {
      const score = Number(formData.passingScore);
      if (isNaN(score) || score < 0 || score > 100) {
        newErrors.passingScore = "Score must be between 0 and 100";
      }
    }

    if (requireCandidates && formData.candidates.length === 0) {
      newErrors.candidates = "Please select at least one candidate to send invites";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildFd = (includeDatesAndCandidates = false) => {
    const fd = new FormData();
    fd.append("difficulty", formData.examLevel);
    fd.append("duration", formData.duration);
    fd.append("test_title", formData.testTitle);
    fd.append("no_of_questions", formData.noOfQuestions);
    fd.append("primary_skill", formData.primarySkill);
    fd.append("secondary_skill", formData.secondarySkill || "");
    fd.append("passing_score", formData.passingScore);
    fd.append(
      "secondary_jobDescription",
      formData.secondry_jobDescription || "",
    );

    if (formData.jobDescriptionText) {
      fd.append("job_description_text", formData.jobDescriptionText);
    }

    if (formData.jobDescription instanceof File) {
      fd.append("jobDescription", formData.jobDescription);
    }

    if (includeDatesAndCandidates) {
      fd.append("start_date", formData.startDate);
      fd.append("end_date", formData.endDate);
      fd.append("candidates", JSON.stringify(formData.candidates.map((c) => c._id)));
    }

    return fd;
  };

  const handleGenerateAndSave = async () => {
    if (!validateForm(false)) {
      showToast("error", "Please fill all required fields correctly");
      return;
    }
    setLoading(true);
    try {
      await adminService.createAssessmentTemplate(buildFd());
      showToast("success", "Assessment template created successfully!", 2000);
      setTimeout(() => {
        setFormData(EMPTY_FORM);
        setMode("create");
        setActiveTab("templates");
        fetchAssessments();
      }, 2000);
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAndSendInvites = async () => {
    if (!validateForm(true)) {
      showToast("error", "Please fill all required fields and select candidates");
      return;
    }
    setLoading(true);
    try {
      await adminService.generateAndInvite(buildFd(true));
      showToast("success", `Invitations sent to ${formData.candidates.length} candidate(s)!`, 2000);
      setTimeout(() => {
        setFormData(EMPTY_FORM);
        setMode("create");
        setActiveTab("templates");
        fetchAssessments();
      }, 2000);
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to send invites");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssessment = async () => {
    if (!validateForm(false)) {
      showToast("error", "Please fill all required fields correctly");
      return;
    }
    setLoading(true);
    try {
      await adminService.updateAssessmentTemplate(id, buildFd());
      showToast("success", "Assessment updated successfully!", 2000);
      setTimeout(() => {
        setFormData(EMPTY_FORM);
        setMode("create");
        setActiveAssessmentId(null);
        setActiveTab("templates");
        fetchAssessments();
      }, 2000);
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to update assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteOnly = async () => {
    const newErrors: any = {};
    if (formData.candidates.length === 0) newErrors.candidates = "Please select at least one candidate";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate))
      newErrors.endDate = "End date must be on or after start date";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast("error", "Please select candidates and set valid dates");
      return;
    }
    setLoading(true);
    try {
      await adminService.sendInvites(id, {
        candidateIds: formData.candidates.map((c) => c._id),
        start_date: formData.startDate,
        end_date: formData.endDate,
      });
      showToast("success", `Invitations sent to ${formData.candidates.length} candidate(s)!`, 2000);
      setTimeout(() => {
        setFormData(EMPTY_FORM);
        setMode("create");
      }, 2000);
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to send invites");
    } finally {
      setLoading(false);
    }
  };

  const handleViewCandidates = (assessment: any) => {
    setSelectedAssessment(assessment);
    setShowCandidateModal(true);
  };

  const closeCandidateModal = () => {
    setShowCandidateModal(false);
    setSelectedAssessment(null);
  };

  console.log(selectedAssessment)
  return (
    <AdminLayout
      heading="Tests & Assessments"
      subheading="Create and manage assessments"
      showSearch={false}
      activeMenuItem={activeMenuItem}
      onMenuItemClick={setActiveMenuItem}
    >
      {/* ── Full-page centered loader overlay ── */}
      {(loading || jdLoading || candidatesLoading || !!editLoading) && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-40 flex flex-col items-center justify-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="h-16 w-16 rounded-full border-4 border-indigo-100" />
            <div className="absolute h-13 w-13 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-indigo-700">
            {jdLoading ? "Analyzing Job Description..." : !!editLoading ? "Loading assessment..." : candidatesLoading ? "Loading candidates..." : "Please wait..."}
          </p>
        </div>
      )}

      {submitStatus && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          submitStatus.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          {submitStatus.type === "success" ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
          <span className={`text-sm font-medium ${submitStatus.type === "success" ? "text-green-800" : "text-red-800"}`}>
            {submitStatus.message}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex bg-white rounded-lg p-2">
          <button onClick={() => { setActiveTab("create"); handleResetMode(); }}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "create" ? "bg-[#F4F7FE] text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
            Create Assessments
          </button>
          <button onClick={() => setActiveTab("templates")}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "templates" ? "bg-[#F4F7FE] text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
            Tests Templates
          </button>
        </div>
     
      </div>

      {activeTab === "create" && (
        <div className="rounded-lg p-5 bg-white">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {mode === "edit" ? "Edit Assessment" : mode === "prefill" ? "Send Invites" : "Create New Assessment"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {mode === "edit" ? "Update the assessment details below" : mode === "prefill" ? "Select candidates and set dates to send invites" : "Set up a new MCQ-based assessment for your candidates"}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Candidates dropdown */}
              <div className="relative" ref={candidateDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Candidates
                  <span className="ml-2 text-xs text-gray-500">{mode === "prefill" ? "(Required)" : "(Optional)"}</span>
                  {formData.candidates.length > 0 && <span className="ml-2 text-xs text-indigo-600">{formData.candidates.length} Selected</span>}
                </label>
                <div className={`w-full min-h-[42px] px-3 py-2 border rounded-lg cursor-pointer transition-all ${errors.candidates ? "border-red-300 bg-red-50 ring-2 ring-red-100" : "border-gray-300 hover:border-gray-400"}`}
                  onClick={() => setShowCandidateDropdown(!showCandidateDropdown)}>
                  {formData.candidates.length === 0 ? (
                    <span className="text-gray-400 text-sm">Select Candidates to invite</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.candidates.map((c) => (
                        <span key={c._id} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md">
                          {c.name}
                          <X className="h-3 w-3 cursor-pointer hover:text-indigo-900" onClick={(e) => { e.stopPropagation(); removeCandidateChip(c._id); }} />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {errors.candidates && <div className="flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3 text-red-500" /><span className="text-xs text-red-600">{errors.candidates}</span></div>}

                {showCandidateDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-gray-200">
                      <input type="text" placeholder="Search by name or role..." value={candidateSearch} onChange={(e) => setCandidateSearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" onClick={(e) => e.stopPropagation()} />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {/* NEW: loader while fetching candidates */}
                      {candidatesLoading ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-4">
                          <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-gray-500">Loading candidates...</span>
                        </div>
                      ) : filteredCandidates?.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">No candidates found</div>
                      ) : (
                        filteredCandidates?.map((candidate) => (
                          <div key={candidate._id} className={`px-4 py-2 cursor-pointer transition-colors ${formData.candidates.some((c) => c._id === candidate._id) ? "bg-indigo-50 hover:bg-indigo-100" : "hover:bg-gray-50"}`}
                            onClick={(e) => { e.stopPropagation(); toggleCandidateSelection(candidate); }}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {candidate.name}
                                  {candidate.role && <span className="ml-1 text-xs text-gray-400 font-normal">— {candidate.role}</span>}
                                </div>
                                <div className="text-xs text-gray-500">{candidate.email}</div>
                              </div>
                              {formData.candidates.some((c) => c._id === candidate._id) && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${errors.startDate ? "border-red-300 bg-red-50 ring-2 ring-red-100 focus:ring-red-200" : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"}`}
                />
                {errors.startDate && <div className="flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3 text-red-500" /><span className="text-xs text-red-600">{errors.startDate}</span></div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  min={formData.startDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${errors.endDate ? "border-red-300 bg-red-50 ring-2 ring-red-100 focus:ring-red-200" : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"}`}
                />
                {errors.endDate && <div className="flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3 text-red-500" /><span className="text-xs text-red-600">{errors.endDate}</span></div>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Title</label>
                <input type="text" placeholder="e.g., Frontend Developer Assessment" value={formData.testTitle}
                  onChange={(e) => handleInputChange("testTitle", e.target.value)} disabled={mode === "prefill"}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${errors.testTitle ? "border-red-300 bg-red-50 ring-2 ring-red-100" : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"} ${mode === "prefill" ? "bg-gray-50 cursor-not-allowed" : ""}`} />
                {errors.testTitle && <div className="flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3 text-red-500" /><span className="text-xs text-red-600">{errors.testTitle}</span></div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. of questions</label>
                <select value={formData.noOfQuestions} onChange={(e) => handleInputChange("noOfQuestions", e.target.value)} disabled={mode === "prefill"}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none appearance-none bg-white transition-all ${errors.noOfQuestions ? "border-red-300 bg-red-50 ring-2 ring-red-100" : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"} ${mode === "prefill" ? "bg-gray-50 cursor-not-allowed" : ""}`}>
                  <option value="">Select number of questions</option>
                  {[10, 20, 30, 40, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                {errors.noOfQuestions && <div className="flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3 text-red-500" /><span className="text-xs text-red-600">{errors.noOfQuestions}</span></div>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Skill</label>
                <input type="text" placeholder="e.g., React.js" value={formData.primarySkill}
                  onChange={(e) => handleInputChange("primarySkill", e.target.value)} disabled={mode === "prefill"}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${errors.primarySkill ? "border-red-300 bg-red-50 ring-2 ring-red-100" : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"} ${mode === "prefill" ? "bg-gray-50 cursor-not-allowed" : ""}`} />
                {errors.primarySkill && <div className="flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3 text-red-500" /><span className="text-xs text-red-600">{errors.primarySkill}</span></div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score%</label>
                <input type="number" placeholder="e.g., 70" min="0" max="100" value={formData.passingScore}
                  onChange={(e) => handleInputChange("passingScore", e.target.value)} disabled={mode === "prefill"}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${errors.passingScore ? "border-red-300 bg-red-50 ring-2 ring-red-100" : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"} ${mode === "prefill" ? "bg-gray-50 cursor-not-allowed" : ""}`} />
                {errors.passingScore && <div className="flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3 text-red-500" /><span className="text-xs text-red-600">{errors.passingScore}</span></div>}
              </div>
             
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Skill (Optional)</label>
                <input type="text" placeholder="e.g., TypeScript" value={formData.secondarySkill}
                  onChange={(e) => handleInputChange("secondarySkill", e.target.value)} disabled={mode === "prefill"}
                  className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none ${mode === "prefill" ? "bg-gray-50 cursor-not-allowed" : ""}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select exam level</label>
                <select value={formData.examLevel} onChange={(e) => handleInputChange("examLevel", e.target.value)} disabled={mode === "prefill"}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none appearance-none bg-white transition-all ${errors.examLevel ? "border-red-300 bg-red-50 ring-2 ring-red-100" : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"} ${mode === "prefill" ? "bg-gray-50 cursor-not-allowed" : ""}`}>
                  <option value="">Select difficulty level</option>
                  <option value="Easy">Easy</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                {errors.examLevel && <div className="flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3 text-red-500" /><span className="text-xs text-red-600">{errors.examLevel}</span></div>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <select value={formData.duration} onChange={(e) => handleInputChange("duration", e.target.value)} disabled={mode === "prefill"}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none appearance-none bg-white transition-all ${errors.duration ? "border-red-300 bg-red-50 ring-2 ring-red-100" : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"} ${mode === "prefill" ? "bg-gray-50 cursor-not-allowed" : ""}`}>
                  <option value="">Select duration</option>
                  <option value="30 min">30 min</option>
                  <option value="60 min">60 min</option>
                  <option value="90 min">90 min</option>
                  <option value="120 min">120 min</option>
                </select>
                {errors.duration && <div className="flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3 text-red-500" /><span className="text-xs text-red-600">{errors.duration}</span></div>}
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., React.js"
                  value={formData.secondry_jobDescription}
                  onChange={(e) =>
                    handleInputChange("secondry_jobDescription", e.target.value)
                  }
                  disabled={mode === "prefill"}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${errors.secondry_jobDescription ? "border-red-300 bg-red-50 ring-2 ring-red-100" : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"} ${mode === "prefill" ? "bg-gray-50 cursor-not-allowed" : ""}`}
                />
                {errors.secondry_jobDescription && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {errors.secondry_jobDescription}
                    </span>
                  </div>
                )}
              </div> */}

              {mode !== "prefill" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Job Description (Optional)</label>
                  {!formData.jobDescription ? (
                    <label htmlFor="jd-upload" className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 border-2 border-dashed rounded-lg cursor-pointer transition-all ${errors.jobDescription ? "border-red-300 bg-red-50 hover:bg-red-100" : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"}`}>
                      <Upload className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Upload PDF or DOC</span>
                      <input id="jd-upload" type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                    </label>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm text-gray-700 truncate max-w-[200px]">{formData.jobDescription.name}</span>
                        </div>
                        <button onClick={removeFile} className="text-gray-400 hover:text-red-600 transition-colors"><X className="h-4 w-4" /></button>
                      </div>

                      {jdLoading && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                          <div className="h-3 w-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-indigo-700">Analyzing JD and auto-filling fields...</span>
                        </div>
                      )}
                      {jdError && !jdLoading && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                          <AlertCircle className="h-3 w-3 text-red-500 shrink-0" />
                          <span className="text-xs text-red-600">{jdError}</span>
                        </div>
                      )}
                      {jdAnalysis && !jdLoading && (
                        <div className="px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span className="text-xs font-medium text-green-700">Fields auto-filled from JD</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {jdAnalysis.requiredSkills?.slice(0, 4).map((skill: string) => (
                              <span key={skill} className="px-2 py-0.5 bg-white border border-green-200 text-green-700 text-xs rounded-full">{skill}</span>
                            ))}
                            {jdAnalysis.requiredSkills?.length > 4 && (
                              <span className="text-xs text-green-600 self-center">+{jdAnalysis.requiredSkills.length - 4} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {errors.jobDescription && <div className="flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3 text-red-500" /><span className="text-xs text-red-600">{errors.jobDescription}</span></div>}
                </div>
                
              )}
               <div className="w-full">
                <label className=" text-sm font-medium text-gray-700 mb-2">Job Description</label>
                <input type="text" placeholder="Job Description" min="0" max="100" value={formData.secondry_jobDescription}
                  onChange={(e) => handleInputChange("secondry_jobDescription", e.target.value)} 
                  className={`w-full  px-4 py-2.5 border rounded-lg outline-none transition-all ${errors.secondry_jobDescription ? "border-red-300 bg-red-50 ring-2 ring-red-100" : "border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"} ${mode === "prefill" ? "bg-gray-50 cursor-not-allowed" : ""}`} />
                {errors.secondry_jobDescription && <div className="flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3 text-red-500" /><span className="text-xs text-red-600">{errors.secondry_jobDescription}</span></div>}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              {mode === "create" && (
                <>
                  <button onClick={handleGenerateAndSave} disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (
                      <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    {loading ? "Saving..." : "Generate & Save as template"}
                  </button>
                  <button onClick={handleGenerateAndSendInvites} disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    )}
                    {loading ? "Sending..." : "Generate & Send Invites"}
                  </button>
                </>
              )}

              {mode === "prefill" && (
                <button onClick={handleInviteOnly} disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  )}
                  {loading ? "Sending..." : "Send Invite"}
                </button>
              )}

              {mode === "edit" && (
                <button onClick={handleUpdateAssessment} disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  {loading ? "Updating..." : "Update Assessment"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "templates" && (
        <div>
          {templatesLoading ? (
            /* NEW: skeleton loader for templates grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
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
                    <div className="h-9 w-10 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : assessments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FileText className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No templates yet</p>
              <p className="text-gray-400 text-sm mt-1">Create an assessment and save it as a template</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assessments.map((item: any) => (
                <div key={item._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">{item.passing_score}%</span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${item.difficulty === "Advanced" ? "bg-orange-100 text-orange-600" : item.difficulty === "Easy" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                      {item.difficulty}
                    </span>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.test_title}</h3>
                    <p className="text-sm text-gray-500">{item.primary_skill}</p>
                  </div>
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    {item.secondary_skill && <div className="flex items-center gap-2"><FileText className="h-4 w-4" /><span>{item.secondary_skill}</span></div>}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1"><Clock className="h-4 w-4" /><span>{item.duration}</span></div>
                      <div className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" /><span>{item.no_of_questions} questions</span></div>
                    </div>
                    {item.createdAt && <p className="text-xs text-gray-400">Created {new Date(item.createdAt).toLocaleDateString()}</p>}
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => handleUseTemplate(item)} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                      Use
                    </button>
                    <button onClick={() => handleViewCandidates(item)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="View Candidates">
                      <Users className="h-4 w-4" />
                    </button>
                    {/* NEW: spinner on the edit button while that specific item is loading */}
                    <button onClick={() => handleEditTemplate(item)} disabled={editLoading === item._id}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[42px]">
                      {editLoading === item._id ? (
                        <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "📄"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Candidate Details Modal */}
      {showCandidateModal && selectedAssessment && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeCandidateModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedAssessment.test_title}</h3>
                <p className="text-sm text-gray-500 mt-1">Candidate Details</p>
              </div>
              <button onClick={closeCandidateModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {selectedAssessment.candidates && selectedAssessment.candidates.length > 0 ? (
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
                        {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Interview Link</th> */}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedAssessment.candidates.map(
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
                              {new Date(candidate.end_Date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
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
                            <a href={candidate.interviewLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline">
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
                  <p className="text-gray-500 font-medium">No candidates assigned</p>
                  <p className="text-gray-400 text-sm mt-1">Candidates will appear here once they are invited</p>
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
    </AdminLayout>
  );
};

export default TestsAssessments;
