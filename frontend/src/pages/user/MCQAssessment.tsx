
// import React, { useState, useEffect, useCallback, useRef } from "react";
// import {
//   ChevronLeft, ChevronRight, Flag, Clock, X, CheckCircle,
//   BarChart2, Loader2, Trophy, VideoOff, AlertTriangle, ShieldAlert,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import { userService } from "../../services/service/userService";
// import * as faceapi from "@vladmandic/face-api";

// // ─── face-api model source ────────────────────────────────────────────────────
// const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
// let faceModelsLoaded = false;
// const loadFaceModels = async () => {
//   if (faceModelsLoaded) return;
//   await Promise.all([
//     faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
//     faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
//   ]);
//   faceModelsLoaded = true;
// };

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface Question {
//   _id: string;
//   questionText: string;
//   options: string[];
//   correctAnswer?: string;
// }

// interface AnswerState {
//   questionId: string;
//   selectedOption: string;
//   submitted: boolean; // true once API has been called at least once for this question
// }

// type ViolationType =
//   | "tab-switch"
//   | "no-face"
//   | "multiple-faces"
//   | "looking-away"
//   | "copy-attempt";

// interface ViolationAlert {
//   type: ViolationType;
//   count: number;
// }

// // ─── Constants ────────────────────────────────────────────────────────────────
// const MAX_VIOLATIONS = 3;

// const VIOLATION_MESSAGES: Record<ViolationType, { title: string; body: (rem: number) => string }> = {
//   "tab-switch": {
//     title: "Tab Switch Detected",
//     body: (rem) =>
//       `You navigated away from the assessment window. Please stay on this page at all times. ${rem} warning(s) remaining.`,
//   },
//   "no-face": {
//     title: "Face Not Detected",
//     body: (rem) =>
//       `Your face has not been visible for several seconds. Please ensure you are seated in front of the camera. ${rem} warning(s) remaining.`,
//   },
//   "multiple-faces": {
//     title: "Multiple People Detected",
//     body: (rem) =>
//       `More than one person is visible. Only the candidate is allowed in the frame. ${rem} warning(s) remaining.`,
//   },
//   "looking-away": {
//     title: "Looking Away Detected",
//     body: (rem) =>
//       `You appeared to be looking away from the screen for an extended period. Please keep your eyes on the assessment. ${rem} warning(s) remaining.`,
//   },
//   "copy-attempt": {
//     title: "Copy Attempt Detected",
//     body: (rem) =>
//       `You attempted to copy assessment content. Sharing or reproducing questions is strictly prohibited. ${rem} warning(s) remaining.`,
//   },
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const formatTime = (s: number) =>
//   `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// const parseDuration = (t: string) => {
//   const match = t?.match(/(\d+)/);
//   return match ? parseInt(match[1]) * 60 : 15 * 60;
// };

// // ─── Component ────────────────────────────────────────────────────────────────
// const MCQAssessment: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { title, time } = (location.state as { title: string; time: string }) ?? {};

//   // ── Quiz state ──
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentQ, setCurrentQ] = useState(0);
//   const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
//   const [flagged, setFlagged] = useState<Set<number>>(new Set());
//   const [timeLeft, setTimeLeft] = useState(() => parseDuration(time));
//   const [showSubmitModal, setShowSubmitModal] = useState(false);
//   const [showSidePanel, setShowSidePanel] = useState(false);
//   const [savingAnswer, setSavingAnswer] = useState(false);
//   const [finalSubmitting, setFinalSubmitting] = useState(false);
//   const [phase, setPhase] = useState<"quiz" | "result">("quiz");
//   const [totalScore, setTotalScore] = useState(0);

//   // ── Proctoring state ──
//   const [violationCount, setViolationCount] = useState(0);
//   const [activeAlert, setActiveAlert] = useState<ViolationAlert | null>(null);
//   const [cameraReady, setCameraReady] = useState(false);
//   const [cameraError, setCameraError] = useState(false);
//   const [faceStatus, setFaceStatus] = useState<"ok" | "warning" | "unknown">("unknown");
//   const [noiseWarning, setNoiseWarning] = useState(false);

//   // ── Refs ──
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const procVideoRef = useRef<HTMLVideoElement>(null);
//   const procStreamRef = useRef<MediaStream | null>(null);
//   const faceCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const audioCtxRef = useRef<AudioContext | null>(null);
//   const analyserRef = useRef<AnalyserNode | null>(null);
//   const audioCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const violationCountRef = useRef(0);
//   const phaseRef = useRef<"quiz" | "result">("quiz");
//   const noiseEpisodeRef = useRef(false);
//   const noiseSilentCountRef = useRef(0);
//   const copyProtectedRef = useRef<HTMLDivElement>(null);
//   const savingRef = useRef(false); // prevents concurrent API calls for same question

//   useEffect(() => { violationCountRef.current = violationCount; }, [violationCount]);
//   useEffect(() => { phaseRef.current = phase; }, [phase]);

//   // ── Auto-fail helper ──────────────────────────────────────────────────────
//   const triggerAutoFail = useCallback(() => {
//     if (timerRef.current) clearInterval(timerRef.current);
//     if (faceCheckIntervalRef.current) clearInterval(faceCheckIntervalRef.current);
//     if (audioCheckIntervalRef.current) clearInterval(audioCheckIntervalRef.current);
//     if (procStreamRef.current) procStreamRef.current.getTracks().forEach((t) => t.stop());
//     setTotalScore(0);
//     setPhase("result");
//   }, []);

//   // ── Violation handler ─────────────────────────────────────────────────────
//   const triggerViolation = useCallback((type: ViolationType) => {
//     if (phaseRef.current === "result") return;
//     setViolationCount((prev) => {
//       const next = prev + 1;
//       violationCountRef.current = next;
//       setActiveAlert({ type, count: next });
//       return next;
//     });
//   }, []);

//   const handleAlertClose = useCallback(() => {
//     if (violationCountRef.current >= MAX_VIOLATIONS) {
//       setActiveAlert(null);
//       triggerAutoFail();
//     } else {
//       setActiveAlert(null);
//     }
//   }, [triggerAutoFail]);

//   // ── Fetch questions ───────────────────────────────────────────────────────
//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await userService.getMCQAssessment(id!);
//         const qs: Question[] = res?.questions ?? res?.data ?? [];
//         setQuestions(qs);
//       } catch (e) {
//         console.error(e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchQuestions();
//   }, [id]);

//   // ── Final submit ──────────────────────────────────────────────────────────
//   const handleFinalSubmit = useCallback(async () => {
//     if (finalSubmitting || phase === "result") return;
//     setFinalSubmitting(true);
//     setShowSubmitModal(false);
//     if (timerRef.current) clearInterval(timerRef.current);
//     if (faceCheckIntervalRef.current) clearInterval(faceCheckIntervalRef.current);
//     if (audioCheckIntervalRef.current) clearInterval(audioCheckIntervalRef.current);
//     if (procStreamRef.current) procStreamRef.current.getTracks().forEach((t) => t.stop());

//     try {
//       const answersArray = Object.values(answers).map((a) => ({
//         questionId: a.questionId,
//         answerText: a.selectedOption,
//       }));
//       const res = await userService.finalSubmitMCQAssessment(id!, { answers: answersArray });
//       if (res){
//         navigate(`/user/${id}/assessment-complete`);
//       setTotalScore(res?.totalScore ?? 0);

//       }
//     } catch (e) {
//       console.error(e);
//       setTotalScore(0);
//     } finally {
//       setFinalSubmitting(false);
//       setPhase("result");
//     }
//   }, [answers, finalSubmitting, id, phase]);

//   // ── Timer ─────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (loading || phase === "result") return;
//     timerRef.current = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) { clearInterval(timerRef.current!); handleFinalSubmit(); return 0; }
//         return prev - 1;
//       });
//     }, 1000);
//     return () => clearInterval(timerRef.current!);
//   }, [loading, phase, handleFinalSubmit]);

//   // ── Tab switch ────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (loading || phase === "result") return;
//     const handle = () => { if (document.hidden) triggerViolation("tab-switch"); };
//     document.addEventListener("visibilitychange", handle);
//     return () => document.removeEventListener("visibilitychange", handle);
//   }, [loading, phase, triggerViolation]);

//   // ── Prevent back navigation ───────────────────────────────────────────────
//   useEffect(() => {
//     if (loading || phase === "result") return;
//     window.history.pushState(null, "", window.location.href);
//     const handle = () => window.history.pushState(null, "", window.location.href);
//     window.addEventListener("popstate", handle);
//     return () => window.removeEventListener("popstate", handle);
//   }, [loading, phase]);

