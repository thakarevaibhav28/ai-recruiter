
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
  EyeOff, Users, Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { userService } from "../../services/service/userService";
import * as faceapi from "@vladmandic/face-api";

// ─── Models ───────────────────────────────────────────────────────────────────
const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
let faceModelsLoaded = false;
async function loadFaceModels() {
  if (faceModelsLoaded) return;
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  ]);
  faceModelsLoaded = true;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Question { _id: string; questionText: string; options: string[]; }
interface AnswerState { questionId: string; selectedOption: string; submitted: boolean; }

type ViolationType =
  | "tab-switch" | "no-face" | "multiple-faces"
  | "looking-away" | "eyes-closed" | "copy-attempt" | "fullscreen-exit";

interface ViolationAlert { type: ViolationType; count: number; }

// Soft warning = non-intrusive amber toast, auto-dismisses, costs 0 violations
interface SoftToast {
  id: string;       // unique key for deduplication
  icon: "eye" | "gaze" | "face" | "noise" | "partial";
  msg: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_VIOLATIONS  = 3;
const TICK_MS         = 1200;   // detection interval
// How many consecutive bad ticks before action
const SOFT_TICKS      = 2;      // 2 × 1.2s = 2.4s → amber toast banner
const HARD_TICKS      = 8;      // 8 × 1.2s = 9.6s → violation modal
// Eye Aspect Ratio thresholds (lower = more closed)
const EAR_SOFT        = 0.23;   // drowsy / heavy eyes → soft toast
const EAR_HARD        = 0.15;   // fully closed → hard violation counter
// Head-pose gaze thresholds (ratio of jaw-width)
const GAZE_SOFT       = 0.20;   // slight drift → soft toast
const GAZE_HARD       = 0.30;   // clear turn → hard violation counter

const VIOL_MSGS: Record<ViolationType, { title: string; body: (r: number) => string }> = {
  "tab-switch":      { title: "Tab Switch Detected",       body: r => `You left the assessment window. ${r} violation(s) left before auto-termination.` },
  "no-face":         { title: "Face Not Detected",         body: r => `Your face was absent for too long. Sit directly in front of the camera. ${r} violation(s) left.` },
  "multiple-faces":  { title: "Multiple People Detected",  body: r => `More than one person is visible. Only you may be in frame. ${r} violation(s) left.` },
  "looking-away":    { title: "Prolonged Gaze Deviation",  body: r => `You looked away from the screen for too long. Keep your eyes on the assessment. ${r} violation(s) left.` },
  "eyes-closed":     { title: "Eyes Closed Too Long",      body: r => `Your eyes were closed for an extended period. Stay alert. ${r} violation(s) left.` },
  "copy-attempt":    { title: "Copy Attempt Detected",     body: r => `Copying is strictly prohibited. ${r} violation(s) left.` },
  "fullscreen-exit": { title: "Fullscreen Exited",         body: r => `Fullscreen mode was exited. The assessment must stay in fullscreen. ${r} violation(s) left.` },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt   = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const pdur  = (t: string) => { const m = t?.match(/(\d+)/); return m ? parseInt(m[1])*60 : 15*60; };
const ed    = (a: faceapi.Point, b: faceapi.Point) => Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2);
const ear   = (p: faceapi.Point[]) => p.length<6 ? 1 : (ed(p[1],p[5])+ed(p[2],p[4]))/(2*ed(p[0],p[3]));

// Attempt fullscreen (never throws)
function tryEnterFS() {
  try {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(()=>{});
  } catch {}
}

// ═════════════════════════════════════════════════════════════════════════════
const MCQAssessment: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { title, time } = (useLocation().state as { title: string; time: string }) ?? {};

  // ── Core state ──────────────────────────────────────────────────────────
  const [questions,       setQuestions]       = useState<Question[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [currentQ,        setCurrentQ]        = useState(0);
  const [answers,         setAnswers]         = useState<Record<string, AnswerState>>({});
  const [flagged,         setFlagged]         = useState<Set<number>>(new Set());
  const [timeLeft,        setTimeLeft]        = useState(() => pdur(time));
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSidePanel,   setShowSidePanel]   = useState(false);
  const [savingAnswer,    setSavingAnswer]    = useState(false);
  const [finalSubmitting, setFinalSubmitting] = useState(false);
  const [phase,           setPhase]           = useState<"quiz"|"result">("quiz");
  const [isFullscreen,    setIsFullscreen]    = useState(false);
  const [showFSBanner,    setShowFSBanner]    = useState(false);

  // ── Proctoring state ────────────────────────────────────────────────────
  const [violationCount,  setViolationCount]  = useState(0);
  const [activeAlert,     setActiveAlert]     = useState<ViolationAlert|null>(null);
  const [softToasts,      setSoftToasts]      = useState<SoftToast[]>([]);
  const [cameraReady,     setCameraReady]     = useState(false);
  const [cameraError,     setCameraError]     = useState(false);
  const [faceOk,          setFaceOk]          = useState<boolean|null>(null); // null=unknown, true=ok, false=warn

