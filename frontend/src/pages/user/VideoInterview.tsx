// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { Mic, MicOff, Video, VideoOff, PhoneOff, LayoutGrid, MonitorUp, User } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// type Screen = "lobby" | "spotlight" | "grid";

// /* ── Waveform ─────────────────────────────────────────────────────────────── */
// const WaveBar = ({ delay }: { delay: number }) => (
//   <motion.span
//     className="inline-block w-0.75 rounded-full bg-white/80 mx-[1.5px]"
//     style={{ minHeight: 3 }}
//     animate={{ height: ["3px", "14px", "5px", "18px", "3px"] }}
//     transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut", delay }}
//   />
// );

// const AudioWave = () => (
//   <div className="flex items-center px-2.5 py-1.5 bg-[#2D55FB] rounded-full shadow-lg shadow-[#2D55FB]/40">
//     <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mr-1.5 shrink-0">
//       <span className="flex gap-0.5">
//         <span className="w-0.75 h-2.25 bg-white rounded-sm block" />
//         <span className="w-0.75 h-2.25 bg-white rounded-sm block" />
//       </span>
//     </div>
//     {[0, 0.07, 0.14, 0.21, 0.1, 0.28, 0.05, 0.18, 0.12, 0.24, 0.08, 0.2, 0.16].map((d, i) => (
//       <WaveBar key={i} delay={d} />
//     ))}
//   </div>
// );

// /* ── Mic badge ────────────────────────────────────────────────────────────── */
// const MicCircle = ({ muted }: { muted: boolean }) => (
//   <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${muted ? "bg-red-500 shadow-red-500/40" : "bg-[#2D55FB] shadow-[#2D55FB]/40"}`}>
//     {muted ? <MicOff className="h-4 w-4 text-white" /> : <Mic className="h-4 w-4 text-white" />}
//   </div>
// );

// /* ── Control button ───────────────────────────────────────────────────────── */
// const CtrlBtn = ({
//   onClick, active = true, danger = false, children,
// }: {
//   onClick?: () => void; active?: boolean; danger?: boolean; children: React.ReactNode;
// }) => (
//   <motion.button
//     onClick={onClick}
//     className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-colors
//       ${danger
//         ? "bg-red-500 hover:bg-red-400 text-white shadow-red-500/40"
//         : active
//           ? "bg-white hover:bg-gray-100 text-gray-800"
//           : "bg-white text-red-500"
//       }`}
//     whileTap={{ scale: 0.88 }}
//   >
//     {children}
//   </motion.button>
// );

// const VideoInterview: React.FC = () => {
//   const [screen, setScreen] = useState<Screen>("lobby");
//   const [micOn, setMicOn] = useState(true);
//   const [camOn, setCamOn] = useState(true);
//   const [elapsed, setElapsed] = useState(248);
//   const [streamReady, setStreamReady] = useState(false);
//   const [now, setNow] = useState(new Date());

//   // subtitle simulation
//   const [avatarSub, setAvatarSub] = useState("Great! Let's start with a quick introduction. Please tell me a bit about yourself");
//   const [userSub, setUserSub] = useState("I'm a software developer with 2 years of experience in full-stack development");

//   // We keep ONE stream; mirror it to all video elements
//   const streamRef = useRef<MediaStream | null>(null);
//   // refs for each video element
//   const lobbyVidRef = useRef<HTMLVideoElement>(null);
//   const spotlightPipRef = useRef<HTMLVideoElement>(null);
//   const gridUserRef = useRef<HTMLVideoElement>(null);

//   const attachStream = useCallback((ref: React.RefObject<HTMLVideoElement>) => {
//     if (ref.current && streamRef.current) {
//       ref.current.srcObject = streamRef.current;
//       ref.current.play().catch(() => {});
//     }
//   }, []);

//   /* Start camera once on mount */
//   useEffect(() => {
//     (async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
//           audio: true,
//         });
//         streamRef.current = stream;
//         setStreamReady(true);
//         attachStream(lobbyVidRef);
//       } catch (e) {
//         console.warn("Camera not available", e);
//       }
//     })();
//     return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
//   }, []);

//   /* Re-attach stream whenever screen changes */
//   useEffect(() => {
//     if (!streamRef.current) return;
//     if (screen === "lobby") attachStream(lobbyVidRef);
//     if (screen === "spotlight") attachStream(spotlightPipRef);
//     if (screen === "grid") attachStream(gridUserRef);
//   }, [screen, attachStream]);

//   /* Clock */
//   useEffect(() => {
//     const t = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(t);
//   }, []);

//   /* Interview timer */
//   useEffect(() => {
//     if (screen === "lobby") return;
//     const t = setInterval(() => setElapsed((e) => e + 1), 1000);
//     return () => clearInterval(t);
//   }, [screen]);

//   const formatElapsed = (s: number) =>
//     `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

//   const formatClock = (d: Date) => {
//     let h = d.getHours(), m = d.getMinutes();
//     const ap = h >= 12 ? "PM" : "AM";
//     h = h % 12 || 12;
//     return `${h}:${String(m).padStart(2, "0")} ${ap}`;
//   };

//   const formatDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

//   const toggleMic = () => {
//     streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !micOn; });
//     setMicOn((v) => !v);
//   };

//   const toggleCam = () => {
//     streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !camOn; });
//     setCamOn((v) => !v);
//   };

//   const handleJoin = () => setScreen("spotlight");
//   const handleEndCall = () => { setScreen("lobby"); setElapsed(248); };

//   /* ── User video tile helper ──────────────────────────────────────────────── */
//   const UserVideo = ({
//     vidRef, showName = true,
//   }: { vidRef: React.RefObject<HTMLVideoElement>; showName?: boolean }) => (
//     <>
//       <video
//         ref={vidRef}
//         muted playsInline
//         className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-100" : "opacity-0"}`}
//         style={{ transform: "scaleX(-1)" }} // mirror like a selfie
//       />
//       {(!camOn || !streamReady) && (
//         <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a5e] to-[#060c25]">
//           <div className="w-16 h-16 rounded-full bg-[#2D55FB]/20 border border-[#2D55FB]/30 flex items-center justify-center mb-2">
//             {streamReady ? <VideoOff className="h-8 w-8 text-[#2D55FB]/60" /> : <User className="h-8 w-8 text-[#2D55FB]/50" />}
//           </div>
//           <span className="text-white/30 text-xs">{streamReady ? "Camera Off" : "Rohan"}</span>
//         </div>
//       )}
//     </>
//   );

//   /* ── Shared bottom controls ──────────────────────────────────────────────── */
//   const BottomBar = () => (
//     <div className="shrink-0 bg-[#070e2b] border-t border-white/5 px-5 sm:px-8 py-3.5 flex items-center justify-between">
//       <div className="flex items-center gap-2 sm:gap-3 min-w-0">
//         <span className="text-white/40 text-sm font-medium whitespace-nowrap">10 Questions</span>
//         <div className="w-px h-5 bg-white/15" />
//         <span className="text-white font-bold text-xl sm:text-2xl whitespace-nowrap">30 Min</span>
//       </div>
//       <div className="flex items-center gap-2 sm:gap-3">
//         <CtrlBtn onClick={toggleMic} active={micOn}>
//           {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
//         </CtrlBtn>
//         <CtrlBtn onClick={toggleCam} active={camOn}>
//           {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
//         </CtrlBtn>
//         <CtrlBtn>
//           <MonitorUp className="h-4 w-4 text-gray-800" />
//         </CtrlBtn>
//         <CtrlBtn onClick={handleEndCall} danger>
//           <PhoneOff className="h-4 w-4" />
//         </CtrlBtn>
//       </div>
//       <div className="min-w-[80px] sm:min-w-[120px]" />
//     </div>
//   );

//   /* ══════════════════════════════════════════════════════════════════════════
//      SCREEN 1 — LOBBY
//   ══════════════════════════════════════════════════════════════════════════ */
//   if (screen === "lobby") return (
//     <div className="h-screen bg-[#050A24] bg-[radial-gradient(ellipse_at_65%_0%,rgba(45,85,251,0.4),transparent_60%),radial-gradient(ellipse_at_0%_100%,rgba(20,40,120,0.4),transparent_60%)] flex flex-col overflow-hidden">
//       {/* Header */}
//       <div className="flex items-center justify-between px-6 sm:px-10 py-5 shrink-0">
//         <h1 className="text-white font-bold text-lg sm:text-xl tracking-tight">Vitric IQ</h1>
//         <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
//           <span>{formatClock(now)}</span>
//           <span className="text-white/20 mx-1">|</span>
//           <span>{formatDate(now)}</span>
//         </div>
//       </div>

//       {/* Body */}
//       <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-6 pb-10">
//         {/* Camera preview */}
//         <motion.div
//           className="relative w-full max-w-sm sm:max-w-md lg:max-w-xl xl:max-w-2xl bg-[#0a1035] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50"
//           style={{ aspectRatio: "16/9" }}
//           initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }}
//         >
//           {/* Live camera */}
//           <video
//             ref={lobbyVidRef}
//             muted playsInline
//             className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-100" : "opacity-0"}`}
//             style={{ transform: "scaleX(-1)" }}
//           />
//           {/* Fallback */}
//           {(!camOn || !streamReady) && (
//             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a5e] to-[#050A24] gap-3">
//               <div className="w-20 h-20 rounded-full bg-[#2D55FB]/20 border border-[#2D55FB]/30 flex items-center justify-center">
//                 {streamReady ? <VideoOff className="h-10 w-10 text-[#2D55FB]/60" /> : <User className="h-10 w-10 text-[#2D55FB]/50" />}
//               </div>
//               <span className="text-white/30 text-sm">{streamReady ? "Camera off" : "Waiting for camera…"}</span>
//             </div>
//           )}
//           {/* Mic + Cam controls */}
//           <div className="absolute bottom-4 left-4 flex items-center gap-3">
//             <motion.button
//               onClick={toggleMic}
//               className={`w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur transition-all ${micOn ? "bg-white/15 border-white/25 text-white hover:bg-white/25" : "bg-red-500 border-red-400 text-white"}`}
//               whileTap={{ scale: 0.9 }}
//             >
//               {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
//             </motion.button>
//             <motion.button
//               onClick={toggleCam}
//               className={`w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur transition-all ${camOn ? "bg-white/15 border-white/25 text-white hover:bg-white/25" : "bg-red-500 border-red-400 text-white"}`}
//               whileTap={{ scale: 0.9 }}
//             >
//               {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
//             </motion.button>
//           </div>
//         </motion.div>

//         {/* Join panel */}
//         <motion.div
//           className="flex flex-col items-center gap-5"
//           initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
//         >
//           <h2 className="text-white text-2xl sm:text-3xl font-semibold">Ready to Join ?</h2>
//           <div className="flex items-center">
//             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-700 border-2 border-[#2D55FB] flex items-center justify-center shadow-lg">
//               <User className="h-6 w-6 text-white/80" />
//             </div>
//             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-orange-400 flex items-center justify-center -ml-3 shadow-lg">
//               <User className="h-6 w-6 text-white/80" />
//             </div>
//           </div>
//           <p className="text-white/50 text-sm -mt-2">Rohan and Aavtar</p>
//           <motion.button
//             onClick={handleJoin}
//             className="px-10 py-3 bg-[#2D55FB] hover:bg-[#1e3fd4] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-[#2D55FB]/30"
//             whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
//           >
//             Join
//           </motion.button>
//         </motion.div>
//       </div>
//     </div>
//   );

//   /* ══════════════════════════════════════════════════════════════════════════
//      SCREEN 2 — SPOTLIGHT VIEW
//   ══════════════════════════════════════════════════════════════════════════ */
//   if (screen === "spotlight") return (
//     <div className="h-screen bg-[#070e2b] flex flex-col overflow-hidden">
//       {/* Top bar */}
//       <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#070e2b] shrink-0">
//         <div className="flex items-center gap-2">
//           <span className="text-white/40 text-sm">Time :</span>
//           <span className="text-[#2D55FB] font-mono font-bold text-sm tracking-widest">{formatElapsed(elapsed)}</span>
//         </div>
//         <motion.button
//           onClick={() => setScreen("grid")}
//           className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-medium transition-colors"
//           whileTap={{ scale: 0.94 }}
//         >
//           Grid View
//           <div className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
//             <LayoutGrid className="h-4 w-4 text-white" />
//           </div>
//         </motion.button>
//       </div>

//       {/* Main area */}
//       <div className="flex flex-1 min-h-0 gap-2.5 px-2.5 pb-2 pt-1">
//         {/* Left: PiP + transcript */}
//         <div className="w-44 sm:w-52 shrink-0 flex flex-col gap-2">
//           {/* User PiP */}
//           <div
//             className="relative rounded-xl overflow-hidden bg-[#0d1535] border border-white/5 shrink-0"
//             style={{ aspectRatio: "4/3" }}
//           >
//             <UserVideo vidRef={spotlightPipRef} />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
//             <div className="absolute bottom-2 left-2.5 z-10">
//               <span className="text-white text-xs font-semibold drop-shadow">Rohan</span>
//             </div>
//             <div className="absolute bottom-2 right-2.5 z-10">
//               <MicCircle muted={!micOn} />
//             </div>
//           </div>

//           {/* Transcript cards */}
//           <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
//             <div className="bg-[#0e1640]/90 rounded-xl p-3 border border-white/5">
//               <div className="flex items-center justify-between mb-1.5">
//                 <span className="text-[#7a9cff] text-[11px] font-semibold">Avatar:</span>
//                 <button className="text-gray-600 hover:text-gray-400 text-xs leading-none">✕</button>
//               </div>
//               <p className="text-gray-300 text-[11px] leading-relaxed">{avatarSub}</p>
//             </div>
//             <div className="bg-[#0e1640]/90 rounded-xl p-3 border border-white/5">
//               <div className="flex items-center justify-between mb-1.5">
//                 <span className="text-[#7a9cff] text-[11px] font-semibold">Candidate (You):</span>
//                 <button className="text-gray-600 hover:text-gray-400 text-xs leading-none">✕</button>
//               </div>
//               <p className="text-gray-300 text-[11px] leading-relaxed">{userSub}</p>
//             </div>
//           </div>
//         </div>

//         {/* Main avatar feed */}
//         <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
//           <img
//             src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&q=85"
//             alt="Avatar"
//             className="absolute inset-0 w-full h-full object-cover"
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
//           {/* Audio wave */}
//           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
//             <AudioWave />
//           </div>
//           {/* Name */}
//           <div className="absolute bottom-4 left-5 z-10">
//             <span className="text-white font-medium text-sm">Avatar</span>
//           </div>
//         </div>
//       </div>

//       <BottomBar />
//     </div>
//   );

//   /* ══════════════════════════════════════════════════════════════════════════
//      SCREEN 3 — GRID VIEW
//   ══════════════════════════════════════════════════════════════════════════ */
//   return (
//     <div className="h-screen bg-[#070e2b] flex flex-col overflow-hidden">
//       {/* Top bar */}
//       <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#070e2b] shrink-0">
//         <div className="flex items-center gap-2">
//           <span className="text-white/40 text-sm">Time :</span>
//           <span className="text-[#2D55FB] font-mono font-bold text-sm tracking-widest">{formatElapsed(elapsed)}</span>
//         </div>
//         <motion.button
//           onClick={() => setScreen("spotlight")}
//           className="flex items-center gap-2 text-white/80 hover:text-white text-xs font-medium transition-colors"
//           whileTap={{ scale: 0.94 }}
//         >
//           Grid View
//           <div className="w-7 h-7 rounded-lg bg-[#2D55FB] flex items-center justify-center shadow-md shadow-[#2D55FB]/30">
//             <LayoutGrid className="h-4 w-4 text-white" />
//           </div>
//         </motion.button>
//       </div>

//       {/* Grid tiles area + subtitles */}
//       <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-6 pt-2 pb-1 gap-0">

//         {/* Two video tiles */}
//         <div className="flex gap-4 sm:gap-5" style={{ flex: "0 0 auto", height: "clamp(200px, 58vh, 420px)" }}>

//           {/* Rohan tile */}
//           <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
//             {/* Portrait bg fallback */}
//             <img
//               src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=85"
//               alt="Rohan"
//               className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-0" : "opacity-100"}`}
//             />
//             {/* Live camera */}
//             <video
//               ref={gridUserRef}
//               muted playsInline
//               className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-100" : "opacity-0"}`}
//               style={{ transform: "scaleX(-1)" }}
//             />
//             {/* Cam off overlay */}
//             {(!camOn || !streamReady) && (
//               <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a5e]/80 to-[#060c25]/80">
//                 <div className="w-14 h-14 rounded-full bg-[#2D55FB]/20 border border-[#2D55FB]/30 flex items-center justify-center mb-2">
//                   {streamReady ? <VideoOff className="h-7 w-7 text-[#2D55FB]/60" /> : <User className="h-7 w-7 text-[#2D55FB]/50" />}
//                 </div>
//               </div>
//             )}
//             <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
//             {/* Mic badge */}
//             <div className="absolute bottom-12 right-3 z-10">
//               <MicCircle muted={!micOn} />
//             </div>
//             {/* Name */}
//             <div className="absolute bottom-4 left-4 z-10">
//               <span className="text-white font-semibold text-base drop-shadow">Rohan</span>
//             </div>
//           </div>

//           {/* Avatar tile */}
//           <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
//             <img
//               src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&q=85"
//               alt="Avatar"
//               className="absolute inset-0 w-full h-full object-cover"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
//             {/* Audio wave */}
//             <div className="absolute bottom-12 right-3 z-10">
//               <AudioWave />
//             </div>
//             {/* Name */}
//             <div className="absolute bottom-4 left-4 z-10">
//               <span className="text-white font-semibold text-base drop-shadow">Avatar</span>
//             </div>
//           </div>
//         </div>

//         {/* ── Subtitle strip ── */}
//         <div className="flex gap-4 sm:gap-5 mt-3" style={{ flex: "0 0 auto" }}>
//           {/* User subtitle */}
//           <div className="flex-1 flex items-start justify-center">
//             <p className="text-white/65 text-sm text-center leading-snug max-w-xs">
//               {userSub}
//             </p>
//           </div>
//           {/* Avatar subtitle */}
//           <div className="flex-1 flex items-start justify-center">
//             <p className="text-white/65 text-sm text-center leading-snug max-w-xs">
//               {avatarSub}
//             </p>
//           </div>
//         </div>

//         {/* Remaining space to push bar down */}
//         <div className="flex-1" />
//       </div>

//       <BottomBar />
//     </div>
//   );
// };

// export default VideoInterview;
// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Vapi from "@vapi-ai/web";
// import { toast } from "sonner";
// import { Mic, MicOff, Video, VideoOff, PhoneOff, LayoutGrid, MonitorUp, User, Loader2 } from "lucide-react";
// import { motion } from "framer-motion";
// import { useAuth } from "../../context/context";

// type Screen = "lobby" | "spotlight" | "grid";

// /* ══════════════════════════════════════════════════════════════════════════
//    INLINE BEHAVIOR DETECTION (replaces external behaviorDetection import)
// ══════════════════════════════════════════════════════════════════════════ */
// function detectSuspiciousBehavior(videoElement: HTMLVideoElement) {
//   try {
//     const canvas = document.createElement("canvas");
//     canvas.width = 160; canvas.height = 120;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return null;
//     ctx.drawImage(videoElement, 0, 0, 160, 120);
//     const { data } = ctx.getImageData(0, 0, 160, 120);
//     let skinPixels = 0;
//     const total = data.length / 4;
//     for (let i = 0; i < data.length; i += 4) {
//       const r = data[i], g = data[i + 1], b = data[i + 2];
//       if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15 && r - b > 15) skinPixels++;
//     }
//     const ratio = skinPixels / total;
//     if (ratio < 0.02) return { noFaceDetected: true };
//     if (ratio > 0.45) return { multipleFaces: true };
//     if (ratio < 0.06) return { lookingAway: true };
//     return null;
//   } catch { return null; }
// }

// class BehaviorTracker {
//   events: Array<{ type: string; timestamp: number }> = [];
//   addEvent(d: { noFaceDetected?: boolean; multipleFaces?: boolean; lookingAway?: boolean }) {
//     const type = d.noFaceDetected ? "no_face" : d.multipleFaces ? "multiple_faces" : d.lookingAway ? "looking_away" : "unknown";
//     this.events.push({ type, timestamp: Date.now() });
//   }
//   getReport() {
//     return {
//       totalEvents: this.events.length,
//       noFaceCount: this.events.filter(e => e.type === "no_face").length,
//       multipleFacesCount: this.events.filter(e => e.type === "multiple_faces").length,
//       lookingAwayCount: this.events.filter(e => e.type === "looking_away").length,
//       events: this.events,
//     };
//   }
// }

// /* ── Waveform ─────────────────────────────────────────────────────────────── */
// const WaveBar = ({ delay, active }: { delay: number; active: boolean }) => (
//   <motion.span
//     className="inline-block w-0.75 rounded-full bg-white/80 mx-[1.5px]"
//     style={{ minHeight: 3 }}
//     animate={active ? { height: ["3px", "14px", "5px", "18px", "3px"] } : { height: "3px" }}
//     transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut", delay }}
//   />
// );