//   // ── Copy / prompt detection ───────────────────────────────────────────────
//   useEffect(() => {
//     if (loading || phase === "result") return;
//     const blockCtx = (e: MouseEvent) => e.preventDefault();
//     const onCopy = (e: ClipboardEvent) => {
//       const sel = window.getSelection()?.toString() ?? "";
//       if (sel.trim().length > 15) { e.preventDefault(); triggerViolation("copy-attempt"); }
//     };
//     const onKey = (e: KeyboardEvent) => {
//       const bad = (e.ctrlKey || e.metaKey) && ["c","x","u","s","p","a"].includes(e.key.toLowerCase());
//       const ps  = e.key === "PrintScreen" || e.key === "F12";
//       if (bad || ps) {
//         e.preventDefault();
//         if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
//           const sel = window.getSelection()?.toString() ?? "";
//           if (sel.trim().length > 15) triggerViolation("copy-attempt");
//         }
//       }
//     };
//     document.addEventListener("contextmenu", blockCtx);
//     document.addEventListener("copy", onCopy);
//     document.addEventListener("keydown", onKey);
//     return () => {
//       document.removeEventListener("contextmenu", blockCtx);
//       document.removeEventListener("copy", onCopy);
//       document.removeEventListener("keydown", onKey);
//     };
//   }, [loading, phase, triggerViolation]);

//   // ── Proctoring: camera + face detection + audio ───────────────────────────
//   useEffect(() => {
//     if (loading || phase === "result") return;
//     let mounted = true;

//     const startProctoring = async () => {
//       try {
//         await loadFaceModels();

//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: "user", width: 320, height: 240 },
//           audio: true,
//         });
//         if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }

//         procStreamRef.current = stream;
//         if (procVideoRef.current) {
//           procVideoRef.current.srcObject = stream;
//           await procVideoRef.current.play();
//         }
//         setCameraReady(true);

//         // ── Audio monitoring ──────────────────────────────────────────────
//         try {
//           const audioCtx = new AudioContext();
//           const analyser = audioCtx.createAnalyser();
//           analyser.fftSize = 256;
//           audioCtx.createMediaStreamSource(stream).connect(analyser);
//           audioCtxRef.current  = audioCtx;
//           analyserRef.current  = analyser;

//           const NOISE_THRESHOLD = 40;
//           const SILENCE_RESET   = 3;

//           audioCheckIntervalRef.current = setInterval(() => {
//             if (phaseRef.current === "result" || !analyserRef.current) return;
//             const arr = new Uint8Array(analyserRef.current.frequencyBinCount);
//             analyserRef.current.getByteFrequencyData(arr);
//             const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
//             if (avg > NOISE_THRESHOLD) {
//               noiseSilentCountRef.current = 0;
//               if (!noiseEpisodeRef.current) { noiseEpisodeRef.current = true; setNoiseWarning(true); }
//             } else {
//               noiseSilentCountRef.current += 1;
//               if (noiseSilentCountRef.current >= SILENCE_RESET) {
//                 noiseEpisodeRef.current   = false;
//                 noiseSilentCountRef.current = 0;
//               }
//             }
//           }, 2000);
//         } catch (e) { console.warn("Audio monitoring failed:", e); }

//         // ── Face detection — consecutive-frame gating ─────────────────────
//         //
//         // A violation only fires after NEED_BAD consecutive bad detections of
//         // the SAME type. Any single good frame resets all counters to zero.
//         //
//         // This eliminates false positives from:
//         //   • Momentary head turns while reading
//         //   • Brief lighting changes / shadows
//         //   • Low-confidence single frames from the model
//         //   • Natural reading posture (slight downward gaze)
//         //
//         // Geometry thresholds are deliberately forgiving:
//         //   hOffset > 0.38 → clearly turned left/right (NOT normal reading)
//         //   vRatio  < 0.10 → chin nearly at chest (NOT slight reading bow)
//         //   confidence < 0.60 → frame skipped, counts as neither good nor bad
//         //
//         const NEED_BAD = 4; // 4 × 2 s = ~8 s sustained before violation fires

//         const badCount: Record<string, number> = {
//           "no-face": 0, "multiple-faces": 0, "looking-away": 0,
//         };

//         const resetAll = () => {
//           badCount["no-face"] = badCount["multiple-faces"] = badCount["looking-away"] = 0;
//         };

//         // Bumps only the given type; zeroes all others so mixed transients
//         // don't accumulate across types.
//         const bump = (type: "no-face" | "multiple-faces" | "looking-away") => {
//           Object.keys(badCount).forEach((k) => { if (k !== type) badCount[k] = 0; });
//           return ++badCount[type];
//         };

//         faceCheckIntervalRef.current = setInterval(async () => {
//           if (phaseRef.current === "result" || !procVideoRef.current) return;
//           if (!procVideoRef.current.readyState || procVideoRef.current.readyState < 2) return;

//           try {
//             const detections = await faceapi
//               .detectAllFaces(
//                 procVideoRef.current,
//                 // inputSize 224 → more accurate than default 128
//                 // scoreThreshold 0.5 → filters uncertain ghost detections
//                 new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5, inputSize: 224 })
//               )
//               .withFaceLandmarks(true);

//             // ── No face ──
//             if (detections.length === 0) {
//               setFaceStatus("warning");
//               if (bump("no-face") >= NEED_BAD) { resetAll(); triggerViolation("no-face"); }
//               return;
//             }

//             // ── Multiple faces ──
//             if (detections.length > 1) {
//               setFaceStatus("warning");
//               if (bump("multiple-faces") >= NEED_BAD) { resetAll(); triggerViolation("multiple-faces"); }
//               return;
//             }

//             const { detection, landmarks } = detections[0];

//             // ── Low confidence → skip frame (don't count as good OR bad) ──
//             if (detection.score < 0.60) return;

//             // ── Head-pose / gaze check via nose + jaw geometry ────────────
//             const nose = landmarks.getNose();
//             const jaw  = landmarks.getJawOutline();
//             let lookingAway = false;

//             if (nose?.length && jaw?.length) {
//               const jawLeft  = jaw[0].x;
//               const jawRight = jaw[jaw.length - 1].x;
//               const jawWidth = jawRight - jawLeft;

//               if (jawWidth > 0) {
//                 const noseTip    = nose[nose.length - 1];
//                 const noseBridge = nose[0];

//                 // Horizontal: nose tip distance from jaw centre, normalised to jaw width.
//                 // Comfortable front-facing seated posture stays well under 0.38.
//                 const hOffset = Math.abs(noseTip.x - (jawLeft + jawRight) / 2) / jawWidth;

//                 // Vertical: nose length normalised to jaw width.
//                 // Drops only when head is severely tilted forward (chin to chest).
//                 // Normal slight reading bow stays above 0.10.
//                 const vRatio = Math.abs(noseTip.y - noseBridge.y) / jawWidth;

//                 lookingAway = hOffset > 0.38 || vRatio < 0.10;
//               }
//             }

//             if (lookingAway) {
//               setFaceStatus("warning");
//               if (bump("looking-away") >= NEED_BAD) { resetAll(); triggerViolation("looking-away"); }
//               return;
//             }

//             // ── All good ──
//             resetAll();
//             setFaceStatus("ok");
//           } catch {
//             // Silently ignore model/canvas errors (race on load, GPU hiccup, etc.)
//           }
//         }, 2000);

//       } catch (err) {
//         console.warn("Proctoring camera error:", err);
//         setCameraError(true);
//       }
//     };

//     startProctoring();

//     return () => {
//       mounted = false;
//       if (faceCheckIntervalRef.current) clearInterval(faceCheckIntervalRef.current);
//       if (audioCheckIntervalRef.current) clearInterval(audioCheckIntervalRef.current);
//       if (audioCtxRef.current) audioCtxRef.current.close();
//       if (procStreamRef.current) procStreamRef.current.getTracks().forEach((t) => t.stop());
//     };
//   }, [loading, phase, triggerViolation]);

//   // ── Select / change answer — always callable, calls API every time ────────
//   //
//   // The backend API (submitMCQAssessment) is expected to be an upsert:
//   //   • No existing record for this question → INSERT, assign score
//   //   • Record already exists               → UPDATE answer + recalculate score
//   //
//   // This means changing an answer is completely safe and the score will
//   // always reflect the candidate's LATEST choice, not their first.
//   //
//   const handleSelectOption = async (opt: string) => {
//     const question = questions[currentQ];
//     if (!question || finalSubmitting || savingRef.current) return;

//     // Optimistic UI update — candidate sees the change instantly
//     setAnswers((prev) => ({
//       ...prev,
//       [question._id]: { questionId: question._id, selectedOption: opt, submitted: true },
//     }));

//     savingRef.current = true;
//     setSavingAnswer(true);
//     try {
//       await userService.submitMCQAssessment(id!, {
//         questionId: question._id,
//         answerText: opt,
//       });
//     } catch (e) {
//       console.error("Save answer error:", e);
//     } finally {
//       savingRef.current = false;
//       setSavingAnswer(false);
//     }
//   };

