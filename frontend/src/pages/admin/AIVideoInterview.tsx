import {
  useState,
  type DragEvent,
  type ChangeEvent,
  useEffect,
  useRef,
  use,
} from "react";
import { CheckCircle2, X } from "lucide-react";
import AdminLayout from "../../common/AdminLayout";
import AI from "../../assets/admin/AI_Power.png";
import Mail from "../../assets/admin/Mail_Icon.png";
import Upload from "../../assets/admin/Upload.png";
import Send_Invite from "../../assets/admin/send_Invite.png";
import SendEmail from "../../assets/admin/send.png";
import Preview from "../../assets/admin/eye1.png";
import Calender from "../../assets/admin/calender.png";
import Bookmark from "../../assets/admin/assessment/bookmark.png";
import Edit from "../../assets/admin/assessment/edit1.png";
import ActiveInterviews from "../../components/admin/AI Interview/ActiveInterviews";
import { adminService } from "../../services/service/adminService";

export default function InterviewSetup() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [duration, setDuration] = useState("");
  const [passingScore, setPassingScore] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [interviewLink] = useState("ai.interview.can00D0@gmail.com");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

  // Candidate States
  const [candidates, setCandidates] = useState<any[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<any[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [activeTab, setActiveTab] = useState("setup");

  console.log("createdJobId", createdJobId);

  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && /\.(pdf|docx?|txt)$/i.test(file.name)) {
      setFileName(file.name);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && /\.(pdf|docx?|txt)$/i.test(selectedFile.name)) {
      setFileName(selectedFile.name);
      setFile(selectedFile); // important
    }
  };

  const handleGenerateAndSendInvites = async () => {
    try {
      if (!file) {
        alert("Please upload job description file");
        return;
      }

      setLoading(true);

      const formData = new FormData();

      formData.append("jobDescription", file);
      formData.append("position", position);
      formData.append("description", description);
      formData.append("difficulty", difficulty);
      formData.append("duration", duration);
      formData.append("passingScore", passingScore);
      formData.append("numberOfQuestions", numberOfQuestions);
      skills.forEach((skill) => {
        formData.append("skills", skill);
      });

      const response = await adminService.generateAIInterview(formData);
      console.log("Interview Created:", response);
      setCreatedJobId(response.jobId);

      setIsGenerated(true);

      setSubject("Invitations to Complete Your AI Video Interview");

      setMessageBody(
        `Hi Dear ,\n\nYou have been invited to complete an AI-powered interview for the ${position} position.\n\nBest of luck!`,
      );
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const handleDraft = async () => {
    try {
      if (!file) {
        alert("Please upload job description file");
        return;
      }

      setLoading(true);

      const formData = new FormData();

      formData.append("jobDescription", file);
      formData.append("position", position);
      formData.append("description", description);
      formData.append("difficulty", difficulty);
      formData.append("duration", duration);
      formData.append("passingScore", passingScore);
      formData.append("numberOfQuestions", numberOfQuestions);
      skills.forEach((skill) => {
        formData.append("skills", skill);
      });

      const response = await adminService.generateAIInterview(formData);
      console.log("Interview Created:", response);
      setCreatedJobId(response.jobId);
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onNavigateToInterviewSetup = (assessment: any) => {
    setActiveTab("setup"); // go back to setup tab
    setIsGenerated(true); // open email template section
    setCreatedJobId(assessment.jobId); // 🔥 VERY IMPORTANT
    // Optional: Pre-fill values
    setPosition(assessment.position);
    setDescription(assessment.description || "");
    setSubject("Invitations to Complete Your AI Video Interview");

    setMessageBody(
      `Hi Dear ,\n\nYou have been invited to complete an AI-powered interview for the ${assessment.position} position.\n\nBest of luck!`,
    );
  };

  // ================= FETCH CANDIDATES =================

  const fetchCandidates = async () => {
    try {
      const res: any = await adminService.getAllCandidate();

      // const filtered = res.candidates.filter(
      //   (c: any) =>
      //     c.status === "active",
      // );

      setCandidates(res.data);
      setFilteredCandidates(res.data);
    } catch (error) {
      console.error("Failed to fetch candidates", error);
    }
  };

  // ================= SEARCH FILTER =================

  useEffect(() => {
    const filtered = candidates.filter((c: any) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredCandidates(filtered);
  }, [searchTerm, candidates]);

  // ================= SELECT / UNSELECT =================

  const handleSelectCandidate = (candidate: any) => {
    const exists = selectedCandidates.find((c) => c._id === candidate._id);

    if (exists) {
      setSelectedCandidates(
        selectedCandidates.filter((c) => c._id !== candidate._id),
      );
    } else {
      setSelectedCandidates([...selectedCandidates, candidate]);
    }
  };

  // ================= SEND INVITATIONS =================

  const handleSendInvitations = async () => {
    try {
      if (!createdJobId) return alert("Create interview first");
      if (!selectedCandidates.length) return alert("Select candidates");
      if (!startDate || !endDate) return alert("Select dates");

      const data = {
        jobId: createdJobId,
        candidateIds: selectedCandidates.map((c) => c._id),
        messageBody,
        startDate,
        endDate,
        testTitle: position,
      };

      await adminService.sendInvitations(data);

      alert("Invitations Sent Successfully");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to send invitations");
    }
  };
  const candidateDropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        candidateDropdownRef.current &&
        !candidateDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(interviewLink)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

   

  return (
    <>
      <AdminLayout
        heading="AI Video Interview"
        subheading="AI-powered video interviews with HuggingFace"
        showSearch={false}
      >
        <div className="min-h-screen">
          {/* Tabs */}
          <div className="flex items-center justify-between mb-6">
            {/* Tabs */}
            <div className="inline-flex bg-white rounded-lg p-1">
              <button
                onClick={() => setActiveTab("setup")}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "setup"
                    ? "bg-[#F4F7FE] text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Interview Setup
              </button>

              <button
                onClick={() => setActiveTab("template")}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "template"
                    ? "bg-[#F4F7FE] text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                AI Interview Template
              </button>
            </div>
          </div>
          {/* Right Side Controls */}
          {activeTab === "template" && (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 w-full">
              <ActiveInterviews
                onNavigateToInterviewSetup={onNavigateToInterviewSetup}
              />
            </div>
          )}

          {activeTab === "setup" && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
                {/* Left: AI Generator */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-lg">
                      <img
                        className="w-10 h-10 sm:w-12 sm:h-12"
                        src={AI}
                        alt="ai"
                      />
                    </div>
                    <div>
                      <h2 className="font-semibold text-base sm:text-lg">
                        AI - Powered Interview Generator
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Upload job description to generate intelligent questions
                      </p>
                    </div>
                  </div>

                  {/* <p className="text-lg sm:text-xl tracking-tight pb-4">
                    Job Descriptions
                  </p> */}
                  <div
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                    className="flex flex-col justify-center gap-2 items-center border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center cursor-pointer"
                  >
                    <img
                      className="w-6 h-6 sm:w-7 sm:h-7"
                      src={Upload}
                      alt="upload"
                    />
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Drag and drop your job description file here, or
                    </p>
                    <label className="mt-2 text-xs sm:text-sm inline-block border border-gray-300 py-1 sm:py-[2px] px-2 sm:px-3 rounded-sm font-medium cursor-pointer">
                      Browse Files
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1">
                      Supports PDF, DOC, DOCX, TXT (max 5MB)
                    </p>
                    {fileName && (
                      <p className="text-green-600 mt-2 text-xs sm:text-sm">
                        Uploaded: {fileName}
                      </p>
                    )}
                  </div>

                  <textarea
                    className="mt-4 w-full p-3 border border-gray-300 rounded-md text-xs sm:text-sm resize-none outline-none"
                    rows={4}
                    placeholder="Paste your job descriptions here..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>

                  <h3 className="text-gray-800 pb-2 text-xs sm:text-sm">
                    Position
                  </h3>
                  <input
                    type="text"
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg outline-none text-xs sm:text-sm"
                    value={position}
                    onChange={(e) => {
                      setPosition(e.target.value);
                    }}
                  />
                  <div className="w-full flex items-center justify-between gap-5">
                    <div className="w-full md:w-1/2">
                      <h3 className="text-gray-800 pb-2 text-xs sm:text-sm">
                        Passing Score
                      </h3>
                      <input
                        type="text"
                        placeholder="e.g. 70%"
                        className="w-full p-2 mb-3 border border-gray-300 rounded-lg outline-none text-xs sm:text-sm"
                        value={passingScore}
                        onChange={(e) => {
                          setPassingScore(e.target.value);
                        }}
                      />
                    </div>
                    <div className="w-full md:w-1/2">
                      <h3 className="text-gray-800 pb-2 text-xs sm:text-sm">
                        Number of Questions
                      </h3>
                      <input
                        type="text"
                        placeholder="10"
                        className="w-full p-2 mb-3 border border-gray-300 rounded-lg outline-none text-xs sm:text-sm"
                        value={numberOfQuestions}
                        onChange={(e) => {
                          setNumberOfQuestions(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <h3 className="text-gray-800 pb-2 text-xs sm:text-sm">
                    Skills
                  </h3>

                  <div className="w-full p-2 mb-3 border border-gray-300 rounded-lg flex flex-wrap gap-2 items-center">
                    {/* Existing Skill Tags */}
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs sm:text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() =>
                            setSkills(skills.filter((_, i) => i !== index))
                          }
                          className="ml-2 text-indigo-500 hover:text-indigo-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Input */}
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        // Add skill when user presses comma or Enter
                        if (e.key === "," || e.key === "Enter") {
                          e.preventDefault();

                          const newSkill = inputValue.trim().replace(",", "");

                          if (newSkill && !skills.includes(newSkill)) {
                            setSkills([...skills, newSkill]);
                          }

                          setInputValue("");
                        }

                        // Remove last skill when backspace and input empty
                        if (e.key === "Backspace" && !inputValue) {
                          setSkills((prev) => prev.slice(0, -1));
                        }
                      }}
                      className="flex-1 min-w-[120px] outline-none text-xs sm:text-sm"
                      placeholder="Type skill and press comma..."
                    />
                  </div>

                  <div className="mt-4 flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/2">
                      <h3 className="text-gray-800 pb-2 text-xs sm:text-sm">
                        Interview Durations
                      </h3>
                      <select
                        className="w-full border border-gray-300 outline-none p-2 rounded-md text-xs sm:text-sm text-gray-700"
                        onChange={(e) => setDuration(e.target.value)}
                      >
                        <option>Select Duration</option>
                        <option>15 minutes</option>
                        <option>30 minutes</option>
                        <option>60 minutes</option>
                      </select>
                    </div>
                    <div className="w-full md:w-1/2">
                      <h3 className="text-gray-800 pb-2 text-xs sm:text-sm">
                        Difficulty Level
                      </h3>
                      <select
                        className="w-full border border-gray-300 outline-none p-2 rounded-md text-xs sm:text-sm text-gray-700"
                        onChange={(e) => setDifficulty(e.target.value)}
                      >
                        <option>Select Level</option>
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    {!isGenerated ? (
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={handleDraft}
                          className="flex items-center justify-center gap-2 rounded-lg bg-white text-[#4318FFE5] border border-[#4318FFE5] px-4 py-2"
                        >
                          <img src={Bookmark} alt="" className="w-5 h-5" />
                          <span className="text-sm">
                            Generate & Save as template
                          </span>
                        </button>
                        <button
                          className="flex items-center justify-center gap-2 bg-[#4318FF] px-4 py-2 rounded-lg"
                          onClick={handleGenerateAndSendInvites}
                        >
                          <img src={Edit} alt="" className="w-5 h-5" />
                          <span className="text-white text-sm">
                            Generate & Send Invites
                          </span>
                        </button>
                      </div>
                    ) : (
                      <button
                        className="w-full bg-[#2AAC7E] text-white text-sm py-3 rounded-md flex items-center justify-center gap-2"
                        onClick={() => setIsGenerated(false)}
                      >
                        <img src={Edit} alt="edit" className="w-5 h-5" />
                        <span>Regenerate AI Interview</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Email Invitations */}
                <div className="bg-white h-fit p-4 sm:p-6 rounded-xl flex flex-col items-start justify-start relative">
                  <div className="flex items-center w-full mb-4">
                    <div className="p-2 rounded-lg">
                      <img
                        className="w-10 h-10 sm:w-12 sm:h-12"
                        src={Mail}
                        alt="mail"
                      />
                    </div>
                    <div>
                      <h2 className="font-semibold text-base sm:text-lg">
                        Email Invitations
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Customize and send interview invitations
                      </p>
                    </div>
                  </div>

                  {!isGenerated && (
                    <div className="mt-6 text-center w-full flex flex-col items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-[#F4F7FE]">
                        <img
                          className="w-8 h-8 sm:w-10 sm:h-10"
                          src={Send_Invite}
                          alt="send_invite"
                        />
                      </div>
                      <p className="text-lg sm:text-xl font-medium tracking-tight mt-6 sm:mt-10">
                        Ready To Send Invitations?
                      </p>
                      <p className="text-xs sm:text-[13px] text-gray-500 mt-1">
                        Generate AI questions first to create email templates
                      </p>
                    </div>
                  )}

                  {isGenerated && (
                    <div className="relative w-full mt-4" ref={candidateDropdownRef}>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
    Candidate
    {selectedCandidates.length > 0 && (
      <span className="ml-2 text-xs text-indigo-600">
        {selectedCandidates.length} Selected
      </span>
    )}
  </label>

                      {/* Candidate Dropdown */}
                      <div
    className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-all"
    onClick={() => {
      setShowDropdown(!showDropdown);
      if (!candidates.length) fetchCandidates();
    }}
  >
    {selectedCandidates.length === 0 ? (
      <span className="text-gray-400 text-sm">
        Select Candidates to invite
      </span>
    ) : (
      <div className="flex flex-wrap gap-2">
        {selectedCandidates.map((c: any) => (
          <span
            key={c._id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md"
          >
            {c.name}
            <X
              className="h-3 w-3 cursor-pointer hover:text-indigo-900"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCandidates((prev) =>
                  prev.filter((item) => item._id !== c._id),
                );
              }}
            />
          </span>
        ))}
      </div>
    )}
  </div>

  {/* Dropdown */}
  {showDropdown && (
    <>
    
    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
      
      {/* Search */}
      <div className="p-2 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search by name or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* List */}
      <div className="max-h-48 overflow-y-auto">
        {filteredCandidates.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No candidates found
          </div>
        ) : (
          filteredCandidates.map((candidate: any) => {
            const isSelected = selectedCandidates.some(
              (c) => c._id === candidate._id,
            );

            return (
              <div
                key={candidate._id}
                className={`px-4 py-2 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-indigo-50 hover:bg-indigo-100"
                    : "hover:bg-gray-50"
                }`}
                onClick={(e) => {
                  e.stopPropagation();

                  if (isSelected) {
                    setSelectedCandidates((prev) =>
                      prev.filter((c) => c._id !== candidate._id),
                    );
                  } else {
                    setSelectedCandidates((prev) => [
                      ...prev,
                      candidate,
                    ]);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {candidate.name}
                      {candidate.role && (
                        <span className="ml-1 text-xs text-gray-400 font-normal">
                          — {candidate.role}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {candidate.email}
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    </>
  )}


                      <div className="w-full mt-4">
                        <label className="block text-xs sm:text-sm text-gray-500 mb-1">
                          Message Body
                        </label>
                        <textarea
                          value={messageBody}
                          onChange={(e) => setMessageBody(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md text-xs sm:text-sm h-28"
                        />
                      </div>

                      <div className="w-full mt-4 flex gap-4">
                        {/* Start Date */}
                        <div className="w-1/2">
                          <label className="block text-xs sm:text-sm text-gray-600 mb-1">
                            Start Date
                          </label>

                          <div className="relative">
                            <input
                              type="date"
                              value={
                                startDate
                                  ? startDate.toISOString().split("T")[0]
                                  : ""
                              }
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) => {
                                const value = e.target.value;
                                const selected = value ? new Date(value) : null;
                                setStartDate(selected);

                                // Reset end date if invalid
                                if (endDate && selected && endDate < selected) {
                                  setEndDate(null);
                                }
                              }}
                              className="calender w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4318FF]"
                            />

                            <img
                              src={Calender}
                              alt="calendar"
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60 pointer-events-none"
                            />
                          </div>
                        </div>

                        {/* End Date */}
                        <div className="w-1/2">
                          <label className="block text-xs sm:text-sm text-gray-600 mb-1">
                            End Date
                          </label>

                          <div className="relative">
                            <input
                              type="date"
                              value={
                                endDate
                                  ? endDate.toISOString().split("T")[0]
                                  : ""
                              }
                              min={
                                startDate
                                  ? startDate.toISOString().split("T")[0]
                                  : new Date().toISOString().split("T")[0]
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                setEndDate(value ? new Date(value) : null);
                              }}
                              className="calender w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4318FF]"
                            />

                            <img
                              src={Calender}
                              alt="calendar"
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60 pointer-events-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="w-full mt-6 flex justify-end gap-2 flex-wrap">
                        <button
                          onClick={handleSendInvitations}
                          className="flex items-center gap-2 px-4 py-2 bg-[#4318FF] text-white rounded-md text-xs sm:text-sm"
                        >
                          <img src={SendEmail} alt="send" className="w-4 h-4" />
                          <span>Send Invitations</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
