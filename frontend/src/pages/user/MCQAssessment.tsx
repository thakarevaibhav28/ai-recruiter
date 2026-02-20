// import React, { useState, useEffect } from "react";
// import { ChevronLeft, ChevronRight, Flag, Clock, X, CheckCircle, BarChart2 } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// interface Question {
//   id: number;
//   text: string;
//   options: string[];
// }

// const questions: Question[] = [
//   {
//     id: 1,
//     text: "What is the virtual DOM in React?",
//     options: [
//       "A copy of the real DOM kept in memory",
//       "A Javascript representations of the actual DOM",
//       "A browser API for DOM manipultions",
//       "A React-specific HTML syntax",
//     ],
//   },
//   {
//     id: 2,
//     text: "Which hook is used to manage side effects in React?",
//     options: ["useState", "useEffect", "useContext", "useReducer"],
//   },
//   {
//     id: 3,
//     text: "What does CSS stand for?",
//     options: [
//       "Cascading Style Sheets",
//       "Creative Style System",
//       "Computer Style Sheets",
//       "Colorful Style Syntax",
//     ],
//   },
//   {
//     id: 4,
//     text: "Which method is used to update state in a class component?",
//     options: ["this.updateState()", "this.setState()", "this.changeState()", "this.modifyState()"],
//   },
//   {
//     id: 5,
//     text: "What is the purpose of keys in React lists?",
//     options: [
//       "To style list items",
//       "To help React identify which items have changed",
//       "To sort the list automatically",
//       "To add click handlers",
//     ],
//   },
// ];

// type QuestionStatus = "not-answered" | "answered" | "flagged" | "current";

// const MCQAssessment: React.FC<{ onSubmit?: () => void }> = ({ onSubmit }) => {
//   const [currentQ, setCurrentQ] = useState(0);
//   const [answers, setAnswers] = useState<Record<number, number>>({});
//   const [flagged, setFlagged] = useState<Set<number>>(new Set());
//   const [timeLeft, setTimeLeft] = useState(28 * 60 + 14);
//   const [showSubmitModal, setShowSubmitModal] = useState(false);
//   const [showSidePanel, setShowSidePanel] = useState(false); // mobile drawer

//   useEffect(() => {
//     const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const formatTime = (s: number) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

//   const isWarning = timeLeft < 5 * 60;

//   const getStatus = (idx: number): QuestionStatus => {
//     if (idx === currentQ) return "current";
//     if (flagged.has(idx)) return "flagged";
//     if (answers[idx] !== undefined) return "answered";
//     return "not-answered";
//   };

//   const statusStyle: Record<QuestionStatus, string> = {
//     current: "bg-[#2D55FB] text-white border-[#2D55FB]",
//     answered: "bg-green-600/80 text-white border-green-600",
//     flagged: "bg-amber-600/70 text-white border-amber-600",
//     "not-answered": "bg-[#1a2850] text-gray-400 border-gray-600",
//   };

//   const answered = Object.keys(answers).length;
//   const flaggedCount = flagged.size;
//   const progress = ((currentQ + 1) / questions.length) * 100;

//   const toggleFlag = () => {
//     setFlagged((prev) => {
//       const next = new Set(prev);
//       if (next.has(currentQ)) next.delete(currentQ);
//       else next.add(currentQ);
//       return next;
//     });
//   };

//   const handleSubmit = () => {
//     setShowSubmitModal(false);
//     onSubmit?.();
//   };