//   // ── Derived ───────────────────────────────────────────────────────────────
//   const currentQuestion = questions[currentQ];
//   const currentAnswer   = currentQuestion ? answers[currentQuestion._id] : undefined;
//   const isWarning       = timeLeft < 5 * 60;
//   const progress        = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;
//   const answeredCount   = Object.values(answers).filter((a) => a.submitted).length;
//   const flaggedCount    = flagged.size;

//   type QuestionStatus = "not-answered" | "answered" | "flagged" | "current";
//   const getStatus = (idx: number): QuestionStatus => {
//     if (idx === currentQ) return "current";
//     const q = questions[idx];
//     if (flagged.has(idx)) return "flagged";
//     if (q && answers[q._id]?.submitted) return "answered";
//     return "not-answered";
//   };

//   const statusStyle: Record<QuestionStatus, string> = {
//     current:        "bg-[#2D55FB] text-white border-[#2D55FB]",
//     answered:       "bg-green-600/80 text-white border-green-600",
//     flagged:        "bg-amber-600/70 text-white border-amber-600",
//     "not-answered": "bg-[#1a2850] text-gray-400 border-gray-600",
//   };

//   const toggleFlag = () => {
//     setFlagged((prev) => {
//       const next = new Set(prev);
//       next.has(currentQ) ? next.delete(currentQ) : next.add(currentQ);
//       return next;
//     });
//   };

//   // ─── Loading ──────────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#060d24] flex items-center justify-center">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="w-10 h-10 text-[#2D55FB] animate-spin" />
//           <p className="text-gray-400 text-sm">Loading assessment…</p>
//         </div>
//       </div>
//     );
//   }


//   // ── Sidebar content ───────────────────────────────────────────────────────
//   const SidebarContent = () => (
//     <div className="flex flex-col gap-5">
//       <div>
//         <h3 className="text-sm font-semibold text-white mb-1">Question Navigator</h3>
//         <p className="text-xs text-gray-500">{answeredCount} of {questions.length} answered</p>
//       </div>
//       <div className="grid grid-cols-5 gap-2">
//         {questions.map((_, i) => {
//           const status = getStatus(i);
//           return (
//             <motion.button
//               key={i}
//               onClick={() => { setCurrentQ(i); setShowSidePanel(false); }}
//               className={`w-full aspect-square rounded-lg border text-xs font-semibold transition-all ${statusStyle[status]}`}
//               whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
//             >
//               {i + 1}
//             </motion.button>
//           );
//         })}
//       </div>
//       <div className="flex flex-wrap gap-2">
//         {[
//           { color: "bg-green-600/80", label: "Answered" },
//           { color: "bg-amber-600/70", label: "Flagged" },
//           { color: "bg-[#1a2850]",    label: "Not Answered" },
//           { color: "bg-[#2D55FB]",    label: "Current" },
//         ].map(({ color, label }) => (
//           <div key={label} className="flex items-center gap-1.5">
//             <div className={`w-3 h-3 rounded-sm ${color}`} />
//             <span className="text-xs text-gray-400">{label}</span>
//           </div>
//         ))}
//       </div>
//       <div className="bg-[#0a0f2e] rounded-xl p-4 border border-gray-700/40">
//         <h4 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
//           <BarChart2 className="w-3.5 h-3.5" /> Test Summary
//         </h4>
//         {[
//           { label: "Total Questions :", value: questions.length,                 color: "text-white" },
//           { label: "Answered :",        value: answeredCount,                    color: "text-blue-400" },
//           { label: "Flagged :",         value: flaggedCount,                     color: "text-amber-400" },
//           { label: "Remaining :",       value: questions.length - answeredCount, color: "text-white" },
//         ].map(({ label, value, color }) => (
//           <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-700/30 last:border-0">
//             <span className="text-xs text-gray-400">{label}</span>
//             <span className={`text-xs font-semibold ${color}`}>{value}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );

//   // ─── Quiz Screen ──────────────────────────────────────────────────────────
//   return (
//     <div
//       className="min-h-screen bg-[#060d24] text-white flex flex-col"
//       style={{ userSelect: "none", WebkitUserSelect: "none" }}
//     >
//       {/* Hidden video — face-api runs detection on this */}
//       <video
//         ref={procVideoRef} muted playsInline
//         style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
//       />

//       {/* ── NOISE WARNING BANNER ── */}
//       <AnimatePresence>
//         {noiseWarning && (
//           <motion.div
//             initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
//             className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 bg-amber-500/15 border border-amber-500/40 rounded-xl shadow-xl backdrop-blur-sm max-w-sm w-[90%]"
//           >
//             <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
//             <p className="text-amber-300 text-xs flex-1 leading-snug">
//               Background noise detected. Please reduce noise around you.
//             </p>
//             <button onClick={() => setNoiseWarning(false)} className="text-amber-400/60 hover:text-amber-300 transition-colors flex-shrink-0">
//               <X className="w-3.5 h-3.5" />
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ── PROCTORING CAMERA PiP (bottom-right) ── */}
//       <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-1.5">
//         {violationCount > 0 && (
//           <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 border border-red-500/40 rounded-full">
//             <ShieldAlert className="w-3 h-3 text-red-400" />
//             <span className="text-red-400 text-xs font-semibold">{violationCount}/{MAX_VIOLATIONS} warnings</span>
//           </div>
//         )}
//         <div
//           className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden border-2 shadow-xl"
//           style={{ borderColor: faceStatus === "ok" ? "#22c55e" : faceStatus === "warning" ? "#ef4444" : "#4b5563" }}
//         >
//           {cameraReady && (
//             <video
//               autoPlay muted playsInline
//               ref={(el) => { if (el && procStreamRef.current && !el.srcObject) el.srcObject = procStreamRef.current; }}
//               className="w-full h-full object-cover scale-x-[-1]"
//             />
//           )}
//           {cameraError && (
//             <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1836]">
//               <VideoOff className="w-5 h-5 text-gray-500 mb-1" />
//               <span className="text-gray-500 text-[9px] text-center leading-tight">Camera<br />unavailable</span>
//             </div>
//           )}
//           {!cameraReady && !cameraError && (
//             <div className="absolute inset-0 flex items-center justify-center bg-[#0d1836]">
//               <Loader2 className="w-4 h-4 text-[#2D55FB] animate-spin" />
//             </div>
//           )}
//           <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
//             <motion.div
//               className="w-2 h-2 rounded-full"
//               style={{ backgroundColor: faceStatus === "ok" ? "#22c55e" : faceStatus === "warning" ? "#ef4444" : "#6b7280" }}
//               animate={{ opacity: [1, 0.4, 1] }}
//               transition={{ duration: 1.5, repeat: Infinity }}
//             />
//             <span className="text-white text-[9px] font-medium bg-black/50 px-1 rounded">
//               {faceStatus === "ok" ? "OK" : faceStatus === "warning" ? "!" : "…"}
//             </span>
//           </div>
//           <div className="absolute bottom-1 right-1.5">
//             <span className="text-[9px] text-white/60 font-medium">Proctored</span>
//           </div>
//         </div>
//       </div>

//       {/* ── HEADER ── */}
//       <div className="sticky top-0 z-30 bg-[#060d24]/95 backdrop-blur border-b border-gray-700/30 px-3 sm:px-4 lg:px-6 py-3">
//         <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
//           <div className="flex-1 min-w-0">
//             <h1 className="text-sm sm:text-base font-semibold text-white truncate">{title ?? "MCQ Assessment"}</h1>
//             <p className="text-xs text-gray-500">Question {currentQ + 1} of {questions.length}</p>
//           </div>

//           {/* Save indicator */}
//           <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
//             {savingAnswer
//               ? <><Loader2 className="w-3.5 h-3.5 animate-spin text-[#2D55FB]" /><span>Saving…</span></>
//               : <><div className="w-2 h-2 rounded-full bg-green-500" /><span>Saved</span></>
//             }
//           </div>

//           {/* Timer */}
//           <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-mono font-semibold ${
//             isWarning ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-gray-700/50 bg-[#0d1836] text-gray-300"
//           }`}>
//             <Clock className={`w-3.5 h-3.5 ${isWarning ? "animate-pulse" : ""}`} />
//             {formatTime(timeLeft)}
//           </div>

//           <button
//             onClick={() => setShowSidePanel(true)}
//             className="flex lg:hidden items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2D55FB]/20 border border-[#2D55FB]/40 text-[#2D55FB] text-xs font-medium"
//           >
//             <BarChart2 className="w-3.5 h-3.5" /> Navigator
//           </button>

