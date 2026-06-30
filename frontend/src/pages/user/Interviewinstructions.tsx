import React, { useEffect, useState } from "react";
import {
  Clock,
  Calendar,
  Briefcase,
  ClipboardList,
  LayoutGrid,
  Monitor,
  Video,
  AlertTriangle,
  FileText,
  Maximize,
  Check,
  Mic,
  HelpCircle,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { userService } from "../../services/service/userService";
import { useAuth } from "../../context/context";
import { userPath } from "../../routes/EncryptRoute";

// ─── GUIDELINE / STRUCTURE DATA ───────────────────────────────────────────────
const MCQ_STRUCTURE = [
  { step: 1, title: "MCQ Assessment", sub: "Technical & aptitude questions" },
  { step: 2, title: "Auto Submission", sub: "Results evaluated instantly" },
];

const AI_STRUCTURE = [
  {
    step: 1,
    title: "AI Video Interview",
    sub: "Behavioral & technical questions",
  },
  { step: 2, title: "Response Analysis", sub: "AI evaluates your answers" },
];

const MCQ_TECH_REQUIREMENTS = [
  "Stable internet connection",
  "Quiet, distraction-free environment",
  "Chrome, Firefox, or Safari browser",
  "Do not open other tabs or apps",
];

const AI_TECH_REQUIREMENTS = [
  "Camera and microphone enabled",
  "Stable internet connection",
  "Quiet, well-lit environment",
  "Chrome, Firefox, or Safari browser",
];

const MCQ_GUIDELINES = [
  "Read each question carefully before answering",
  "You cannot go back to previous questions",
  "Timer will be visible at all times",
  "Assessment auto-submits when time expires",
];

const AI_GUIDELINES = [
  "Maintain eye contact with the camera",
  "Speak clearly and at a natural pace",
  "Take your time to think before answering",
  "Be authentic and professional",
];

const MCQ_NOTICE = [
  "Once you begin, you must complete the assessment in one session",
  "Refreshing or closing the browser will end your assessment",
  "Make sure you have enough uninterrupted time before starting",
  "All keyboard shortcuts are disabled during the assessment",
];

const AI_NOTICE = [
  "Once you begin, you must complete the entire interview in one session",
  "Refreshing the page or closing the browser will end your assessment",
  "Make sure you have enough time to complete the interview",
  "All keyboard shortcuts are disabled during the assessment",
];

const AI_TITLE = "Interview Process Overview";
const MCQ_TITLE = "MCQ Test Process Overview";

// ── Fullscreen helper ─────────────────────────────────────────────────────────
async function requestFullscreen(): Promise<boolean> {
  try {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      await el.requestFullscreen({ navigationUI: "hide" });
    }
    return true;
  } catch (err) {
    console.warn("Fullscreen request failed:", err);
    return false;
  }
}

// ─── SMALL UI ATOMS ───────────────────────────────────────────────────────────
const SectionCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-[#0a1035]/60 backdrop-blur-xl border border-white/10 rounded-2xl ${className}`}
  >
    {children}
  </div>
);

const IconBadge = ({ children }: { children: React.ReactNode }) => (
  <div className="w-10 h-10 rounded-xl bg-[#2D55FB]/15 border border-[#2D55FB]/20 flex items-center justify-center shrink-0">
    {children}
  </div>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[11px] font-bold tracking-wider text-white/40 uppercase">
    {children}
  </span>
);