// const AudioWave = ({ active = true }: { active?: boolean }) => (
//   <div className={`flex items-center px-2.5 py-1.5 rounded-full shadow-lg transition-all ${active ? "bg-[#2D55FB] shadow-[#2D55FB]/40" : "bg-white/10"}`}>
//     <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mr-1.5 shrink-0">
//       <span className="flex gap-0.5">
//         <span className="w-0.75 h-2.25 bg-white rounded-sm block" />
//         <span className="w-0.75 h-2.25 bg-white rounded-sm block" />
//       </span>
//     </div>
//     {[0, 0.07, 0.14, 0.21, 0.1, 0.28, 0.05, 0.18, 0.12, 0.24, 0.08, 0.2, 0.16].map((d, i) => (
//       <WaveBar key={i} delay={d} active={active} />
//     ))}
//   </div>
// );

// /* ── Mic badge ────────────────────────────────────────────────────────────── */
// const MicCircle = ({ muted }: { muted: boolean }) => (
//   <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${muted ? "bg-red-500 shadow-red-500/40" : "bg-[#2D55FB] shadow-[#2D55FB]/40"}`}>
//     {muted ? <MicOff className="h-4 w-4 text-white" /> : <Mic className="h-4 w-4 text-white" />}
//   </div>
// );

// /* ── Control button ───────────────────────────────────────────────────────── */
// const CtrlBtn = ({
//   onClick, active = true, danger = false, children,
// }: {
//   onClick?: () => void; active?: boolean; danger?: boolean; children: React.ReactNode;
// }) => (
//   <motion.button
//     onClick={onClick}
//     className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-colors
//       ${danger
//         ? "bg-red-500 hover:bg-red-400 text-white shadow-red-500/40"
//         : active
//           ? "bg-white hover:bg-gray-100 text-gray-800"
//           : "bg-white text-red-500"
//       }`}
//     whileTap={{ scale: 0.88 }}
//   >
//     {children}
//   </motion.button>
// );

// /* ── AI Avatar (from StartInterview, adapted for dark UI) ─────────────────── */
// function AIAvatarTile({ isSpeaking, isCallActive }: { isSpeaking: boolean; isCallActive: boolean }) {
//   const [mouthOpening, setMouthOpening] = useState(0);
//   useEffect(() => {
//     if (!isSpeaking) { setMouthOpening(0); return; }
//     const interval = setInterval(() => setMouthOpening(prev => (prev + 1) % 5), 80);
//     return () => clearInterval(interval);
//   }, [isSpeaking]);

//   return (
//     <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0d1535] to-[#060c25]">
//       <svg width="160" height="190" viewBox="0 0 280 360" className="drop-shadow-2xl">
//         <defs>
//           <linearGradient id="skinG" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" style={{ stopColor: "#f5c9a8" }} />
//             <stop offset="50%" style={{ stopColor: "#e8b89f" }} />
//             <stop offset="100%" style={{ stopColor: "#daa589" }} />
//           </linearGradient>
//           <linearGradient id="hairG" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" style={{ stopColor: "#4a3728" }} />
//             <stop offset="100%" style={{ stopColor: "#2d2318" }} />
//           </linearGradient>
//         </defs>
//         <path d="M 60 80 Q 50 30 140 20 Q 230 30 220 80 L 220 140 Q 220 90 140 85 Q 60 90 60 140 Z" fill="url(#hairG)" />
//         <ellipse cx="140" cy="150" rx="95" ry="110" fill="url(#skinG)" />
//         <ellipse cx="105" cy="130" rx="18" ry="26" fill="white" />
//         <ellipse cx="175" cy="130" rx="18" ry="26" fill="white" />
//         <circle cx="105" cy="138" r="12" fill="#5a6b7d" />
//         <circle cx="175" cy="138" r="12" fill="#5a6b7d" />
//         <circle cx="105" cy="140" r="7" fill="#1a1a1a" />
//         <circle cx="175" cy="140" r="7" fill="#1a1a1a" />
//         <circle cx="102" cy="136" r="3.5" fill="white" opacity="0.9" />
//         <circle cx="172" cy="136" r="3.5" fill="white" opacity="0.9" />
//         <path d="M 80 110 Q 105 98 122 105" stroke="#3d2f20" strokeWidth="3.5" fill="none" strokeLinecap="round" />
//         <path d="M 158 105 Q 175 98 200 110" stroke="#3d2f20" strokeWidth="3.5" fill="none" strokeLinecap="round" />
//         <path d="M 140 130 L 140 185" stroke="#d9956a" strokeWidth="2.5" fill="none" opacity="0.7" />
//         <ellipse cx="130" cy="188" rx="4" ry="5" fill="#d9956a" opacity="0.6" />
//         <ellipse cx="150" cy="188" rx="4" ry="5" fill="#d9956a" opacity="0.6" />
//         <path
//           d={mouthOpening === 0 ? "M 110 220 Q 140 228 170 220" : mouthOpening <= 2 ? "M 110 218 Q 140 232 170 218" : "M 110 216 Q 140 238 170 216"}
//           stroke="#a85a5a" strokeWidth="2.5" fill={mouthOpening > 1 ? "#c97070" : "none"} strokeLinecap="round"
//         />
//         <rect x="120" y="245" width="40" height="50" fill="#e8b89f" opacity="0.9" />
//         <polygon points="95,290 140,295 185,290 185,340 95,340" fill="#1a3a5c" opacity="0.9" />
//       </svg>
//     </div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════════════════════
//    MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════ */
// const VideoInterview: React.FC = () => {
//   const { interviewInfo } = useAuth();
//   console.log("info", interviewInfo);
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const interview_id = id || "";

//   // ── UI state ──────────────────────────────────────────────────────────────
//   const [screen, setScreen] = useState<Screen>("lobby");
//   const [micOn, setMicOn] = useState(true);
//   const [camOn, setCamOn] = useState(true);
//   const [streamReady, setStreamReady] = useState(false);
//   const [elapsed, setElapsed] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [now, setNow] = useState(new Date());

//   // ── Vapi / AI state ───────────────────────────────────────────────────────
//   const [loading, setLoading] = useState(true);
//   const [vapi, setVapi] = useState<any>(null);
//   const [isCallActive, setIsCallActive] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
//   const [avatarSub, setAvatarSub] = useState("Waiting for AI to speak...");
//   const [userSub, setUserSub] = useState("Your transcript will appear here...");
//   const [resumeData, setResumeData] = useState<any>(null);
//   const [isResumeInterview, setIsResumeInterview] = useState(false);
//   const [noFaceWarning, setNoFaceWarning] = useState(false);

//   // ── Refs ──────────────────────────────────────────────────────────────────
//   const streamRef = useRef<MediaStream | null>(null);
//   const lobbyVidRef = useRef<HTMLVideoElement>(null);
//   const spotlightPipRef = useRef<HTMLVideoElement>(null);
//   const gridUserRef = useRef<HTMLVideoElement>(null);
//   const behaviorVidRef = useRef<HTMLVideoElement>(null);
//   const conversationRef = useRef<any[]>([]);
//   const aiTranscriptBufferRef = useRef("");
//   const userTranscriptBufferRef = useRef("");
//   const detectionIntervalRef = useRef<any>(null);
//   const behaviorTrackerRef = useRef(new BehaviorTracker());

//   /* ── Camera setup ─────────────────────────────────────────────────────── */
//   const attachStream = useCallback((ref: React.RefObject<HTMLVideoElement>) => {
//     if (ref.current && streamRef.current) {
//       ref.current.srcObject = streamRef.current;
//       ref.current.play().catch(() => {});
//     }
//   }, []);

//   useEffect(() => {
//     (async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
//           audio: true,
//         });
//         streamRef.current = stream;
//         setStreamReady(true);
//         attachStream(lobbyVidRef);
//         if (behaviorVidRef.current) {
//           behaviorVidRef.current.srcObject = stream;
//           behaviorVidRef.current.play().catch(() => {});
//         }
//       } catch (e) { console.warn("Camera not available", e); }
//     })();
//     return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
//   }, []);

//   useEffect(() => {
//     if (!streamRef.current) return;
//     if (screen === "lobby") attachStream(lobbyVidRef);
//     if (screen === "spotlight") attachStream(spotlightPipRef);
//     if (screen === "grid") attachStream(gridUserRef);
//   }, [screen, attachStream]);

//   /* ── Interview info setup ─────────────────────────────────────────────── */
//   useEffect(() => {
//     if (!interviewInfo) {
//       toast.error("Interview details not found.");
//       navigate(`/user/${interview_id}/interview-instruction`);
//       return;
//     }

//     // ── FIX: parse duration safely — strip any non-numeric text e.g. "15 minutes" → 15
//     const rawDuration = interviewInfo?.duration || "5";
//     const mins = parseInt(String(rawDuration), 10) || 5;
//     setTimeLeft(mins * 60);

//     // ── FIX: check type OR examType for resume-based detection
//     const type = interviewInfo?.type || interviewInfo?.examType || "";
//     setIsResumeInterview(type === "resume-based");

//     setLoading(false);
//   }, [interviewInfo, interview_id, navigate]);

//   useEffect(() => {
//     if (isResumeInterview) {
//       fetch(`/api/resumes/${interview_id}`)
//         .then(r => r.json())
//         .then(({ data }) => setResumeData(data))
//         .catch(() => toast.error("Could not load resume."));
//     }
//   }, [isResumeInterview, interview_id]);

//   /* ── Clocks & timers ──────────────────────────────────────────────────── */
//   useEffect(() => {
//     const t = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(t);
//   }, []);

//   useEffect(() => {
//     if (screen === "lobby") return;
//     const t = setInterval(() => setElapsed(e => e + 1), 1000);
//     return () => clearInterval(t);
//   }, [screen]);

//   useEffect(() => {
//     if (!isCallActive || timeLeft <= 0) return;
//     const t = setInterval(() => setTimeLeft(s => {
//       if (s <= 1) { toast("Interview time ended"); stopInterview(); return 0; }
//       return s - 1;
//     }), 1000);
//     return () => clearInterval(t);
//   }, [isCallActive]);

//   /* ── Behavior detection ───────────────────────────────────────────────── */
//   useEffect(() => {
//     if (!isCallActive) { clearInterval(detectionIntervalRef.current); return; }
//     detectionIntervalRef.current = setInterval(() => {
//       const vid = behaviorVidRef.current;
//       if (vid && vid.readyState === vid.HAVE_ENOUGH_DATA) {
//         const detected = detectSuspiciousBehavior(vid);
//         if (detected) {
//           behaviorTrackerRef.current.addEvent(detected);
//           if (detected.noFaceDetected) setNoFaceWarning(true);
//           else setNoFaceWarning(false);
//           if (behaviorTrackerRef.current.events.length >= 10) {
//             toast.error("⛔ Interview stopped: Maximum alerts exceeded");
//             stopInterview();
//           }
//         }
//       }
//     }, 1000);
//     return () => clearInterval(detectionIntervalRef.current);
//   }, [isCallActive]);

//   /* ── Vapi initialization ──────────────────────────────────────────────── */
//   useEffect(() => {
//     const instance = new Vapi("960479af-1202-4414-b368-4c813846634e");
//     setVapi(instance);

//     instance.on("speech-start", () => { setIsSpeaking(true); });
//     instance.on("speech-end", () => {
//       setIsSpeaking(false);
//       if (aiTranscriptBufferRef.current.trim()) {
//         setAvatarSub(aiTranscriptBufferRef.current.trim());
//         aiTranscriptBufferRef.current = "";
//       }
//     });
//     instance.on("call-start", () => { setIsCallActive(true); toast("Call Connected"); });
//     instance.on("error", (error: any) => toast.error(`Error: ${error?.message || "Unknown"}`));

//     instance.on("message", (msg: any) => {
//       conversationRef.current.push(msg);
//       if (msg?.type === "transcript") {
//         const text = msg.transcript || msg.text || "";
//         if (msg.role === "assistant") {
//           aiTranscriptBufferRef.current = text;
//           setAvatarSub(text);
//         } else {
//           userTranscriptBufferRef.current = text;
//           setUserSub(text);
//           setIsListening(true);
//         }
//       }
//     });

//     instance.on("user-speech-start", () => setIsListening(true));
//     instance.on("user-speech-end", () => {
//       setIsListening(false);
//       if (userTranscriptBufferRef.current.trim()) {
//         setUserSub(userTranscriptBufferRef.current.trim());
//         userTranscriptBufferRef.current = "";
//       }
//     });

//     return () => { instance.stop(); };
//   }, []);

//   /* ── Start call ───────────────────────────────────────────────────────── */
//   const startCall = useCallback(() => {
//     if (!vapi || !interviewInfo) return;

//     // ── FIX: map actual field names from interviewInfo
//     const jobPosition = interviewInfo?.position || interviewInfo?.jobPosition || "the role";
//     const jobDescription = interviewInfo?.jobDescription || "";
//     const difficulty = interviewInfo?.difficulty || "Medium";
//     const skills = Array.isArray(interviewInfo?.skills)
//       ? interviewInfo.skills.join(", ")
//       : interviewInfo?.skills || "";
//     const numberOfQuestions = interviewInfo?.numberOfQuestions || 5;
//     const candidateName = interviewInfo?.username || interviewInfo?.candidateName || "Candidate";

//     let systemContent = "";
//     let firstMessage = "";

//     if (isResumeInterview) {
//       // ── Resume-based path (unchanged logic, updated field names)
//       systemContent = `You are a professional AI interviewer conducting a ${difficulty} level interview.\nCANDIDATE RESUME:\n${resumeData?.resumeText}\nROLE: ${jobPosition}\nJob Description: ${jobDescription}\nAsk ${numberOfQuestions} relevant questions one by one based on their resume and the role. Wait for a complete answer before asking the next question. Be professional and conversational.`;
//       firstMessage = `Hi ${candidateName}, thank you for joining. I'm your AI interviewer for the ${jobPosition} position. Ready to begin?`;
//     } else {
//       // ── FIX: support both `questions` (your actual field) and legacy `questionList`
//       let questionList: string[] = [];

//       try {
//         // Try interviewInfo.questions first (your actual data shape)
//         const rawQuestions = interviewInfo?.questions ?? interviewInfo?.questionList;

//         if (Array.isArray(rawQuestions) && rawQuestions.length > 0) {
//           // Array of objects with a `question` key, or plain strings
//           questionList = rawQuestions
//             .map((item: any) => (typeof item === "string" ? item : item?.question))
//             .filter(Boolean);
//         }

//         // Also try parsing if it's a JSON string
//         if (questionList.length === 0 && typeof rawQuestions === "string") {
//           const parsed = JSON.parse(rawQuestions);
//           questionList = (Array.isArray(parsed) ? parsed : [])
//             .map((item: any) => (typeof item === "string" ? item : item?.question))
//             .filter(Boolean);
//         }
//       } catch (e) {
//         console.error("Failed to parse questions:", e);
//       }

//       // ── FIX: if questions array is empty, generate questions dynamically via system prompt
//       if (questionList.length === 0) {
//         console.warn("No pre-defined questions found — AI will generate questions dynamically.");

//         systemContent = `You are a professional AI interviewer conducting a ${difficulty} level technical interview.

// ROLE: ${jobPosition}
// JOB DESCRIPTION: ${jobDescription}
// REQUIRED SKILLS: ${skills}
// NUMBER OF QUESTIONS: ${numberOfQuestions}

// Your task:
// 1. Generate ${numberOfQuestions} relevant interview questions for a ${difficulty} level ${jobPosition} developer.
// 2. Ask them ONE BY ONE — wait for the candidate's complete answer before moving to the next.
// 3. Be conversational, professional, and encouraging.
// 4. After all questions are asked, thank the candidate and end the interview.

// Start by introducing yourself and then ask the first question.`;

//         firstMessage = `Hi ${candidateName}, welcome to your ${difficulty} level interview for the ${jobPosition} role. I'll be asking you ${numberOfQuestions} questions today. Let's get started — are you ready?`;
//       } else {
//         // ── Pre-defined questions available
//         systemContent = `You are a professional AI interviewer.\n\nINTERVIEW QUESTIONS (ask one by one):\n${questionList.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\nWait for complete answers before moving to the next question. Be conversational and professional.`;
//         firstMessage = `Hi ${candidateName}, welcome to your interview for the ${jobPosition} role. Ready?`;
//       }
//     }

//     vapi.start({
//       name: "AI Recruiter",
//       firstMessage,
//       transcriber: null,
//       voice: { provider: "vapi", voiceId: "Neha", speed: 0.95, fillerInjectionEnabled: true },
//       model: {
//         provider: "openai",
//         model: "gpt-4-turbo",
//         messages: [{ role: "system", content: systemContent }],
//         temperature: 0.8,
//         maxTokens: 350,
//       },
//       endCallMessage: "Thank you for the interview! We'll be in touch soon. Have a great day!",
//     });
//   }, [vapi, interviewInfo, isResumeInterview, resumeData]);

//   /* ── Generate feedback then navigate ─────────────────────────────────── */
//   const generateFeedback = useCallback(async () => {
//     setIsGeneratingFeedback(true);
//     try {
//       const conversation = conversationRef.current;
//       if (conversation.length === 0) { navigate(`/user/${interview_id}/assessment-complete`); return; }

//       const result = await fetch("/api/ai-feedback", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ conversation }),
//       });
//       const data = await result.json();
//       const content = data?.content?.replace("```json", "").replace("```", "");
//       if (content) {
//         await fetch("/api/feedback", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             userName: interviewInfo?.username,
//             userEmail: interviewInfo?.userEmail,
//             interview_id,
//             feedback: JSON.parse(content),
//           }),
//         });
//         await fetch("/api/behavior", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             interview_id,
//             userName: interviewInfo?.username,
//             userEmail: interviewInfo?.userEmail,
//             behaviorReport: behaviorTrackerRef.current.getReport(),
//           }),
//         }).catch(console.error);
//       }
//       toast.success("Feedback generated!");
//     } catch (e) { console.error(e); }
//     finally {
//       setIsGeneratingFeedback(false);
//       navigate(`/user/${interview_id}/assessment-complete`);
//     }
//   }, [interview_id, navigate, interviewInfo]);

//   /* ── Call-end triggers feedback ──────────────────────────────────────── */
//   useEffect(() => {
//     if (!vapi) return;
//     const handler = () => { setIsCallActive(false); setIsSpeaking(false); generateFeedback(); };
//     vapi.on("call-end", handler);
//     return () => vapi.off("call-end", handler);
//   }, [vapi, generateFeedback]);

//   /* ── Controls ─────────────────────────────────────────────────────────── */
//   const stopInterview = () => {
//     setIsCallActive(false);
//     try { vapi?.stop(); } catch (e) {}
//     toast("Interview stopped");
//   };

//   const handleJoin = () => {
//     setScreen("spotlight");
//     startCall();
//   };

//   const handleEndCall = () => {
//     stopInterview();
//     setScreen("lobby");
//     setElapsed(0);
//   };

//   const toggleMic = () => {
//     streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !micOn; });
//     setMicOn(v => !v);
//   };

//   const toggleCam = () => {
//     streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !camOn; });
//     setCamOn(v => !v);
//   };

//   /* ── Formatters ───────────────────────────────────────────────────────── */
//   const formatElapsed = (s: number) =>
//     `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

//   const formatTimeLeft = (s: number) => {
//     if (isNaN(s) || s < 0) return "00:00";
//     return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
//   };

//   const formatClock = (d: Date) => {
//     let h = d.getHours(), m = d.getMinutes();
//     const ap = h >= 12 ? "PM" : "AM";
//     h = h % 12 || 12;
//     return `${h}:${String(m).padStart(2, "0")} ${ap}`;
//   };

//   const formatDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

//   /* ── Loading / feedback screens ──────────────────────────────────────── */
//   if (loading || !interviewInfo) return (
//     <div className="h-screen bg-[#050A24] flex items-center justify-center">
//       <Loader2 className="animate-spin h-8 w-8 text-[#2D55FB]" />
//       <span className="ml-3 text-white text-lg">Preparing Interview...</span>
//     </div>
//   );

//   if (isGeneratingFeedback) return (
//     <div className="h-screen bg-[#050A24] flex flex-col items-center justify-center gap-4">
//       <Loader2 className="animate-spin h-12 w-12 text-[#2D55FB]" />
//       <h2 className="text-white text-xl font-bold">Generating Your Feedback...</h2>
//       <p className="text-white/40 text-sm">Please wait while our AI analyzes your performance</p>
//     </div>
//   );

//   /* ── Shared User video tile ──────────────────────────────────────────── */
//   const UserVideo = ({ vidRef }: { vidRef: React.RefObject<HTMLVideoElement> }) => (
//     <>
//       <video
//         ref={vidRef} muted playsInline
//         className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-100" : "opacity-0"}`}
//         style={{ transform: "scaleX(-1)" }}
//       />
//       {(!camOn || !streamReady) && (
//         <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a5e] to-[#060c25]">
//           <div className="w-16 h-16 rounded-full bg-[#2D55FB]/20 border border-[#2D55FB]/30 flex items-center justify-center mb-2">
//             {streamReady ? <VideoOff className="h-8 w-8 text-[#2D55FB]/60" /> : <User className="h-8 w-8 text-[#2D55FB]/50" />}
//           </div>
//           <span className="text-white/30 text-xs">{streamReady ? "Camera Off" : interviewInfo?.username || "You"}</span>
//         </div>
//       )}
//     </>
//   );