//           <motion.button
//             onClick={() => setShowSubmitModal(true)}
//             disabled={finalSubmitting}
//             className="px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-green-500 hover:bg-green-400 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
//             whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
//           >
//             {finalSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Test"}
//           </motion.button>
//         </div>
//       </div>

//       {/* ── MAIN LAYOUT ── */}
//       <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 gap-4 lg:gap-6">
//         <div className="flex-1 flex flex-col gap-4">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={currentQ}
//               initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
//               transition={{ duration: 0.2 }}
//               className="bg-[#0d1836] border border-gray-700/40 rounded-2xl p-4 sm:p-6 flex flex-col gap-5"
//             >
//               {/* Q header */}
//               <div className="flex items-center justify-between">
//                 <span className="text-xs font-semibold text-[#2D55FB] bg-[#2D55FB]/10 px-2.5 py-1 rounded-full border border-[#2D55FB]/20">
//                   Question {currentQ + 1}
//                 </span>
//                 <motion.button
//                   onClick={toggleFlag}
//                   className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
//                     flagged.has(currentQ)
//                       ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
//                       : "bg-transparent border-gray-600 text-gray-500 hover:border-amber-500/40 hover:text-amber-400"
//                   }`}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   <Flag className="w-3 h-3" />
//                   {flagged.has(currentQ) ? "Flagged" : "Flag"}
//                 </motion.button>
//               </div>

//               {/* Progress bar */}
//               <div className="w-full h-1 bg-gray-700/40 rounded-full overflow-hidden">
//                 <motion.div
//                   className="h-full bg-[#2D55FB] rounded-full"
//                   animate={{ width: `${progress}%` }}
//                   transition={{ duration: 0.3 }}
//                 />
//               </div>

//               {/* Question text */}
//               <div ref={copyProtectedRef}>
//                 <p className="text-white text-sm sm:text-base leading-relaxed font-medium pointer-events-none select-none">
//                   {currentQuestion?.questionText}
//                 </p>
//               </div>

//               {/* Options — ALWAYS clickable, even if previously submitted */}
//               <div className="flex flex-col gap-2.5">
//                 {currentQuestion?.options?.map((opt, i) => {
//                   const isSelected = currentAnswer?.selectedOption === opt;
//                   return (
//                     <motion.button
//                       key={i}
//                       onClick={() => handleSelectOption(opt)}
//                       disabled={finalSubmitting}
//                       className={`w-full flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-left transition-all text-sm cursor-pointer ${
//                         isSelected
//                           ? "border-[#2D55FB] bg-[#2D55FB]/15"
//                           : "border-gray-700/50 bg-[#0a0f2e]/60 hover:border-[#2D55FB]/40 hover:bg-[#0a0f2e]/80"
//                       }`}
//                       whileHover={{ scale: 1.005 }}
//                       whileTap={{ scale: 0.998 }}
//                     >
//                       {/* Radio indicator */}
//                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
//                         isSelected ? "border-[#2D55FB] bg-[#2D55FB]" : "border-gray-600"
//                       }`}>
//                         {isSelected && (
//                           savingAnswer
//                             ? <Loader2 className="w-3 h-3 text-white animate-spin" />
//                             : <div className="w-2 h-2 rounded-full bg-white" />
//                         )}
//                       </div>
//                       <span className={`flex-1 ${isSelected ? "text-white" : "text-gray-300"}`}>{opt}</span>
//                     </motion.button>
//                   );
//                 })}
//               </div>

//               {/* Neutral confirmation — no score, no correctness hint */}
//               {currentAnswer?.submitted && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
//                   className="flex items-center gap-2 text-gray-500 text-xs py-1"
//                 >
//                   <CheckCircle className="w-3.5 h-3.5 text-[#2D55FB]/50" />
//                   <span>
//                     Answer saved —{" "}
//                     <span className="text-gray-400">you can change it anytime before submitting</span>
//                   </span>
//                 </motion.div>
//               )}

//               {/* Navigation */}
//               <div className="flex items-center justify-between pt-2 border-t border-gray-700/30">
//                 <motion.button
//                   onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
//                   disabled={currentQ === 0}
//                   className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-700/50 text-gray-400 text-xs sm:text-sm hover:border-gray-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
//                 >
//                   <ChevronLeft className="w-4 h-4" /> Previous
//                 </motion.button>

//                 <div className="flex items-center gap-1 overflow-hidden max-w-[120px] sm:max-w-[200px]">
//                   {questions.map((_, i) => (
//                     <button
//                       key={i}
//                       onClick={() => setCurrentQ(i)}
//                       className={`rounded-full transition-all ${
//                         i === currentQ ? "w-5 h-2 bg-[#2D55FB]" : "w-2 h-2 bg-gray-600 hover:bg-gray-500"
//                       }`}
//                     />
//                   ))}
//                 </div>

//                 <motion.button
//                   onClick={() => setCurrentQ((q) => Math.min(questions.length - 1, q + 1))}
//                   disabled={currentQ === questions.length - 1}
//                   className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-[#2D55FB] text-white bg-[#2D55FB]/20 text-xs sm:text-sm hover:bg-[#2D55FB]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
//                 >
//                   Next <ChevronRight className="w-4 h-4" />
//                 </motion.button>
//               </div>
//             </motion.div>
//           </AnimatePresence>
//         </div>

//         {/* Desktop sidebar */}
//         <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
//           <div className="sticky top-24 bg-[#0d1836] border border-gray-700/40 rounded-2xl p-5">
//             <SidebarContent />
//           </div>
//         </div>
//       </div>

//       {/* ── MOBILE DRAWER ── */}
//       {showSidePanel && (
//         <>
//           <motion.div
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/60 z-40 lg:hidden"
//             onClick={() => setShowSidePanel(false)}
//           />
//           <motion.div
//             initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
//             transition={{ type: "spring", damping: 25 }}
//             className="fixed right-0 top-0 h-full w-72 bg-[#0d1836] border-l border-gray-700/40 z-50 p-5 overflow-y-auto lg:hidden"
//           >
//             <div className="flex items-center justify-between mb-5">
//               <h3 className="text-sm font-semibold text-white">Question Navigator</h3>
//               <button onClick={() => setShowSidePanel(false)} className="text-gray-400 hover:text-white p-1">
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//             <SidebarContent />
//           </motion.div>
//         </>
//       )}

//       {/* ── VIOLATION ALERT ── */}
//       <AnimatePresence>
//         {activeAlert && (
//           <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
//               className={`rounded-2xl p-6 w-full max-w-sm shadow-2xl border ${
//                 activeAlert.count >= MAX_VIOLATIONS
//                   ? "bg-red-950/80 border-red-500/50"
//                   : "bg-[#0d1836] border-amber-500/40"
//               }`}
//             >
//               <div className="flex items-start gap-4 mb-4">
//                 <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${
//                   activeAlert.count >= MAX_VIOLATIONS ? "bg-red-500/20" : "bg-amber-500/20"
//                 }`}>
//                   {activeAlert.count >= MAX_VIOLATIONS
//                     ? <ShieldAlert className="w-6 h-6 text-red-400" />
//                     : <AlertTriangle className="w-6 h-6 text-amber-400" />}
//                 </div>
//                 <div>
//                   <h3 className="text-base font-bold text-white mb-0.5">
//                     {activeAlert.count >= MAX_VIOLATIONS
//                       ? "Assessment Terminated"
//                       : VIOLATION_MESSAGES[activeAlert.type].title}
//                   </h3>
//                   <p className={`text-xs font-medium ${activeAlert.count >= MAX_VIOLATIONS ? "text-red-400" : "text-amber-400"}`}>
//                     {activeAlert.count >= MAX_VIOLATIONS
//                       ? "Too many violations detected"
//                       : `Violation ${activeAlert.count} of ${MAX_VIOLATIONS}`}
//                   </p>
//                 </div>
//               </div>

//               <p className="text-sm text-gray-300 leading-relaxed mb-6">
//                 {activeAlert.count >= MAX_VIOLATIONS
//                   ? "You have exceeded the maximum number of violations. Your assessment has been automatically submitted with the answers recorded so far."
//                   : VIOLATION_MESSAGES[activeAlert.type].body(MAX_VIOLATIONS - activeAlert.count)}
//               </p>

//               {activeAlert.count < MAX_VIOLATIONS && (
//                 <div className="mb-5">
//                   <div className="flex justify-between text-xs text-gray-400 mb-1.5">
//                     <span>Violations</span>
//                     <span>{activeAlert.count} / {MAX_VIOLATIONS}</span>
//                   </div>
//                   <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
//                     <motion.div
//                       className="h-full rounded-full"
//                       style={{ backgroundColor: activeAlert.count === 1 ? "#f59e0b" : "#ef4444" }}
//                       initial={{ width: 0 }}
//                       animate={{ width: `${(activeAlert.count / MAX_VIOLATIONS) * 100}%` }}
//                       transition={{ duration: 0.4 }}
//                     />
//                   </div>
//                 </div>
//               )}