//   const SidebarContent = () => (
//     <div className="flex flex-col gap-4">
//       {/* Question Navigator */}
//       <div className="bg-[#0d1535]/80 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
//         <h3 className="text-white font-semibold text-sm mb-1">Question Navigator</h3>
//         <p className="text-gray-500 text-xs mb-3">{answered} of {questions.length} answered</p>
//         <div className="grid grid-cols-5 gap-2 mb-4">
//           {questions.map((_, i) => {
//             const status = getStatus(i);
//             return (
//               <motion.button
//                 key={i}
//                 onClick={() => { setCurrentQ(i); setShowSidePanel(false); }}
//                 className={`w-full aspect-square rounded-lg border text-xs font-semibold transition-all ${statusStyle[status]}`}
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 {i + 1}
//               </motion.button>
//             );
//           })}
//         </div>
//         <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
//           {[
//             { color: "bg-green-600/80", label: "Answered" },
//             { color: "bg-amber-600/70", label: "Flagged" },
//             { color: "bg-[#1a2850]", label: "Not Answered" },
//             { color: "bg-[#2D55FB]", label: "Current" },
//           ].map(({ color, label }) => (
//             <div key={label} className="flex items-center gap-2">
//               <div className={`w-3 h-3 rounded-sm shrink-0 ${color}`} />
//               <span className="text-gray-400 text-xs">{label}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Test Summary */}
//       <div className="bg-[#0d1535]/80 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
//         <h3 className="text-white font-semibold text-sm mb-3">Test Summary</h3>
//         <div className="space-y-2.5">
//           {[
//             { label: "Total Questions :", value: questions.length, color: "text-white" },
//             { label: "Answered :", value: answered, color: "text-blue-400" },
//             { label: "Flagged :", value: flaggedCount, color: "text-amber-400" },
//             { label: "Remaining :", value: questions.length - answered, color: "text-white" },
//           ].map(({ label, value, color }) => (
//             <div key={label} className="flex items-center justify-between">
//               <span className="text-gray-400 text-xs">{label}</span>
//               <span className={`text-sm font-semibold ${color}`}>{value}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-[#050A24] bg-[radial-gradient(circle_at_80%_10%,rgba(45,85,251,0.3),transparent_50%),radial-gradient(circle_at_10%_90%,rgba(45,85,251,0.2),transparent_50%)] relative overflow-hidden">
//       {/* Orbs */}
//       <motion.div
//         className="absolute -top-20 -right-20 w-[150px] h-[150px] md:w-[200px] md:h-[200px] bg-[#2D55FB] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
//         animate={{ x: [0, 30, -20, 0], y: [0, -50, 20, 0] }}
//         transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <motion.div
//         className="absolute -bottom-20 -left-20 w-[150px] h-[150px] md:w-[200px] md:h-[200px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
//         animate={{ x: [0, -40, 30, 0], y: [0, 40, -30, 0] }}
//         transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//       />

//       <div className="relative z-10 p-3 sm:p-4 lg:p-6 max-w-[1400px] mx-auto">

//         {/* ── TOP HEADER ── */}
//         <div className="bg-[#0d1535]/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-white/10 mb-4 flex items-center justify-between gap-2">
//           <div className="min-w-0">
//             <h1 className="text-white font-bold text-sm sm:text-base lg:text-lg truncate">Frontend Developer MCQ Test</h1>
//             <p className="text-gray-500 text-xs">Question {currentQ + 1} of {questions.length}</p>
//           </div>

//           <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
//             {/* Saved - hidden on very small */}
//             <div className="hidden xs:flex items-center gap-1.5">
//               <div className="w-2 h-2 rounded-full bg-green-400" />
//               <span className="text-green-400 text-xs sm:text-sm font-medium">Saved</span>
//             </div>

//             {/* Timer */}
//             <div className={`flex items-center gap-1 sm:gap-1.5 ${isWarning ? "text-red-400" : "text-red-400"}`}>
//               <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
//               <span className={`font-mono font-semibold text-sm sm:text-base ${isWarning ? "text-red-400" : "text-red-400"}`}>
//                 {formatTime(timeLeft)}
//               </span>
//             </div>

//             {/* Mobile navigator trigger */}
//             <button
//               onClick={() => setShowSidePanel(true)}
//               className="flex lg:hidden items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2D55FB]/20 border border-[#2D55FB]/40 text-[#2D55FB] text-xs font-medium"
//             >
//               <BarChart2 className="h-3.5 w-3.5" />
//               <span className="hidden sm:inline">Navigator</span>
//             </button>