//   /* ── Shared bottom controls ──────────────────────────────────────────── */
//   const BottomBar = () => (
//     <div className="shrink-0 bg-[#070e2b] border-t border-white/5 px-5 sm:px-8 py-3.5 flex items-center justify-between">
//       <div className="flex items-center gap-2 sm:gap-3 min-w-0">
//         <span className="text-white/40 text-sm font-medium whitespace-nowrap">
//           {interviewInfo?.position || interviewInfo?.jobPosition || "Interview"}
//         </span>
//         <div className="w-px h-5 bg-white/15" />
//         <span className={`font-bold text-sm whitespace-nowrap ${timeLeft < 60 ? "text-red-400 animate-pulse" : "text-[#2D55FB]"}`}>
//           ⏱ {formatTimeLeft(timeLeft)}
//         </span>
//       </div>
//       <div className="flex items-center gap-2 sm:gap-3">
//         <CtrlBtn onClick={toggleMic} active={micOn}>
//           {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
//         </CtrlBtn>
//         <CtrlBtn onClick={toggleCam} active={camOn}>
//           {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
//         </CtrlBtn>
//         <CtrlBtn>
//           <MonitorUp className="h-4 w-4 text-gray-800" />
//         </CtrlBtn>
//         <CtrlBtn onClick={handleEndCall} danger>
//           <PhoneOff className="h-4 w-4" />
//         </CtrlBtn>
//       </div>
//       <div className="min-w-[80px] sm:min-w-[120px] flex justify-end">
//         {noFaceWarning && (
//           <span className="text-red-400 text-xs font-bold animate-pulse">⚠ No face detected</span>
//         )}
//       </div>
//     </div>
//   );

//   /* ══════════════════════════════════════════════════════════════════════════
//      SCREEN 1 — LOBBY
//   ══════════════════════════════════════════════════════════════════════════ */
//   if (screen === "lobby") return (
//     <div className="h-screen bg-[#050A24] bg-[radial-gradient(ellipse_at_65%_0%,rgba(45,85,251,0.4),transparent_60%),radial-gradient(ellipse_at_0%_100%,rgba(20,40,120,0.4),transparent_60%)] flex flex-col overflow-hidden">
//       <video ref={behaviorVidRef} muted playsInline className="hidden" />

//       <div className="flex items-center justify-between px-6 sm:px-10 py-5 shrink-0">
//         <h1 className="text-white font-bold text-lg sm:text-xl tracking-tight">Vitric IQ</h1>
//         <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
//           <span>{formatClock(now)}</span>
//           <span className="text-white/20 mx-1">|</span>
//           <span>{formatDate(now)}</span>
//         </div>
//       </div>

//       <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-6 pb-10">
//         <motion.div
//           className="relative w-full max-w-sm sm:max-w-md lg:max-w-xl xl:max-w-2xl bg-[#0a1035] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50"
//           style={{ aspectRatio: "16/9" }}
//           initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }}
//         >
//           <video
//             ref={lobbyVidRef} muted playsInline
//             className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-100" : "opacity-0"}`}
//             style={{ transform: "scaleX(-1)" }}
//           />
//           {(!camOn || !streamReady) && (
//             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a5e] to-[#050A24] gap-3">
//               <div className="w-20 h-20 rounded-full bg-[#2D55FB]/20 border border-[#2D55FB]/30 flex items-center justify-center">
//                 {streamReady ? <VideoOff className="h-10 w-10 text-[#2D55FB]/60" /> : <User className="h-10 w-10 text-[#2D55FB]/50" />}
//               </div>
//               <span className="text-white/30 text-sm">{streamReady ? "Camera off" : "Waiting for camera…"}</span>
//             </div>
//           )}
//           <div className="absolute bottom-4 left-4 flex items-center gap-3">
//             <motion.button onClick={toggleMic} className={`w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur transition-all ${micOn ? "bg-white/15 border-white/25 text-white hover:bg-white/25" : "bg-red-500 border-red-400 text-white"}`} whileTap={{ scale: 0.9 }}>
//               {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
//             </motion.button>
//             <motion.button onClick={toggleCam} className={`w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur transition-all ${camOn ? "bg-white/15 border-white/25 text-white hover:bg-white/25" : "bg-red-500 border-red-400 text-white"}`} whileTap={{ scale: 0.9 }}>
//               {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
//             </motion.button>
//           </div>
//         </motion.div>

//         <motion.div
//           className="flex flex-col items-center gap-5"
//           initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
//         >
//           <h2 className="text-white text-2xl sm:text-3xl font-semibold">Ready to Join?</h2>
//           <p className="text-white/40 text-sm text-center max-w-xs">
//             {interviewInfo?.position || interviewInfo?.jobPosition || "Interview"} • {interviewInfo?.duration || "N/A"}
//           </p>
//           <div className="flex items-center">
//             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-700 border-2 border-[#2D55FB] flex items-center justify-center shadow-lg">
//               <User className="h-6 w-6 text-white/80" />
//             </div>
//             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-orange-400 flex items-center justify-center -ml-3 shadow-lg">
//               <User className="h-6 w-6 text-white/80" />
//             </div>
//           </div>
//           <p className="text-white/50 text-sm -mt-2">{interviewInfo?.username || "You"} and AI Recruiter</p>
//           <motion.button
//             onClick={handleJoin}
//             className="px-10 py-3 bg-[#2D55FB] hover:bg-[#1e3fd4] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-[#2D55FB]/30"
//             whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
//           >
//             Join Interview
//           </motion.button>
//         </motion.div>
//       </div>
//     </div>
//   );

//   /* ══════════════════════════════════════════════════════════════════════════
//      SCREEN 2 — SPOTLIGHT VIEW
//   ══════════════════════════════════════════════════════════════════════════ */
//   if (screen === "spotlight") return (
//     <div className="h-screen bg-[#070e2b] flex flex-col overflow-hidden">
//       <video ref={behaviorVidRef} muted playsInline className="hidden" />

//       <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#070e2b] shrink-0">
//         <div className="flex items-center gap-2">
//           <span className="text-white/40 text-sm">Time :</span>
//           <span className="text-[#2D55FB] font-mono font-bold text-sm tracking-widest">{formatElapsed(elapsed)}</span>
//           {isCallActive && <div className="flex items-center gap-1.5 ml-3 text-green-400 text-xs font-bold"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />LIVE</div>}
//         </div>
//         <motion.button
//           onClick={() => setScreen("grid")}
//           className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-medium transition-colors"
//           whileTap={{ scale: 0.94 }}
//         >
//           Grid View
//           <div className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
//             <LayoutGrid className="h-4 w-4 text-white" />
//           </div>
//         </motion.button>
//       </div>

//       <div className="flex flex-1 min-h-0 gap-2.5 px-2.5 pb-2 pt-1">
//         <div className="w-44 sm:w-52 shrink-0 flex flex-col gap-2">
//           <div className="relative rounded-xl overflow-hidden bg-[#0d1535] border border-white/5 shrink-0" style={{ aspectRatio: "4/3" }}>
//             <UserVideo vidRef={spotlightPipRef} />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
//             <div className="absolute bottom-2 left-2.5 z-10">
//               <span className="text-white text-xs font-semibold drop-shadow">{interviewInfo?.username || "You"}</span>
//             </div>
//             <div className="absolute bottom-2 right-2.5 z-10"><MicCircle muted={!micOn} /></div>
//           </div>

//           <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
//             <div className="bg-[#0e1640]/90 rounded-xl p-3 border border-white/5">
//               <div className="flex items-center justify-between mb-1.5">
//                 <span className="text-[#7a9cff] text-[11px] font-semibold">AI Recruiter:</span>
//                 {isSpeaking && <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
//               </div>
//               <p className="text-gray-300 text-[11px] leading-relaxed">{avatarSub}</p>
//             </div>
//             <div className="bg-[#0e1640]/90 rounded-xl p-3 border border-white/5">
//               <div className="flex items-center justify-between mb-1.5">
//                 <span className="text-[#7a9cff] text-[11px] font-semibold">You:</span>
//                 {isListening && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />}
//               </div>
//               <p className="text-gray-300 text-[11px] leading-relaxed">{userSub}</p>
//             </div>
//           </div>
//         </div>

//         <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
//           <AIAvatarTile isSpeaking={isSpeaking} isCallActive={isCallActive} />
//           <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
//           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
//             <AudioWave active={isSpeaking} />
//           </div>
//           <div className="absolute bottom-4 left-5 z-10">
//             <span className="text-white font-medium text-sm">AI Recruiter</span>
//           </div>
//           {isCallActive && (
//             <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-bold z-10">
//               <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />REC
//             </div>
//           )}
//         </div>
//       </div>

//       <BottomBar />
//     </div>
//   );

//   /* ══════════════════════════════════════════════════════════════════════════
//      SCREEN 3 — GRID VIEW
//   ══════════════════════════════════════════════════════════════════════════ */
//   return (
//     <div className="h-screen bg-[#070e2b] flex flex-col overflow-hidden">
//       <video ref={behaviorVidRef} muted playsInline className="hidden" />

//       <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#070e2b] shrink-0">
//         <div className="flex items-center gap-2">
//           <span className="text-white/40 text-sm">Time :</span>
//           <span className="text-[#2D55FB] font-mono font-bold text-sm tracking-widest">{formatElapsed(elapsed)}</span>
//           {isCallActive && <div className="flex items-center gap-1.5 ml-3 text-green-400 text-xs font-bold"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />LIVE</div>}
//         </div>
//         <motion.button
//           onClick={() => setScreen("spotlight")}
//           className="flex items-center gap-2 text-white/80 hover:text-white text-xs font-medium transition-colors"
//           whileTap={{ scale: 0.94 }}
//         >
//           Spotlight View
//           <div className="w-7 h-7 rounded-lg bg-[#2D55FB] flex items-center justify-center shadow-md shadow-[#2D55FB]/30">
//             <LayoutGrid className="h-4 w-4 text-white" />
//           </div>
//         </motion.button>
//       </div>

//       <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-6 pt-2 pb-1 gap-0">
//         <div className="flex gap-4 sm:gap-5" style={{ flex: "0 0 auto", height: "clamp(200px, 58vh, 420px)" }}>

//           <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
//             <video
//               ref={gridUserRef} muted playsInline
//               className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-100" : "opacity-0"}`}
//               style={{ transform: "scaleX(-1)" }}
//             />
//             {(!camOn || !streamReady) && (
//               <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a5e]/80 to-[#060c25]/80">
//                 <div className="w-14 h-14 rounded-full bg-[#2D55FB]/20 border border-[#2D55FB]/30 flex items-center justify-center mb-2">
//                   {streamReady ? <VideoOff className="h-7 w-7 text-[#2D55FB]/60" /> : <User className="h-7 w-7 text-[#2D55FB]/50" />}
//                 </div>
//               </div>
//             )}
//             <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
//             <div className="absolute bottom-12 right-3 z-10"><MicCircle muted={!micOn} /></div>
//             <div className="absolute bottom-4 left-4 z-10">
//               <span className="text-white font-semibold text-base drop-shadow">{interviewInfo?.username || "You"}</span>
//             </div>
//             {isListening && (
//               <div className="absolute top-4 left-4 z-10">
//                 <div className="flex items-center gap-1.5 bg-blue-600/80 text-white px-2 py-1 rounded-full text-xs font-bold">
//                   <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />Speaking
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
//             <AIAvatarTile isSpeaking={isSpeaking} isCallActive={isCallActive} />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
//             <div className="absolute bottom-12 right-3 z-10"><AudioWave active={isSpeaking} /></div>
//             <div className="absolute bottom-4 left-4 z-10">
//               <span className="text-white font-semibold text-base drop-shadow">AI Recruiter</span>
//             </div>
//             {isSpeaking && (
//               <div className="absolute top-4 left-4 z-10">
//                 <div className="flex items-center gap-1.5 bg-green-600/80 text-white px-2 py-1 rounded-full text-xs font-bold">
//                   <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />Speaking
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="flex gap-4 sm:gap-5 mt-3" style={{ flex: "0 0 auto" }}>
//           <div className="flex-1 flex items-start justify-center">
//             <p className="text-white/65 text-sm text-center leading-snug max-w-xs">{userSub}</p>
//           </div>
//           <div className="flex-1 flex items-start justify-center">
//             <p className="text-white/65 text-sm text-center leading-snug max-w-xs">{avatarSub}</p>
//           </div>
//         </div>
//         <div className="flex-1" />
//       </div>

//       <BottomBar />
//     </div>
//   );
// };

// export default VideoInterview;
// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Vapi from "@vapi-ai/web";
// import { toast } from "sonner";
// import { Mic, MicOff, Video, VideoOff, PhoneOff, LayoutGrid, MonitorUp, User, Loader2 } from "lucide-react";
// import { motion } from "framer-motion";
// import { useAuth } from "../../context/context";

// type Screen = "lobby" | "spotlight" | "grid";

// /* ══════════════════════════════════════════════════════════════════════════
//    INLINE BEHAVIOR DETECTION
// ══════════════════════════════════════════════════════════════════════════ */
// function detectSuspiciousBehavior(videoElement: HTMLVideoElement) {
//   try {
//     const canvas = document.createElement("canvas");
//     canvas.width = 160; canvas.height = 120;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return null;
//     ctx.drawImage(videoElement, 0, 0, 160, 120);
//     const { data } = ctx.getImageData(0, 0, 160, 120);
//     let skinPixels = 0;
//     const total = data.length / 4;
//     for (let i = 0; i < data.length; i += 4) {
//       const r = data[i], g = data[i + 1], b = data[i + 2];
//       if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15 && r - b > 15) skinPixels++;
//     }
//     const ratio = skinPixels / total;
//     if (ratio < 0.02) return { noFaceDetected: true };
//     if (ratio > 0.45) return { multipleFaces: true };
//     if (ratio < 0.06) return { lookingAway: true };
//     return null;
//   } catch { return null; }
// }

// class BehaviorTracker {
//   events: Array<{ type: string; timestamp: number }> = [];
//   addEvent(d: { noFaceDetected?: boolean; multipleFaces?: boolean; lookingAway?: boolean }) {
//     const type = d.noFaceDetected ? "no_face" : d.multipleFaces ? "multiple_faces" : d.lookingAway ? "looking_away" : "unknown";
//     this.events.push({ type, timestamp: Date.now() });
//   }
//   getReport() {
//     return {
//       totalEvents: this.events.length,
//       noFaceCount: this.events.filter(e => e.type === "no_face").length,
//       multipleFacesCount: this.events.filter(e => e.type === "multiple_faces").length,
//       lookingAwayCount: this.events.filter(e => e.type === "looking_away").length,
//       events: this.events,
//     };
//   }
// }

// /* ── Waveform ─────────────────────────────────────────────────────────────── */
// const WaveBar = ({ delay, active }: { delay: number; active: boolean }) => (
//   <motion.span
//     className="inline-block w-0.75 rounded-full bg-white/80 mx-[1.5px]"
//     style={{ minHeight: 3 }}
//     animate={active ? { height: ["3px", "14px", "5px", "18px", "3px"] } : { height: "3px" }}
//     transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut", delay }}
//   />
// );

// const AudioWave = ({ active = true }: { active?: boolean }) => (
//   <div className={`flex items-center px-2.5 py-1.5 rounded-full shadow-lg transition-all ${active ? "bg-[#2D55FB] shadow-[#2D55FB]/40" : "bg-white/10"}`}>
//     <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mr-1.5 shrink-0">
//       <span className="flex gap-0.5">
//         <span className="w-0.75 h-2.25 bg-white rounded-sm block" />
//         <span className="w-0.75 h-2.25 bg-white rounded-sm block" />
//       </span>
//     </div>
//     {[0, 0.07, 0.14, 0.21, 0.1, 0.28, 0.05, 0.18, 0.12, 0.24, 0.08, 0.2, 0.16].map((d, i) => (
//       <WaveBar key={i} delay={d} active={active} />
//     ))}
//   </div>
// );

// /* ── Mic badge ────────────────────────────────────────────────────────────── */
// const MicCircle = ({ muted }: { muted: boolean }) => (
//   <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${muted ? "bg-red-500 shadow-red-500/40" : "bg-[#2D55FB] shadow-[#2D55FB]/40"}`}>
//     {muted ? <MicOff className="h-4 w-4 text-white" /> : <Mic className="h-4 w-4 text-white" />}
//   </div>
// );

// /* ── Control button ───────────────────────────────────────────────────────── */
// const CtrlBtn = ({
//   onClick, active = true, danger = false, children,
// }: {
//   onClick?: () => void; active?: boolean; danger?: boolean; children: React.ReactNode;
// }) => (
//   <motion.button
//     onClick={onClick}
//     className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-colors
//       ${danger
//         ? "bg-red-500 hover:bg-red-400 text-white shadow-red-500/40"
//         : active
//           ? "bg-white hover:bg-gray-100 text-gray-800"
//           : "bg-white text-red-500"
//       }`}
//     whileTap={{ scale: 0.88 }}
//   >
//     {children}
//   </motion.button>
// );

// /* ── AI Avatar ─────────────────────────────────────────────────────────────── */
// function AIAvatarTile({ isSpeaking, isCallActive }: { isSpeaking: boolean; isCallActive: boolean }) {
//   const [mouthOpening, setMouthOpening] = useState(0);
//   useEffect(() => {
//     if (!isSpeaking) { setMouthOpening(0); return; }
//     const interval = setInterval(() => setMouthOpening(prev => (prev + 1) % 5), 80);
//     return () => clearInterval(interval);
//   }, [isSpeaking]);

//   return (
//     <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0d1535] to-[#060c25]">
//       <svg width="160" height="190" viewBox="0 0 280 360" className="drop-shadow-2xl">
//         <defs>
//           <linearGradient id="skinG" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" style={{ stopColor: "#f5c9a8" }} />
//             <stop offset="50%" style={{ stopColor: "#e8b89f" }} />
//             <stop offset="100%" style={{ stopColor: "#daa589" }} />
//           </linearGradient>
//           <linearGradient id="hairG" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" style={{ stopColor: "#4a3728" }} />
//             <stop offset="100%" style={{ stopColor: "#2d2318" }} />
//           </linearGradient>
//         </defs>
//         <path d="M 60 80 Q 50 30 140 20 Q 230 30 220 80 L 220 140 Q 220 90 140 85 Q 60 90 60 140 Z" fill="url(#hairG)" />
//         <ellipse cx="140" cy="150" rx="95" ry="110" fill="url(#skinG)" />
//         <ellipse cx="105" cy="130" rx="18" ry="26" fill="white" />
//         <ellipse cx="175" cy="130" rx="18" ry="26" fill="white" />
//         <circle cx="105" cy="138" r="12" fill="#5a6b7d" />
//         <circle cx="175" cy="138" r="12" fill="#5a6b7d" />
//         <circle cx="105" cy="140" r="7" fill="#1a1a1a" />
//         <circle cx="175" cy="140" r="7" fill="#1a1a1a" />
//         <circle cx="102" cy="136" r="3.5" fill="white" opacity="0.9" />
//         <circle cx="172" cy="136" r="3.5" fill="white" opacity="0.9" />
//         <path d="M 80 110 Q 105 98 122 105" stroke="#3d2f20" strokeWidth="3.5" fill="none" strokeLinecap="round" />
//         <path d="M 158 105 Q 175 98 200 110" stroke="#3d2f20" strokeWidth="3.5" fill="none" strokeLinecap="round" />
//         <path d="M 140 130 L 140 185" stroke="#d9956a" strokeWidth="2.5" fill="none" opacity="0.7" />
//         <ellipse cx="130" cy="188" rx="4" ry="5" fill="#d9956a" opacity="0.6" />
//         <ellipse cx="150" cy="188" rx="4" ry="5" fill="#d9956a" opacity="0.6" />
//         <path
//           d={mouthOpening === 0 ? "M 110 220 Q 140 228 170 220" : mouthOpening <= 2 ? "M 110 218 Q 140 232 170 218" : "M 110 216 Q 140 238 170 216"}
//           stroke="#a85a5a" strokeWidth="2.5" fill={mouthOpening > 1 ? "#c97070" : "none"} strokeLinecap="round"
//         />
//         <rect x="120" y="245" width="40" height="50" fill="#e8b89f" opacity="0.9" />
//         <polygon points="95,290 140,295 185,290 185,340 95,340" fill="#1a3a5c" opacity="0.9" />
//       </svg>
//     </div>
//   );
// }

// /* ── Stable UserVideo component defined OUTSIDE main component to prevent remount ── */
// interface UserVideoProps {
//   streamRef: React.RefObject<MediaStream | null>;
//   camOn: boolean;
//   streamReady: boolean;
//   username: string;
//   onVideoMount: (el: HTMLVideoElement | null) => void;
// }

// const UserVideo = React.memo(({ streamRef, camOn, streamReady, username, onVideoMount }: UserVideoProps) => (
//   <>
//     <video
//       ref={onVideoMount}
//       muted
//       playsInline
//       className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-100" : "opacity-0"}`}
//       style={{ transform: "scaleX(-1)" }}
//     />
//     {(!camOn || !streamReady) && (
//       <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a5e] to-[#060c25]">
//         <div className="w-16 h-16 rounded-full bg-[#2D55FB]/20 border border-[#2D55FB]/30 flex items-center justify-center mb-2">
//           {streamReady ? <VideoOff className="h-8 w-8 text-[#2D55FB]/60" /> : <User className="h-8 w-8 text-[#2D55FB]/50" />}
//         </div>
//         <span className="text-white/30 text-xs">{streamReady ? "Camera Off" : username}</span>
//       </div>
//     )}
//   </>
// ));