//               <motion.button
//                 onClick={handleAlertClose}
//                 className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${
//                   activeAlert.count >= MAX_VIOLATIONS ? "bg-red-500 hover:bg-red-400" : "bg-[#2D55FB] hover:bg-[#1e3fd4]"
//                 }`}
//                 whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
//               >
//                 {activeAlert.count >= MAX_VIOLATIONS ? "View Results" : "I Understand"}
//               </motion.button>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* ── FINAL SUBMIT MODAL ── */}
//       {showSubmitModal && (
//         <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
//             className="bg-[#0d1836] border border-gray-700/40 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
//           >
//             <h3 className="text-base font-semibold text-white mb-2">Submit Test?</h3>
//             <p className="text-sm text-gray-400 mb-4">
//               You have answered {answeredCount} of {questions.length} questions.
//             </p>

//             {flaggedCount > 0 && (
//               <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4">
//                 <span className="text-amber-400 text-xs">⚠ {flaggedCount} question(s) still flagged for review.</span>
//               </div>
//             )}
//             {!flaggedCount && (
//               <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-4">
//                 <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
//                 <span className="text-green-400 text-xs">Ready to submit.</span>
//               </div>
//             )}

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowSubmitModal(false)}
//                 className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 text-sm hover:border-gray-500 hover:text-white transition-colors"
//               >
//                 Cancel
//               </button>
//               <motion.button
//                 onClick={handleFinalSubmit}
//                 disabled={finalSubmitting}
//                 className="flex-1 py-2.5 rounded-lg bg-green-500 hover:bg-green-400 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
//                 whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
//               >
//                 {finalSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
//               </motion.button>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MCQAssessment;

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Flag, Clock, X, CheckCircle,
  BarChart2, Loader2, VideoOff, AlertTriangle, ShieldAlert, Maximize,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { userService } from "../../services/service/userService";
import * as faceapi from "@vladmandic/face-api";

// ─── face-api model source ────────────────────────────────────────────────────
const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
let faceModelsLoaded = false;
const loadFaceModels = async () => {
  if (faceModelsLoaded) return;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),   // full 68-pt for EAR eye detection
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),   // expression detection
  ]);
  faceModelsLoaded = true;
};

// ─── Types ────────────────────────────────────────────────────────────────────
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
}

type ViolationType =
  | "tab-switch"
  | "no-face"
  | "multiple-faces"
  | "looking-away"
  | "eyes-closed"
  | "copy-attempt"
  | "fullscreen-exit";

interface ViolationAlert {
  type: ViolationType;
  count: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_VIOLATIONS = 3;

// Each detection tick = 1500ms
// NEED_BAD = 3 → violation fires after 4.5s sustained bad behaviour
const NEED_BAD = 3;

// Eye Aspect Ratio threshold
// Open eye ≈ 0.25+, half-closed ≈ 0.18-0.22, fully closed < 0.15
// We fire at 0.20 so drowsy/half-closed eyes are also caught
const EAR_CLOSED_THRESHOLD = 0.20;

const VIOLATION_MESSAGES: Record<ViolationType, { title: string; body: (rem: number) => string }> = {
  "tab-switch": {
    title: "Tab Switch Detected",
    body: (rem) =>
      `You navigated away from the assessment window. Stay on this page at all times. ${rem} more violation(s) will auto-terminate your exam.`,
  },
  "no-face": {
    title: "Face Not Detected",
    body: (rem) =>
      `Your face has not been visible. Please sit directly in front of the camera. ${rem} more violation(s) will auto-terminate your exam.`,
  },
  "multiple-faces": {
    title: "Multiple People Detected",
    body: (rem) =>
      `More than one face is visible. Only the candidate may be in frame. ${rem} more violation(s) will auto-terminate your exam.`,
  },
  "looking-away": {
    title: "Looking Away Detected",
    body: (rem) =>
      `You are looking away from the screen. Keep your gaze on the assessment at all times. ${rem} more violation(s) will auto-terminate your exam.`,
  },
  "eyes-closed": {
    title: "Eyes Closed / Drowsiness Detected",
    body: (rem) =>
      `Your eyes have been closed for an extended period. Please stay alert and focused. ${rem} more violation(s) will auto-terminate your exam.`,
  },
  "copy-attempt": {
    title: "Copy Attempt Detected",
    body: (rem) =>
      `You attempted to copy content. This is strictly prohibited. ${rem} more violation(s) will auto-terminate your exam.`,
  },
  "fullscreen-exit": {
    title: "Fullscreen Exited",
    body: (rem) =>
      `You exited fullscreen mode. The assessment must run in fullscreen. ${rem} more violation(s) will auto-terminate your exam.`,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const parseDuration = (t: string) => {
  const match = t?.match(/(\d+)/);
  return match ? parseInt(match[1]) * 60 : 15 * 60;
};

// ─── Eye Aspect Ratio ─────────────────────────────────────────────────────────
// EAR = (||P2-P6|| + ||P3-P5||) / (2 * ||P1-P4||)
// Uses the 6 standard eye landmark points per eye from the 68-pt model
const dist = (a: faceapi.Point, b: faceapi.Point) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

const calcEAR = (pts: faceapi.Point[]): number => {
  if (pts.length < 6) return 1.0;
  return (dist(pts[1], pts[5]) + dist(pts[2], pts[4])) / (2.0 * dist(pts[0], pts[3]));
};

// ─── Fullscreen ───────────────────────────────────────────────────────────────
const enterFullscreen = async () => {
  try {
    if (!document.fullscreenElement)
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
  } catch (err) {
    console.warn("Fullscreen request failed:", err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const MCQAssessment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { title, time } = (location.state as { title: string; time: string }) ?? {};

  // ── State ──
  const [questions, setQuestions]         = useState<Question[]>([]);
  const [loading, setLoading]             = useState(true);
  const [currentQ, setCurrentQ]           = useState(0);
  const [answers, setAnswers]             = useState<Record<string, AnswerState>>({});
  const [flagged, setFlagged]             = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft]           = useState(() => parseDuration(time));
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [savingAnswer, setSavingAnswer]   = useState(false);
  const [finalSubmitting, setFinalSubmitting] = useState(false);
  const [phase, setPhase]                 = useState<"quiz" | "result">("quiz");
  const [totalScore, setTotalScore]       = useState(0);
  const [isFullscreen, setIsFullscreen]   = useState(false);
  const [showFSBanner, setShowFSBanner]   = useState(false);

  // ── Proctoring state ──
  const [violationCount, setViolationCount] = useState(0);
  const [activeAlert, setActiveAlert]       = useState<ViolationAlert | null>(null);
  const [cameraReady, setCameraReady]       = useState(false);
  const [cameraError, setCameraError]       = useState(false);
  const [faceStatus, setFaceStatus]         = useState<"ok" | "warning" | "unknown">("unknown");
  const [noiseWarning, setNoiseWarning]     = useState(false);

  // ── Refs ──
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null);
  const procVideoRef          = useRef<HTMLVideoElement>(null);
  const procStreamRef         = useRef<MediaStream | null>(null);
  const faceCheckIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef           = useRef<AudioContext | null>(null);
  const analyserRef           = useRef<AnalyserNode | null>(null);
  const audioCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const violationCountRef     = useRef(0);
  const phaseRef              = useRef<"quiz" | "result">("quiz");
  const noiseEpisodeRef       = useRef(false);
  const noiseSilentCountRef   = useRef(0);
  const copyProtectedRef      = useRef<HTMLDivElement>(null);
  const savingRef             = useRef(false);
  const autoFailCalledRef     = useRef(false);

  // Stable function refs so event listeners always call the latest version
  const triggerViolationRef = useRef<(type: ViolationType) => void>(() => {});
  const triggerAutoFailRef  = useRef<() => void>(() => {});
  const answersRef          = useRef<Record<string, AnswerState>>({});

  useEffect(() => { violationCountRef.current = violationCount; }, [violationCount]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // ══════════════════════════════════════════════════════════════════════════
  // KEYBOARD LOCK — capture phase, fires before ALL browser defaults (ESC, F11, etc.)
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const block = (e: KeyboardEvent) => {
      if (phaseRef.current === "result") return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };
    // capture: true → we intercept BEFORE the browser processes the event.
    // This is the only reliable way to block ESC exiting fullscreen.
    document.addEventListener("keydown",  block, { capture: true });
    document.addEventListener("keyup",    block, { capture: true });
    document.addEventListener("keypress", block, { capture: true });
    return () => {
      document.removeEventListener("keydown",  block, { capture: true });
      document.removeEventListener("keyup",    block, { capture: true });
      document.removeEventListener("keypress", block, { capture: true });
    };
  }, []);

  // Block right-click
  useEffect(() => {
    const block = (e: MouseEvent) => {
      if (phaseRef.current !== "result") e.preventDefault();
    };
    document.addEventListener("contextmenu", block, { capture: true });
    return () => document.removeEventListener("contextmenu", block, { capture: true });
  }, []);

  // Disable text selection globally
  useEffect(() => {
    document.body.style.userSelect = "none";
    (document.body.style as any).webkitUserSelect = "none";
    return () => {
      document.body.style.userSelect = "";
      (document.body.style as any).webkitUserSelect = "";
    };
  }, []);

  // ── Enter fullscreen on mount ─────────────────────────────────────────────
  useEffect(() => {
    enterFullscreen().then(() => setIsFullscreen(!!document.fullscreenElement));
  }, []);

  // ── Fullscreen change listener ────────────────────────────────────────────
  useEffect(() => {
    const onChange = () => {
      const inFS = !!document.fullscreenElement;
      setIsFullscreen(inFS);
      if (!inFS && phaseRef.current !== "result") {
        setShowFSBanner(true);
        triggerViolationRef.current("fullscreen-exit");
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // AUTO-FAIL — submits current answers and navigates away
  // ══════════════════════════════════════════════════════════════════════════
  const triggerAutoFail = useCallback(async () => {
    if (autoFailCalledRef.current) return;
    autoFailCalledRef.current = true;

    // Stop everything
    if (timerRef.current) clearInterval(timerRef.current);
    if (faceCheckIntervalRef.current) clearInterval(faceCheckIntervalRef.current);
    if (audioCheckIntervalRef.current) clearInterval(audioCheckIntervalRef.current);
    if (procStreamRef.current) procStreamRef.current.getTracks().forEach((t) => t.stop());

    setPhase("result");
    phaseRef.current = "result";

    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch {}
    }
    document.body.style.userSelect = "";

    // Submit whatever was answered
    try {
      const answersArray = Object.values(answersRef.current).map((a) => ({
        questionId: a.questionId,
        answerText: a.selectedOption,
      }));
      await userService.finalSubmitMCQAssessment(id!, { answers: answersArray });
    } catch (e) {
      console.error("Auto-fail submit error:", e);
    }

    navigate(`/user/${id}/assessment-complete`);
  }, [id, navigate]);

  useEffect(() => { triggerAutoFailRef.current = triggerAutoFail; }, [triggerAutoFail]);

  // ══════════════════════════════════════════════════════════════════════════
  // VIOLATION HANDLER
  // ══════════════════════════════════════════════════════════════════════════
  const triggerViolation = useCallback((type: ViolationType) => {
    if (phaseRef.current === "result") return;
    setViolationCount((prev) => {
      const next = prev + 1;
      violationCountRef.current = next;
      setActiveAlert({ type, count: next });
      return next;
    });
  }, []);

  useEffect(() => { triggerViolationRef.current = triggerViolation; }, [triggerViolation]);

  // ── Alert dismiss ─────────────────────────────────────────────────────────
  const handleAlertClose = useCallback(() => {
    const count = violationCountRef.current;
    const type  = activeAlert?.type;
    setActiveAlert(null);

    if (count >= MAX_VIOLATIONS) {
      // Give a brief moment for animation to close, then auto-fail
      setTimeout(() => triggerAutoFailRef.current(), 150);
    } else if (type === "fullscreen-exit") {
      enterFullscreen();
      setShowFSBanner(false);
    }
  }, [activeAlert]);

  // ── Fetch questions ───────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await userService.getMCQAssessment(id!);
        setQuestions(res?.questions ?? res?.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── Final submit (voluntary / timer) ─────────────────────────────────────
  const handleFinalSubmit = useCallback(async () => {
    if (finalSubmitting || phase === "result") return;
    setFinalSubmitting(true);
    setShowSubmitModal(false);

    if (timerRef.current) clearInterval(timerRef.current);
    if (faceCheckIntervalRef.current) clearInterval(faceCheckIntervalRef.current);
    if (audioCheckIntervalRef.current) clearInterval(audioCheckIntervalRef.current);
    if (procStreamRef.current) procStreamRef.current.getTracks().forEach((t) => t.stop());

    try {
      const answersArray = Object.values(answers).map((a) => ({
        questionId: a.questionId,
        answerText: a.selectedOption,
      }));
      const res = await userService.finalSubmitMCQAssessment(id!, { answers: answersArray });
      if (res) {
        if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
        document.body.style.userSelect = "";
        setTotalScore(res?.totalScore ?? 0);
        navigate(`/user/${id}/assessment-complete`);
      }
    } catch (e) {
      console.error(e);
      setTotalScore(0);
    } finally {
      setFinalSubmitting(false);
      setPhase("result");
    }
  }, [answers, finalSubmitting, id, phase, navigate]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || phase === "result") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); handleFinalSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [loading, phase, handleFinalSubmit]);

  // ── Tab switch ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || phase === "result") return;
    const handle = () => { if (document.hidden) triggerViolation("tab-switch"); };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, [loading, phase, triggerViolation]);

  // ── Prevent back navigation ───────────────────────────────────────────────
  useEffect(() => {
    if (loading || phase === "result") return;
    window.history.pushState(null, "", window.location.href);
    const handle = () => window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handle);
    return () => window.removeEventListener("popstate", handle);
  }, [loading, phase]);

  // ── Copy detection ────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || phase === "result") return;
    const onCopy = (e: ClipboardEvent) => {
      const sel = window.getSelection()?.toString() ?? "";
      if (sel.trim().length > 5) { e.preventDefault(); triggerViolation("copy-attempt"); }
    };
    document.addEventListener("copy", onCopy, { capture: true });
    return () => document.removeEventListener("copy", onCopy, true);
  }, [loading, phase, triggerViolation]);

