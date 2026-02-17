import { useState, type DragEvent, type ChangeEvent, useEffect ,useRef, use} from "react";
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

console.log("createdJobId",createdJobId)

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
      formData.append("skills", JSON.stringify(skills));

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
      formData.append("skills", JSON.stringify(skills));

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
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
                  <input
                    type="text"
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg outline-none text-xs sm:text-sm"
                    value={inputValue}
                    onChange={(e) => {
                      const value = e.target.value;

                      // If user types comma
                      if (value.endsWith(",")) {
                        const newSkill = value.slice(0, -1).trim();

                        if (newSkill && !skills.includes(newSkill)) {
                          setSkills([...skills, newSkill]);
                        }

                        setInputValue(""); // Clear input
                      } else {
                        setInputValue(value);
                      }
                    }}
                  />

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
                        className="flex items-center justify-center gap-2 rounded-lg bg-white text-[#4318FFE5] border border-[#4318FFE5] px-4 py-2">
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
                    <div className="w-full mt-4">
                      <label className="block text-xs sm:text-sm text-gray-600 mb-1">
                        Candidate
                      </label>

                      {/* Candidate Dropdown */}
                     <div ref={dropdownRef} className="relative">
                        <div
                          className="flex items-center space-x-4 cursor-pointer"
                          onClick={() => {
                            setShowDropdown(!showDropdown);
                            if (!candidates.length) fetchCandidates();
                          }}
                        >
                          <input
                            type="text"
                            value={
                              selectedCandidates.length
                                ? `${selectedCandidates.length} candidate(s) selected`
                                : "Select Candidates to invite"
                            }
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded-md text-[14px] text-gray-600 outline-none font-normal cursor-pointer"
                          />
                        </div>

                        {showDropdown && (
                          <div
  className={`absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-hidden transition-all duration-200 ${
    showDropdown ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
  }`}
>
                            {/* Search Bar */}
                            <div className="p-3 border-b bg-gray-50">
                              <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#4318FF]"
                              />
                            </div>

                            {/* Candidate List */}
                            <div className="max-h-60 overflow-y-auto">
                              {filteredCandidates.map((candidate: any) => {
                                const isSelected = selectedCandidates.find(
                                  (c) => c._id === candidate._id,
                                );

                                return (
                                  <div
                                    key={candidate._id}
                                    onClick={() =>
                                      handleSelectCandidate(candidate)
                                    }
                                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150
              ${isSelected ? "bg-[#F4F7FE]" : "hover:bg-gray-50"}
            `}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={!!isSelected}
                                      readOnly
                                      className="mt-1 accent-[#4318FF]"
                                    />

                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-gray-800">
                                        {candidate.name}
                                      </span>

                                      <span className="text-xs text-gray-500">
                                        {candidate.email}
                                      </span>

                                      <span className="text-xs text-[#4318FF] font-medium mt-1">
                                        {candidate.role}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}

                              {filteredCandidates.length === 0 && (
                                <div className="p-4 text-center text-sm text-gray-400">
                                  No candidates found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

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
        value={startDate ? startDate.toISOString().split("T")[0] : ""}
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
        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4318FF]"
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
        value={endDate ? endDate.toISOString().split("T")[0] : ""}
        min={
          startDate
            ? startDate.toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]
        }
        onChange={(e) => {
          const value = e.target.value;
          setEndDate(value ? new Date(value) : null);
        }}
        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4318FF]"
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