// /* ═══════════════════════════════════════════════════════════════════════════
//    MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════ */
// const VideoInterview: React.FC = () => {
//   const { interviewInfo } = useAuth();
//   console.log("info", interviewInfo);
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const interview_id = id || "";

//   // ── UI state ──────────────────────────────────────────────────────────────
//   const [screen, setScreen] = useState<Screen>("lobby");
//   const [micOn, setMicOn] = useState(true);
//   const [camOn, setCamOn] = useState(true);
//   const [streamReady, setStreamReady] = useState(false);
//   const [elapsed, setElapsed] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [now, setNow] = useState(new Date());

//   // ── Vapi / AI state ───────────────────────────────────────────────────────
//   const [loading, setLoading] = useState(true);
//   const [vapi, setVapi] = useState<any>(null);
//   const [isCallActive, setIsCallActive] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
//   const [avatarSub, setAvatarSub] = useState("Waiting for AI to speak...");
//   const [userSub, setUserSub] = useState("Your transcript will appear here...");
//   const [resumeData, setResumeData] = useState<any>(null);
//   const [isResumeInterview, setIsResumeInterview] = useState(false);
//   const [noFaceWarning, setNoFaceWarning] = useState(false);

//   // ── Alert system state ────────────────────────────────────────────────────
//   const [alertCount, setAlertCount] = useState(0);

//   // ── Refs ──────────────────────────────────────────────────────────────────
//   const streamRef = useRef<MediaStream | null>(null);
//   const lobbyVidRef = useRef<HTMLVideoElement>(null);
//   const spotlightVidElRef = useRef<HTMLVideoElement | null>(null); // holds the actual DOM element
//   const gridUserVidElRef = useRef<HTMLVideoElement | null>(null);  // holds the actual DOM element
//   const behaviorVidRef = useRef<HTMLVideoElement>(null);
//   const conversationRef = useRef<any[]>([]);
//   const aiTranscriptBufferRef = useRef("");
//   const userTranscriptBufferRef = useRef("");
//   const detectionIntervalRef = useRef<any>(null);
//   const behaviorTrackerRef = useRef(new BehaviorTracker());

//   // ── Alert tracking refs (avoids stale closures) ───────────────────────────
//   const alertCountRef = useRef(0);
//   const vapiRef = useRef<any>(null);
//   const isCallActiveRef = useRef(false);
//   const isSpeakingRef = useRef(false);
//   const lastUserSpeakRef = useRef<number>(Date.now());
//   const silenceNotifiedRef = useRef(false); // prevent spamming silence prompts
//   const camOnRef = useRef(true);
//   const camAlertIssuedRef = useRef(false); // only alert once per cam-off event

//   // Keep refs in sync with state
//   useEffect(() => { vapiRef.current = vapi; }, [vapi]);
//   useEffect(() => { isCallActiveRef.current = isCallActive; }, [isCallActive]);
//   useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
//   useEffect(() => { camOnRef.current = camOn; }, [camOn]);

//   /* ── Callback refs for spotlight / grid videos (fixes remount issue) ──── */
//   const onSpotlightVideoMount = useCallback((el: HTMLVideoElement | null) => {
//     spotlightVidElRef.current = el;
//     if (el && streamRef.current) {
//       el.srcObject = streamRef.current;
//       el.play().catch(() => {});
//     }
//   }, []);

//   const onGridUserVideoMount = useCallback((el: HTMLVideoElement | null) => {
//     gridUserVidElRef.current = el;
//     if (el && streamRef.current) {
//       el.srcObject = streamRef.current;
//       el.play().catch(() => {});
//     }
//   }, []);

//   /* ── Camera setup ─────────────────────────────────────────────────────── */
//   const attachStream = useCallback((ref: React.RefObject<HTMLVideoElement>) => {
//     if (ref.current && streamRef.current) {
//       ref.current.srcObject = streamRef.current;
//       ref.current.play().catch(() => {});
//     }
//   }, []);

//   // Re-attach to callback-ref elements when stream becomes ready
//   useEffect(() => {
//     if (!streamRef.current) return;
//     if (spotlightVidElRef.current) {
//       spotlightVidElRef.current.srcObject = streamRef.current;
//       spotlightVidElRef.current.play().catch(() => {});
//     }
//     if (gridUserVidElRef.current) {
//       gridUserVidElRef.current.srcObject = streamRef.current;
//       gridUserVidElRef.current.play().catch(() => {});
//     }
//   }, [streamReady]);

//   useEffect(() => {
//     (async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
//           audio: true,
//         });
//         streamRef.current = stream;
//         setStreamReady(true);
//         attachStream(lobbyVidRef);
//         if (behaviorVidRef.current) {
//           behaviorVidRef.current.srcObject = stream;
//           behaviorVidRef.current.play().catch(() => {});
//         }
//       } catch (e) { console.warn("Camera not available", e); }
//     })();
//     return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
//   }, []);

//   useEffect(() => {
//     if (!streamRef.current) return;
//     if (screen === "lobby") attachStream(lobbyVidRef);
//   }, [screen, attachStream]);

//   /* ── Alert system ─────────────────────────────────────────────────────── */
//   const triggerAlert = useCallback((reason: string) => {
//     if (!isCallActiveRef.current) return;

//     alertCountRef.current += 1;
//     const count = alertCountRef.current;
//     setAlertCount(count);

//     const remaining = 3 - count;

//     if (count < 3) {
//       toast.warning(`⚠️ Warning ${count}/3: ${reason}. ${remaining} warning(s) left before interview ends.`);
//     } else {
//       // 3rd alert — inform AI, then end after a short delay
//       toast.error(`🚫 Interview ending: ${reason}. Maximum warnings reached.`);

//       const v = vapiRef.current;
//       if (v) {
//         try {
//           v.send({
//             type: "add-message",
//             message: {
//               role: "system",
//               content:
//                 "IMPORTANT: The candidate has received 3 integrity warnings and the interview must be terminated immediately. In one brief sentence, inform the candidate that the interview is being ended due to multiple violations, then stop.",
//             },
//           });
//         } catch (e) { /* ignore */ }
//         // Give AI ~4 s to speak the farewell, then hard-stop
//         setTimeout(() => {
//           try { v.stop(); } catch (e) {}
//           setIsCallActive(false);
//           setIsSpeaking(false);
//         }, 4000);
//       } else {
//         setIsCallActive(false);
//         setIsSpeaking(false);
//       }
//     }
//   }, []);

//   /* ── Tab switch detection ─────────────────────────────────────────────── */
//   useEffect(() => {
//     if (!isCallActive) return;

//     const handleVisibilityChange = () => {
//       if (document.hidden) {
//         triggerAlert("Tab switching / window minimized detected");
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, [isCallActive, triggerAlert]);

//   /* ── Camera-off alert (only fires once per off-event) ─────────────────── */
//   useEffect(() => {
//     if (!isCallActive) return;

//     if (!camOn && !camAlertIssuedRef.current) {
//       camAlertIssuedRef.current = true;
//       triggerAlert("Camera turned off");
//     }

//     if (camOn) {
//       camAlertIssuedRef.current = false; // reset so turning off again triggers again
//     }
//   }, [camOn, isCallActive, triggerAlert]);

//   /* ── Silence detection — prompt AI if candidate silent > 20 s ─────────── */
//   useEffect(() => {
//     if (!isCallActive) return;

//     const interval = setInterval(() => {
//       if (isSpeakingRef.current) return; // AI is talking, don't interrupt
//       const silenceMs = Date.now() - lastUserSpeakRef.current;

//       if (silenceMs > 20_000 && !silenceNotifiedRef.current) {
//         silenceNotifiedRef.current = true; // throttle
//         const v = vapiRef.current;
//         if (v) {
//           try {
//             v.send({
//               type: "add-message",
//               message: {
//                 role: "system",
//                 content:
//                   "The candidate has been silent for over 20 seconds. Politely ask if they need more time, are having trouble understanding the question, or are ready to proceed.",
//               },
//             });
//           } catch (e) { /* ignore */ }
//         }
//         // Re-enable prompt after another 25 s to avoid spam
//         setTimeout(() => { silenceNotifiedRef.current = false; }, 25_000);
//       }
//     }, 5_000);

//     return () => clearInterval(interval);
//   }, [isCallActive]);

//   /* ── Interview info setup ─────────────────────────────────────────────── */
//   useEffect(() => {
//     if (!interviewInfo) {
//       toast.error("Interview details not found.");
//       navigate(`/user/${interview_id}/interview-instruction`);
//       return;
//     }

//     const rawDuration = interviewInfo?.duration || "5";
//     const mins = parseInt(String(rawDuration), 10) || 5;
//     setTimeLeft(mins * 60);

//     const type = interviewInfo?.type || interviewInfo?.examType || "";
//     setIsResumeInterview(type === "resume-based");

//     setLoading(false);
//   }, [interviewInfo, interview_id, navigate]);

//   useEffect(() => {
//     if (isResumeInterview) {
//       fetch(`/api/resumes/${interview_id}`)
//         .then(r => r.json())
//         .then(({ data }) => setResumeData(data))
//         .catch(() => toast.error("Could not load resume."));
//     }
//   }, [isResumeInterview, interview_id]);

//   /* ── Clocks & timers ──────────────────────────────────────────────────── */
//   useEffect(() => {
//     const t = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(t);
//   }, []);

//   useEffect(() => {
//     if (screen === "lobby") return;
//     const t = setInterval(() => setElapsed(e => e + 1), 1000);
//     return () => clearInterval(t);
//   }, [screen]);

//   useEffect(() => {
//     if (!isCallActive || timeLeft <= 0) return;
//     const t = setInterval(() => setTimeLeft(s => {
//       if (s <= 1) { toast("Interview time ended"); stopInterview(); return 0; }
//       return s - 1;
//     }), 1000);
//     return () => clearInterval(t);
//   }, [isCallActive]);

//   /* ── Behavior detection ───────────────────────────────────────────────── */
//   useEffect(() => {
//     if (!isCallActive) { clearInterval(detectionIntervalRef.current); return; }

//     // Track consecutive no-face detections to avoid false positives
//     let consecutiveNoFace = 0;

//     detectionIntervalRef.current = setInterval(() => {
//       const vid = behaviorVidRef.current;
//       if (vid && vid.readyState === vid.HAVE_ENOUGH_DATA) {
//         const detected = detectSuspiciousBehavior(vid);
//         if (detected) {
//           behaviorTrackerRef.current.addEvent(detected);

//           if (detected.noFaceDetected) {
//             consecutiveNoFace++;
//             setNoFaceWarning(true);
//             // Only trigger alert after 3 consecutive no-face detections (3 s) to avoid flickers
//             if (consecutiveNoFace === 3) {
//               triggerAlert("No face detected — please stay in front of the camera");
//             }
//           } else {
//             consecutiveNoFace = 0;
//             setNoFaceWarning(false);
//           }

//           if (detected.multipleFaces) {
//             triggerAlert("Multiple faces detected in camera");
//           }
//         } else {
//           consecutiveNoFace = 0;
//           setNoFaceWarning(false);
//         }
//       }
//     }, 1000);

//     return () => clearInterval(detectionIntervalRef.current);
//   }, [isCallActive, triggerAlert]);

//   /* ── Vapi initialization ──────────────────────────────────────────────── */
//   useEffect(() => {
//     const instance = new Vapi("e1b6fe14-f22f-4a75-af38-5136766216ec");
//     setVapi(instance);

//     instance.on("speech-start", () => { setIsSpeaking(true); });
//     instance.on("speech-end", () => {
//       setIsSpeaking(false);
//       if (aiTranscriptBufferRef.current.trim()) {
//         setAvatarSub(aiTranscriptBufferRef.current.trim());
//         aiTranscriptBufferRef.current = "";
//       }
//     });
//     instance.on("call-start", () => { setIsCallActive(true); toast("Call Connected"); });
//     instance.on("error", (error: any) => toast.error(`Error: ${error?.message || "Unknown"}`));

//     instance.on("message", (msg: any) => {
//       conversationRef.current.push(msg);
//       if (msg?.type === "transcript") {
//         const text = msg.transcript || msg.text || "";
//         if (msg.role === "assistant") {
//           aiTranscriptBufferRef.current = text;
//           setAvatarSub(text);
//         } else {
//           userTranscriptBufferRef.current = text;
//           setUserSub(text);
//           setIsListening(true);
//         }
//       }
//     });

//     instance.on("user-speech-start", () => {
//       setIsListening(true);
//       // Reset silence tracking whenever candidate starts speaking
//       lastUserSpeakRef.current = Date.now();
//       silenceNotifiedRef.current = false;
//     });

//     instance.on("user-speech-end", () => {
//       setIsListening(false);
//       // Update last-speak timestamp when candidate finishes too
//       lastUserSpeakRef.current = Date.now();
//       if (userTranscriptBufferRef.current.trim()) {
//         setUserSub(userTranscriptBufferRef.current.trim());
//         userTranscriptBufferRef.current = "";
//       }
//     });

//     return () => { instance.stop(); };
//   }, []);

//   /* ── Start call ───────────────────────────────────────────────────────── */
//   const startCall = useCallback(() => {
//     if (!vapi || !interviewInfo) return;

//     // Reset silence + alert tracking for new call
//     lastUserSpeakRef.current = Date.now();
//     silenceNotifiedRef.current = false;
//     alertCountRef.current = 0;
//     setAlertCount(0);

//     const jobPosition = interviewInfo?.position || interviewInfo?.jobPosition || "the role";
//     const jobDescription = interviewInfo?.jobDescription || "";
//     const difficulty = interviewInfo?.difficulty || "Medium";
//     const skills = Array.isArray(interviewInfo?.skills)
//       ? interviewInfo.skills.join(", ")
//       : interviewInfo?.skills || "";
//     const numberOfQuestions = interviewInfo?.numberOfQuestions || 5;
//     const candidateName = interviewInfo?.username || interviewInfo?.candidateName || "Candidate";

//     let systemContent = "";
//     let firstMessage = "";

//     if (isResumeInterview) {
//       systemContent = `You are a professional AI interviewer conducting a ${difficulty} level interview.\nCANDIDATE RESUME:\n${resumeData?.resumeText}\nROLE: ${jobPosition}\nJob Description: ${jobDescription}\nAsk ${numberOfQuestions} relevant questions one by one based on their resume and the role. Wait for a complete answer before asking the next question. Be professional and conversational.`;
//       firstMessage = `Hi ${candidateName}, thank you for joining. I'm your AI interviewer for the ${jobPosition} position. Ready to begin?`;
//     } else {
//       let questionList: string[] = [];

//       try {
//         const rawQuestions = interviewInfo?.questions ?? interviewInfo?.questionList;

//         if (Array.isArray(rawQuestions) && rawQuestions.length > 0) {
//           questionList = rawQuestions
//             .map((item: any) => (typeof item === "string" ? item : item?.question))
//             .filter(Boolean);
//         }

//         if (questionList.length === 0 && typeof rawQuestions === "string") {
//           const parsed = JSON.parse(rawQuestions);
//           questionList = (Array.isArray(parsed) ? parsed : [])
//             .map((item: any) => (typeof item === "string" ? item : item?.question))
//             .filter(Boolean);
//         }
//       } catch (e) {
//         console.error("Failed to parse questions:", e);
//       }

//       const sharedRules = `
// STRICT RULES YOU MUST FOLLOW:
// - NEVER repeat or paraphrase the candidate's answer back to them. Do not say things like "Great, you mentioned X..." or "So you're saying Y...". Acknowledge briefly (e.g. "Got it.", "Thank you.") and move on.
// - NEVER mention difficulty level, passing score, or any internal interview metadata to the candidate.
// - Ask ONE question at a time. Wait for a complete answer before asking the next.
// - Be warm, professional, and concise. Keep your responses short — do not over-explain.
// - If the candidate asks to stop, end the interview, or says they want to leave, immediately say a brief professional farewell and end the call. Do not ask why or try to continue.
// - Do not use filler phrases like "That's a great question!" or "Excellent answer!". Keep acknowledgements natural and minimal.
// - Stay fully focused on the interview. Do not go off-topic.`;

//       if (questionList.length === 0) {
//         console.warn("No pre-defined questions found — AI will generate questions dynamically.");

//         systemContent = `You are a professional AI interviewer at a reputed tech company.

// ROLE: ${jobPosition}
// JOB DESCRIPTION: ${jobDescription}
// REQUIRED SKILLS: ${skills}
// NUMBER OF QUESTIONS: ${numberOfQuestions}

// Your task:
// 1. Prepare ${numberOfQuestions} strong, relevant interview questions for a ${jobPosition} candidate covering the required skills.
// 2. Ask them one by one. After the candidate answers, acknowledge briefly and ask the next question.
// 3. After all questions are completed, thank the candidate professionally and end the interview.

// ${sharedRules}`;

//         firstMessage = `Hi ${candidateName}, thanks for joining today. I'm your interviewer for the ${jobPosition} position. We'll go through a few questions — take your time with each answer. Shall we begin?`;
//       } else {
//         systemContent = `You are a professional AI interviewer at a reputed tech company.

// INTERVIEW QUESTIONS (ask one by one in order):
// ${questionList.map((q, i) => `${i + 1}. ${q}`).join("\n")}

// After all questions are completed, thank the candidate professionally and end the interview.

// ${sharedRules}`;

//         firstMessage = `Hi ${candidateName}, thanks for joining today. I'm your interviewer for the ${jobPosition} position. We'll go through a few questions — take your time with each answer. Shall we begin?`;
//       }
//     }

//     vapi.start({
//       name: "AI Recruiter",
//       firstMessage,
//       transcriber: null,
//       voice: { provider: "vapi", voiceId: "Neha", speed: 0.95, fillerInjectionEnabled: true },
//       model: {
//         provider: "openai",
//         model: "gpt-4-turbo",
//         messages: [{ role: "system", content: systemContent }],
//         temperature: 0.8,
//         maxTokens: 350,
//       },
//       endCallMessage: "Thank you for the interview! We'll be in touch soon. Have a great day!",
//     });
//   }, [vapi, interviewInfo, isResumeInterview, resumeData]);

//   /* ── Generate feedback then navigate ─────────────────────────────────── */
//   const generateFeedback = useCallback(async () => {
//     setIsGeneratingFeedback(true);
//     try {
//       const conversation = conversationRef.current;
//       if (conversation.length === 0) { navigate(`/user/${interview_id}/assessment-complete`); return; }

//       const result = await fetch("/api/ai-feedback", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ conversation }),
//       });
//       const data = await result.json();
//       const content = data?.content?.replace("```json", "").replace("```", "");
//       if (content) {
//         await fetch("/api/feedback", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             userName: interviewInfo?.username,
//             userEmail: interviewInfo?.userEmail,
//             interview_id,
//             feedback: JSON.parse(content),
//           }),
//         });
//         await fetch("/api/behavior", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             interview_id,
//             userName: interviewInfo?.username,
//             userEmail: interviewInfo?.userEmail,
//             behaviorReport: behaviorTrackerRef.current.getReport(),
//           }),
//         }).catch(console.error);
//       }
//       toast.success("Feedback generated!");
//     } catch (e) { console.error(e); }
//     finally {
//       setIsGeneratingFeedback(false);
//       navigate(`/user/${interview_id}/assessment-complete`);
//     }
//   }, [interview_id, navigate, interviewInfo]);

//   /* ── Call-end triggers feedback ──────────────────────────────────────── */
//   useEffect(() => {
//     if (!vapi) return;
//     const handler = () => { setIsCallActive(false); setIsSpeaking(false); generateFeedback(); };
//     vapi.on("call-end", handler);
//     return () => vapi.off("call-end", handler);
//   }, [vapi, generateFeedback]);

//   /* ── Controls ─────────────────────────────────────────────────────────── */
//   const stopInterview = () => {
//     setIsCallActive(false);
//     try { vapi?.stop(); } catch (e) {}
//     toast("Interview stopped");
//   };

//   const handleJoin = () => {
//     setScreen("spotlight");
//     startCall();
//   };

//   const handleEndCall = () => {
//     stopInterview();
//     setScreen("lobby");
//     setElapsed(0);
//   };

//   const toggleMic = () => {
//     streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !micOn; });
//     setMicOn(v => !v);
//   };

//   const toggleCam = () => {
//     streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !camOn; });
//     setCamOn(v => !v);
//   };

//   /* ── Formatters ───────────────────────────────────────────────────────── */
//   const formatElapsed = (s: number) =>
//     `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

//   const formatTimeLeft = (s: number) => {
//     if (isNaN(s) || s < 0) return "00:00";
//     return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
//   };

//   const formatClock = (d: Date) => {
//     let h = d.getHours(), m = d.getMinutes();
//     const ap = h >= 12 ? "PM" : "AM";
//     h = h % 12 || 12;
//     return `${h}:${String(m).padStart(2, "0")} ${ap}`;
//   };

//   const formatDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

//   /* ── Loading / feedback screens ──────────────────────────────────────── */
//   if (loading || !interviewInfo) return (
//     <div className="h-screen bg-[#050A24] flex items-center justify-center">
//       <Loader2 className="animate-spin h-8 w-8 text-[#2D55FB]" />
//       <span className="ml-3 text-white text-lg">Preparing Interview...</span>
//     </div>
//   );