//             {/* Submit */}
//             <motion.button
//               onClick={() => setShowSubmitModal(true)}
//               className="px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-green-500 hover:bg-green-400 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
//               whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
//             >
//               Submit Test
//             </motion.button>
//           </div>
//         </div>

//         {/* ── MAIN LAYOUT ── */}
//         <div className="flex gap-4 lg:gap-5">

//           {/* ── QUESTION PANEL ── */}
//           <motion.div
//             className="flex-1 min-w-0 bg-[#0d1535]/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 border border-white/10 flex flex-col"
//             style={{ minHeight: "clamp(420px, 65vh, 560px)" }}
//             key={currentQ}
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             {/* Q header */}
//             <div className="flex items-center justify-between mb-3">
//               <h2 className="text-white font-semibold text-base sm:text-lg">Question {currentQ + 1}</h2>
//               <button
//                 onClick={toggleFlag}
//                 className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
//                   flagged.has(currentQ)
//                     ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
//                     : "bg-white/5 border-white/20 text-gray-400 hover:text-white"
//                 }`}
//               >
//                 <Flag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//                 <span className="hidden xs:inline">{flagged.has(currentQ) ? "Flagged" : "Flag"}</span>
//               </button>
//             </div>

//             {/* Progress bar */}
//             <div className="h-1 bg-[#1a2850] rounded-full mb-4 sm:mb-5 overflow-hidden">
//               <motion.div
//                 className="h-full bg-gradient-to-r from-[#2D55FB] to-blue-400 rounded-full"
//                 initial={{ width: 0 }}
//                 animate={{ width: `${progress}%` }}
//                 transition={{ duration: 0.5 }}
//               />
//             </div>

//             {/* Question text */}
//             <p className="text-white text-sm sm:text-base lg:text-lg mb-4 sm:mb-5 leading-relaxed">
//               {questions[currentQ].text}
//             </p>

//             {/* Options */}
//             <div className="space-y-2.5 sm:space-y-3 flex-1">
//               {questions[currentQ].options.map((opt, i) => {
//                 const selected = answers[currentQ] === i;
//                 return (
//                   <motion.button
//                     key={i}
//                     onClick={() => setAnswers((prev) => ({ ...prev, [currentQ]: i }))}
//                     className={`w-full flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-left transition-all text-sm ${
//                       selected
//                         ? "border-[#2D55FB] bg-[#2D55FB]/15"
//                         : "border-gray-700/50 bg-[#0a0f2e]/60 hover:border-gray-600 hover:bg-[#0a0f2e]/80"
//                     }`}
//                     whileHover={{ scale: 1.005 }}
//                     whileTap={{ scale: 0.998 }}
//                   >
//                     <div
//                       className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
//                         selected ? "border-[#2D55FB]" : "border-gray-600"
//                       }`}
//                     >
//                       {selected && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#2D55FB]" />}
//                     </div>
//                     <span className={`text-xs sm:text-sm leading-snug ${selected ? "text-white" : "text-gray-300"}`}>
//                       {opt}
//                     </span>
//                   </motion.button>
//                 );
//               })}
//             </div>

//             {/* Navigation buttons */}
//             <div className="flex items-center justify-between mt-5 sm:mt-6">
//               <button
//                 onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
//                 disabled={currentQ === 0}
//                 className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-700/50 text-gray-400 text-xs sm:text-sm hover:border-gray-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
//               >
//                 <ChevronLeft className="h-4 w-4" />
//                 <span>Previous</span>
//               </button>

//               {/* Dot indicators - visible on mobile */}
//               <div className="flex items-center gap-1.5 lg:hidden">
//                 {questions.map((_, i) => (
//                   <button
//                     key={i}
//                     onClick={() => setCurrentQ(i)}
//                     className={`rounded-full transition-all ${
//                       i === currentQ ? "w-5 h-2 bg-[#2D55FB]" : "w-2 h-2 bg-gray-600 hover:bg-gray-500"
//                     }`}
//                   />
//                 ))}
//               </div>

