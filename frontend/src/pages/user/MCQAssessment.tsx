import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Flag, Clock, X, CheckCircle, BarChart2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  text: string;
  options: string[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "What is the virtual DOM in React?",
    options: [
      "A copy of the real DOM kept in memory",
      "A Javascript representations of the actual DOM",
      "A browser API for DOM manipultions",
      "A React-specific HTML syntax",
    ],
  },
  {
    id: 2,
    text: "Which hook is used to manage side effects in React?",
    options: ["useState", "useEffect", "useContext", "useReducer"],
  },
  {
    id: 3,
    text: "What does CSS stand for?",
    options: [
      "Cascading Style Sheets",
      "Creative Style System",
      "Computer Style Sheets",
      "Colorful Style Syntax",
    ],
  },
  {
    id: 4,
    text: "Which method is used to update state in a class component?",
    options: ["this.updateState()", "this.setState()", "this.changeState()", "this.modifyState()"],
  },
  {
    id: 5,
    text: "What is the purpose of keys in React lists?",
    options: [
      "To style list items",
      "To help React identify which items have changed",
      "To sort the list automatically",
      "To add click handlers",
    ],
  },
];

type QuestionStatus = "not-answered" | "answered" | "flagged" | "current";

const MCQAssessment: React.FC<{ onSubmit?: () => void }> = ({ onSubmit }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(28 * 60 + 14);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false); // mobile drawer

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const isWarning = timeLeft < 5 * 60;

  const getStatus = (idx: number): QuestionStatus => {
    if (idx === currentQ) return "current";
    if (flagged.has(idx)) return "flagged";
    if (answers[idx] !== undefined) return "answered";
    return "not-answered";
  };

  const statusStyle: Record<QuestionStatus, string> = {
    current: "bg-[#2D55FB] text-white border-[#2D55FB]",
    answered: "bg-green-600/80 text-white border-green-600",
    flagged: "bg-amber-600/70 text-white border-amber-600",
    "not-answered": "bg-[#1a2850] text-gray-400 border-gray-600",
  };

  const answered = Object.keys(answers).length;
  const flaggedCount = flagged.size;
  const progress = ((currentQ + 1) / questions.length) * 100;

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ)) next.delete(currentQ);
      else next.add(currentQ);
      return next;
    });
  };

  const handleSubmit = () => {
    setShowSubmitModal(false);
    onSubmit?.();
  };

  const SidebarContent = () => (
    <div className="flex flex-col gap-4">
      {/* Question Navigator */}
      <div className="bg-[#0d1535]/80 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
        <h3 className="text-white font-semibold text-sm mb-1">Question Navigator</h3>
        <p className="text-gray-500 text-xs mb-3">{answered} of {questions.length} answered</p>
        <div className="grid grid-cols-5 gap-2 mb-4">
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
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {[
            { color: "bg-green-600/80", label: "Answered" },
            { color: "bg-amber-600/70", label: "Flagged" },
            { color: "bg-[#1a2850]", label: "Not Answered" },
            { color: "bg-[#2D55FB]", label: "Current" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm shrink-0 ${color}`} />
              <span className="text-gray-400 text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Test Summary */}
      <div className="bg-[#0d1535]/80 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
        <h3 className="text-white font-semibold text-sm mb-3">Test Summary</h3>
        <div className="space-y-2.5">
          {[
            { label: "Total Questions :", value: questions.length, color: "text-white" },
            { label: "Answered :", value: answered, color: "text-blue-400" },
            { label: "Flagged :", value: flaggedCount, color: "text-amber-400" },
            { label: "Remaining :", value: questions.length - answered, color: "text-white" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">{label}</span>
              <span className={`text-sm font-semibold ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050A24] bg-[radial-gradient(circle_at_80%_10%,rgba(45,85,251,0.3),transparent_50%),radial-gradient(circle_at_10%_90%,rgba(45,85,251,0.2),transparent_50%)] relative overflow-hidden">
      {/* Orbs */}
      <motion.div
        className="absolute -top-20 -right-20 w-[150px] h-[150px] md:w-[200px] md:h-[200px] bg-[#2D55FB] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ x: [0, 30, -20, 0], y: [0, -50, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-[150px] h-[150px] md:w-[200px] md:h-[200px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ x: [0, -40, 30, 0], y: [0, 40, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="relative z-10 p-3 sm:p-4 lg:p-6 max-w-[1400px] mx-auto">

        {/* ── TOP HEADER ── */}
        <div className="bg-[#0d1535]/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-white/10 mb-4 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm sm:text-base lg:text-lg truncate">Frontend Developer MCQ Test</h1>
            <p className="text-gray-500 text-xs">Question {currentQ + 1} of {questions.length}</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
            {/* Saved - hidden on very small */}
            <div className="hidden xs:flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-400 text-xs sm:text-sm font-medium">Saved</span>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-1 sm:gap-1.5 ${isWarning ? "text-red-400" : "text-red-400"}`}>
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className={`font-mono font-semibold text-sm sm:text-base ${isWarning ? "text-red-400" : "text-red-400"}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Mobile navigator trigger */}
            <button
              onClick={() => setShowSidePanel(true)}
              className="flex lg:hidden items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2D55FB]/20 border border-[#2D55FB]/40 text-[#2D55FB] text-xs font-medium"
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Navigator</span>
            </button>

            {/* Submit */}
            <motion.button
              onClick={() => setShowSubmitModal(true)}
              className="px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-green-500 hover:bg-green-400 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              Submit Test
            </motion.button>
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="flex gap-4 lg:gap-5">

          {/* ── QUESTION PANEL ── */}
          <motion.div
            className="flex-1 min-w-0 bg-[#0d1535]/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 border border-white/10 flex flex-col"
            style={{ minHeight: "clamp(420px, 65vh, 560px)" }}
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Q header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold text-base sm:text-lg">Question {currentQ + 1}</h2>
              <button
                onClick={toggleFlag}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  flagged.has(currentQ)
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                    : "bg-white/5 border-white/20 text-gray-400 hover:text-white"
                }`}
              >
                <Flag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">{flagged.has(currentQ) ? "Flagged" : "Flag"}</span>
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-[#1a2850] rounded-full mb-4 sm:mb-5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#2D55FB] to-blue-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Question text */}
            <p className="text-white text-sm sm:text-base lg:text-lg mb-4 sm:mb-5 leading-relaxed">
              {questions[currentQ].text}
            </p>

            {/* Options */}
            <div className="space-y-2.5 sm:space-y-3 flex-1">
              {questions[currentQ].options.map((opt, i) => {
                const selected = answers[currentQ] === i;
                return (
                  <motion.button
                    key={i}
                    onClick={() => setAnswers((prev) => ({ ...prev, [currentQ]: i }))}
                    className={`w-full flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-left transition-all text-sm ${
                      selected
                        ? "border-[#2D55FB] bg-[#2D55FB]/15"
                        : "border-gray-700/50 bg-[#0a0f2e]/60 hover:border-gray-600 hover:bg-[#0a0f2e]/80"
                    }`}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.998 }}
                  >
                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selected ? "border-[#2D55FB]" : "border-gray-600"
                      }`}
                    >
                      {selected && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#2D55FB]" />}
                    </div>
                    <span className={`text-xs sm:text-sm leading-snug ${selected ? "text-white" : "text-gray-300"}`}>
                      {opt}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-5 sm:mt-6">
              <button
                onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                disabled={currentQ === 0}
                className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-700/50 text-gray-400 text-xs sm:text-sm hover:border-gray-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              {/* Dot indicators - visible on mobile */}
              <div className="flex items-center gap-1.5 lg:hidden">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    className={`rounded-full transition-all ${
                      i === currentQ ? "w-5 h-2 bg-[#2D55FB]" : "w-2 h-2 bg-gray-600 hover:bg-gray-500"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentQ((q) => Math.min(questions.length - 1, q + 1))}
                disabled={currentQ === questions.length - 1}
                className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-[#2D55FB] text-white bg-[#2D55FB]/20 text-xs sm:text-sm hover:bg-[#2D55FB]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          {/* ── DESKTOP SIDEBAR ── */}
          <div className="hidden lg:flex w-56 xl:w-64 flex-col gap-4 shrink-0">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* ── MOBILE SIDE DRAWER ── */}
      <AnimatePresence>
        {showSidePanel && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSidePanel(false)}
            />
            <motion.div
              className="fixed right-0 top-0 h-full w-72 sm:w-80 bg-[#080f2a] border-l border-white/10 z-50 overflow-y-auto p-4 lg:hidden"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-base">Question Navigator</h2>
                <button onClick={() => setShowSidePanel(false)} className="text-gray-400 hover:text-white p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── SUBMIT MODAL ── */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#0d1535] border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-sm"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="text-white font-bold text-base sm:text-lg">Submit Test?</h3>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                You have answered <span className="text-white font-semibold">{answered}</span> of{" "}
                <span className="text-white font-semibold">{questions.length}</span> questions.
              </p>
              {flaggedCount > 0 && (
                <p className="text-amber-400 text-xs mb-4">⚠ {flaggedCount} question(s) still flagged for review.</p>
              )}
              {!flaggedCount && <div className="mb-4" />}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 text-sm hover:border-gray-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-400 transition-colors"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MCQAssessment;