//   if (isGeneratingFeedback) return (
//     <div className="h-screen bg-[#050A24] flex flex-col items-center justify-center gap-4">
//       <Loader2 className="animate-spin h-12 w-12 text-[#2D55FB]" />
//       <h2 className="text-white text-xl font-bold">Generating Your Feedback...</h2>
//       <p className="text-white/40 text-sm">Please wait while our AI analyzes your performance</p>
//     </div>
//   );

//   /* ── Shared bottom controls ──────────────────────────────────────────── */
//   const BottomBar = () => (
//     <div className="shrink-0 bg-[#070e2b] border-t border-white/5 px-5 sm:px-8 py-3.5 flex items-center justify-between">
//       <div className="flex items-center gap-2 sm:gap-3 min-w-0">
//         <span className="text-white/40 text-sm font-medium whitespace-nowrap">
//           {interviewInfo?.position || interviewInfo?.jobPosition || "Interview"}
//         </span>
//         <div className="w-px h-5 bg-white/15" />
//         <span className={`font-bold text-sm whitespace-nowrap ${timeLeft < 60 ? "text-red-400 animate-pulse" : "text-[#2D55FB]"}`}>
//           ⏱ {formatTimeLeft(timeLeft)}
//         </span>
//       </div>
//       <div className="flex items-center gap-2 sm:gap-3">
//         <CtrlBtn onClick={toggleMic} active={micOn}>
//           {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
//         </CtrlBtn>
//         <CtrlBtn onClick={toggleCam} active={camOn}>
//           {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
//         </CtrlBtn>
//         <CtrlBtn>
//           <MonitorUp className="h-4 w-4 text-gray-800" />
//         </CtrlBtn>
//         <CtrlBtn onClick={handleEndCall} danger>
//           <PhoneOff className="h-4 w-4" />
//         </CtrlBtn>
//       </div>
//       <div className="min-w-[80px] sm:min-w-[120px] flex justify-end">
//         {noFaceWarning && (
//           <span className="text-red-400 text-xs font-bold animate-pulse">⚠ No face detected</span>
//         )}
//         {!noFaceWarning && alertCount > 0 && (
//           <span className="text-orange-400 text-xs font-bold">{alertCount}/3 warnings</span>
//         )}
//       </div>
//     </div>
//   );

//   const username = interviewInfo?.username || "You";

//   /* ══════════════════════════════════════════════════════════════════════════
//      SCREEN 1 — LOBBY
//   ══════════════════════════════════════════════════════════════════════════ */
//   if (screen === "lobby") return (
//     <div className="h-screen bg-[#050A24] bg-[radial-gradient(ellipse_at_65%_0%,rgba(45,85,251,0.4),transparent_60%),radial-gradient(ellipse_at_0%_100%,rgba(20,40,120,0.4),transparent_60%)] flex flex-col overflow-hidden">
//       <video ref={behaviorVidRef} muted playsInline className="hidden" />

//       <div className="flex items-center justify-between px-6 sm:px-10 py-5 shrink-0">
//         <h1 className="text-white font-bold text-lg sm:text-xl tracking-tight">Vitric IQ</h1>
//         <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
//           <span>{formatClock(now)}</span>
//           <span className="text-white/20 mx-1">|</span>
//           <span>{formatDate(now)}</span>
//         </div>
//       </div>

//       <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-6 pb-10">
//         <motion.div
//           className="relative w-full max-w-sm sm:max-w-md lg:max-w-xl xl:max-w-2xl bg-[#0a1035] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50"
//           style={{ aspectRatio: "16/9" }}
//           initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }}
//         >
//           <video
//             ref={lobbyVidRef} muted playsInline
//             className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-100" : "opacity-0"}`}
//             style={{ transform: "scaleX(-1)" }}
//           />
//           {(!camOn || !streamReady) && (
//             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a5e] to-[#050A24] gap-3">
//               <div className="w-20 h-20 rounded-full bg-[#2D55FB]/20 border border-[#2D55FB]/30 flex items-center justify-center">
//                 {streamReady ? <VideoOff className="h-10 w-10 text-[#2D55FB]/60" /> : <User className="h-10 w-10 text-[#2D55FB]/50" />}
//               </div>
//               <span className="text-white/30 text-sm">{streamReady ? "Camera off" : "Waiting for camera…"}</span>
//             </div>
//           )}
//           <div className="absolute bottom-4 left-4 flex items-center gap-3">
//             <motion.button onClick={toggleMic} className={`w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur transition-all ${micOn ? "bg-white/15 border-white/25 text-white hover:bg-white/25" : "bg-red-500 border-red-400 text-white"}`} whileTap={{ scale: 0.9 }}>
//               {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
//             </motion.button>
//             <motion.button onClick={toggleCam} className={`w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur transition-all ${camOn ? "bg-white/15 border-white/25 text-white hover:bg-white/25" : "bg-red-500 border-red-400 text-white"}`} whileTap={{ scale: 0.9 }}>
//               {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
//             </motion.button>
//           </div>
//         </motion.div>

//         <motion.div
//           className="flex flex-col items-center gap-5"
//           initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
//         >
//           <h2 className="text-white text-2xl sm:text-3xl font-semibold">Ready to Join?</h2>
//           <p className="text-white/40 text-sm text-center max-w-xs">
//             {interviewInfo?.position || interviewInfo?.jobPosition || "Interview"} • {interviewInfo?.duration || "N/A"}
//           </p>
//           <div className="flex items-center">
//             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-700 border-2 border-[#2D55FB] flex items-center justify-center shadow-lg">
//               <User className="h-6 w-6 text-white/80" />
//             </div>
//             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-orange-400 flex items-center justify-center -ml-3 shadow-lg">
//               <User className="h-6 w-6 text-white/80" />
//             </div>
//           </div>
//           <p className="text-white/50 text-sm -mt-2">{username} and AI Recruiter</p>
//           <motion.button
//             onClick={handleJoin}
//             className="px-10 py-3 bg-[#2D55FB] hover:bg-[#1e3fd4] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-[#2D55FB]/30"
//             whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
//           >
//             Join Interview
//           </motion.button>
//         </motion.div>
//       </div>
//     </div>
//   );

//   /* ══════════════════════════════════════════════════════════════════════════
//      SCREEN 2 — SPOTLIGHT VIEW
//   ══════════════════════════════════════════════════════════════════════════ */
//   if (screen === "spotlight") return (
//     <div className="h-screen bg-[#070e2b] flex flex-col overflow-hidden">
//       <video ref={behaviorVidRef} muted playsInline className="hidden" />

//       <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#070e2b] shrink-0">
//         <div className="flex items-center gap-2">
//           <span className="text-white/40 text-sm">Time :</span>
//           <span className="text-[#2D55FB] font-mono font-bold text-sm tracking-widest">{formatElapsed(elapsed)}</span>
//           {isCallActive && <div className="flex items-center gap-1.5 ml-3 text-green-400 text-xs font-bold"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />LIVE</div>}
//         </div>
//         <motion.button
//           onClick={() => setScreen("grid")}
//           className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-medium transition-colors"
//           whileTap={{ scale: 0.94 }}
//         >
//           Grid View
//           <div className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
//             <LayoutGrid className="h-4 w-4 text-white" />
//           </div>
//         </motion.button>
//       </div>

//       <div className="flex flex-1 min-h-0 gap-2.5 px-2.5 pb-2 pt-1">
//         <div className="w-44 sm:w-52 shrink-0 flex flex-col gap-2">
//           {/* ── User PiP tile — uses stable callback ref ── */}
//           <div className="relative rounded-xl overflow-hidden bg-[#0d1535] border border-white/5 shrink-0" style={{ aspectRatio: "4/3" }}>
//             <UserVideo
//               streamRef={streamRef}
//               camOn={camOn}
//               streamReady={streamReady}
//               username={username}
//               onVideoMount={onSpotlightVideoMount}
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
//             <div className="absolute bottom-2 left-2.5 z-10">
//               <span className="text-white text-xs font-semibold drop-shadow">{username}</span>
//             </div>
//             <div className="absolute bottom-2 right-2.5 z-10"><MicCircle muted={!micOn} /></div>
//           </div>

//           <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
//             <div className="bg-[#0e1640]/90 rounded-xl p-3 border border-white/5">
//               <div className="flex items-center justify-between mb-1.5">
//                 <span className="text-[#7a9cff] text-[11px] font-semibold">AI Recruiter:</span>
//                 {isSpeaking && <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
//               </div>
//               <p className="text-gray-300 text-[11px] leading-relaxed">{avatarSub}</p>
//             </div>
//             <div className="bg-[#0e1640]/90 rounded-xl p-3 border border-white/5">
//               <div className="flex items-center justify-between mb-1.5">
//                 <span className="text-[#7a9cff] text-[11px] font-semibold">You:</span>
//                 {isListening && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />}
//               </div>
//               <p className="text-gray-300 text-[11px] leading-relaxed">{userSub}</p>
//             </div>
//           </div>
//         </div>

//         <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
//           <AIAvatarTile isSpeaking={isSpeaking} isCallActive={isCallActive} />
//           <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
//           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
//             <AudioWave active={isSpeaking} />
//           </div>
//           <div className="absolute bottom-4 left-5 z-10">
//             <span className="text-white font-medium text-sm">AI Recruiter</span>
//           </div>
//           {isCallActive && (
//             <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-bold z-10">
//               <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />REC
//             </div>
//           )}
//         </div>
//       </div>

//       <BottomBar />
//     </div>
//   );

//   /* ══════════════════════════════════════════════════════════════════════════
//      SCREEN 3 — GRID VIEW
//   ══════════════════════════════════════════════════════════════════════════ */
//   return (
//     <div className="h-screen bg-[#070e2b] flex flex-col overflow-hidden">
//       <video ref={behaviorVidRef} muted playsInline className="hidden" />

//       <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#070e2b] shrink-0">
//         <div className="flex items-center gap-2">
//           <span className="text-white/40 text-sm">Time :</span>
//           <span className="text-[#2D55FB] font-mono font-bold text-sm tracking-widest">{formatElapsed(elapsed)}</span>
//           {isCallActive && <div className="flex items-center gap-1.5 ml-3 text-green-400 text-xs font-bold"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />LIVE</div>}
//         </div>
//         <motion.button
//           onClick={() => setScreen("spotlight")}
//           className="flex items-center gap-2 text-white/80 hover:text-white text-xs font-medium transition-colors"
//           whileTap={{ scale: 0.94 }}
//         >
//           Spotlight View
//           <div className="w-7 h-7 rounded-lg bg-[#2D55FB] flex items-center justify-center shadow-md shadow-[#2D55FB]/30">
//             <LayoutGrid className="h-4 w-4 text-white" />
//           </div>
//         </motion.button>
//       </div>

//       <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-6 pt-2 pb-1 gap-0">
//         <div className="flex gap-4 sm:gap-5" style={{ flex: "0 0 auto", height: "clamp(200px, 58vh, 420px)" }}>

//           {/* ── User tile — uses stable callback ref ── */}
//           <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
//             <video
//               ref={onGridUserVideoMount}
//               muted
//               playsInline
//               className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-100" : "opacity-0"}`}
//               style={{ transform: "scaleX(-1)" }}
//             />
//             {(!camOn || !streamReady) && (
//               <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a5e]/80 to-[#060c25]/80">
//                 <div className="w-14 h-14 rounded-full bg-[#2D55FB]/20 border border-[#2D55FB]/30 flex items-center justify-center mb-2">
//                   {streamReady ? <VideoOff className="h-7 w-7 text-[#2D55FB]/60" /> : <User className="h-7 w-7 text-[#2D55FB]/50" />}
//                 </div>
//               </div>
//             )}
//             <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
//             <div className="absolute bottom-12 right-3 z-10"><MicCircle muted={!micOn} /></div>
//             <div className="absolute bottom-4 left-4 z-10">
//               <span className="text-white font-semibold text-base drop-shadow">{username}</span>
//             </div>
//             {isListening && (
//               <div className="absolute top-4 left-4 z-10">
//                 <div className="flex items-center gap-1.5 bg-blue-600/80 text-white px-2 py-1 rounded-full text-xs font-bold">
//                   <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />Speaking
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
//             <AIAvatarTile isSpeaking={isSpeaking} isCallActive={isCallActive} />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
//             <div className="absolute bottom-12 right-3 z-10"><AudioWave active={isSpeaking} /></div>
//             <div className="absolute bottom-4 left-4 z-10">
//               <span className="text-white font-semibold text-base drop-shadow">AI Recruiter</span>
//             </div>
//             {isSpeaking && (
//               <div className="absolute top-4 left-4 z-10">
//                 <div className="flex items-center gap-1.5 bg-green-600/80 text-white px-2 py-1 rounded-full text-xs font-bold">
//                   <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />Speaking
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="flex gap-4 sm:gap-5 mt-3" style={{ flex: "0 0 auto" }}>
//           <div className="flex-1 flex items-start justify-center">
//             <p className="text-white/65 text-sm text-center leading-snug max-w-xs">{userSub}</p>
//           </div>
//           <div className="flex-1 flex items-start justify-center">
//             <p className="text-white/65 text-sm text-center leading-snug max-w-xs">{avatarSub}</p>
//           </div>
//         </div>
//         <div className="flex-1" />
//       </div>

//       <BottomBar />
//     </div>
//   );
// };

// export default VideoInterview;
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Vapi from "@vapi-ai/web";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  LayoutGrid,
  MonitorUp,
  User,
  Loader2,
  ShieldAlert,
  AlertTriangle,
  Volume2,
  X,
  Maximize,
  Wifi,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/context";
import { userService } from "../../services/service/userService";

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const AVATAR_CONFIG = {
  heygen: {
    apiKey: "sk_V2_hgu_kBz4ii8AzWD_oRmNinOC4JiXq8Q8KcOXuKm84nrjnquG",
    // ✅ Correct UUID from app.heygen.com/avatars/looks/public?avatarId=...
    avatarId: "a02648040d8140ffbff8157743559a98",
    voiceId: "",
    quality: "high" as const,
  },
  ganai: {
    apiKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ2YWliaGF2QHZpdHJpYy5pbiIsImp0aSI6ImE1ODhiZDJiLWQ1NDUtNGFmNy1iOTRhLTYzNDAwZTliNmFmYiIsInJlZnJlc2giOmZhbHNlLCJpYXQiOjE3NzE5OTk1NDMsIm9yZ0lkIjoiYzNkODdkZjktMjEyNi00MTdkLWJiYmEtMWQ3MjZhMGI5YWI5IiwiZXhwIjoxOTI5Njc5NTQzfQ.8nPZ-7yk_agsRvoEW3gfOQMcx9-JBE722BIZTAdzwTY",
    avatarId: "",
    voiceId: "",
    baseUrl: "https://api.gan.ai",
  },
};

const USE_HEYGEN =
  !!AVATAR_CONFIG.heygen.apiKey && !!AVATAR_CONFIG.heygen.avatarId;
const USE_GANAI =
  !USE_HEYGEN && !!AVATAR_CONFIG.ganai.apiKey && !!AVATAR_CONFIG.ganai.avatarId;