  // ══════════════════════════════════════════════════════════════════════════
  // ENHANCED PROCTORING
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (loading || phase === "result") return;
    let mounted = true;

    const startProctoring = async () => {
      try {
        await loadFaceModels();

        // Higher resolution for better face detection accuracy
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true,
        });
        if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }

        procStreamRef.current = stream;
        if (procVideoRef.current) {
          procVideoRef.current.srcObject = stream;
          await procVideoRef.current.play();
        }
        setCameraReady(true);

        // ── Audio noise monitoring ────────────────────────────────────────
        try {
          const audioCtx = new AudioContext();
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          audioCtx.createMediaStreamSource(stream).connect(analyser);
          audioCtxRef.current  = audioCtx;
          analyserRef.current  = analyser;
          const NOISE_THRESHOLD = 40;
          const SILENCE_RESET   = 3;
          audioCheckIntervalRef.current = setInterval(() => {
            if (phaseRef.current === "result" || !analyserRef.current) return;
            const arr = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(arr);
            const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
            if (avg > NOISE_THRESHOLD) {
              noiseSilentCountRef.current = 0;
              if (!noiseEpisodeRef.current) { noiseEpisodeRef.current = true; setNoiseWarning(true); }
            } else {
              noiseSilentCountRef.current += 1;
              if (noiseSilentCountRef.current >= SILENCE_RESET) {
                noiseEpisodeRef.current = false;
                noiseSilentCountRef.current = 0;
              }
            }
          }, 2000);
        } catch (e) { console.warn("Audio monitor failed:", e); }

        // ── Face / Gaze / Eye detection ───────────────────────────────────
        //
        // Bad-frame counters (independent per type):
        //   Each counter increments when that issue persists this tick.
        //   When a counter reaches NEED_BAD → violation fires, counter resets.
        //   A good frame for a specific check resets ONLY that counter.
        //   This means:  - Looking away 2 frames + face missing 1 frame doesn't
        //                  reset the looking-away counter unfairly.
        //                - Multiple types can accumulate independently.
        //
        const bad: Record<string, number> = {
          "no-face": 0, "multiple-faces": 0, "looking-away": 0, "eyes-closed": 0,
        };

        const bumpAndCheck = (type: string): boolean => {
          bad[type] = (bad[type] || 0) + 1;
          if (bad[type] >= NEED_BAD) {
            bad[type] = 0;
            return true;
          }
          return false;
        };

        faceCheckIntervalRef.current = setInterval(async () => {
          if (phaseRef.current === "result" || !procVideoRef.current) return;
          if (procVideoRef.current.readyState < 2) return;

          try {
            const detections = await faceapi
              .detectAllFaces(
                procVideoRef.current,
                new faceapi.TinyFaceDetectorOptions({
                  scoreThreshold: 0.35, // sensitive — catches partial/side-on faces
                  inputSize: 320,
                })
              )
              .withFaceLandmarks()     // full 68-point
              .withFaceExpressions();  // adds expression data

            // ── NO FACE ──────────────────────────────────────────────────
            if (detections.length === 0) {
              setFaceStatus("warning");
              bad["multiple-faces"] = 0;
              bad["looking-away"]   = 0;
              bad["eyes-closed"]    = 0;
              if (bumpAndCheck("no-face")) triggerViolationRef.current("no-face");
              return;
            }
            bad["no-face"] = 0;

            // ── MULTIPLE FACES ────────────────────────────────────────────
            if (detections.length > 1) {
              setFaceStatus("warning");
              bad["looking-away"] = 0;
              bad["eyes-closed"]  = 0;
              if (bumpAndCheck("multiple-faces")) triggerViolationRef.current("multiple-faces");
              return;
            }
            bad["multiple-faces"] = 0;

            const { detection, landmarks } = detections[0];

            // Very low confidence → skip this frame entirely
            if (detection.score < 0.40) return;

            // ── PARTIAL FACE (out of frame) ───────────────────────────────
            // Check how much of the bounding box is within the video dimensions
            const vw = procVideoRef.current!.videoWidth  || 640;
            const vh = procVideoRef.current!.videoHeight || 480;
            const box = detection.box;
            const clampedW = Math.max(0, Math.min(box.x + box.width,  vw) - Math.max(box.x, 0));
            const clampedH = Math.max(0, Math.min(box.y + box.height, vh) - Math.max(box.y, 0));
            const visRatio = (clampedW * clampedH) / (box.width * box.height);

            if (visRatio < 0.55) {
              // More than 45% of face is outside the frame = treat as no-face
              setFaceStatus("warning");
              if (bumpAndCheck("no-face")) triggerViolationRef.current("no-face");
              return;
            }

            // ── GAZE / HEAD POSE ──────────────────────────────────────────
            const nose = landmarks.getNose();
            const jaw  = landmarks.getJawOutline();
            let lookingAway = false;

            if (nose?.length && jaw?.length) {
              const jL = jaw[0].x, jR = jaw[jaw.length - 1].x;
              const jawW = jR - jL;
              const jawMid = (jL + jR) / 2;

              if (jawW > 0) {
                const tip    = nose[nose.length - 1];
                const bridge = nose[0];

                // Horizontal: nose tip offset from jaw midpoint
                // 0.28 = moderate head turn (< original 0.38)
                const hOffset = Math.abs(tip.x - jawMid) / jawW;

                // Vertical: nose projection length vs jaw width
                // 0.15 = head tilted down (< original 0.10 which was too loose)
                const vRatio = Math.abs(tip.y - bridge.y) / jawW;

                // Cross-check with eye centre vs jaw centre
                const lEye = landmarks.getLeftEye();
                const rEye = landmarks.getRightEye();
                let eyeOffset = 0;
                if (lEye?.length && rEye?.length) {
                  const eyeMid = (
                    lEye.reduce((s, p) => s + p.x, 0) / lEye.length +
                    rEye.reduce((s, p) => s + p.x, 0) / rEye.length
                  ) / 2;
                  eyeOffset = Math.abs(eyeMid - jawMid) / jawW;
                }

                // Any one of these being true = looking away
                lookingAway = hOffset > 0.28 || vRatio < 0.15 || eyeOffset > 0.22;
              }
            }

            if (lookingAway) {
              setFaceStatus("warning");
              if (bumpAndCheck("looking-away")) triggerViolationRef.current("looking-away");
            } else {
              bad["looking-away"] = 0;
            }

            // ── EYE CLOSURE via EAR ───────────────────────────────────────
            const lEyePts = landmarks.getLeftEye();
            const rEyePts = landmarks.getRightEye();

            if (lEyePts?.length >= 6 && rEyePts?.length >= 6) {
              const avgEAR = (calcEAR(lEyePts) + calcEAR(rEyePts)) / 2;

              if (avgEAR < EAR_CLOSED_THRESHOLD) {
                // Eyes closed / very heavy
                setFaceStatus("warning");
                if (bumpAndCheck("eyes-closed")) triggerViolationRef.current("eyes-closed");
              } else {
                bad["eyes-closed"] = 0;
              }
            }

            // Mark face as OK only if both gaze and eyes pass
            if (!lookingAway) {
              setFaceStatus("ok");
            }

          } catch {
            // Suppress GPU / model race errors silently
          }
        }, 1500); // every 1.5s (tighter than previous 2s)

      } catch (err) {
        console.warn("Proctoring camera error:", err);
        setCameraError(true);
      }
    };

    startProctoring();

    return () => {
      mounted = false;
      if (faceCheckIntervalRef.current) clearInterval(faceCheckIntervalRef.current);
      if (audioCheckIntervalRef.current) clearInterval(audioCheckIntervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (procStreamRef.current) procStreamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [loading, phase]);

  // ── Save answer ───────────────────────────────────────────────────────────
  const handleSelectOption = async (opt: string) => {
    const question = questions[currentQ];
    if (!question || finalSubmitting || savingRef.current) return;
    setAnswers((prev) => ({
      ...prev,
      [question._id]: { questionId: question._id, selectedOption: opt, submitted: true },
    }));
    savingRef.current = true;
    setSavingAnswer(true);
    try {
      await userService.submitMCQAssessment(id!, { questionId: question._id, answerText: opt });
    } catch (e) {
      console.error("Save answer error:", e);
    } finally {
      savingRef.current = false;
      setSavingAnswer(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentQuestion = questions[currentQ];
  const currentAnswer   = currentQuestion ? answers[currentQuestion._id] : undefined;
  const isWarning       = timeLeft < 5 * 60;
  const progress        = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;
  const answeredCount   = Object.values(answers).filter((a) => a.submitted).length;
  const flaggedCount    = flagged.size;

  type QuestionStatus = "not-answered" | "answered" | "flagged" | "current";
  const getStatus = (idx: number): QuestionStatus => {
    if (idx === currentQ) return "current";
    const q = questions[idx];
    if (flagged.has(idx)) return "flagged";
    if (q && answers[q._id]?.submitted) return "answered";
    return "not-answered";
  };

  const statusStyle: Record<QuestionStatus, string> = {
    current:        "bg-[#2D55FB] text-white border-[#2D55FB]",
    answered:       "bg-green-600/80 text-white border-green-600",
    flagged:        "bg-amber-600/70 text-white border-amber-600",
    "not-answered": "bg-[#1a2850] text-gray-400 border-gray-600",
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(currentQ) ? next.delete(currentQ) : next.add(currentQ);
      return next;
    });
  };

  // ─── Loading screen ───────────────────────────────────────────────────────
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

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Question Navigator</h3>
        <p className="text-xs text-gray-500">{answeredCount} of {questions.length} answered</p>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((_, i) => {
          const status = getStatus(i);
          return (
            <motion.button
              key={i}
              onClick={() => { setCurrentQ(i); setShowSidePanel(false); }}
              className={`w-full aspect-square rounded-lg border text-xs font-semibold transition-all ${statusStyle[status]}`}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
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
          { color: "bg-[#1a2850]",    label: "Not Answered" },
          { color: "bg-[#2D55FB]",    label: "Current" },
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
          { label: "Total Questions :", value: questions.length,                 color: "text-white"     },
          { label: "Answered :",        value: answeredCount,                    color: "text-blue-400"  },
          { label: "Flagged :",         value: flaggedCount,                     color: "text-amber-400" },
          { label: "Remaining :",       value: questions.length - answeredCount, color: "text-white"     },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-700/30 last:border-0">
            <span className="text-xs text-gray-400">{label}</span>
            <span className={`text-xs font-semibold ${color}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div
      className="min-h-screen bg-[#060d24] text-white flex flex-col"
      style={{ userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}
    >
      {/* Hidden proctoring video */}
      <video
        ref={procVideoRef} muted playsInline
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
      />

      {/* ── FULLSCREEN BANNER ── */}
      <AnimatePresence>
        {showFSBanner && !activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 bg-red-500/20 border border-red-500/50 rounded-xl shadow-xl backdrop-blur-sm max-w-sm w-[90%]"
          >
            <Maximize className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-xs flex-1 leading-snug">Fullscreen exited. Please re-enter fullscreen to continue.</p>
            <button
              onClick={() => { enterFullscreen(); setShowFSBanner(false); }}
              className="text-xs text-white bg-red-500 hover:bg-red-400 px-2.5 py-1 rounded-lg font-semibold transition-colors"
            >
              Re-enter
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NOISE BANNER ── */}
      <AnimatePresence>
        {noiseWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 bg-amber-500/15 border border-amber-500/40 rounded-xl shadow-xl backdrop-blur-sm max-w-sm w-[90%]"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-amber-300 text-xs flex-1 leading-snug">Background noise detected. Please reduce noise around you.</p>
            <button onClick={() => setNoiseWarning(false)} className="text-amber-400/60 hover:text-amber-300 transition-colors flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PROCTORING PiP ── */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-1.5">
        {violationCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 border border-red-500/40 rounded-full">
            <ShieldAlert className="w-3 h-3 text-red-400" />
            <span className="text-red-400 text-xs font-semibold">{violationCount}/{MAX_VIOLATIONS} warnings</span>
          </div>
        )}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
          isFullscreen
            ? "bg-green-500/10 border-green-500/30 text-green-400"
            : "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
        }`}>
          <Maximize className="w-3 h-3" />
          {isFullscreen ? "Fullscreen" : "Not Fullscreen!"}
        </div>
        <div
          className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden border-2 shadow-xl"
          style={{ borderColor: faceStatus === "ok" ? "#22c55e" : faceStatus === "warning" ? "#ef4444" : "#4b5563" }}
        >
          {cameraReady && (
            <video
              autoPlay muted playsInline
              ref={(el) => { if (el && procStreamRef.current && !el.srcObject) el.srcObject = procStreamRef.current; }}
              className="w-full h-full object-cover scale-x-[-1]"
            />
          )}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1836]">
              <VideoOff className="w-5 h-5 text-gray-500 mb-1" />
              <span className="text-gray-500 text-[9px] text-center leading-tight">Camera<br />unavailable</span>
            </div>
          )}
          {!cameraReady && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0d1836]">
              <Loader2 className="w-4 h-4 text-[#2D55FB] animate-spin" />
            </div>
          )}
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: faceStatus === "ok" ? "#22c55e" : faceStatus === "warning" ? "#ef4444" : "#6b7280" }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-white text-[9px] font-medium bg-black/50 px-1 rounded">
              {faceStatus === "ok" ? "OK" : faceStatus === "warning" ? "!" : "…"}
            </span>
          </div>
          <div className="absolute bottom-1 right-1.5">
            <span className="text-[9px] text-white/60 font-medium">Proctored</span>
          </div>
        </div>
      </div>

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-30 bg-[#060d24]/95 backdrop-blur border-b border-gray-700/30 px-3 sm:px-4 lg:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-white truncate">{title ?? "MCQ Assessment"}</h1>
            <p className="text-xs text-gray-500">Question {currentQ + 1} of {questions.length}</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
            {savingAnswer
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin text-[#2D55FB]" /><span>Saving…</span></>
              : <><div className="w-2 h-2 rounded-full bg-green-500" /><span>Saved</span></>
            }
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-mono font-semibold ${
            isWarning ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-gray-700/50 bg-[#0d1836] text-gray-300"
          }`}>
            <Clock className={`w-3.5 h-3.5 ${isWarning ? "animate-pulse" : ""}`} />
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => setShowSidePanel(true)}
            className="flex lg:hidden items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2D55FB]/20 border border-[#2D55FB]/40 text-[#2D55FB] text-xs font-medium"
          >
            <BarChart2 className="w-3.5 h-3.5" /> Navigator
          </button>
          <motion.button
            onClick={() => setShowSubmitModal(true)}
            disabled={finalSubmitting}
            className="px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-green-500 hover:bg-green-400 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            {finalSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Test"}
          </motion.button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 gap-4 lg:gap-6">
        <div className="flex-1 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0d1836] border border-gray-700/40 rounded-2xl p-4 sm:p-6 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2D55FB] bg-[#2D55FB]/10 px-2.5 py-1 rounded-full border border-[#2D55FB]/20">
                  Question {currentQ + 1}
                </span>
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

              <div className="w-full h-1 bg-gray-700/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#2D55FB] rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div ref={copyProtectedRef}>
                <p className="text-white text-sm sm:text-base leading-relaxed font-medium pointer-events-none select-none">
                  {currentQuestion?.questionText}
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {currentQuestion?.options?.map((opt, i) => {
                  const isSelected = currentAnswer?.selectedOption === opt;
                  return (
                    <motion.button
                      key={i}
                      onClick={() => handleSelectOption(opt)}
                      disabled={finalSubmitting}
                      className={`w-full flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-left transition-all text-sm cursor-pointer ${
                        isSelected
                          ? "border-[#2D55FB] bg-[#2D55FB]/15"
                          : "border-gray-700/50 bg-[#0a0f2e]/60 hover:border-[#2D55FB]/40 hover:bg-[#0a0f2e]/80"
                      }`}
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.998 }}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected ? "border-[#2D55FB] bg-[#2D55FB]" : "border-gray-600"
                      }`}>
                        {isSelected && (
                          savingAnswer
                            ? <Loader2 className="w-3 h-3 text-white animate-spin" />
                            : <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className={`flex-1 ${isSelected ? "text-white" : "text-gray-300"}`}>{opt}</span>
                    </motion.button>
                  );
                })}
              </div>

              {currentAnswer?.submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-gray-500 text-xs py-1"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-[#2D55FB]/50" />
                  <span>Answer saved — <span className="text-gray-400">you can change it anytime before submitting</span></span>
                </motion.div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-700/30">
                <motion.button
                  onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                  disabled={currentQ === 0}
                  className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-700/50 text-gray-400 text-xs sm:text-sm hover:border-gray-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </motion.button>

                <div className="flex items-center gap-1 overflow-hidden max-w-[120px] sm:max-w-[200px]">
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

        {/* Desktop sidebar */}
        <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
          <div className="sticky top-24 bg-[#0d1836] border border-gray-700/40 rounded-2xl p-5">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {showSidePanel && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setShowSidePanel(false)}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed right-0 top-0 h-full w-72 bg-[#0d1836] border-l border-gray-700/40 z-50 p-5 overflow-y-auto lg:hidden"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white">Question Navigator</h3>
              <button onClick={() => setShowSidePanel(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <SidebarContent />
          </motion.div>
        </>
      )}

      {/* ══ VIOLATION ALERT ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeAlert && (
          <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-2xl p-6 w-full max-w-sm shadow-2xl border ${
                activeAlert.count >= MAX_VIOLATIONS
                  ? "bg-red-950/95 border-red-500/60"
                  : "bg-[#0d1836] border-amber-500/40"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${
                  activeAlert.count >= MAX_VIOLATIONS ? "bg-red-500/20" : "bg-amber-500/20"
                }`}>
                  {activeAlert.count >= MAX_VIOLATIONS
                    ? <ShieldAlert className="w-6 h-6 text-red-400" />
                    : <AlertTriangle className="w-6 h-6 text-amber-400" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-0.5">
                    {activeAlert.count >= MAX_VIOLATIONS
                      ? "⚠ Assessment Terminated"
                      : VIOLATION_MESSAGES[activeAlert.type].title}
                  </h3>
                  <p className={`text-xs font-medium ${activeAlert.count >= MAX_VIOLATIONS ? "text-red-400" : "text-amber-400"}`}>
                    {activeAlert.count >= MAX_VIOLATIONS
                      ? "3 violations reached — exam auto-ended"
                      : `Warning ${activeAlert.count} of ${MAX_VIOLATIONS}`}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                {activeAlert.count >= MAX_VIOLATIONS
                  ? "You have received 3 proctoring violations. Your assessment has been automatically submitted with answers recorded so far. You will now be redirected."
                  : VIOLATION_MESSAGES[activeAlert.type].body(MAX_VIOLATIONS - activeAlert.count)}
              </p>

              {activeAlert.count < MAX_VIOLATIONS && (
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Violations</span>
                    <span className="text-amber-400 font-semibold">{activeAlert.count} / {MAX_VIOLATIONS}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: activeAlert.count === 1 ? "#f59e0b" : "#ef4444" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(activeAlert.count / MAX_VIOLATIONS) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <p className="text-xs text-red-400/80 mt-1.5 text-right">
                    {MAX_VIOLATIONS - activeAlert.count} more = auto-termination
                  </p>
                </div>
              )}

              <motion.button
                onClick={handleAlertClose}
                className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${
                  activeAlert.count >= MAX_VIOLATIONS
                    ? "bg-red-500 hover:bg-red-400"
                    : "bg-[#2D55FB] hover:bg-[#1e3fd4]"
                }`}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              >
                {activeAlert.count >= MAX_VIOLATIONS ? "End Assessment" : "I Understand, Continue"}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SUBMIT MODAL ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0d1836] border border-gray-700/40 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <h3 className="text-base font-semibold text-white mb-2">Submit Test?</h3>
            <p className="text-sm text-gray-400 mb-4">
              You have answered {answeredCount} of {questions.length} questions.
            </p>
            {flaggedCount > 0 && (
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4">
                <span className="text-amber-400 text-xs">⚠ {flaggedCount} question(s) still flagged for review.</span>
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
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
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