  // ── Refs ─────────────────────────────────────────────────────────────────
  const timerRef         = useRef<ReturnType<typeof setInterval>|null>(null);
  const procVideoRef     = useRef<HTMLVideoElement>(null);
  const procStreamRef    = useRef<MediaStream|null>(null);
  const faceIntervalRef  = useRef<ReturnType<typeof setInterval>|null>(null);
  const audioCtxRef      = useRef<AudioContext|null>(null);
  const analyserRef      = useRef<AnalyserNode|null>(null);
  const audioIntRef      = useRef<ReturnType<typeof setInterval>|null>(null);
  const toastTimersRef   = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const violCountRef     = useRef(0);
  const phaseRef         = useRef<"quiz"|"result">("quiz");
  const answersRef       = useRef<Record<string,AnswerState>>({});
  const savingRef        = useRef(false);
  const autoFailDoneRef  = useRef(false);
  // Stable callback refs
  const trigViolRef      = useRef<(t: ViolationType) => void>(()=>{});
  const autoFailRef      = useRef<() => void>(()=>{});

  useEffect(()=>{ phaseRef.current   = phase;   }, [phase]);
  useEffect(()=>{ answersRef.current = answers; }, [answers]);
  useEffect(()=>{ violCountRef.current = violationCount; }, [violationCount]);