// ─────────────────────────────────────────────────────────────────────────────
// GAN.AI SERVICE
// ─────────────────────────────────────────────────────────────────────────────
const ganAi = {
  async generate(script: string): Promise<string | null> {
    try {
      const body: any = {
        avatar_id: AVATAR_CONFIG.ganai.avatarId,
        script,
        background: { type: "color", value: "#0d1535" },
      };
      if (AVATAR_CONFIG.ganai.voiceId)
        body.voice_id = AVATAR_CONFIG.ganai.voiceId;
      const r = await fetch(
        `${AVATAR_CONFIG.ganai.baseUrl}/v2/avatar/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": AVATAR_CONFIG.ganai.apiKey,
          },
          body: JSON.stringify(body),
        },
      );
      if (!r.ok) return null;
      const d = await r.json();
      return d?.render_id ?? d?.id ?? null;
    } catch {
      return null;
    }
  },
  async poll(renderId: string): Promise<string | null> {
    for (let i = 0; i < 45; i++) {
      await new Promise((r) => setTimeout(r, 4000));
      try {
        const r = await fetch(
          `${AVATAR_CONFIG.ganai.baseUrl}/v2/renders/${renderId}`,
          { headers: { "x-api-key": AVATAR_CONFIG.ganai.apiKey } },
        );
        if (!r.ok) continue;
        const d = await r.json();
        if (d?.status === "completed" && d?.video_url) return d.video_url;
        if (d?.status === "failed") return null;
      } catch {}
    }
    return null;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HEYGEN STREAMING AVATAR SERVICE
// ─────────────────────────────────────────────────────────────────────────────
type HeyGenInstance = any;

class HeyGenService {
  private avatar: HeyGenInstance = null;
  private sessionData: any = null;
  private videoRef: React.RefObject<HTMLVideoElement>;
  onStateChange?: (speaking: boolean) => void;
  /** Called when the WebRTC stream is actually flowing and video is live */
  onStreamReady?: () => void;

  constructor(videoRef: React.RefObject<HTMLVideoElement>) {
    this.videoRef = videoRef;
  }

  async init(): Promise<boolean> {
    try {
      // ✅ FIX: @heygen/streaming-avatar may export via .default or directly as named exports
      // Handle both module formats to avoid "StreamingAvatar is not a constructor"
      const mod = await import("@heygen/streaming-avatar" as any);
      const StreamingAvatar =
        mod.StreamingAvatar ??
        (mod as any).default?.StreamingAvatar ??
        (mod as any).default;
      const StreamingEvents =
        mod.StreamingEvents ??
        (mod as any).default?.StreamingEvents;

      if (typeof StreamingAvatar !== "function") {
        throw new Error(
          `StreamingAvatar is not a constructor. Module keys: ${Object.keys(mod).join(", ")}`,
        );
      }

      this.avatar = new StreamingAvatar({ token: await this.getToken() });

      this.avatar.on(StreamingEvents.AVATAR_START_TALKING, () =>
        this.onStateChange?.(true),
      );
      this.avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () =>
        this.onStateChange?.(false),
      );
      // ⬇️  KEY FIX: fire onStreamReady here — only when the live stream is flowing
      this.avatar.on(StreamingEvents.STREAM_READY, (event: any) => {
        if (this.videoRef.current && event.detail) {
          this.videoRef.current.srcObject = event.detail;
          this.videoRef.current
            .play()
            .catch(() => {})
            .then(() => {
              this.onStreamReady?.();
            });
        }
      });

      this.sessionData = await this.avatar.createStartAvatar({
        avatarName: AVATAR_CONFIG.heygen.avatarId,
        quality: AVATAR_CONFIG.heygen.quality,
        voice: AVATAR_CONFIG.heygen.voiceId
          ? { voiceId: AVATAR_CONFIG.heygen.voiceId }
          : undefined,
      });

      return true;
    } catch (e) {
      console.error("HeyGen init error:", e);
      return false;
    }
  }

  private async getToken(): Promise<string> {
    const r = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: { "x-api-key": AVATAR_CONFIG.heygen.apiKey },
    });
    const d = await r.json();
    return d?.data?.token ?? "";
  }

  async speak(text: string): Promise<void> {
    if (!this.avatar || !this.sessionData) return;
    try {
      const mod = await import("@heygen/streaming-avatar" as any);
      const TaskType = mod.TaskType ?? (mod as any).default?.TaskType;
      await this.avatar.speak({
        sessionId: this.sessionData.session_id,
        text,
        task_type: TaskType?.REPEAT ?? "repeat",
      });
    } catch (e) {
      console.warn("HeyGen speak error:", e);
    }
  }

  async destroy(): Promise<void> {
    try {
      await this.avatar?.stopAvatar();
    } catch {}
    this.avatar = null;
    this.sessionData = null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type Screen = "lobby" | "connecting" | "spotlight" | "grid";
type AvatarMode = "heygen" | "ganai" | "animated";
type AvatarState = "idle" | "thinking" | "speaking";

const MAX_VIOLATIONS = 3;
const SILENCE_THRESHOLD_SEC = 30; // warn candidate after 30 s of silence

const VIOLATION_MESSAGES: Record<
  string,
  { title: string; body: (r: number) => string; spoken: string }
> = {
  "tab-switch": {
    title: "Tab Switch Detected",
    body: (r) => `You navigated away. ${r} warning(s) remaining.`,
    spoken:
      "I noticed you switched tabs. Please stay on the interview window. This is a warning.",
  },
  "camera-off": {
    title: "Camera Turned Off",
    body: (r) => `Keep camera on. ${r} warning(s) remaining.`,
    spoken:
      "Please turn your camera back on. Camera must remain on throughout the interview. This is a warning.",
  },
  "no-face": {
    title: "Face Not Detected",
    body: (r) => `Sit in front of the camera. ${r} warning(s) remaining.`,
    spoken:
      "I can't see your face. Please sit directly in front of the camera. This is a warning.",
  },
  "multiple-faces": {
    title: "Multiple People Detected",
    body: (r) => `Only candidate should be visible. ${r} warning(s) remaining.`,
    spoken:
      "I detected multiple people on camera. Only the candidate should be visible. This is a warning.",
  },
  "fullscreen-exit": {
    title: "Fullscreen Exited",
    body: (r) => `Stay in fullscreen. ${r} warning(s) remaining.`,
    spoken:
      "Please keep the interview in fullscreen mode. Exiting fullscreen is not permitted. This is a warning.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function tryEnterFS() {
  try {
    if (!document.fullscreenElement)
      document.documentElement
        .requestFullscreen({ navigationUI: "hide" })
        .catch(() => {});
  } catch {}
}
async function tryExitFS() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
  } catch {}
}

function detectSuspicious(el: HTMLVideoElement) {
  try {
    const c = document.createElement("canvas");
    c.width = 160;
    c.height = 120;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(el, 0, 0, 160, 120);
    const { data } = ctx.getImageData(0, 0, 160, 120);

    // Count skin-coloured pixels across the full frame
    let totalSkin = 0;
    const total = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (
        r > 95 && g > 40 && b > 20 &&
        r > g && r > b &&
        Math.abs(r - g) > 15 && r - b > 15
      ) totalSkin++;
    }
    const ratio = totalSkin / total;

    // No face: almost no skin pixels visible
    if (ratio < 0.02) return { noFaceDetected: true };

    // ── Multiple-face detection via horizontal strip analysis ──────────────
    // Split the frame into 4 vertical columns and count skin pixels in each.
    // If 3+ columns all have significant skin presence, multiple faces likely.
    const cols = 4;
    const colWidth = Math.floor(160 / cols);
    let activeCols = 0;
    for (let col = 0; col < cols; col++) {
      let colSkin = 0;
      const xStart = col * colWidth;
      const xEnd = xStart + colWidth;
      const colPixels = colWidth * 120;
      for (let y = 0; y < 120; y++) {
        for (let x = xStart; x < xEnd; x++) {
          const i = (y * 160 + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (
            r > 95 && g > 40 && b > 20 &&
            r > g && r > b &&
            Math.abs(r - g) > 15 && r - b > 15
          ) colSkin++;
        }
      }
      if (colSkin / colPixels > 0.08) activeCols++;
    }

    // ✅ FIX: lowered threshold from 0.45 → 0.18 (3 faces clearly exceed this)
    // AND column analysis: 3+ active columns with skin = multiple faces
    if (ratio > 0.18 || activeCols >= 3) return { multipleFaces: true };

    return null;
  } catch {
    return null;
  }
}

class BehaviorTracker {
  events: Array<{ type: string; timestamp: number }> = [];
  addEvent(d: { noFaceDetected?: boolean; multipleFaces?: boolean }) {
    this.events.push({
      type: d.noFaceDetected ? "no_face" : "multiple_faces",
      timestamp: Date.now(),
    });
  }
  getReport() {
    return {
      totalEvents: this.events.length,
      noFaceCount: this.events.filter((e) => e.type === "no_face").length,
      multipleFacesCount: this.events.filter((e) => e.type === "multiple_faces")
        .length,
      events: this.events,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED AVATAR
// ─────────────────────────────────────────────────────────────────────────────
const AnimatedAvatar = React.memo(({ state }: { state: AvatarState }) => {
  const [blink, setBlink] = useState(false);
  const [mouth, setMouth] = useState(0);
  const [breathe, setBreathe] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(
        () => {
          setBlink(true);
          setTimeout(() => setBlink(false), 130);
          loop();
        },
        2500 + Math.random() * 2500,
      );
    };
    loop();
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setBreathe((p) => !p), 2200);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (state !== "speaking") {
      setMouth(0);
      return;
    }
    const t = setInterval(() => setMouth((p) => (p % 4) + 1), 90);
    return () => clearInterval(t);
  }, [state]);

  const mouthD = [
    "M 116 218 Q 140 222 164 218",
    "M 116 216 Q 140 228 164 216",
    "M 114 215 Q 140 234 166 215",
    "M 112 213 Q 140 238 168 213",
    "M 114 215 Q 140 232 166 215",
  ][mouth];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0b1230] via-[#0d1535] to-[#060c22]">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-64 h-80 rounded-full opacity-15"
          style={{
            background: "radial-gradient(ellipse, #2D55FB 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
      </div>
      <motion.div
        animate={{ y: breathe && state === "idle" ? -4 : 0 }}
        transition={{ duration: 2.2, ease: "easeInOut" }}
      >
        <svg
          width="210"
          height="252"
          viewBox="0 0 280 340"
          style={{ filter: "drop-shadow(0 12px 40px rgba(45,85,251,0.25))" }}
        >
          <defs>
            <linearGradient id="av_skin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8d5b5" />
              <stop offset="45%" stopColor="#f0c4a0" />
              <stop offset="100%" stopColor="#e0a87a" />
            </linearGradient>
            <linearGradient id="av_hair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3a2c1e" />
              <stop offset="100%" stopColor="#1a140d" />
            </linearGradient>
            <linearGradient id="av_suit" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#162050" />
              <stop offset="100%" stopColor="#0b1234" />
            </linearGradient>
            <radialGradient id="av_iris" cx="38%" cy="32%" r="62%">
              <stop offset="0%" stopColor="#5b7bbf" />
              <stop offset="100%" stopColor="#2d4a7a" />
            </radialGradient>
            <filter id="av_shadow">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.28" />
            </filter>
          </defs>
          <rect x="122" y="232" width="36" height="45" rx="6" fill="url(#av_skin)" />
          <path d="M 48 330 Q 50 268 90 256 L 140 266 L 190 256 Q 230 268 232 330 Z" fill="url(#av_suit)" />
          <path d="M 118 258 L 140 278 L 162 258 L 155 250 L 140 268 L 125 250 Z" fill="#f0f4ff" />
          <path d="M 134 263 L 140 308 L 146 263 L 140 258 Z" fill="#2D55FB" opacity="0.9" />
          <path d="M 137 261 L 143 261 L 142 267 L 138 267 Z" fill="#1e3fd4" />
          <path d="M 90 256 Q 112 245 130 250 L 118 258 Q 78 272 68 292 Z" fill="#101840" opacity="0.65" />
          <path d="M 190 256 Q 168 245 150 250 L 162 258 Q 202 272 212 292 Z" fill="#101840" opacity="0.65" />
          <ellipse cx="140" cy="146" rx="88" ry="100" fill="url(#av_skin)" filter="url(#av_shadow)" />
          <path d="M 56 108 Q 50 48 140 36 Q 230 48 224 108 L 220 128 Q 212 73 140 66 Q 68 73 60 128 Z" fill="url(#av_hair)" />
          <path d="M 56 108 Q 52 142 58 165 Q 54 132 60 128 Z" fill="url(#av_hair)" />
          <path d="M 224 108 Q 228 142 222 165 Q 226 132 220 128 Z" fill="url(#av_hair)" />
          <ellipse cx="52" cy="153" rx="10" ry="14" fill="url(#av_skin)" />
          <path d="M 56 146 Q 60 153 56 160" stroke="#d4956a" strokeWidth="1.5" fill="none" />
          <ellipse cx="228" cy="153" rx="10" ry="14" fill="url(#av_skin)" />
          <path d="M 224 146 Q 220 153 224 160" stroke="#d4956a" strokeWidth="1.5" fill="none" />
          <path d="M 86 106 Q 104 100 120 105" stroke="#3a2c1e" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <ellipse cx="103" cy="126" rx="16" ry={blink ? 0.8 : 12} fill="white" />
          {!blink && (
            <>
              <ellipse cx="105" cy="127" rx="9" ry="9" fill="url(#av_iris)" />
              <ellipse cx="105" cy="127" rx="5" ry="5" fill="#0a0a0a" />
              <circle cx="102" cy="124" r="2.5" fill="white" opacity="0.9" />
            </>
          )}
          <path d={blink ? "M 87 126 Q 103 126 119 126" : "M 87 118 Q 103 113 119 118"} stroke="#3a2c1e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M 160 105 Q 176 100 194 106" stroke="#3a2c1e" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <ellipse cx="177" cy="126" rx="16" ry={blink ? 0.8 : 12} fill="white" />
          {!blink && (
            <>
              <ellipse cx="175" cy="127" rx="9" ry="9" fill="url(#av_iris)" />
              <ellipse cx="175" cy="127" rx="5" ry="5" fill="#0a0a0a" />
              <circle cx="172" cy="124" r="2.5" fill="white" opacity="0.9" />
            </>
          )}
          <path d={blink ? "M 161 126 Q 177 126 193 126" : "M 161 118 Q 177 113 193 118"} stroke="#3a2c1e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M 140 133 L 135 168 Q 140 175 145 168 Z" fill="#d4956a" opacity="0.28" />
          <path d="M 130 171 Q 140 177 150 171" stroke="#c4856a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <ellipse cx="92" cy="168" rx="15" ry="8" fill="#f08080" opacity="0.10" />
          <ellipse cx="188" cy="168" rx="15" ry="8" fill="#f08080" opacity="0.10" />
          <path d="M 116 213 Q 128 208 140 210 Q 152 208 164 213" stroke="#c0766a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d={mouthD} stroke="#a85a5a" strokeWidth="2.5" fill={mouth > 1 ? "#7a3030" : "none"} strokeLinecap="round" />
          {mouth > 1 && (
            <path d="M 120 216 Q 140 228 160 216 L 158 220 Q 140 232 122 220 Z" fill="white" opacity="0.88" />
          )}
          <path d="M 118 238 Q 140 252 162 238" stroke="#d4956a" strokeWidth="1" fill="none" opacity="0.3" />
        </svg>
      </motion.div>
      <div className="mt-2 h-5 flex items-center justify-center">
        {state === "thinking" && (
          <div className="flex gap-1.5 items-center">
            {[0, 0.15, 0.3].map((d, i) => (
              <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#2D55FB]"
                animate={{ y: ["0px", "-6px", "0px"], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: d }} />
            ))}
            <span className="text-white/35 text-[10px] ml-1 font-medium">Thinking…</span>
          </div>
        )}
        {state === "speaking" && (
          <div className="flex items-center gap-1">
            {[0, 0.08, 0.16, 0.24, 0.16, 0.08].map((d, i) => (
              <motion.div key={i} className="w-0.5 rounded-full bg-[#2D55FB]"
                animate={{ height: ["3px", `${6 + (i % 3) * 4}px`, "3px"] }}
                transition={{ duration: 0.45, repeat: Infinity, delay: d, ease: "easeInOut" }} />
            ))}
            <span className="text-[#2D55FB] text-[10px] ml-1.5 font-semibold">Speaking</span>
          </div>
        )}
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR TILE
// ─────────────────────────────────────────────────────────────────────────────
interface AvatarTileProps {
  mode: AvatarMode;
  state: AvatarState;
  heygenVideoRef: React.RefObject<HTMLVideoElement>;
  ganAiVideoUrl: string | null;
  ganAiLoading: boolean;
  heygenReady: boolean;
}

const AvatarTile = React.memo(
  ({ mode, state, heygenVideoRef, ganAiVideoUrl, ganAiLoading, heygenReady }: AvatarTileProps) => {
    const ganVideoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
      if (ganAiVideoUrl && ganVideoRef.current) {
        ganVideoRef.current.src = ganAiVideoUrl;
        ganVideoRef.current.play().catch(() => {});
      }
    }, [ganAiVideoUrl]);

    return (
      <div className="absolute inset-0">
        <AnimatedAvatar state={mode === "heygen" && heygenReady ? "idle" : state} />
        {mode === "heygen" && (
          <video
            ref={heygenVideoRef}
            playsInline
            autoPlay
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${heygenReady ? "opacity-100" : "opacity-0"}`}
          />
        )}
        {mode === "ganai" && ganAiVideoUrl && (
          <video
            ref={ganVideoRef}
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: ganAiVideoUrl ? 1 : 0, transition: "opacity 0.5s" }}
            onEnded={() => { if (ganVideoRef.current) ganVideoRef.current.src = ""; }}
          />
        )}
        <div className="absolute top-3 left-3 z-20">
          {mode === "heygen" && (
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border backdrop-blur-sm text-[9px] font-semibold ${heygenReady ? "bg-green-500/15 border-green-500/30 text-green-300" : "bg-amber-500/15 border-amber-500/30 text-amber-300"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${heygenReady ? "bg-green-400 animate-pulse" : "bg-amber-400 animate-pulse"}`} />
              {heygenReady ? "Live Avatar" : "Connecting…"}
            </div>
          )}
          {mode === "ganai" && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border backdrop-blur-sm bg-purple-500/15 border-purple-500/30 text-purple-300 text-[9px] font-semibold">
              <div className={`w-1.5 h-1.5 rounded-full ${ganAiLoading ? "bg-amber-400 animate-pulse" : "bg-purple-400"}`} />
              {ganAiLoading ? "Rendering…" : "Gan.AI"}
            </div>
          )}
        </div>
      </div>
    );
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// CONNECTING SCREEN
// ─────────────────────────────────────────────────────────────────────────────
interface ConnectingScreenProps {
  heygenReady: boolean;
  vapiReady: boolean;
  avatarMode: AvatarMode;
  onBothReady: () => void;
}

const ConnectingScreen: React.FC<ConnectingScreenProps> = ({
  heygenReady, vapiReady, avatarMode, onBothReady,
}) => {
  const bothDone =
    avatarMode === "heygen" ? heygenReady && vapiReady : vapiReady;

  useEffect(() => {
    if (bothDone) {
      const t = setTimeout(onBothReady, 600);
      return () => clearTimeout(t);
    }
  }, [bothDone, onBothReady]);

  const items = [
    {
      label: "Vapi Voice AI",
      done: vapiReady,
      desc: vapiReady ? "Voice AI connected" : "Connecting voice AI…",
    },
    ...(avatarMode === "heygen"
      ? [{
          label: "HeyGen Avatar",
          done: heygenReady,
          desc: heygenReady ? "Avatar stream live" : "Starting avatar stream…",
        }]
      : []),
  ];

  return (
    <div className="h-screen bg-[#050A24] flex flex-col items-center justify-center gap-8 px-6">
      {/* Animated logo pulse */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-[#2D55FB]/10 border border-[#2D55FB]/20 flex items-center justify-center">
          <Wifi className="h-10 w-10 text-[#2D55FB]" />
        </div>
        {!bothDone && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border border-[#2D55FB]/40"
              animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-[#2D55FB]/25"
              animate={{ scale: [1, 2.2], opacity: [0.3, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
            />
          </>
        )}
        {bothDone && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-2 border-[#050A24] flex items-center justify-center"
          >
            <CheckCircle2 className="h-4 w-4 text-white" />
          </motion.div>
        )}
      </div>

      <div className="text-center">
        <h2 className="text-white text-2xl font-bold mb-2">
          {bothDone ? "All systems ready!" : "Setting up your interview…"}
        </h2>
        <p className="text-white/40 text-sm">
          {bothDone
            ? "Starting interview now"
            : "Please wait while we connect the AI interviewer"}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {items.map(({ label, done, desc }) => (
          <div
            key={label}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-500 ${
              done
                ? "bg-green-500/10 border-green-500/30"
                : "bg-[#0d1535] border-white/8"
            }`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-green-500/20" : "bg-[#2D55FB]/15"}`}>
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              ) : (
                <Loader2 className="h-5 w-5 text-[#2D55FB] animate-spin" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`font-semibold text-sm ${done ? "text-green-300" : "text-white"}`}>
                {label}
              </span>
              <span className={`text-xs ${done ? "text-green-400/70" : "text-white/35"}`}>
                {desc}
              </span>
            </div>
            {done && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto w-2 h-2 rounded-full bg-green-400"
              />
            )}
          </div>
        ))}
      </div>

      {!bothDone && (
        <p className="text-white/20 text-xs text-center max-w-xs">
          This usually takes 5–15 seconds. Do not close or navigate away.
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SMALL REUSABLE UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const WaveBar = ({ delay, active }: { delay: number; active: boolean }) => (
  <motion.span
    className="inline-block w-0.75 rounded-full bg-white/80 mx-[1.5px]"
    style={{ minHeight: 3 }}
    animate={active ? { height: ["3px", "14px", "5px", "18px", "3px"] } : { height: "3px" }}
    transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut", delay }}
  />
);
const AudioWave = ({ active = true }: { active?: boolean }) => (
  <div className={`flex items-center px-2.5 py-1.5 rounded-full shadow-lg transition-all ${active ? "bg-[#2D55FB] shadow-[#2D55FB]/40" : "bg-white/10"}`}>
    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mr-1.5 shrink-0">
      <span className="flex gap-0.5">
        <span className="w-0.75 h-2.25 bg-white rounded-sm block" />
        <span className="w-0.75 h-2.25 bg-white rounded-sm block" />
      </span>
    </div>
    {[0, 0.07, 0.14, 0.21, 0.1, 0.28, 0.05, 0.18, 0.12, 0.24, 0.08, 0.2, 0.16].map((d, i) => (
      <WaveBar key={i} delay={d} active={active} />
    ))}
  </div>
);
const MicCircle = ({ muted }: { muted: boolean }) => (
  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${muted ? "bg-red-500 shadow-red-500/40" : "bg-[#2D55FB] shadow-[#2D55FB]/40"}`}>
    {muted ? <MicOff className="h-4 w-4 text-white" /> : <Mic className="h-4 w-4 text-white" />}
  </div>
);
const CtrlBtn = ({
  onClick, active = true, danger = false, children,
}: {
  onClick?: () => void; active?: boolean; danger?: boolean; children: React.ReactNode;
}) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.88 }}
    className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-colors ${danger ? "bg-red-500 hover:bg-red-400 text-white shadow-red-500/40" : active ? "bg-white hover:bg-gray-100 text-gray-800" : "bg-white text-red-500"}`}
  >
    {children}
  </motion.button>
);
const UserVideo = React.memo(
  ({ camOn, streamReady, username, onVideoMount }: {
    camOn: boolean; streamReady: boolean; username: string;
    onVideoMount: (el: HTMLVideoElement | null) => void;
  }) => (
    <>
      <video
        ref={onVideoMount}
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-100" : "opacity-0"}`}
        style={{ transform: "scaleX(-1)" }}
      />
      {(!camOn || !streamReady) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a5e] to-[#060c25]">
          <div className="w-16 h-16 rounded-full bg-[#2D55FB]/20 border border-[#2D55FB]/30 flex items-center justify-center mb-2">
            {streamReady ? <VideoOff className="h-8 w-8 text-[#2D55FB]/60" /> : <User className="h-8 w-8 text-[#2D55FB]/50" />}
          </div>
          <span className="text-white/30 text-xs">{streamReady ? "Camera Off" : username}</span>
        </div>
      )}
    </>
  ),
);