//               <button
//                 onClick={() => setCurrentQ((q) => Math.min(questions.length - 1, q + 1))}
//                 disabled={currentQ === questions.length - 1}
//                 className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-[#2D55FB] text-white bg-[#2D55FB]/20 text-xs sm:text-sm hover:bg-[#2D55FB]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
//               >
//                 <span>Next</span>
//                 <ChevronRight className="h-4 w-4" />
//               </button>
//             </div>
//           </motion.div>

//           {/* ── DESKTOP SIDEBAR ── */}
//           <div className="hidden lg:flex w-56 xl:w-64 flex-col gap-4 shrink-0">
//             <SidebarContent />
//           </div>
//         </div>
//       </div>

//       {/* ── MOBILE SIDE DRAWER ── */}
//       <AnimatePresence>
//         {showSidePanel && (
//           <>
//             <motion.div
//               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
//               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//               onClick={() => setShowSidePanel(false)}
//             />
//             <motion.div
//               className="fixed right-0 top-0 h-full w-72 sm:w-80 bg-[#080f2a] border-l border-white/10 z-50 overflow-y-auto p-4 lg:hidden"
//               initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
//               transition={{ type: "spring", stiffness: 300, damping: 30 }}
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-white font-semibold text-base">Question Navigator</h2>
//                 <button onClick={() => setShowSidePanel(false)} className="text-gray-400 hover:text-white p-1">
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//               <SidebarContent />
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       {/* ── SUBMIT MODAL ── */}
//       <AnimatePresence>
//         {showSubmitModal && (
//           <motion.div
//             className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="bg-[#0d1535] border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-sm"
//               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
//             >
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
//                   <CheckCircle className="h-5 w-5 text-green-400" />
//                 </div>
//                 <h3 className="text-white font-bold text-base sm:text-lg">Submit Test?</h3>
//               </div>
//               <p className="text-gray-400 text-sm mb-2">
//                 You have answered <span className="text-white font-semibold">{answered}</span> of{" "}
//                 <span className="text-white font-semibold">{questions.length}</span> questions.
//               </p>
//               {flaggedCount > 0 && (
//                 <p className="text-amber-400 text-xs mb-4">⚠ {flaggedCount} question(s) still flagged for review.</p>
//               )}
//               {!flaggedCount && <div className="mb-4" />}
//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setShowSubmitModal(false)}
//                   className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 text-sm hover:border-gray-500 hover:text-white transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmit}
//                   className="flex-1 py-2.5 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-400 transition-colors"
//                 >
//                   Submit
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default MCQAssessment;
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Flag, Clock, X, CheckCircle, BarChart2, Loader2, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { userService } from "../../services/service/userService";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer?: string;
}

interface AnswerState {
  questionId: string;
  selectedOption: string;
  submitted: boolean;
  score: number | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const parseDuration = (t: string) => {
  const match = t?.match(/(\d+)/);
  return match ? parseInt(match[1]) * 60 : 15 * 60;
};

// ─── Component ──────────────────────────────────────────────────────────────
const MCQAssessment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { title, time } = (location.state as { title: string; time: string }) ?? {};