  // ════════════════════════════════════════════════════════════════════════
  // KEYBOARD LOCK
  // ════════════════════════════════════════════════════════════════════════
  // Registered once on mount with NO deps — uses phaseRef to stay current.
  // { capture:true } fires our handler BEFORE the browser's own keydown
  // processing, which blocks Ctrl+C, F12, Ctrl+U, Ctrl+A, Tab, etc.
  //
  // IMPORTANT NOTE ON ESC:
  // The W3C Fullscreen spec (§7.1) explicitly forbids scripts from
  // preventing the user from exiting fullscreen via the ESC key.
  // e.preventDefault() on ESC *is ignored* by every browser by design.
  // Our mitigation: detect the fullscreenchange event and immediately
  // call requestFullscreen() again — making the exit near-instant.
  // We also trigger a violation so the candidate is penalised.
  // ════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const blockKey = (e: KeyboardEvent) => {
      // After exam ends, allow normal keyboard again
      if (phaseRef.current === "result") return;
      // This prevents ALL keys: Ctrl+C, Ctrl+U, F12, Tab, arrows, letters
      // Note: ESC exit-fullscreen is enforced by browser spec, cannot be stopped.
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };
    // capture:true = intercept before any other handler including browser defaults
    document.addEventListener("keydown",  blockKey, { capture: true, passive: false });
    document.addEventListener("keyup",    blockKey, { capture: true, passive: false });
    document.addEventListener("keypress", blockKey, { capture: true, passive: false });

    // Block right-click
    const blockCtx = (e: MouseEvent) => {
      if (phaseRef.current !== "result") e.preventDefault();
    };
    document.addEventListener("contextmenu", blockCtx, { capture: true, passive: false });

    // Block clipboard
    const blockClip = (e: ClipboardEvent) => {
      if (phaseRef.current !== "result") e.preventDefault();
    };
    document.addEventListener("copy",  blockClip, { capture: true });
    document.addEventListener("cut",   blockClip, { capture: true });
    document.addEventListener("paste", blockClip, { capture: true });

    return () => {
      document.removeEventListener("keydown",  blockKey, { capture: true } as any);
      document.removeEventListener("keyup",    blockKey, { capture: true } as any);
      document.removeEventListener("keypress", blockKey, { capture: true } as any);
      document.removeEventListener("contextmenu", blockCtx, { capture: true } as any);
      document.removeEventListener("copy",  blockClip, { capture: true } as any);
      document.removeEventListener("cut",   blockClip, { capture: true } as any);
      document.removeEventListener("paste", blockClip, { capture: true } as any);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // INTENTIONALLY empty — phaseRef keeps it current without re-registering

  // Disable text selection via CSS
  useEffect(() => {
    const s = document.body.style;
    s.userSelect = "none";
    (s as any).webkitUserSelect = "none";
    (s as any).msUserSelect = "none";
    return () => { s.userSelect = ""; (s as any).webkitUserSelect = ""; (s as any).msUserSelect = ""; };
  }, []);

  // ════════════════════════════════════════════════════════════════════════
  // FULLSCREEN
  // Enter on mount. On any exit: immediately re-request + trigger violation.
  // ════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    tryEnterFS();
    setIsFullscreen(!!document.fullscreenElement);

    const onChange = () => {
      const inFS = !!document.fullscreenElement;
      setIsFullscreen(inFS);
      if (!inFS && phaseRef.current !== "result") {
        // Re-enter immediately — this minimises the time the screen is visible
        tryEnterFS();
        setShowFSBanner(true);
        trigViolRef.current("fullscreen-exit");
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prevent back navigation
  useEffect(() => {
    if (loading || phase === "result") return;
    window.history.pushState(null, "", window.location.href);
    const h = () => window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", h);
    return () => window.removeEventListener("popstate", h);
  }, [loading, phase]);

  // Tab switch
  useEffect(() => {
    if (loading || phase === "result") return;
    const h = () => { if (document.hidden) trigViolRef.current("tab-switch"); };
    document.addEventListener("visibilitychange", h);
    return () => document.removeEventListener("visibilitychange", h);
  }, [loading, phase]);

  // ════════════════════════════════════════════════════════════════════════
  // SOFT TOAST SYSTEM
  // Small amber banners — no violation cost, auto-dismiss in 5s.
  // Deduplicated by id so the same toast doesn't stack.
  // ════════════════════════════════════════════════════════════════════════
  const showToast = useCallback((toast: SoftToast) => {
    setSoftToasts(prev => {
      // deduplicate: replace if same id already exists
      const filtered = prev.filter(t => t.id !== toast.id);
      return [...filtered, toast];
    });
    // Clear existing auto-dismiss timer for this id
    if (toastTimersRef.current[toast.id]) clearTimeout(toastTimersRef.current[toast.id]);
    toastTimersRef.current[toast.id] = setTimeout(() => {
      setSoftToasts(prev => prev.filter(t => t.id !== toast.id));
      delete toastTimersRef.current[toast.id];
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setSoftToasts(prev => prev.filter(t => t.id !== id));
    if (toastTimersRef.current[id]) {
      clearTimeout(toastTimersRef.current[id]);
      delete toastTimersRef.current[id];
    }
  }, []);

  const clearToast = useCallback((id: string) => {
    setSoftToasts(prev => prev.filter(t => t.id !== id));
    if (toastTimersRef.current[id]) {
      clearTimeout(toastTimersRef.current[id]);
      delete toastTimersRef.current[id];
    }
  }, []);

  // ════════════════════════════════════════════════════════════════════════
  // AUTO-FAIL
  // ════════════════════════════════════════════════════════════════════════
  const triggerAutoFail = useCallback(async () => {
    if (autoFailDoneRef.current) return;
    autoFailDoneRef.current = true;

    if (timerRef.current)        clearInterval(timerRef.current);
    if (faceIntervalRef.current) clearInterval(faceIntervalRef.current);
    if (audioIntRef.current)     clearInterval(audioIntRef.current);
    if (procStreamRef.current)   procStreamRef.current.getTracks().forEach(t => t.stop());

    setPhase("result");
    phaseRef.current = "result";
    if (document.fullscreenElement) { try { await document.exitFullscreen(); } catch {} }
    document.body.style.userSelect = "";
    (document.body.style as any).webkitUserSelect = "";

    try {
      const arr = Object.values(answersRef.current).map(a => ({ questionId: a.questionId, answerText: a.selectedOption }));
      await userService.finalSubmitMCQAssessment(id!, { answers: arr });
    } catch (e) { console.error("auto-fail submit:", e); }

    navigate(`/user/${id}/assessment-complete`);
  }, [id, navigate]);

  useEffect(() => { autoFailRef.current = triggerAutoFail; }, [triggerAutoFail]);

  // ════════════════════════════════════════════════════════════════════════
  // VIOLATION HANDLER
  // ════════════════════════════════════════════════════════════════════════
  const triggerViolation = useCallback((type: ViolationType) => {
    if (phaseRef.current === "result") return;
    setViolationCount(prev => {
      const next = prev + 1;
      violCountRef.current = next;
      setActiveAlert({ type, count: next });
      return next;
    });
  }, []);

  useEffect(() => { trigViolRef.current = triggerViolation; }, [triggerViolation]);

  const handleAlertClose = useCallback(() => {
    const count = violCountRef.current;
    const type  = activeAlert?.type;
    setActiveAlert(null);
    if (count >= MAX_VIOLATIONS) {
      setTimeout(() => autoFailRef.current(), 120);
    } else if (type === "fullscreen-exit") {
      tryEnterFS();
      setShowFSBanner(false);
    }
  }, [activeAlert]);

  // ── Fetch questions ──────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try { const r = await userService.getMCQAssessment(id!); setQuestions(r?.questions ?? r?.data ?? []); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [id]);

  // ── Final submit ─────────────────────────────────────────────────────────
  const handleFinalSubmit = useCallback(async () => {
    if (finalSubmitting || phase === "result") return;
    setFinalSubmitting(true);
    setShowSubmitModal(false);
    if (timerRef.current)        clearInterval(timerRef.current);
    if (faceIntervalRef.current) clearInterval(faceIntervalRef.current);
    if (audioIntRef.current)     clearInterval(audioIntRef.current);
    if (procStreamRef.current)   procStreamRef.current.getTracks().forEach(t => t.stop());
    try {
      const arr = Object.values(answers).map(a => ({ questionId: a.questionId, answerText: a.selectedOption }));
      const res = await userService.finalSubmitMCQAssessment(id!, { answers: arr });
      if (res) {
        if (document.fullscreenElement) await document.exitFullscreen().catch(()=>{});
        document.body.style.userSelect = "";
        navigate(`/user/${id}/assessment-complete`);
      }
    } catch (e) { console.error(e); }
    finally { setFinalSubmitting(false); setPhase("result"); }
  }, [answers, finalSubmitting, id, phase, navigate]);

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || phase === "result") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(timerRef.current!); handleFinalSubmit(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [loading, phase, handleFinalSubmit]);

  // ════════════════════════════════════════════════════════════════════════
  // PROCTORING ENGINE
  //
  // Two-tier approach:
  //   TIER 1 — Soft toast (amber banner, no violation penalty):
  //     • EAR between EAR_SOFT and EAR_HARD   → "eyes heavy/drowsy"
  //     • Gaze between GAZE_SOFT and GAZE_HARD → "looking slightly away"
  //     • Face partially out of frame (>30% missing but <55% missing)
  //     • Background noise detected
  //   TIER 2 — Hard violation (modal, counts toward 3-strike limit):
  //     • EAR < EAR_HARD for HARD_TICKS consecutive ticks
  //     • Gaze > GAZE_HARD for HARD_TICKS consecutive ticks
  //     • Face entirely missing for HARD_TICKS consecutive ticks
  //     • Multiple faces for HARD_TICKS consecutive ticks
  //     • Tab switch (instant)
  //     • Fullscreen exit (instant)
  //     • Copy attempt (instant)
  //
  // Each check has its own independent bad-tick counter.
  // ════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (loading || phase === "result") return;
    let mounted = true;

    (async () => {
      try {
        await loadFaceModels();

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true,
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        procStreamRef.current = stream;

        if (procVideoRef.current) {
          procVideoRef.current.srcObject = stream;
          await procVideoRef.current.play();
        }
        setCameraReady(true);

        // ── Audio ─────────────────────────────────────────────────────────
        try {
          const ctx = new AudioContext();
          const an  = ctx.createAnalyser();
          an.fftSize = 256;
          ctx.createMediaStreamSource(stream).connect(an);
          audioCtxRef.current = ctx;
          analyserRef.current = an;
          let noiseActive = false;
          audioIntRef.current = setInterval(() => {
            if (phaseRef.current === "result" || !analyserRef.current) return;
            const buf = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(buf);
            const avg = buf.reduce((a,b)=>a+b,0)/buf.length;
            if (avg > 42) {
              if (!noiseActive) {
                noiseActive = true;
                showToast({ id:"noise", icon:"noise", msg:"Background noise detected — please reduce noise around you." });
              }
            } else {
              if (noiseActive) { noiseActive = false; clearToast("noise"); }
            }
          }, 2500);
        } catch {}

        // ── Independent bad-tick counters ─────────────────────────────────
        // soft = counts ticks at "soft" level; fires toast at SOFT_TICKS
        // hard = counts ticks at "hard" level; fires violation at HARD_TICKS
        // Each key is a separate proctoring check.
        const soft: Record<string,number> = {};
        const hard: Record<string,number> = {};

        const bumpS = (k: string) => { soft[k] = (soft[k]||0)+1; return soft[k]; };
        const bumpH = (k: string) => { hard[k] = (hard[k]||0)+1; return hard[k]; };
        const clearS = (k: string) => { soft[k] = 0; };
        const clearH = (k: string) => { hard[k] = 0; };

        faceIntervalRef.current = setInterval(async () => {
          if (phaseRef.current === "result" || !procVideoRef.current) return;
          if (procVideoRef.current.readyState < 2) return;

          try {
            const dets = await faceapi
              .detectAllFaces(
                procVideoRef.current,
                new faceapi.SsdMobilenetv1Options({ minConfidence: 0.40 })
              )
              .withFaceLandmarks();

            // ── NO FACE ──────────────────────────────────────────────────
            if (dets.length === 0) {
              setFaceOk(false);
              // Show soft toast immediately on first tick
              showToast({ id:"noface", icon:"face", msg:"Your face is not visible. Please sit directly in front of the camera." });
              // Hard violation after sustained absence
              const hc = bumpH("noface");
              if (hc >= HARD_TICKS) { clearH("noface"); trigViolRef.current("no-face"); }
              // Reset all other counters — can't track gaze/eyes without a face
              clearS("gaze"); clearH("gaze");
              clearS("eyes"); clearH("eyes");
              clearH("multi");
              return;
            }
            clearH("noface");
            clearS("noface");
            clearToast("noface");

            // ── MULTIPLE FACES ────────────────────────────────────────────
            if (dets.length > 1) {
              setFaceOk(false);
              showToast({ id:"multi", icon:"face", msg:"Multiple people detected. Only the candidate should be in frame." });
              const hc = bumpH("multi");
              if (hc >= HARD_TICKS) { clearH("multi"); trigViolRef.current("multiple-faces"); }
              clearS("gaze"); clearH("gaze");
              clearS("eyes"); clearH("eyes");
              return;
            }
            clearH("multi");
            clearToast("multi");

            const { detection, landmarks } = dets[0];
            // Very low confidence = unreliable frame, skip without penalising
            if (detection.score < 0.42) return;

            // ── PARTIAL FACE (moving out of frame) ────────────────────────
            const vw  = procVideoRef.current!.videoWidth  || 640;
            const vh  = procVideoRef.current!.videoHeight || 480;
            const box = detection.box;
            const cw  = Math.max(0, Math.min(box.x+box.width,  vw) - Math.max(box.x, 0));
            const ch  = Math.max(0, Math.min(box.y+box.height, vh) - Math.max(box.y, 0));
            const vis = (cw * ch) / (box.width * box.height);

            if (vis < 0.50) {
              // More than half the face is out of frame → treat like no-face
              setFaceOk(false);
              showToast({ id:"partial", icon:"partial", msg:"Part of your face is outside the camera view. Centre yourself." });
              const hc = bumpH("noface");
              if (hc >= HARD_TICKS) { clearH("noface"); trigViolRef.current("no-face"); }
              return;
            } else if (vis < 0.75) {
              // 25-50% of face out of frame → soft toast only
              const sc = bumpS("partial");
              if (sc >= SOFT_TICKS) {
                showToast({ id:"partial", icon:"partial", msg:"Please centre yourself — part of your face is near the frame edge." });
              }
            } else {
              clearS("partial");
              clearToast("partial");
              clearH("noface");
            }

            // ── GAZE / HEAD POSE ──────────────────────────────────────────
            const nose  = landmarks.getNose();
            const jaw   = landmarks.getJawOutline();
            const lEye  = landmarks.getLeftEye();
            const rEye  = landmarks.getRightEye();
            let gazeLevel = 0; // 0=ok, 1=soft, 2=hard

            if (nose?.length && jaw?.length) {
              const jL   = jaw[0].x, jR = jaw[jaw.length-1].x;
              const jawW = jR - jL;
              const jawM = (jL + jR) / 2;
              if (jawW > 20) { // sanity check — face must have real width
                const tip    = nose[nose.length-1];
                const bridge = nose[0];
                // Horizontal rotation: nose tip distance from jaw center
                const hOff = Math.abs(tip.x - jawM) / jawW;
                // Vertical tilt: nose bridge-to-tip height vs jaw width
                const vRat = Math.abs(tip.y - bridge.y) / jawW;
                // Eye midpoint displacement from jaw center
                let eyeOff = 0;
                if (lEye?.length && rEye?.length) {
                  const em = (
                    lEye.reduce((s,p)=>s+p.x,0)/lEye.length +
                    rEye.reduce((s,p)=>s+p.x,0)/rEye.length
                  ) / 2;
                  eyeOff = Math.abs(em - jawM) / jawW;
                }
                if      (hOff > GAZE_HARD || vRat < 0.12 || eyeOff > GAZE_HARD) gazeLevel = 2;
                else if (hOff > GAZE_SOFT || vRat < 0.17 || eyeOff > GAZE_SOFT) gazeLevel = 1;
              }
            }

            if (gazeLevel === 2) {
              setFaceOk(false);
              // Show soft toast while building up to hard violation
              const sc = bumpS("gaze");
              if (sc >= SOFT_TICKS) {
                showToast({ id:"gaze", icon:"gaze", msg:"You are looking away from the screen. Please look at the assessment." });
              }
              const hc = bumpH("gaze");
              if (hc >= HARD_TICKS) { clearH("gaze"); clearS("gaze"); dismissToast("gaze"); trigViolRef.current("looking-away"); }
            } else if (gazeLevel === 1) {
              // Soft only — slight drift
              const sc = bumpS("gaze");
              if (sc >= SOFT_TICKS) {
                showToast({ id:"gaze", icon:"gaze", msg:"Please keep your eyes on the screen." });
              }
              clearH("gaze");
            } else {
              clearS("gaze");
              clearH("gaze");
              clearToast("gaze");
            }

            // ── EYE CLOSURE (EAR) ─────────────────────────────────────────
            let eyeLevel = 0;
            if (lEye?.length >= 6 && rEye?.length >= 6) {
              const avgEAR = (ear(lEye) + ear(rEye)) / 2;
              if      (avgEAR < EAR_HARD) eyeLevel = 2;
              else if (avgEAR < EAR_SOFT) eyeLevel = 1;
            }

            if (eyeLevel === 2) {
              setFaceOk(false);
              // Soft toast while accumulating
              const sc = bumpS("eyes");
              if (sc >= SOFT_TICKS) {
                showToast({ id:"eyes", icon:"eye", msg:"Your eyes appear closed. Please stay alert and keep your eyes open." });
              }
              const hc = bumpH("eyes");
              if (hc >= HARD_TICKS) { clearH("eyes"); clearS("eyes"); dismissToast("eyes"); trigViolRef.current("eyes-closed"); }
            } else if (eyeLevel === 1) {
              // Drowsy / heavy — soft toast only
              const sc = bumpS("eyes");
              if (sc >= SOFT_TICKS) {
                showToast({ id:"eyes", icon:"eye", msg:"Your eyes look heavy. Stay alert and keep your eyes fully open." });
              }
              clearH("eyes");
            } else {
              clearS("eyes");
              clearH("eyes");
              clearToast("eyes");
            }

            // Face OK only if all checks pass
            if (gazeLevel === 0 && eyeLevel === 0) {
              setFaceOk(true);
            }

          } catch { /* suppress GPU / model race errors */ }
        }, TICK_MS);

      } catch (err) {
        console.warn("Proctoring start error:", err);
        setCameraError(true);
      }
    })();

    return () => {
      mounted = false;
      if (faceIntervalRef.current)  clearInterval(faceIntervalRef.current);
      if (audioIntRef.current)      clearInterval(audioIntRef.current);
      if (audioCtxRef.current)      audioCtxRef.current.close().catch(()=>{});
      if (procStreamRef.current)    procStreamRef.current.getTracks().forEach(t => t.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, phase]); // showToast/clearToast are stable callbacks — safe to omit

  // ── Select answer ────────────────────────────────────────────────────────
  const handleSelectOption = async (opt: string) => {
    const q = questions[currentQ];
    if (!q || finalSubmitting || savingRef.current) return;
    setAnswers(prev => ({ ...prev, [q._id]: { questionId: q._id, selectedOption: opt, submitted: true } }));
    savingRef.current = true; setSavingAnswer(true);
    try { await userService.submitMCQAssessment(id!, { questionId: q._id, answerText: opt }); }
    catch (e) { console.error(e); }
    finally { savingRef.current = false; setSavingAnswer(false); }
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const curQ          = questions[currentQ];
  const curAns        = curQ ? answers[curQ._id] : undefined;
  const isTimeWarning = timeLeft < 5 * 60;
  const progress      = questions.length > 0 ? ((currentQ+1)/questions.length)*100 : 0;
  const answeredCount = Object.values(answers).filter(a=>a.submitted).length;
  const flaggedCount  = flagged.size;

  type QS = "not-answered"|"answered"|"flagged"|"current";
  const getStatus = (i: number): QS => {
    if (i === currentQ) return "current";
    const q = questions[i];
    if (flagged.has(i)) return "flagged";
    if (q && answers[q._id]?.submitted) return "answered";
    return "not-answered";
  };
  const statusStyle: Record<QS,string> = {
    current:        "bg-[#2D55FB] text-white border-[#2D55FB]",
    answered:       "bg-green-600/80 text-white border-green-600",
    flagged:        "bg-amber-600/70 text-white border-amber-600",
    "not-answered": "bg-[#1a2850] text-gray-400 border-gray-600",
  };
  const toggleFlag = () => {
    setFlagged(prev => { const n=new Set(prev); n.has(currentQ)?n.delete(currentQ):n.add(currentQ); return n; });
  };

  // ── Face status colour ───────────────────────────────────────────────────
  const faceStatusColor = faceOk === true ? "#22c55e" : faceOk === false ? "#ef4444" : "#4b5563";
  const faceStatusLabel = faceOk === true ? "OK" : faceOk === false ? "!" : "…";

  // Toast icon map
  const toastIconMap: Record<SoftToast["icon"], React.ReactNode> = {
    eye:     <EyeOff className="w-3.5 h-3.5 text-amber-400 shrink-0"/>,
    gaze:    <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0"/>,
    face:    <Users className="w-3.5 h-3.5 text-amber-400 shrink-0"/>,
    noise:   <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0"/>,
    partial: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0"/>,
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#060d24] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-[#2D55FB] animate-spin"/>
        <p className="text-gray-400 text-sm">Loading assessment…</p>
      </div>
    </div>
  );

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Question Navigator</h3>
        <p className="text-xs text-gray-500">{answeredCount} of {questions.length} answered</p>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((_,i) => (
          <motion.button key={i} onClick={()=>{ setCurrentQ(i); setShowSidePanel(false); }}
            className={`w-full aspect-square rounded-lg border text-xs font-semibold transition-all ${statusStyle[getStatus(i)]}`}
            whileHover={{ scale:1.1 }} whileTap={{ scale:0.95 }}>
            {i+1}
          </motion.button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          { color:"bg-green-600/80", label:"Answered"     },
          { color:"bg-amber-600/70", label:"Flagged"      },
          { color:"bg-[#1a2850]",    label:"Not Answered" },
          { color:"bg-[#2D55FB]",    label:"Current"      },
        ].map(({color,label}) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${color}`}/>
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>
      <div className="bg-[#0a0f2e] rounded-xl p-4 border border-gray-700/40">
        <h4 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5"/> Test Summary
        </h4>
        {[
          { label:"Total Questions :", value:questions.length,                 color:"text-white"     },
          { label:"Answered :",        value:answeredCount,                    color:"text-blue-400"  },
          { label:"Flagged :",         value:flaggedCount,                     color:"text-amber-400" },
          { label:"Remaining :",       value:questions.length-answeredCount,   color:"text-white"     },
        ].map(({label,value,color}) => (
          <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-700/30 last:border-0">
            <span className="text-xs text-gray-400">{label}</span>
            <span className={`text-xs font-semibold ${color}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#060d24] text-white flex flex-col"
      style={{ userSelect:"none", WebkitUserSelect:"none" } as React.CSSProperties}>

      {/* Hidden proctoring video */}
      <video ref={procVideoRef} muted playsInline
        style={{ position:"absolute", width:1, height:1, opacity:0, pointerEvents:"none" }}/>

      {/* ══ SOFT WARNING TOASTS ══════════════════════════════════════════════
          Non-intrusive amber banners at top-center.
          No violation penalty — just warnings to the candidate.
          Auto-dismiss in 5s, or candidate can close manually.     */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-full max-w-[340px]">
        <AnimatePresence>
          {softToasts.map(toast => (
            <motion.div key={toast.id}
              initial={{ opacity:0, y:-12, scale:0.96 }}
              animate={{ opacity:1,  y:0,   scale:1    }}
              exit={{    opacity:0,  y:-12, scale:0.96 }}
              transition={{ duration: 0.22 }}
              className="flex items-start gap-2.5 px-3.5 py-2.5 bg-amber-500/12 border border-amber-500/40 rounded-xl shadow-lg backdrop-blur-sm">
              {toastIconMap[toast.icon]}
              <p className="text-amber-200 text-xs flex-1 leading-snug font-medium">{toast.msg}</p>
              <button onClick={() => dismissToast(toast.id)}
                className="text-amber-400/50 hover:text-amber-300 transition-colors shrink-0 mt-0.5">
                <X className="w-3 h-3"/>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── FULLSCREEN RE-ENTER BANNER ── */}
      <AnimatePresence>
        {showFSBanner && !activeAlert && (
          <motion.div
            initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 bg-red-500/20 border border-red-500/50 rounded-xl shadow-xl backdrop-blur-sm max-w-sm w-[90%]">
            <Maximize className="w-4 h-4 text-red-400 shrink-0"/>
            <p className="text-red-300 text-xs flex-1 leading-snug">Fullscreen exited — re-entering automatically.</p>
            <button onClick={()=>{ tryEnterFS(); setShowFSBanner(false); }}
              className="text-xs text-white bg-red-500 hover:bg-red-400 px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0">
              OK
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PROCTORING PiP ── */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-1.5">
        {violationCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 border border-red-500/40 rounded-full">
            <ShieldAlert className="w-3 h-3 text-red-400"/>
            <span className="text-red-400 text-xs font-semibold">{violationCount}/{MAX_VIOLATIONS} warnings</span>
          </div>
        )}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
          isFullscreen
            ? "bg-green-500/10 border-green-500/30 text-green-400"
            : "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
        }`}>
          <Maximize className="w-3 h-3"/>
          {isFullscreen ? "Fullscreen" : "Not Fullscreen!"}
        </div>
        {/* Camera feed */}
        <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden border-2 shadow-xl"
          style={{ borderColor: faceStatusColor }}>
          {cameraReady && (
            <video autoPlay muted playsInline
              ref={el => { if (el && procStreamRef.current && !el.srcObject) el.srcObject = procStreamRef.current; }}
              className="w-full h-full object-cover scale-x-[-1]"/>
          )}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1836]">
              <VideoOff className="w-5 h-5 text-gray-500 mb-1"/>
              <span className="text-gray-500 text-[9px] text-center leading-tight">Camera<br/>unavailable</span>
            </div>
          )}
          {!cameraReady && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0d1836]">
              <Loader2 className="w-4 h-4 text-[#2D55FB] animate-spin"/>
            </div>
          )}
          {/* Live status dot */}
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
            <motion.div className="w-2 h-2 rounded-full"
              style={{ backgroundColor: faceStatusColor }}
              animate={{ opacity:[1,0.4,1] }} transition={{ duration:1.5, repeat:Infinity }}/>
            <span className="text-white text-[9px] font-medium bg-black/50 px-1 rounded">
              {faceStatusLabel}
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
            <p className="text-xs text-gray-500">Question {currentQ+1} of {questions.length}</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
            {savingAnswer
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin text-[#2D55FB]"/><span>Saving…</span></>
              : <><div className="w-2 h-2 rounded-full bg-green-500"/><span>Saved</span></>}
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-mono font-semibold ${
            isTimeWarning ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-gray-700/50 bg-[#0d1836] text-gray-300"
          }`}>
            <Clock className={`w-3.5 h-3.5 ${isTimeWarning?"animate-pulse":""}`}/>
            {fmt(timeLeft)}
          </div>
          <button onClick={()=>setShowSidePanel(true)}
            className="flex lg:hidden items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2D55FB]/20 border border-[#2D55FB]/40 text-[#2D55FB] text-xs font-medium">
            <BarChart2 className="w-3.5 h-3.5"/> Navigator
          </button>
          <motion.button onClick={()=>setShowSubmitModal(true)} disabled={finalSubmitting}
            className="px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-green-500 hover:bg-green-400 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
            whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
            {finalSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : "Submit Test"}
          </motion.button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 gap-4 lg:gap-6">
        <div className="flex-1 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div key={currentQ}
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}
              transition={{ duration:0.2 }}
              className="bg-[#0d1836] border border-gray-700/40 rounded-2xl p-4 sm:p-6 flex flex-col gap-5">

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2D55FB] bg-[#2D55FB]/10 px-2.5 py-1 rounded-full border border-[#2D55FB]/20">
                  Question {currentQ+1}
                </span>
                <motion.button onClick={toggleFlag}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                    flagged.has(currentQ)
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                      : "bg-transparent border-gray-600 text-gray-500 hover:border-amber-500/40 hover:text-amber-400"
                  }`} whileTap={{ scale:0.95 }}>
                  <Flag className="w-3 h-3"/>
                  {flagged.has(currentQ) ? "Flagged" : "Flag"}
                </motion.button>
              </div>

              <div className="w-full h-1 bg-gray-700/40 rounded-full overflow-hidden">
                <motion.div className="h-full bg-[#2D55FB] rounded-full"
                  animate={{ width:`${progress}%` }} transition={{ duration:0.3 }}/>
              </div>

              <p className="text-white text-sm sm:text-base leading-relaxed font-medium pointer-events-none select-none">
                {curQ?.questionText}
              </p>

              <div className="flex flex-col gap-2.5">
                {curQ?.options?.map((opt, i) => {
                  const isSelected = curAns?.selectedOption === opt;
                  return (
                    <motion.button key={i} onClick={()=>handleSelectOption(opt)} disabled={finalSubmitting}
                      className={`w-full flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-left transition-all text-sm cursor-pointer ${
                        isSelected
                          ? "border-[#2D55FB] bg-[#2D55FB]/15"
                          : "border-gray-700/50 bg-[#0a0f2e]/60 hover:border-[#2D55FB]/40 hover:bg-[#0a0f2e]/80"
                      }`} whileHover={{ scale:1.005 }} whileTap={{ scale:0.998 }}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected ? "border-[#2D55FB] bg-[#2D55FB]" : "border-gray-600"
                      }`}>
                        {isSelected && (savingAnswer
                          ? <Loader2 className="w-3 h-3 text-white animate-spin"/>
                          : <div className="w-2 h-2 rounded-full bg-white"/>)}
                      </div>
                      <span className={`flex-1 ${isSelected?"text-white":"text-gray-300"}`}>{opt}</span>
                    </motion.button>
                  );
                })}
              </div>

              {curAns?.submitted && (
                <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                  className="flex items-center gap-2 text-gray-500 text-xs py-1">
                  <CheckCircle className="w-3.5 h-3.5 text-[#2D55FB]/50"/>
                  <span>Answer saved — <span className="text-gray-400">you can change it anytime before submitting</span></span>
                </motion.div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-700/30">
                <motion.button onClick={()=>setCurrentQ(q=>Math.max(0,q-1))} disabled={currentQ===0}
                  className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-700/50 text-gray-400 text-xs sm:text-sm hover:border-gray-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4"/> Previous
                </motion.button>

                <div className="flex items-center gap-1 overflow-hidden max-w-[120px] sm:max-w-[200px]">
                  {questions.map((_,i)=>(
                    <button key={i} onClick={()=>setCurrentQ(i)}
                      className={`rounded-full transition-all ${i===currentQ?"w-5 h-2 bg-[#2D55FB]":"w-2 h-2 bg-gray-600 hover:bg-gray-500"}`}/>
                  ))}
                </div>

                <motion.button onClick={()=>setCurrentQ(q=>Math.min(questions.length-1,q+1))} disabled={currentQ===questions.length-1}
                  className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-[#2D55FB] text-white bg-[#2D55FB]/20 text-xs sm:text-sm hover:bg-[#2D55FB]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  Next <ChevronRight className="w-4 h-4"/>
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block w-72 xl:w-80 shrink-0">
          <div className="sticky top-24 bg-[#0d1836] border border-gray-700/40 rounded-2xl p-5">
            <SidebarContent/>
          </div>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {showSidePanel && (
        <>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={()=>setShowSidePanel(false)}/>
          <motion.div initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
            transition={{ type:"spring", damping:25 }}
            className="fixed right-0 top-0 h-full w-72 bg-[#0d1836] border-l border-gray-700/40 z-50 p-5 overflow-y-auto lg:hidden">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white">Question Navigator</h3>
              <button onClick={()=>setShowSidePanel(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-4 h-4"/>
              </button>
            </div>
            <SidebarContent/>
          </motion.div>
        </>
      )}

      {/* ══ VIOLATION MODAL ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeAlert && (
          <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }}
              className={`rounded-2xl p-6 w-full max-w-sm shadow-2xl border ${
                activeAlert.count >= MAX_VIOLATIONS
                  ? "bg-red-950/95 border-red-500/60"
                  : "bg-[#0d1836] border-amber-500/40"
              }`}>
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center ${
                  activeAlert.count >= MAX_VIOLATIONS ? "bg-red-500/20" : "bg-amber-500/20"}`}>
                  {activeAlert.count >= MAX_VIOLATIONS
                    ? <ShieldAlert className="w-6 h-6 text-red-400"/>
                    : <AlertTriangle className="w-6 h-6 text-amber-400"/>}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-0.5">
                    {activeAlert.count >= MAX_VIOLATIONS
                      ? "⚠ Assessment Terminated"
                      : VIOL_MSGS[activeAlert.type].title}
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
                  ? "You have received 3 proctoring violations. Your assessment has been automatically submitted with answers recorded so far. You will be redirected now."
                  : VIOL_MSGS[activeAlert.type].body(MAX_VIOLATIONS - activeAlert.count)}
              </p>
              {activeAlert.count < MAX_VIOLATIONS && (
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Violations</span>
                    <span className="text-amber-400 font-semibold">{activeAlert.count} / {MAX_VIOLATIONS}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ backgroundColor: activeAlert.count===1?"#f59e0b":"#ef4444" }}
                      initial={{ width:0 }}
                      animate={{ width:`${(activeAlert.count/MAX_VIOLATIONS)*100}%` }}
                      transition={{ duration:0.4 }}/>
                  </div>
                  <p className="text-xs text-red-400/80 mt-1.5 text-right">
                    {MAX_VIOLATIONS - activeAlert.count} more = auto-termination
                  </p>
                </div>
              )}
              <motion.button onClick={handleAlertClose}
                className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${
                  activeAlert.count >= MAX_VIOLATIONS ? "bg-red-500 hover:bg-red-400" : "bg-[#2D55FB] hover:bg-[#1e3fd4]"
                }`} whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}>
                {activeAlert.count >= MAX_VIOLATIONS ? "End Assessment" : "I Understand, Continue"}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SUBMIT MODAL ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            className="bg-[#0d1836] border border-gray-700/40 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-2">Submit Test?</h3>
            <p className="text-sm text-gray-400 mb-4">You have answered {answeredCount} of {questions.length} questions.</p>
            {flaggedCount > 0 && (
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4">
                <span className="text-amber-400 text-xs">⚠ {flaggedCount} question(s) still flagged for review.</span>
              </div>
            )}
            {!flaggedCount && (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-4">
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0"/>
                <span className="text-green-400 text-xs">Ready to submit.</span>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={()=>setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 text-sm hover:border-gray-500 hover:text-white transition-colors">
                Cancel
              </button>
              <motion.button onClick={handleFinalSubmit} disabled={finalSubmitting}
                className="flex-1 py-2.5 rounded-lg bg-green-500 hover:bg-green-400 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}>
                {finalSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : "Submit"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MCQAssessment;