// ── Component ─────────────────────────────────────────────────────────────────
const InterviewInstructions: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [interview, setInterview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setInterviewInfo, setUserData } = useAuth();
  const [selectedVoice, setSelectedVoice] = useState<"female" | "male">(
    "female",
  );
  const [now] = useState(new Date());

  const isMCQ = interview?.examType === "MCQ";
  const structure = isMCQ ? MCQ_STRUCTURE : AI_STRUCTURE;
  const techRequirements = isMCQ ? MCQ_TECH_REQUIREMENTS : AI_TECH_REQUIREMENTS;
  const guidelines = isMCQ ? MCQ_GUIDELINES : AI_GUIDELINES;
  const notice = isMCQ ? MCQ_NOTICE : AI_NOTICE;
  const title = isMCQ ? MCQ_TITLE : AI_TITLE;

  const position = interview?.test_title ?? interview?.position ?? "Position";
  const company = interview?.companyName ?? "Vitric Business Solutions";
  const duration = interview?.duration
    ? `${interview.duration} minutes`
    : "N/A";
  const description =
    interview?.jobDescriptionText ??
    interview?.description ??
    "No job description provided.";

  useEffect(() => {
    const fetchInterviewInstruction = async (id: string) => {
      try {
        const response = await userService.getInterviewInstruction(id!);
        setInterview(response?.interview);
        setInterviewInfo(response?.interview);
        setUserData(response?.user);
      } catch (error) {
        console.error(error);
      }
    };
    fetchInterviewInstruction(id!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartAssessment = async () => {
    if (isMCQ) {
      try {
        setIsLoading(true);

        // Request fullscreen before anything else
        await requestFullscreen();

        await userService.generateMCQ(
          {
            jobDescription: interview?.jobDescription,
            topic: interview?.test_title ?? interview?.position,
            difficulty: interview?.difficulty,
            examType: "MCQ",
            count: parseInt(interview?.no_of_questions),
          },
          id!,
        );

        navigate(userPath("mcq", id), {
          state: { title: interview?.title, time: interview?.duration },
        });
      } catch (error) {
        console.error("Failed to generate MCQ questions:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Request fullscreen before navigating to video interview
      await requestFullscreen();

      navigate(userPath("videoInterview", id), {
        state: {
          title: interview?.title,
          time: interview?.duration,
          voice: selectedVoice,
        },
      });
    }
  };

  const fmtClock = (d: Date) => {
    let h = d.getHours();
    const m = d.getMinutes();
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, "0")} ${ap}`;
  };
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="min-h-screen bg-[#050A24] bg-[radial-gradient(ellipse_at_70%_-10%,rgba(45,85,251,0.18),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgba(20,40,120,0.18),transparent_55%)] px-5 sm:px-8 lg:px-10 py-7">
      <div className="max-w-6xl mx-auto">
        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            {/* <div className="w-8 h-8 rounded-lg bg-[#2D55FB] flex items-center justify-center shrink-0">
              <div className="w-3.5 h-3.5 rounded-[3px] bg-white" />
            </div> */}
            <h1 className="text-white font-bold text-lg tracking-tight">
              Vitric IQ
            </h1>
          </div>
          <div className="flex items-center gap-2.5 text-white/50 text-sm">
            <Clock className="h-4 w-4" />
            <span>{fmtClock(now)}</span>
            <span className="text-white/20">•</span>
            <Calendar className="h-4 w-4" />
            <span>{fmtDate(now)}</span>
          </div>
        </div>

        {/* ── Heading + CTA ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-7">
          <div>
            <h2 className="text-white text-3xl font-bold tracking-tight mb-1.5">
              {title}
            </h2>
            <p className="text-white/40 text-sm">
              Please read these instructions carefully before proceeding
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <button
              onClick={handleStartAssessment}
              disabled={isLoading}
              className="flex items-center gap-2 bg-[#2D55FB] hover:bg-[#1e3fd4] text-white font-semibold rounded-xl px-6 py-3 shadow-lg shadow-[#2D55FB]/30 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Setting up...
                </>
              ) : (
                <>
                  <Maximize className="h-4 w-4" />
                  Start Assessment
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <div className="flex items-center gap-1.5 text-white/35 text-xs">
              <Lock className="h-3 w-3" />
              Your interview will begin immediately
            </div>
          </div>
        </div>

        {/* ── Position / Duration / Description ────────────────────────── */}
        <SectionCard className="p-6 mb-5">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
            <div className="flex items-center gap-4 flex-1">
              <IconBadge>
                <Briefcase className="h-5 w-5 text-[#2D55FB]" />
              </IconBadge>
              <div>
                <Eyebrow>Position</Eyebrow>
                <p className="text-white text-lg font-bold leading-tight mt-0.5">
                  {position}
                </p>
                <p className="text-white/40 text-sm">{company}</p>
              </div>
            </div>
            <div className="hidden sm:block w-px bg-white/10" />
            <div className="flex items-center gap-4 flex-1">
              <IconBadge>
                {isMCQ ? (
                  <FileText className="h-5 w-5 text-[#2D55FB]" />
                ) : (
                  <Clock className="h-5 w-5 text-[#2D55FB]" />
                )}
              </IconBadge>
              <div>
                <Eyebrow>Duration</Eyebrow>
                <p className="text-white text-lg font-bold leading-tight mt-0.5">
                  {duration}
                </p>
                <p className="text-white/40 text-sm">
                  {isMCQ ? "MCQ Assessment" : "AI Video Interview"}
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/10 my-5" />

          <div className="flex items-start gap-4">
            <IconBadge>
              <ClipboardList className="h-5 w-5 text-[#2D55FB]" />
            </IconBadge>
            <div>
              <Eyebrow>Job Description</Eyebrow>
              <p className="text-white/70 text-sm leading-relaxed mt-1 max-w-3xl">
                {description}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ── Voice selection — AI Interview only ─────────────────────────── */}
        {!isMCQ && (
          <SectionCard className="p-6 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Mic className="h-5 w-5 text-[#2D55FB] shrink-0" />
                <div>
                  <p className="text-white font-semibold text-sm">
                    Voice Selection
                  </p>
                  <p className="text-white/40 text-xs">
                    Choose the voice you're comfortable with
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Female */}
                <button
                  onClick={() => setSelectedVoice("female")}
                  className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 transition-colors ${
                    selectedVoice === "female"
                      ? "border-[#2D55FB] bg-[#2D55FB]/10"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="text-lg">👩</span>
                  <span className="text-white text-sm font-semibold">
                    Female
                  </span>
                  <span className="text-white/40 text-sm">• Aria</span>
                  {selectedVoice === "female" && (
                    <span className="w-4 h-4 rounded-full bg-[#2D55FB] flex items-center justify-center ml-1">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </span>
                  )}
                </button>

                {/* Male */}
                <button
                  onClick={() => setSelectedVoice("male")}
                  className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 transition-colors ${
                    selectedVoice === "male"
                      ? "border-[#2D55FB] bg-[#2D55FB]/10"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="text-lg">👨</span>
                  <span className="text-white text-sm font-semibold">
                    Male
                  </span>
                  <span className="text-white/40 text-sm">• Orion</span>
                  {selectedVoice === "male" && (
                    <span className="w-4 h-4 rounded-full bg-[#2D55FB] flex items-center justify-center ml-1">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── 3 info columns ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
          <SectionCard className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <IconBadge>
                {isMCQ ? (
                  <LayoutGrid className="h-5 w-5 text-[#2D55FB]" />
                ) : (
                  <Video className="h-5 w-5 text-[#2D55FB]" />
                )}
              </IconBadge>
              <Eyebrow>Assessment Structure</Eyebrow>
            </div>
            <div className="space-y-4">
              {structure.map(({ step, title, sub }) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#2D55FB] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {step}
                  </span>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {title}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <IconBadge>
                <Monitor className="h-5 w-5 text-[#2D55FB]" />
              </IconBadge>
              <Eyebrow>Technical Requirements</Eyebrow>
            </div>
            <ul className="space-y-3">
              {techRequirements.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-2.5 text-white/70 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <IconBadge>
                <Video className="h-5 w-5 text-[#2D55FB]" />
              </IconBadge>
              <Eyebrow>
                {isMCQ ? "MCQ Guidelines" : "Video Interview Guidelines"}
              </Eyebrow>
            </div>
            <ul className="space-y-3">
              {guidelines.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-2.5 text-white/70 text-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D55FB] shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {/* ── Important notice ──────────────────────────────────────────── */}
        <SectionCard className="p-6 mb-7">
          <div className="flex items-center gap-2.5 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <Eyebrow>Important Notice</Eyebrow>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {notice.map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 inline-block" />
                </div>
                <p className="text-white/50 text-[13px] leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 text-white/40 text-sm pb-6">
          <HelpCircle className="h-4 w-4" />
          <span>
            Need help?{" "}
            <a href="#" className="text-[#2D55FB] hover:underline">
              Contact Support
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default InterviewInstructions;