interface AlertState {
  type: string;
  count: number;
  title: string;
  body: string;
}
const ViolationModal = ({ alert, onClose }: { alert: AlertState; onClose: () => void }) => {
  const term = alert.count >= MAX_VIOLATIONS;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ duration: 0.22 }}
        className={`relative z-10 w-full max-w-sm mx-4 rounded-2xl border p-6 shadow-2xl ${term ? "bg-red-950/90 border-red-500/50" : "bg-[#0d1836] border-amber-500/40"}`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${term ? "bg-red-500/20" : "bg-amber-500/20"}`}>
          {term ? <ShieldAlert className="h-6 w-6 text-red-400" /> : <AlertTriangle className="h-6 w-6 text-amber-400" />}
        </div>
        <h3 className="text-white font-bold text-lg mb-1">{term ? "Interview Terminated" : alert.title}</h3>
        <p className={`text-sm mb-1 ${term ? "text-red-400" : "text-amber-400"}`}>
          {term ? "Maximum violations reached" : `Violation ${alert.count} of ${MAX_VIOLATIONS}`}
        </p>
        <p className="text-white/70 text-sm leading-relaxed mb-5">{alert.body}</p>
        {!term && (
          <div className="flex gap-1.5 mb-5">
            {[...Array(MAX_VIOLATIONS)].map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full ${i < alert.count ? "bg-amber-400" : "bg-white/10"}`} />
            ))}
          </div>
        )}
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-2.5 rounded-xl font-semibold text-white text-sm ${term ? "bg-red-500 hover:bg-red-400" : "bg-[#2D55FB] hover:bg-[#1e3fd4]"}`}
        >
          {term ? "View Results" : "I Understand"}
        </motion.button>
      </motion.div>
    </div>
  );
};
const NoiseBanner = ({ onDismiss }: { onDismiss: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
    className="absolute top-12 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-amber-500/90 backdrop-blur-sm border border-amber-400/50 rounded-xl px-4 py-2.5 shadow-lg max-w-sm w-full mx-4"
  >
    <Volume2 className="h-4 w-4 text-amber-900 shrink-0" />
    <span className="text-amber-950 text-xs font-semibold flex-1">Background noise detected — please reduce noise around you.</span>
    <button onClick={onDismiss} className="text-amber-900/60 hover:text-amber-900"><X className="h-4 w-4" /></button>
  </motion.div>
);
const FullscreenBanner = ({ onDismiss }: { onDismiss: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
    className="absolute top-12 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-red-500/90 backdrop-blur-sm border border-red-400/50 rounded-xl px-4 py-2.5 shadow-lg max-w-sm w-full mx-4"
  >
    <Maximize className="h-4 w-4 text-white shrink-0" />
    <span className="text-white text-xs font-semibold flex-1">Fullscreen exited — re-entering automatically.</span>
    <button onClick={onDismiss} className="text-white/60 hover:text-white"><X className="h-4 w-4" /></button>
  </motion.div>
);

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const VideoInterview: React.FC = () => {
  const { interviewInfo, userData } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const interview_id = id || "";

  // ── Core state ────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>("lobby");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [streamReady, setStreamReady] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [vapi, setVapi] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [avatarSub, setAvatarSub] = useState("Waiting for AI to speak...");
  const [userSub, setUserSub] = useState("Your transcript will appear here...");
  const [resumeData, setResumeData] = useState<any>(null);
  const [isResumeInterview, setIsResumeInterview] = useState(false);
  const [noFaceWarning, setNoFaceWarning] = useState(false);
  const [activeAlert, setActiveAlert] = useState<AlertState | null>(null);
  const [noiseWarning, setNoiseWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFSBanner, setShowFSBanner] = useState(false);

  // ── Connection gate state ─────────────────────────────────────────────────
  /** True once Vapi call-start fires */
  const [vapiReady, setVapiReady] = useState(false);
  /** True once HeyGen STREAM_READY fires and video is playing */
  const [heygenStreamLive, setHeygenStreamLive] = useState(false);

  // ── Avatar state ──────────────────────────────────────────────────────────
  const [avatarMode] = useState<AvatarMode>(
    USE_HEYGEN ? "heygen" : USE_GANAI ? "ganai" : "animated",
  );
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [heygenReady, setHeygenReady] = useState(false);
  const [ganAiVideoUrl, setGanAiVideoUrl] = useState<string | null>(null);
  const [ganAiLoading, setGanAiLoading] = useState(false);
  const heygenVideoRef = useRef<HTMLVideoElement>(null);
  const heygenServiceRef = useRef<HeyGenService | null>(null);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const streamRef = useRef<MediaStream | null>(null);
  const lobbyVidRef = useRef<HTMLVideoElement>(null);
  const spotlightVidElRef = useRef<HTMLVideoElement | null>(null);
  const gridUserVidElRef = useRef<HTMLVideoElement | null>(null);
  const behaviorVidRef = useRef<HTMLVideoElement>(null);
  const conversationRef = useRef<any[]>([]);
  const aiTranscriptBufRef = useRef("");
  const userTranscriptBufRef = useRef("");
  const detectionIntervalRef = useRef<any>(null);
  const behaviorTrackerRef = useRef(new BehaviorTracker());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCheckRef = useRef<any>(null);
  const noiseEpisodeRef = useRef(false);
  const noiseSilentCntRef = useRef(0);
  const alertCountRef = useRef(0);
  const vapiRef = useRef<any>(null);
  const isCallActiveRef = useRef(false);
  const micOnRef = useRef(true);
  const camAlertIssuedRef = useRef(false);
  const interviewEndedRef = useRef(false);
  const consecutiveNoFaceRef = useRef(0);
  const trigViolRef = useRef<(t: string) => void>(() => {});
  // Prevents rapid re-trigger of violation while modal is already showing
  const violationLockedRef = useRef(false);

  // ── Silence detection ─────────────────────────────────────────────────────
  const lastUserSpeechRef = useRef<number>(Date.now());
  const silenceCheckRef = useRef<any>(null);
  const silenceWarnedRef = useRef(false);
  // ✅ NEW: track how many silence prompts have been sent (end after 5)
  const silenceWarnCountRef = useRef(0);
  const MAX_SILENCE_WARNINGS = 5;

  // ── Question count tracking ───────────────────────────────────────────────
  const questionCountRef = useRef(0);
  const maxQuestionsRef = useRef(0);
  const questionLimitReachedRef = useRef(false);
  // ✅ Tracks that we've sent the close instruction and are waiting for AI to finish
  const closingInProgressRef = useRef(false);
  // ✅ flag to prevent error-triggered auto-end with no conversation
  const callEndedByErrorRef = useRef(false);

  useEffect(() => { vapiRef.current = vapi; }, [vapi]);
  useEffect(() => { isCallActiveRef.current = isCallActive; }, [isCallActive]);
  useEffect(() => { micOnRef.current = micOn; }, [micOn]);

  // ── Keyboard lock ─────────────────────────────────────────────────────────
  useEffect(() => {
    const blockKey = (e: KeyboardEvent) => {
      if (isCallActiveRef.current) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); }
    };
    const blockCtx = (e: MouseEvent) => { if (isCallActiveRef.current) e.preventDefault(); };
    const blockClip = (e: ClipboardEvent) => { if (isCallActiveRef.current) e.preventDefault(); };
    document.addEventListener("keydown", blockKey, { capture: true, passive: false });
    document.addEventListener("keyup", blockKey, { capture: true, passive: false });
    document.addEventListener("keypress", blockKey, { capture: true, passive: false });
    document.addEventListener("contextmenu", blockCtx, { capture: true, passive: false });
    document.addEventListener("copy", blockClip, { capture: true });
    document.addEventListener("cut", blockClip, { capture: true });
    document.addEventListener("paste", blockClip, { capture: true });
    return () => {
      document.removeEventListener("keydown", blockKey, { capture: true } as any);
      document.removeEventListener("keyup", blockKey, { capture: true } as any);
      document.removeEventListener("keypress", blockKey, { capture: true } as any);
      document.removeEventListener("contextmenu", blockCtx, { capture: true } as any);
      document.removeEventListener("copy", blockClip, { capture: true } as any);
      document.removeEventListener("cut", blockClip, { capture: true } as any);
      document.removeEventListener("paste", blockClip, { capture: true } as any);
    };
  }, []);

  // ── Fullscreen ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onChange = () => {
      const inFS = !!document.fullscreenElement;
      setIsFullscreen(inFS);
      if (!inFS && isCallActiveRef.current) {
        tryEnterFS();
        setShowFSBanner(true);
        trigViolRef.current("fullscreen-exit");
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const onSpotlightVideoMount = useCallback((el: HTMLVideoElement | null) => {
    spotlightVidElRef.current = el;
    if (el && streamRef.current) { el.srcObject = streamRef.current; el.play().catch(() => {}); }
  }, []);
  const onGridUserVideoMount = useCallback((el: HTMLVideoElement | null) => {
    gridUserVidElRef.current = el;
    if (el && streamRef.current) { el.srcObject = streamRef.current; el.play().catch(() => {}); }
  }, []);
  const attachStream = useCallback((ref: React.RefObject<HTMLVideoElement>) => {
    if (ref.current && streamRef.current) { ref.current.srcObject = streamRef.current; ref.current.play().catch(() => {}); }
  }, []);

  useEffect(() => {
    if (!streamRef.current) return;
    if (spotlightVidElRef.current) { spotlightVidElRef.current.srcObject = streamRef.current; spotlightVidElRef.current.play().catch(() => {}); }
    if (gridUserVidElRef.current) { gridUserVidElRef.current.srcObject = streamRef.current; gridUserVidElRef.current.play().catch(() => {}); }
  }, [streamReady]);

  // ── Camera + Audio ────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: true,
        });
        streamRef.current = stream;
        setStreamReady(true);
        attachStream(lobbyVidRef);
        if (behaviorVidRef.current) { behaviorVidRef.current.srcObject = stream; behaviorVidRef.current.play().catch(() => {}); }
        try {
          const ctx = new AudioContext();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          ctx.createMediaStreamSource(stream).connect(analyser);
          audioCtxRef.current = ctx;
          analyserRef.current = analyser;
          audioCheckRef.current = setInterval(() => {
            if (!isCallActiveRef.current || !analyserRef.current) return;
            const arr = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(arr);
            const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
            if (avg > 38) {
              noiseSilentCntRef.current = 0;
              if (!noiseEpisodeRef.current) { noiseEpisodeRef.current = true; setNoiseWarning(true); }
            } else {
              noiseSilentCntRef.current++;
              if (noiseSilentCntRef.current >= 3) { noiseEpisodeRef.current = false; noiseSilentCntRef.current = 0; }
            }
          }, 2000);
        } catch {}
      } catch (e) { console.warn("Camera unavailable:", e); }
    })();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
      if (audioCheckRef.current) clearInterval(audioCheckRef.current);
    };
  }, []);

  useEffect(() => {
    if (screen === "lobby") attachStream(lobbyVidRef);
  }, [screen, attachStream]);

  const stopAllProctoring = useCallback(() => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    if (silenceCheckRef.current) clearInterval(silenceCheckRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const endInterviewAndNavigate = useCallback(async () => {
    if (interviewEndedRef.current) return;
    interviewEndedRef.current = true;
    stopAllProctoring();
    setIsCallActive(false);
    isCallActiveRef.current = false;
    setIsSpeaking(false);
    setAvatarState("idle");
    try { vapiRef.current?.stop(); } catch {}
    if (heygenServiceRef.current) {
      await heygenServiceRef.current.destroy();
      heygenServiceRef.current = null;
    }
    await tryExitFS();
  }, [stopAllProctoring]);

  // ── Inject spoken warning via Vapi ────────────────────────────────────────
  const speakViolationWarning = useCallback((type: string, isTerminal: boolean) => {
    const v = vapiRef.current;
    if (!v) return;
    const spoken = isTerminal
      ? "You have exceeded the maximum number of warnings. This interview has been terminated."
      : VIOLATION_MESSAGES[type]?.spoken ?? "You have received a violation warning.";
    try {
      v.send({
        type: "add-message",
        message: {
          role: "system",
          content: `[PROCTOR ALERT — speak this immediately to the candidate, in character as the interviewer]: "${spoken}"`,
        },
      });
    } catch {}
  }, []);

  const triggerViolation = useCallback(
    (type: string) => {
      if (!isCallActiveRef.current) return;
      // ✅ FIX: Don't fire while a modal is already on screen — prevents blinking
      if (violationLockedRef.current) return;
      violationLockedRef.current = true;

      alertCountRef.current++;
      const count = alertCountRef.current;
      const config = VIOLATION_MESSAGES[type] ?? {
        title: "Violation",
        body: (r: number) => `${r} warning(s) remaining.`,
        spoken: "You have received a violation warning.",
      };
      const isTerminal = count >= MAX_VIOLATIONS;
      setActiveAlert({
        type,
        count,
        title: config.title,
        body: isTerminal
          ? "You have exceeded the maximum violations. Interview auto-ended."
          : config.body(MAX_VIOLATIONS - count),
      });
      speakViolationWarning(type, isTerminal);
    },
    [speakViolationWarning],
  );

  useEffect(() => { trigViolRef.current = triggerViolation; }, [triggerViolation]);

  const handleAlertClose = useCallback(() => {
    const count = alertCountRef.current;
    const type = activeAlert?.type;
    setActiveAlert(null);
    // ✅ Unlock after a small delay so interval doesn't re-fire immediately
    setTimeout(() => { violationLockedRef.current = false; }, 3000);
    if (count >= MAX_VIOLATIONS) endInterviewAndNavigate();
    else if (type === "fullscreen-exit") { tryEnterFS(); setShowFSBanner(false); }
  }, [activeAlert, endInterviewAndNavigate]);

  // ── Silence detection — prompt up to 5× then end ─────────────────────────
  const startSilenceMonitor = useCallback(() => {
    lastUserSpeechRef.current = Date.now();
    silenceWarnedRef.current = false;
    silenceWarnCountRef.current = 0;
    if (silenceCheckRef.current) clearInterval(silenceCheckRef.current);
    silenceCheckRef.current = setInterval(() => {
      if (!isCallActiveRef.current) return;
      const silent = (Date.now() - lastUserSpeechRef.current) / 1000;
      if (silent >= SILENCE_THRESHOLD_SEC && !silenceWarnedRef.current) {
        silenceWarnedRef.current = true;
        // Reset timer so next check waits another 30 s
        lastUserSpeechRef.current = Date.now();
        silenceWarnCountRef.current++;

        const count = silenceWarnCountRef.current;

        if (count >= MAX_SILENCE_WARNINGS) {
          // ✅ After 5 unanswered prompts — ask AI to close the interview
          try {
            vapiRef.current?.send({
              type: "add-message",
              message: {
                role: "system",
                content:
                  "[SYSTEM — FINAL]: The candidate has not responded after 5 attempts. Thank them for their time, let them know the interview is being concluded due to inactivity, and end the call professionally.",
              },
            });
          } catch {}
        } else {
          // ✅ Escalating silence messages based on count
          const prompts = [
            "The candidate has not responded for 30 seconds. Gently ask if they are still there, and if they are ready to answer or need the question repeated.",
            "The candidate is still not responding (2nd attempt). Ask clearly if they can hear you and if they need a moment.",
            "Still no response (3rd attempt). Ask if there are any technical issues and remind them you can repeat the question.",
            "The candidate has been silent for a while (4th attempt). Firmly but politely ask if they wish to answer or skip to the next question.",
            "Final check (5th attempt): Let the candidate know this is the last prompt before concluding, and ask if they are ready to continue.",
          ];
          try {
            vapiRef.current?.send({
              type: "add-message",
              message: {
                role: "system",
                content: `[SILENCE ALERT #${count}]: ${prompts[count - 1]}`,
              },
            });
          } catch {}
        }
        // Allow warning to re-trigger after next silence period
        silenceWarnedRef.current = false;
      }
    }, 5000);
  }, []);

  // ── Proctoring ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isCallActive) return;
    const h = () => { if (document.hidden) triggerViolation("tab-switch"); };
    document.addEventListener("visibilitychange", h);
    return () => document.removeEventListener("visibilitychange", h);
  }, [isCallActive, triggerViolation]);

  useEffect(() => {
    if (!isCallActive) return;
    if (!camOn && !camAlertIssuedRef.current) { camAlertIssuedRef.current = true; triggerViolation("camera-off"); }
    if (camOn) camAlertIssuedRef.current = false;
  }, [camOn, isCallActive, triggerViolation]);

  // ✅ FIX: separate consecutive counter for multiple faces (was missing before)
  const consecutiveMultiFaceRef = useRef(0);

  useEffect(() => {
    if (!isCallActive) { clearInterval(detectionIntervalRef.current); return; }
    detectionIntervalRef.current = setInterval(() => {
      const vid = behaviorVidRef.current;
      if (!vid || vid.readyState < vid.HAVE_ENOUGH_DATA) return;
      const d = detectSuspicious(vid);
      if (d) {
        behaviorTrackerRef.current.addEvent(d);
        if (d.noFaceDetected) {
          consecutiveNoFaceRef.current++;
          consecutiveMultiFaceRef.current = 0;
          setNoFaceWarning(true);
          // Trigger after 3 consecutive no-face detections (~3 seconds)
          if (consecutiveNoFaceRef.current === 3) triggerViolation("no-face");
        } else if (d.multipleFaces) {
          consecutiveMultiFaceRef.current++;
          consecutiveNoFaceRef.current = 0;
          setNoFaceWarning(false);
          // ✅ Trigger after 2 consecutive multi-face detections (~2 seconds)
          // to avoid false positives from a single bad frame
          if (consecutiveMultiFaceRef.current === 2) {
            consecutiveMultiFaceRef.current = 0;
            triggerViolation("multiple-faces");
          }
        }
      } else {
        consecutiveNoFaceRef.current = 0;
        consecutiveMultiFaceRef.current = 0;
        setNoFaceWarning(false);
      }
    }, 1000);
    return () => clearInterval(detectionIntervalRef.current);
  }, [isCallActive, triggerViolation]);

  // ── Interview info ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!interviewInfo) { navigate(`/user/${interview_id}/interview-instruction`); return; }
    const dur = (parseInt(String(interviewInfo?.duration || "5"), 10) || 5) * 60;
    setTimeLeft(dur);
    setIsResumeInterview((interviewInfo?.type || interviewInfo?.examType || "") === "resume-based");
    maxQuestionsRef.current = parseInt(String(interviewInfo?.numberOfQuestions || "5"), 10) || 5;
    setLoading(false);
  }, [interviewInfo, interview_id, navigate]);

  useEffect(() => {
    if (isResumeInterview)
      fetch(`/api/resumes/${interview_id}`)
        .then((r) => r.json())
        .then(({ data }) => setResumeData(data))
        .catch(() => {});
  }, [isResumeInterview, interview_id]);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (screen === "lobby" || screen === "connecting") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [screen]);
  useEffect(() => {
    if (!isCallActive || timeLeft <= 0) return;
    const t = setInterval(
      () => setTimeLeft((s) => {
        if (s <= 1) { clearInterval(t); endInterviewAndNavigate(); return 0; }
        return s - 1;
      }), 1000,
    );
    return () => clearInterval(t);
  }, [isCallActive, endInterviewAndNavigate]);

  // ─────────────────────────────────────────────────────────────────────────
  // HEYGEN INIT
  // ─────────────────────────────────────────────────────────────────────────
  const initHeyGen = useCallback(async () => {
    if (avatarMode !== "heygen") return;
    const svc = new HeyGenService(heygenVideoRef);
    svc.onStateChange = (speaking) => setAvatarState(speaking ? "speaking" : "idle");
    // ⬇️  This fires only when the live WebRTC stream is actually playing
    svc.onStreamReady = () => {
      setHeygenReady(true);
      setHeygenStreamLive(true);
    };
    heygenServiceRef.current = svc;
    const ok = await svc.init();
    if (!ok) {
      console.warn("HeyGen init failed — falling back to animated avatar");
      // If HeyGen fails, unblock the gate so interview still starts
      setHeygenStreamLive(true);
    }
  }, [avatarMode]);

  // ─────────────────────────────────────────────────────────────────────────
  // GAN.AI GREETING
  // ─────────────────────────────────────────────────────────────────────────
  const generateGanAiGreeting = useCallback(async (greetingText: string) => {
    if (avatarMode !== "ganai") return;
    setGanAiLoading(true);
    try {
      const renderId = await ganAi.generate(greetingText);
      if (!renderId) return;
      const url = await ganAi.poll(renderId);
      if (url) setGanAiVideoUrl(url);
    } catch {
    } finally { setGanAiLoading(false); }
  }, [avatarMode]);

  // ── Vapi ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const instance = new Vapi("e1b6fe14-f22f-4a75-af38-5136766216ec");
    setVapi(instance);

    instance.on("speech-start", () => {
      setIsSpeaking(true);
      if (avatarMode === "animated" || (avatarMode === "ganai" && !ganAiVideoUrl))
        setAvatarState("speaking");
    });
    instance.on("speech-end", () => {
      setIsSpeaking(false);
      if (avatarMode !== "heygen") setAvatarState("idle");
      const text = aiTranscriptBufRef.current.trim();
      if (text) {
        setAvatarSub(text);
        if (avatarMode === "heygen" && heygenServiceRef.current && heygenReady) {
          heygenServiceRef.current.speak(text).catch(() => {});
        }
        aiTranscriptBufRef.current = "";
      }

      // ✅ FIX: After all questions done AND AI has finished speaking its closing,
      // wait 3 s for candidate to hear it, then programmatically stop the call
      if (closingInProgressRef.current && isCallActiveRef.current) {
        closingInProgressRef.current = false;
        setTimeout(() => {
          try { vapiRef.current?.stop(); } catch {}
        }, 3500);
      }
    });
    instance.on("call-start", () => {
      setIsCallActive(true);
      isCallActiveRef.current = true;
      setAvatarState("thinking");
      setVapiReady(true);
    });
    instance.on("error", (e: any) => {
      // ✅ Log error type clearly; daily-error = WebRTC/Daily.co connection issue
      const errType = e?.error?.type ?? e?.type ?? "unknown";
      console.error(`Vapi error [${errType}]:`, e);
      // Mark as error-end so call-end handler won't try to generate feedback
      if (errType === "daily-error" || errType === "connection-error") {
        callEndedByErrorRef.current = true;
      }
    });
    instance.on("message", (msg: any) => {
      if (msg?.type === "transcript") {
        const text = msg.transcript || msg.text || "";
        if (msg.role === "assistant") {
          conversationRef.current.push(msg);
          aiTranscriptBufRef.current = text;
          setAvatarSub(text);
          setAvatarState("thinking");

          // Count AI questions (sentences ending with ?)
          if (text.includes("?")) {
            questionCountRef.current++;
            // If question limit reached, tell AI to wrap up
            if (
              !questionLimitReachedRef.current &&
              questionCountRef.current >= maxQuestionsRef.current
            ) {
              questionLimitReachedRef.current = true;
              setTimeout(() => {
                try {
                  // ✅ Set flag so speech-end knows to stop the call after closing
                  closingInProgressRef.current = true;
                  vapiRef.current?.send({
                    type: "add-message",
                    message: {
                      role: "system",
                      content: `[SYSTEM — FINAL]: You have now asked all ${maxQuestionsRef.current} questions. This is the LAST thing you will say. Thank the candidate warmly, tell them the interview is now complete, wish them well, and say goodbye. Do NOT ask any more questions after this.`,
                    },
                  });
                } catch {}
              }, 500);
            }
          }
        } else if (msg.role === "user") {
          if (!micOnRef.current) return;
          conversationRef.current.push(msg);
          userTranscriptBufRef.current = text;
          setUserSub(text);
          setIsListening(true);
          setAvatarState("idle");
          // Reset silence timer on user speech
          lastUserSpeechRef.current = Date.now();
          silenceWarnedRef.current = false;
          silenceWarnCountRef.current = 0; // ✅ reset silence warning count
        }
      } else { conversationRef.current.push(msg); }
    });
    instance.on("user-speech-start", () => {
      if (!micOnRef.current) return;
      setIsListening(true);
      lastUserSpeechRef.current = Date.now();
      silenceWarnedRef.current = false;
      silenceWarnCountRef.current = 0; // ✅ reset counter when candidate speaks
    });
    instance.on("user-speech-end", () => {
      setIsListening(false);
      if (!micOnRef.current) return;
      if (userTranscriptBufRef.current.trim()) {
        setUserSub(userTranscriptBufRef.current.trim());
        userTranscriptBufRef.current = "";
      }
    });
    return () => { instance.stop(); };
  }, [avatarMode, heygenReady]);

  // ── Start call ────────────────────────────────────────────────────────────
  const startCall = useCallback(() => {
    if (!vapi || !interviewInfo) return;
    alertCountRef.current = 0;
    questionCountRef.current = 0;
    questionLimitReachedRef.current = false;
    closingInProgressRef.current = false;
    interviewEndedRef.current = false;

    const jobPosition = interviewInfo?.position || interviewInfo?.jobPosition || "the role";
    const jobDesc = interviewInfo?.jobDescription || "";
    const difficulty = interviewInfo?.difficulty || "Medium";
    const skills = Array.isArray(interviewInfo?.skills)
      ? interviewInfo.skills.join(", ")
      : interviewInfo?.skills || "";
    const numQs = maxQuestionsRef.current;
    const candidateName = interviewInfo?.username || interviewInfo?.candidateName || "Candidate";

    // ⬇️  Strict question limit instruction baked into RULES
    const RULES = `CORE RULES:
- Ask ONE question at a time.
- Start with "Tell me about yourself." as question 1.
- You MUST ask EXACTLY ${numQs} questions in total — no more, no fewer.
- After the ${numQs}th question and the candidate's answer, close the interview warmly.
- Use follow-up probes only if the answer is very vague, but count them toward the total.
- Do NOT exceed ${numQs} questions under any circumstance.`;

    let systemContent = "", firstMessage = "";
    if (isResumeInterview) {
      systemContent = `You are a senior AI interviewer (${difficulty} level).
RESUME:
${resumeData?.resumeText || "Not provided"}
ROLE: ${jobPosition}
${RULES}`;
      firstMessage = `Hi ${candidateName}, welcome. I'm your AI interviewer for the ${jobPosition} role. Ready when you are.`;
    } else {
      let qList: string[] = [];
      try {
        const raw = interviewInfo?.questions ?? interviewInfo?.questionList;
        if (Array.isArray(raw) && raw.length)
          qList = raw.map((x: any) => (typeof x === "string" ? x : x?.question)).filter(Boolean);
        if (!qList.length && typeof raw === "string")
          qList = (JSON.parse(raw) || []).map((x: any) => (typeof x === "string" ? x : x?.question)).filter(Boolean);
      } catch {}
      const final = [
        "Tell me about yourself.",
        ...qList.filter((q) => !q.toLowerCase().includes("tell me about yourself")),
      ].slice(0, numQs);

      systemContent = qList.length
        ? `You are a senior AI interviewer.
QUESTIONS (ask in strict order, one at a time):
${final.map((q, i) => `${i + 1}. ${q}`).join("\n")}
${RULES}`
        : `You are a senior AI interviewer.
ROLE: ${jobPosition}
JOB DESC: ${jobDesc}
SKILLS: ${skills}
DIFFICULTY: ${difficulty}
${RULES}`;
      firstMessage = `Hi ${userData?.name || userData?.firstName || userData?.username || "Candidate"}, welcome! I'm your AI interviewer for the ${jobPosition} position. Let's get started.`;
    }

    if (avatarMode === "heygen") initHeyGen();
    if (avatarMode === "ganai") generateGanAiGreeting(firstMessage);

    vapi.start({
      name: "AI Recruiter",
      firstMessage,
      transcriber: null,
      voice: {
        provider: "vapi",
        voiceId: "Neha",
        speed: 0.92,
        fillerInjectionEnabled: false,
      },
      model: {
        provider: "openai",
        model: "gpt-4-turbo",
        messages: [{ role: "system", content: systemContent }],
        temperature: 0.65,
        maxTokens: 420,
      },
      endCallMessage:
        "Thank you so much for your time. Best of luck — we'll be in touch soon!",
    });
  }, [
    vapi, interviewInfo, isResumeInterview, resumeData, userData,
    avatarMode, initHeyGen, generateGanAiGreeting,
  ]);

  // ── Once both Vapi + HeyGen are ready → show interview ───────────────────
  const handleBothReady = useCallback(() => {
    startSilenceMonitor();
    setScreen("spotlight");
  }, [startSilenceMonitor]);

  // ── Feedback ──────────────────────────────────────────────────────────────
  const generateFeedback = useCallback(async () => {
    setIsGeneratingFeedback(true);
    try {
      const conversation = conversationRef.current;
      if (!conversation.length) { navigate(`/user/${interview_id}/assessment-complete`); return; }
      const transcript = conversation
        .filter((m) => m?.type === "transcript" && (m.role === "assistant" || m.role === "user"))
        .map((m) => ({ role: m.role === "assistant" ? "Interviewer" : "Candidate", text: m.transcript || m.text || "" }))
        .filter((m) => m.text.trim());
      const r = await fetch("http://localhost:3000/api/ai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation, transcript }),
      });
      const data = await r.json();
      const raw = (data?.content || data?.feedback || "").replace(/```json|```/g, "").trim();
      if (raw) {
        let parsed: any = {};
        try { parsed = JSON.parse(raw); } catch {}
        await userService.generateFeedback({
          interview_id,
          userName: userData?.name,
          userEmail: userData?.email,
          feedback: parsed,
          transcript,
          behaviorReport: behaviorTrackerRef.current.getReport(),
          completedAt: new Date().toISOString(),
        });
      }
    } catch (e) { console.error("Feedback error:", e); }
    finally { setIsGeneratingFeedback(false); navigate(`/user/${interview_id}/assessment-complete`); }
  }, [interview_id, navigate, userData]);

  useEffect(() => {
    if (!vapi) return;
    const h = () => {
      // ✅ FIX: Don't generate feedback if call ended due to an error
      // with no real conversation (prevents the 400 Bad Request and unexpected end)
      const hasRealConversation = conversationRef.current.filter(
        (m) => m?.type === "transcript" && (m.role === "assistant" || m.role === "user"),
      ).length >= 2;

      setIsCallActive(false);
      isCallActiveRef.current = false;
      setIsSpeaking(false);
      setAvatarState("idle");

      if (!hasRealConversation) {
        // Error-end with no content — go back to lobby, don't attempt feedback
        console.warn("Call ended with no conversation content — returning to lobby");
        setScreen("lobby");
        setVapiReady(false);
        setHeygenStreamLive(false);
        setHeygenReady(false);
        setElapsed(0);
        return;
      }

      generateFeedback();
    };
    vapi.on("call-end", h);
    return () => vapi.off("call-end", h);
  }, [vapi, generateFeedback]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const handleJoin = () => {
    tryEnterFS();
    setScreen("connecting");
    startCall();
  };
  const handleEndCall = () => {
    setIsCallActive(false);
    if (silenceCheckRef.current) clearInterval(silenceCheckRef.current);
    try { vapi?.stop(); } catch {}
    tryExitFS();
    setScreen("lobby");
    setElapsed(0);
    setVapiReady(false);
    setHeygenStreamLive(false);
    setHeygenReady(false);
  };
  const toggleMic = () => {
    const n = !micOn;
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = n; });
    micOnRef.current = n;
    setMicOn(n);
    if (!n) userTranscriptBufRef.current = "";
  };
  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !camOn; });
    setCamOn((v) => !v);
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const fmtL = (s: number) =>
    isNaN(s) || s < 0 ? "00:00" : `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const fmtC = (d: Date) => {
    let h = d.getHours(), m = d.getMinutes();
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, "0")} ${ap}`;
  };
  const fmtD = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  if (loading || !interviewInfo)
    return (
      <div className="h-screen bg-[#050A24] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-[#2D55FB]" />
        <span className="ml-3 text-white text-lg">Preparing Interview...</span>
      </div>
    );
  if (isGeneratingFeedback)
    return (
      <div className="h-screen bg-[#050A24] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin h-12 w-12 text-[#2D55FB]" />
        <h2 className="text-white text-xl font-bold">Generating Your Feedback...</h2>
        <p className="text-white/40 text-sm">Please wait while our AI analyzes your performance</p>
      </div>
    );

  const username = userData?.name || "You";
  const avatarProps: AvatarTileProps = { mode: avatarMode, state: avatarState, heygenVideoRef, ganAiVideoUrl, ganAiLoading, heygenReady };

  const BottomBar = () => (
    <div className="shrink-0 bg-[#070e2b] border-t border-white/5 px-5 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span className="text-white/40 text-sm font-medium whitespace-nowrap">
          {interviewInfo?.position || interviewInfo?.jobPosition || "Interview"}
        </span>
        <div className="w-px h-5 bg-white/15" />
        <span className={`font-bold text-sm whitespace-nowrap ${timeLeft < 60 ? "text-red-400 animate-pulse" : "text-[#2D55FB]"}`}>
          ⏱ {fmtL(timeLeft)}
        </span>
        {maxQuestionsRef.current > 0 && (
          <>
            <div className="w-px h-5 bg-white/15" />
            <span className="text-white/40 text-xs whitespace-nowrap">
              Q {Math.min(questionCountRef.current, maxQuestionsRef.current)}/{maxQuestionsRef.current}
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <CtrlBtn onClick={toggleMic} active={micOn}>
          {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </CtrlBtn>
        <CtrlBtn onClick={toggleCam} active={camOn}>
          {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </CtrlBtn>
        <CtrlBtn><MonitorUp className="h-4 w-4 text-gray-800" /></CtrlBtn>
        <CtrlBtn onClick={handleEndCall} danger>
          <PhoneOff className="h-4 w-4" />
        </CtrlBtn>
      </div>
      <div className="min-w-[80px] sm:min-w-[120px] flex flex-col items-end gap-1">
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${isFullscreen ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/15 border-red-500/30 text-red-400 animate-pulse"}`}>
          <Maximize className="w-2.5 h-2.5" />
          {isFullscreen ? "Fullscreen" : "Not FS!"}
        </div>
        {noFaceWarning && <span className="text-red-400 text-[10px] font-bold animate-pulse">⚠ No face</span>}
        {!noFaceWarning && alertCountRef.current > 0 && (
          <span className="text-orange-400 text-[10px] font-bold">{alertCountRef.current}/3 warns</span>
        )}
      </div>
    </div>
  );

  const GlobalOverlays = () => (
    <>
      <AnimatePresence>
        {activeAlert && <ViolationModal alert={activeAlert} onClose={handleAlertClose} />}
      </AnimatePresence>
      <AnimatePresence>
        {noiseWarning && screen !== "lobby" && screen !== "connecting" && (
          <NoiseBanner onDismiss={() => setNoiseWarning(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showFSBanner && screen !== "lobby" && screen !== "connecting" && !activeAlert && (
          <FullscreenBanner onDismiss={() => { tryEnterFS(); setShowFSBanner(false); }} />
        )}
      </AnimatePresence>
    </>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // LOBBY
  // ══════════════════════════════════════════════════════════════════════════
  if (screen === "lobby")
    return (
      <div className="h-screen bg-[#050A24] bg-[radial-gradient(ellipse_at_65%_0%,rgba(45,85,251,0.4),transparent_60%),radial-gradient(ellipse_at_0%_100%,rgba(20,40,120,0.4),transparent_60%)] flex flex-col overflow-hidden">
        <video ref={behaviorVidRef} muted playsInline className="hidden" />
        <div className="flex items-center justify-between px-6 sm:px-10 py-5 shrink-0">
          <h1 className="text-white font-bold text-lg sm:text-xl tracking-tight">Vitric IQ</h1>
          <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
            <span>{fmtC(now)}</span>
            <span className="text-white/20 mx-1">|</span>
            <span>{fmtD(now)}</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-6 pb-10">
          <motion.div
            className="relative w-full max-w-sm sm:max-w-md lg:max-w-xl xl:max-w-2xl bg-[#0a1035] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50"
            style={{ aspectRatio: "16/9" }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55 }}
          >
            <video
              ref={lobbyVidRef}
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-100" : "opacity-0"}`}
              style={{ transform: "scaleX(-1)" }}
            />
            {(!camOn || !streamReady) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a5e] to-[#050A24] gap-3">
                <div className="w-20 h-20 rounded-full bg-[#2D55FB]/20 border border-[#2D55FB]/30 flex items-center justify-center">
                  {streamReady ? <VideoOff className="h-10 w-10 text-[#2D55FB]/60" /> : <User className="h-10 w-10 text-[#2D55FB]/50" />}
                </div>
                <span className="text-white/30 text-sm">{streamReady ? "Camera off" : "Waiting for camera…"}</span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 flex items-center gap-3">
              <motion.button onClick={toggleMic} whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur transition-all ${micOn ? "bg-white/15 border-white/25 text-white hover:bg-white/25" : "bg-red-500 border-red-400 text-white"}`}>
                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </motion.button>
              <motion.button onClick={toggleCam} whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur transition-all ${camOn ? "bg-white/15 border-white/25 text-white hover:bg-white/25" : "bg-red-500 border-red-400 text-white"}`}>
                {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </motion.button>
            </div>
          </motion.div>
          <motion.div
            className="flex flex-col items-center gap-5"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            <h2 className="text-white text-2xl sm:text-3xl font-semibold">Ready to Join?</h2>
            <p className="text-white/40 text-sm text-center max-w-xs">
              {interviewInfo?.position || interviewInfo?.jobPosition || "Interview"} • {interviewInfo?.duration || "N/A"}
            </p>
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl max-w-xs border ${USE_HEYGEN ? "bg-green-500/10 border-green-500/25" : USE_GANAI ? "bg-purple-500/10 border-purple-500/25" : "bg-[#2D55FB]/10 border-[#2D55FB]/25"}`}>
              <div className={`w-2 h-2 rounded-full ${USE_HEYGEN ? "bg-green-400" : USE_GANAI ? "bg-purple-400" : "bg-[#2D55FB]/60"}`} />
              <span className="text-white/50 text-xs">
                {USE_HEYGEN ? "Photorealistic avatar via HeyGen Streaming" : USE_GANAI ? "Avatar intro via Gan.AI + animated live" : "Animated AI avatar"}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 bg-[#2D55FB]/10 border border-[#2D55FB]/25 rounded-xl max-w-xs">
              <Maximize className="h-3.5 w-3.5 text-[#2D55FB]/70 shrink-0" />
              <span className="text-white/50 text-xs">Interview will run in fullscreen mode</span>
            </div>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-700 border-2 border-[#2D55FB] flex items-center justify-center shadow-lg">
                <User className="h-6 w-6 text-white/80" />
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-orange-400 flex items-center justify-center -ml-3 shadow-lg">
                <User className="h-6 w-6 text-white/80" />
              </div>
            </div>
            <p className="text-white/50 text-sm -mt-2">{username} and AI Recruiter</p>
            <motion.button
              onClick={handleJoin}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-3 bg-[#2D55FB] hover:bg-[#1e3fd4] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-[#2D55FB]/30"
            >
              Join Interview
            </motion.button>
          </motion.div>
        </div>
      </div>
    );

  // ══════════════════════════════════════════════════════════════════════════
  // CONNECTING GATE — waits for Vapi + HeyGen before showing interview
  // ══════════════════════════════════════════════════════════════════════════
  if (screen === "connecting")
    return (
      <>
        <video ref={behaviorVidRef} muted playsInline className="hidden" />
        <ConnectingScreen
          heygenReady={heygenStreamLive}
          vapiReady={vapiReady}
          avatarMode={avatarMode}
          onBothReady={handleBothReady}
        />
      </>
    );

  // ══════════════════════════════════════════════════════════════════════════
  // SPOTLIGHT
  // ══════════════════════════════════════════════════════════════════════════
  if (screen === "spotlight")
    return (
      <div className="h-screen bg-[#070e2b] flex flex-col overflow-hidden relative">
        <video ref={behaviorVidRef} muted playsInline className="hidden" />
        <GlobalOverlays />
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#070e2b] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-sm">Time :</span>
            <span className="text-[#2D55FB] font-mono font-bold text-sm tracking-widest">{fmt(elapsed)}</span>
            {isCallActive && (
              <div className="flex items-center gap-1.5 ml-3 text-green-400 text-xs font-bold">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                LIVE
              </div>
            )}
          </div>
          <motion.button onClick={() => setScreen("grid")} whileTap={{ scale: 0.94 }}
            className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-medium transition-colors">
            Grid View
            <div className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <LayoutGrid className="h-4 w-4 text-white" />
            </div>
          </motion.button>
        </div>
        <div className="flex flex-1 min-h-0 gap-2.5 px-2.5 pb-2 pt-1">
          <div className="w-44 sm:w-52 shrink-0 flex flex-col gap-2">
            <div className="relative rounded-xl overflow-hidden bg-[#0d1535] border border-white/5 shrink-0" style={{ aspectRatio: "4/3" }}>
              <UserVideo camOn={camOn} streamReady={streamReady} username={username} onVideoMount={onSpotlightVideoMount} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-2.5 z-10"><span className="text-white text-xs font-semibold drop-shadow">{username}</span></div>
              <div className="absolute bottom-2 right-2.5 z-10"><MicCircle muted={!micOn} /></div>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
              <div className="bg-[#0e1640]/90 rounded-xl p-3 border border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[#7a9cff] text-[11px] font-semibold">AI Recruiter:</span>
                  {isSpeaking && <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">{avatarSub}</p>
              </div>
              <div className="bg-[#0e1640]/90 rounded-xl p-3 border border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[#7a9cff] text-[11px] font-semibold">You:</span>
                  {isListening && micOn && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />}
                  {!micOn && <span className="text-red-400/70 text-[9px] font-bold">MIC OFF</span>}
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">{micOn ? userSub : "Microphone is muted."}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
            <AvatarTile {...avatarProps} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"><AudioWave active={isSpeaking} /></div>
            <div className="absolute bottom-4 left-5 z-10"><span className="text-white font-medium text-sm">AI Recruiter</span></div>
            {isCallActive && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-bold z-10">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                REC
              </div>
            )}
          </div>
        </div>
        <BottomBar />
      </div>
    );

  // ══════════════════════════════════════════════════════════════════════════
  // GRID
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="h-screen bg-[#070e2b] flex flex-col overflow-hidden relative">
      <video ref={behaviorVidRef} muted playsInline className="hidden" />
      <GlobalOverlays />
      <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#070e2b] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-sm">Time :</span>
          <span className="text-[#2D55FB] font-mono font-bold text-sm tracking-widest">{fmt(elapsed)}</span>
          {isCallActive && (
            <div className="flex items-center gap-1.5 ml-3 text-green-400 text-xs font-bold">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              LIVE
            </div>
          )}
        </div>
        <motion.button onClick={() => setScreen("spotlight")} whileTap={{ scale: 0.94 }}
          className="flex items-center gap-2 text-white/80 hover:text-white text-xs font-medium transition-colors">
          Spotlight View
          <div className="w-7 h-7 rounded-lg bg-[#2D55FB] flex items-center justify-center shadow-md shadow-[#2D55FB]/30">
            <LayoutGrid className="h-4 w-4 text-white" />
          </div>
        </motion.button>
      </div>
      <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-6 pt-2 pb-1 gap-0">
        <div className="flex gap-4 sm:gap-5" style={{ flex: "0 0 auto", height: "clamp(200px, 58vh, 420px)" }}>
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
            <video
              ref={onGridUserVideoMount}
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-100" : "opacity-0"}`}
              style={{ transform: "scaleX(-1)" }}
            />
            {(!camOn || !streamReady) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a5e]/80 to-[#060c25]/80">
                <div className="w-14 h-14 rounded-full bg-[#2D55FB]/20 border border-[#2D55FB]/30 flex items-center justify-center mb-2">
                  {streamReady ? <VideoOff className="h-7 w-7 text-[#2D55FB]/60" /> : <User className="h-7 w-7 text-[#2D55FB]/50" />}
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-12 right-3 z-10"><MicCircle muted={!micOn} /></div>
            <div className="absolute bottom-4 left-4 z-10"><span className="text-white font-semibold text-base drop-shadow">{username}</span></div>
            {isListening && micOn && (
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-1.5 bg-blue-600/80 text-white px-2 py-1 rounded-full text-xs font-bold">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  Speaking
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
            <AvatarTile {...avatarProps} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-12 right-3 z-10"><AudioWave active={isSpeaking} /></div>
            <div className="absolute bottom-4 left-4 z-10"><span className="text-white font-semibold text-base drop-shadow">AI Recruiter</span></div>
            {isSpeaking && (
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-1.5 bg-green-600/80 text-white px-2 py-1 rounded-full text-xs font-bold">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  Speaking
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-4 sm:gap-5 mt-3" style={{ flex: "0 0 auto" }}>
          <div className="flex-1 flex items-start justify-center">
            <p className="text-white/65 text-sm text-center leading-snug max-w-xs">{micOn ? userSub : "🎤 Mic is muted"}</p>
          </div>
          <div className="flex-1 flex items-start justify-center">
            <p className="text-white/65 text-sm text-center leading-snug max-w-xs">{avatarSub}</p>
          </div>
        </div>
        <div className="flex-1" />
      </div>
      <BottomBar />
    </div>
  );
};

export default VideoInterview;