  // ── State ──
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(() => parseDuration(time));
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [finalSubmitting, setFinalSubmitting] = useState(false);
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  const [totalScore, setTotalScore] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabSwitchAlert, setShowTabSwitchAlert] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch questions ──
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await userService.getMCQAssessment(id!);
        const qs: Question[] = res?.questions ?? res?.data ?? [];
        setQuestions(qs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [id]);

  // ── Final Submit ──
  const handleFinalSubmit = useCallback(async () => {
    if (finalSubmitting || phase === "result") return;
    setFinalSubmitting(true);
    setShowSubmitModal(false);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const answersArray = Object.values(answers).map((a) => ({
        questionId: a.questionId,
        answerText: a.selectedOption,
      }));
      const res = await userService.finalSubmitMCQAssessment(id!, { answers: answersArray });
      const score = Object.values(answers).reduce((acc, a) => acc + (a.score ?? 0), 0);
      setTotalScore(res?.totalScore ?? score);
    } catch (e) {
      console.error(e);
      const score = Object.values(answers).reduce((acc, a) => acc + (a.score ?? 0), 0);
      setTotalScore(score);
    } finally {
      setFinalSubmitting(false);
      setPhase("result");
    }
  }, [answers, finalSubmitting, id, phase]);

  // ── Handle Tab Switch Alert Close ──
  const handleTabAlertClose = useCallback(() => {
    if (tabSwitchCount >= 3) {
      // Auto-fail the test
      setShowTabSwitchAlert(false);
      setFinalSubmitting(true);
      setShowSubmitModal(false);
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Set score to 0 and submit
      setTotalScore(0);
      setPhase("result");
      setFinalSubmitting(false);
    } else {
      setShowTabSwitchAlert(false);
    }
  }, [tabSwitchCount]);

  // ── Timer ──
  useEffect(() => {
    if (loading || phase === "result") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [loading, phase, handleFinalSubmit]);

  // ── Tab Switch Detection ──
  useEffect(() => {
    if (loading || phase === "result") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab switched away
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          setShowTabSwitchAlert(true);

          // Auto-fail after 3 alerts
          if (newCount >= 3) {
            // Will be handled by the modal close or automatic submission
          }

          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loading, phase]);

  // ── Prevent Browser Back/Forward Navigation ──
  useEffect(() => {
    if (loading || phase === "result") return;

    // Push a state to prevent back navigation
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Push state again to prevent actual navigation
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [loading, phase]);

  // ── Select option locally (no API call) ──
  const handleSelectOption = (opt: string) => {
    const question = questions[currentQ];
    if (!question || answers[question._id]?.submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [question._id]: {
        questionId: question._id,
        selectedOption: opt,
        submitted: false,
        score: null,
      },
    }));
  };

  // ── Submit single answer (API call on button click) ──
  const handleSubmitAnswer = async () => {
    const question = questions[currentQ];
    if (!question) return;
    const selected = answers[question._id]?.selectedOption;
    if (!selected || answers[question._id]?.submitted) return;

    setSubmittingAnswer(true);
    try {
      const res = await userService.submitMCQAssessment(id!, {
        questionId: question._id,
        answerText: selected,
      });
      const score: number = res?.evaluation?.score ?? 0;
      setAnswers((prev) => ({
        ...prev,
        [question._id]: {
          questionId: question._id,
          selectedOption: selected,
          submitted: true,
          score,
        },
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // ── Derived ──
  const currentQuestion = questions[currentQ];
  const currentAnswer = currentQuestion ? answers[currentQuestion._id] : undefined;
  const isWarning = timeLeft < 5 * 60;
  const progress = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.values(answers).filter((a) => a.submitted).length;
  const flaggedCount = flagged.size;

  type QuestionStatus = "not-answered" | "answered" | "flagged" | "current";
  const getStatus = (idx: number): QuestionStatus => {
    if (idx === currentQ) return "current";
    const q = questions[idx];
    if (flagged.has(idx)) return "flagged";
    if (q && answers[q._id]?.submitted) return "answered";
    return "not-answered";
  };

  const statusStyle: Record<QuestionStatus, string> = {
    current: "bg-[#2D55FB] text-white border-[#2D55FB]",
    answered: "bg-green-600/80 text-white border-green-600",
    flagged: "bg-amber-600/70 text-white border-amber-600",
    "not-answered": "bg-[#1a2850] text-gray-400 border-gray-600",
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ)) next.delete(currentQ);
      else next.add(currentQ);
      return next;
    });
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060d24] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#2D55FB] animate-spin" />
          <p className="text-gray-400 text-sm">Loading assessment…</p>
        </div>
      </div>
    );
  }

  // ─── Result Screen ─────────────────────────────────────────────────────────
  if (phase === "result") {
    const maxScore = questions.length * 10;
    const percent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percent >= 70;

    return (
      <div className="min-h-screen bg-[#060d24] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#0d1836] border border-gray-700/40 rounded-2xl p-8 text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? "bg-green-500/20" : "bg-red-500/20"}`}
          >
            {passed ? (
              <Trophy className="w-10 h-10 text-green-400" />
            ) : (
              <BarChart2 className="w-10 h-10 text-red-400" />
            )}
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-1">
            {passed ? "Assessment Passed!" : "Assessment Complete"}
          </h2>
          <p className="text-gray-400 text-sm mb-8">{title ?? "MCQ Assessment"}</p>

          {/* Score ring */}
          <div className="relative w-36 h-36 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1a2850" strokeWidth="10" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none"
                stroke={passed ? "#22c55e" : "#ef4444"}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - percent / 100) }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{percent}%</span>
              <span className="text-xs text-gray-400">Score</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Points", value: totalScore, color: "text-white" },
              { label: "Questions", value: questions.length, color: "text-white" },
              { label: "Result", value: passed ? "Pass" : "Fail", color: passed ? "text-green-400" : "text-red-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#1a2850] rounded-xl p-3">
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          <motion.button
            onClick={() => navigate(`/user/${id}/assessment-complete`)}
            className="w-full py-3 bg-[#2D55FB] text-white font-semibold rounded-xl hover:bg-[#1e3fd4] transition-all shadow-lg shadow-[#2D55FB]/30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            OK
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── Sidebar (shared desktop + mobile) ──
  const SidebarContent = () => (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Question Navigator</h3>
        <p className="text-xs text-gray-500">
          {answeredCount} of {questions.length} answered
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((_, i) => {
          const status = getStatus(i);
          return (
            <motion.button
              key={i}
              onClick={() => { setCurrentQ(i); setShowSidePanel(false); }}
              className={`w-full aspect-square rounded-lg border text-xs font-semibold transition-all ${statusStyle[status]}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {i + 1}
            </motion.button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { color: "bg-green-600/80", label: "Answered" },
          { color: "bg-amber-600/70", label: "Flagged" },
          { color: "bg-[#1a2850]", label: "Not Answered" },
          { color: "bg-[#2D55FB]", label: "Current" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      <div className="bg-[#0a0f2e] rounded-xl p-4 border border-gray-700/40">
        <h4 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5" /> Test Summary
        </h4>
        {[
          { label: "Total Questions :", value: questions.length, color: "text-white" },
          { label: "Answered :", value: answeredCount, color: "text-blue-400" },
          { label: "Flagged :", value: flaggedCount, color: "text-amber-400" },
          { label: "Remaining :", value: questions.length - answeredCount, color: "text-white" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-700/30 last:border-0">
            <span className="text-xs text-gray-400">{label}</span>
            <span className={`text-xs font-semibold ${color}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Quiz Screen ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060d24] text-white flex flex-col">

      {/* ── TOP HEADER ── */}
      <div className="sticky top-0 z-30 bg-[#060d24]/95 backdrop-blur border-b border-gray-700/30 px-3 sm:px-4 lg:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-white truncate">
              {title ?? "MCQ Assessment"}
            </h1>
            <p className="text-xs text-gray-500">
              Question {currentQ + 1} of {questions.length}
            </p>
          </div>

          {/* Saved / Saving indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
            {submittingAnswer ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2D55FB]" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-green-500" />
            )}
            {submittingAnswer ? "Saving…" : "Saved"}
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-mono font-semibold ${
            isWarning
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : "border-gray-700/50 bg-[#0d1836] text-gray-300"
          }`}>
            <Clock className={`w-3.5 h-3.5 ${isWarning ? "animate-pulse" : ""}`} />
            {formatTime(timeLeft)}
          </div>

          {/* Mobile navigator trigger */}
          <button
            onClick={() => setShowSidePanel(true)}
            className="flex lg:hidden items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2D55FB]/20 border border-[#2D55FB]/40 text-[#2D55FB] text-xs font-medium"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Navigator
          </button>

          {/* Submit */}
          <motion.button
            onClick={() => setShowSubmitModal(true)}
            disabled={finalSubmitting}
            className="px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-green-500 hover:bg-green-400 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {finalSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Test"}
          </motion.button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 gap-4 lg:gap-6">

        {/* ── QUESTION PANEL ── */}
        <div className="flex-1 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0d1836] border border-gray-700/40 rounded-2xl p-4 sm:p-6 flex flex-col gap-5"
            >
              {/* Q header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#2D55FB] bg-[#2D55FB]/10 px-2.5 py-1 rounded-full border border-[#2D55FB]/20">
                    Question {currentQ + 1}
                  </span>
                </div>
                <motion.button
                  onClick={toggleFlag}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                    flagged.has(currentQ)
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                      : "bg-transparent border-gray-600 text-gray-500 hover:border-amber-500/40 hover:text-amber-400"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Flag className="w-3 h-3" />
                  {flagged.has(currentQ) ? "Flagged" : "Flag"}
                </motion.button>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-gray-700/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#2D55FB] rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Question text */}
              <p className="text-white text-sm sm:text-base leading-relaxed font-medium">
                {currentQuestion?.questionText}
              </p>

              {/* Options */}
              <div className="flex flex-col gap-2.5">
                {currentQuestion?.options?.map((opt, i) => {
                  const isSelected = currentAnswer?.selectedOption === opt;
                  const isSubmitted = !!currentAnswer?.submitted;
                  const isCorrect = isSubmitted && currentQuestion.correctAnswer === opt;
                  const isWrong = isSubmitted && isSelected && (currentAnswer?.score ?? 0) === 0;

                  let optionClass =
                    "border-gray-700/50 bg-[#0a0f2e]/60 hover:border-gray-600 hover:bg-[#0a0f2e]/80";
                  if (!isSubmitted && isSelected)
                    optionClass = "border-[#2D55FB] bg-[#2D55FB]/15";
                  if (isSubmitted && isCorrect)
                    optionClass = "border-green-500/60 bg-green-500/10";
                  if (isSubmitted && isWrong)
                    optionClass = "border-red-500/60 bg-red-500/10";

                  return (
                    <motion.button
                      key={i}
                      onClick={() => !isSubmitted && handleSelectOption(opt)}
                      disabled={isSubmitted || submittingAnswer}
                      className={`w-full flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-left transition-all text-sm ${optionClass} ${
                        isSubmitted ? "cursor-default" : "cursor-pointer"
                      }`}
                      whileHover={!isSubmitted ? { scale: 1.005 } : {}}
                      whileTap={!isSubmitted ? { scale: 0.998 } : {}}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSubmitted && isCorrect
                          ? "border-green-500 bg-green-500"
                          : isSubmitted && isWrong
                          ? "border-red-500 bg-red-500"
                          : isSelected
                          ? "border-[#2D55FB] bg-[#2D55FB]"
                          : "border-gray-600"
                      }`}>
                        {isSubmitted && isCorrect ? (
                          <CheckCircle className="w-3 h-3 text-white" />
                        ) : isSubmitted && isWrong ? (
                          <X className="w-3 h-3 text-white" />
                        ) : isSelected ? (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        ) : null}
                      </div>
                      <span className={`flex-1 ${
                        isSubmitted && isCorrect
                          ? "text-green-400"
                          : isSubmitted && isWrong
                          ? "text-red-400"
                          : isSelected
                          ? "text-white"
                          : "text-gray-300"
                      }`}>
                        {opt}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* ── Submit Answer Button (only shows when option selected but not yet submitted) ── */}
              {currentAnswer && !currentAnswer.submitted && (
                <motion.button
                  onClick={handleSubmitAnswer}
                  disabled={submittingAnswer}
                  className="w-full py-3 bg-[#2D55FB] hover:bg-[#1e3fd4] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#2D55FB]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {submittingAnswer ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {submittingAnswer ? "Submitting…" : "Submit Answer"}
                </motion.button>
              )}

              {/* ── Submitted confirmation ── */}
              {/* {currentAnswer?.submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 text-green-400 text-sm font-medium py-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Answer submitted — {currentAnswer.score ?? 0} pts
                </motion.div>
              )} */}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-700/30">
                <motion.button
                  onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                  disabled={currentQ === 0}
                  className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-700/50 text-gray-400 text-xs sm:text-sm hover:border-gray-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </motion.button>

                {/* Dot indicators - mobile */}
                <div className="flex items-center gap-1 overflow-hidden max-w-[120px] sm:max-w-[200px]">
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQ(i)}
                      className={`rounded-full transition-all ${
                        i === currentQ
                          ? "w-5 h-2 bg-[#2D55FB]"
                          : "w-2 h-2 bg-gray-600 hover:bg-gray-500"
                      }`}
                    />
                  ))}
                </div>

                <motion.button
                  onClick={() => setCurrentQ((q) => Math.min(questions.length - 1, q + 1))}
                  disabled={currentQ === questions.length - 1}
                  className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-[#2D55FB] text-white bg-[#2D55FB]/20 text-xs sm:text-sm hover:bg-[#2D55FB]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── DESKTOP SIDEBAR ── */}
        <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
          <div className="sticky top-24 bg-[#0d1836] border border-gray-700/40 rounded-2xl p-5">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* ── MOBILE SIDE DRAWER ── */}
      {showSidePanel && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setShowSidePanel(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed right-0 top-0 h-full w-72 bg-[#0d1836] border-l border-gray-700/40 z-50 p-5 overflow-y-auto lg:hidden"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white">Question Navigator</h3>
              <button
                onClick={() => setShowSidePanel(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <SidebarContent />
          </motion.div>
        </>
      )}

      {/* ── TAB SWITCH ALERT MODAL ── */}
      {showTabSwitchAlert && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl p-6 w-full max-w-sm shadow-2xl border ${
              tabSwitchCount >= 3
                ? "bg-red-500/10 border-red-500/40"
                : "bg-[#0d1836] border-gray-700/40"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  tabSwitchCount >= 3
                    ? "bg-red-500/20"
                    : "bg-amber-500/20"
                }`}
              >
                <span
                  className={`text-xl font-bold ${
                    tabSwitchCount >= 3
                      ? "text-red-400"
                      : "text-amber-400"
                  }`}
                >
                  ⚠
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  {tabSwitchCount >= 3
                    ? "Test Terminated"
                    : "Tab Switch Detected"}
                </h3>
                <p className={`text-xs ${
                  tabSwitchCount >= 3
                    ? "text-red-400"
                    : "text-amber-400"
                }`}>
                  {tabSwitchCount >= 3
                    ? "Test failed - 0 marks awarded"
                    : `Warning ${tabSwitchCount} of 3`}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              {tabSwitchCount >= 3
                ? "You switched tabs 3 times. Your test has been automatically ended with 0 marks."
                : `You switched to another tab. Please stay on this window while taking the test. You have ${3 - tabSwitchCount} ${3 - tabSwitchCount === 1 ? "warning" : "warnings"} remaining before the test is ended.`}
            </p>

            <motion.button
              onClick={handleTabAlertClose}
              className="w-full py-2.5 rounded-lg bg-[#2D55FB] hover:bg-[#1e3fd4] text-white text-sm font-semibold transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tabSwitchCount >= 3 ? "View Results" : "OK"}
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* ── SUBMIT MODAL ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0d1836] border border-gray-700/40 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <h3 className="text-base font-semibold text-white mb-2">Submit Test?</h3>
            <p className="text-sm text-gray-400 mb-4">
              You have answered {answeredCount} of{" "}
              {questions.length} questions.
            </p>

            {flaggedCount > 0 && (
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4">
                <span className="text-amber-400 text-xs">
                  ⚠ {flaggedCount} question(s) still flagged for review.
                </span>
              </div>
            )}

            {!flaggedCount && (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-4">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-green-400 text-xs">Ready to submit.</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 text-sm hover:border-gray-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleFinalSubmit}
                disabled={finalSubmitting}
                className="flex-1 py-2.5 rounded-lg bg-green-500 hover:bg-green-400 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {finalSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MCQAssessment;