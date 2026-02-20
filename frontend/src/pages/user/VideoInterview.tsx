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
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";
import { Mic, MicOff, Video, VideoOff, PhoneOff, LayoutGrid, MonitorUp, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/context";

type Screen = "lobby" | "spotlight" | "grid";

/* ══════════════════════════════════════════════════════════════════════════
   INLINE BEHAVIOR DETECTION
══════════════════════════════════════════════════════════════════════════ */
function detectSuspiciousBehavior(videoElement: HTMLVideoElement) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 160; canvas.height = 120;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(videoElement, 0, 0, 160, 120);
    const { data } = ctx.getImageData(0, 0, 160, 120);
    let skinPixels = 0;
    const total = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15 && r - b > 15) skinPixels++;
    }
    const ratio = skinPixels / total;
    if (ratio < 0.02) return { noFaceDetected: true };
    if (ratio > 0.45) return { multipleFaces: true };
    if (ratio < 0.06) return { lookingAway: true };
    return null;
  } catch { return null; }
}

class BehaviorTracker {
  events: Array<{ type: string; timestamp: number }> = [];
  addEvent(d: { noFaceDetected?: boolean; multipleFaces?: boolean; lookingAway?: boolean }) {
    const type = d.noFaceDetected ? "no_face" : d.multipleFaces ? "multiple_faces" : d.lookingAway ? "looking_away" : "unknown";
    this.events.push({ type, timestamp: Date.now() });
  }
  getReport() {
    return {
      totalEvents: this.events.length,
      noFaceCount: this.events.filter(e => e.type === "no_face").length,
      multipleFacesCount: this.events.filter(e => e.type === "multiple_faces").length,
      lookingAwayCount: this.events.filter(e => e.type === "looking_away").length,
      events: this.events,
    };
  }
}

/* ── Waveform ─────────────────────────────────────────────────────────────── */
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

/* ── Mic badge ────────────────────────────────────────────────────────────── */
const MicCircle = ({ muted }: { muted: boolean }) => (
  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${muted ? "bg-red-500 shadow-red-500/40" : "bg-[#2D55FB] shadow-[#2D55FB]/40"}`}>
    {muted ? <MicOff className="h-4 w-4 text-white" /> : <Mic className="h-4 w-4 text-white" />}
  </div>
);

/* ── Control button ───────────────────────────────────────────────────────── */
const CtrlBtn = ({
  onClick, active = true, danger = false, children,
}: {
  onClick?: () => void; active?: boolean; danger?: boolean; children: React.ReactNode;
}) => (
  <motion.button
    onClick={onClick}
    className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-colors
      ${danger
        ? "bg-red-500 hover:bg-red-400 text-white shadow-red-500/40"
        : active
          ? "bg-white hover:bg-gray-100 text-gray-800"
          : "bg-white text-red-500"
      }`}
    whileTap={{ scale: 0.88 }}
  >
    {children}
  </motion.button>
);

/* ── AI Avatar ─────────────────────────────────────────────────────────────── */
function AIAvatarTile({ isSpeaking, isCallActive }: { isSpeaking: boolean; isCallActive: boolean }) {
  const [mouthOpening, setMouthOpening] = useState(0);
  useEffect(() => {
    if (!isSpeaking) { setMouthOpening(0); return; }
    const interval = setInterval(() => setMouthOpening(prev => (prev + 1) % 5), 80);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0d1535] to-[#060c25]">
      <svg width="160" height="190" viewBox="0 0 280 360" className="drop-shadow-2xl">
        <defs>
          <linearGradient id="skinG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#f5c9a8" }} />
            <stop offset="50%" style={{ stopColor: "#e8b89f" }} />
            <stop offset="100%" style={{ stopColor: "#daa589" }} />
          </linearGradient>
          <linearGradient id="hairG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#4a3728" }} />
            <stop offset="100%" style={{ stopColor: "#2d2318" }} />
          </linearGradient>
        </defs>
        <path d="M 60 80 Q 50 30 140 20 Q 230 30 220 80 L 220 140 Q 220 90 140 85 Q 60 90 60 140 Z" fill="url(#hairG)" />
        <ellipse cx="140" cy="150" rx="95" ry="110" fill="url(#skinG)" />
        <ellipse cx="105" cy="130" rx="18" ry="26" fill="white" />
        <ellipse cx="175" cy="130" rx="18" ry="26" fill="white" />
        <circle cx="105" cy="138" r="12" fill="#5a6b7d" />
        <circle cx="175" cy="138" r="12" fill="#5a6b7d" />
        <circle cx="105" cy="140" r="7" fill="#1a1a1a" />
        <circle cx="175" cy="140" r="7" fill="#1a1a1a" />
        <circle cx="102" cy="136" r="3.5" fill="white" opacity="0.9" />
        <circle cx="172" cy="136" r="3.5" fill="white" opacity="0.9" />
        <path d="M 80 110 Q 105 98 122 105" stroke="#3d2f20" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 158 105 Q 175 98 200 110" stroke="#3d2f20" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 140 130 L 140 185" stroke="#d9956a" strokeWidth="2.5" fill="none" opacity="0.7" />
        <ellipse cx="130" cy="188" rx="4" ry="5" fill="#d9956a" opacity="0.6" />
        <ellipse cx="150" cy="188" rx="4" ry="5" fill="#d9956a" opacity="0.6" />
        <path
          d={mouthOpening === 0 ? "M 110 220 Q 140 228 170 220" : mouthOpening <= 2 ? "M 110 218 Q 140 232 170 218" : "M 110 216 Q 140 238 170 216"}
          stroke="#a85a5a" strokeWidth="2.5" fill={mouthOpening > 1 ? "#c97070" : "none"} strokeLinecap="round"
        />
        <rect x="120" y="245" width="40" height="50" fill="#e8b89f" opacity="0.9" />
        <polygon points="95,290 140,295 185,290 185,340 95,340" fill="#1a3a5c" opacity="0.9" />
      </svg>
    </div>
  );
}

/* ── Stable UserVideo component defined OUTSIDE main component to prevent remount ── */
interface UserVideoProps {
  streamRef: React.RefObject<MediaStream | null>;
  camOn: boolean;
  streamReady: boolean;
  username: string;
  onVideoMount: (el: HTMLVideoElement | null) => void;
}

const UserVideo = React.memo(({ streamRef, camOn, streamReady, username, onVideoMount }: UserVideoProps) => (
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
));

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const VideoInterview: React.FC = () => {
  const { interviewInfo } = useAuth();
  console.log("info", interviewInfo);
  const { id } = useParams();
  const navigate = useNavigate();
  const interview_id = id || "";

  // ── UI state ──────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>("lobby");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [streamReady, setStreamReady] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [now, setNow] = useState(new Date());

  // ── Vapi / AI state ───────────────────────────────────────────────────────
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

  // ── Alert system state ────────────────────────────────────────────────────
  const [alertCount, setAlertCount] = useState(0);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const streamRef = useRef<MediaStream | null>(null);
  const lobbyVidRef = useRef<HTMLVideoElement>(null);
  const spotlightVidElRef = useRef<HTMLVideoElement | null>(null); // holds the actual DOM element
  const gridUserVidElRef = useRef<HTMLVideoElement | null>(null);  // holds the actual DOM element
  const behaviorVidRef = useRef<HTMLVideoElement>(null);
  const conversationRef = useRef<any[]>([]);
  const aiTranscriptBufferRef = useRef("");
  const userTranscriptBufferRef = useRef("");
  const detectionIntervalRef = useRef<any>(null);
  const behaviorTrackerRef = useRef(new BehaviorTracker());

  // ── Alert tracking refs (avoids stale closures) ───────────────────────────
  const alertCountRef = useRef(0);
  const vapiRef = useRef<any>(null);
  const isCallActiveRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const lastUserSpeakRef = useRef<number>(Date.now());
  const silenceNotifiedRef = useRef(false); // prevent spamming silence prompts
  const camOnRef = useRef(true);
  const camAlertIssuedRef = useRef(false); // only alert once per cam-off event

  // Keep refs in sync with state
  useEffect(() => { vapiRef.current = vapi; }, [vapi]);
  useEffect(() => { isCallActiveRef.current = isCallActive; }, [isCallActive]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { camOnRef.current = camOn; }, [camOn]);

  /* ── Callback refs for spotlight / grid videos (fixes remount issue) ──── */
  const onSpotlightVideoMount = useCallback((el: HTMLVideoElement | null) => {
    spotlightVidElRef.current = el;
    if (el && streamRef.current) {
      el.srcObject = streamRef.current;
      el.play().catch(() => {});
    }
  }, []);

  const onGridUserVideoMount = useCallback((el: HTMLVideoElement | null) => {
    gridUserVidElRef.current = el;
    if (el && streamRef.current) {
      el.srcObject = streamRef.current;
      el.play().catch(() => {});
    }
  }, []);

  /* ── Camera setup ─────────────────────────────────────────────────────── */
  const attachStream = useCallback((ref: React.RefObject<HTMLVideoElement>) => {
    if (ref.current && streamRef.current) {
      ref.current.srcObject = streamRef.current;
      ref.current.play().catch(() => {});
    }
  }, []);

  // Re-attach to callback-ref elements when stream becomes ready
  useEffect(() => {
    if (!streamRef.current) return;
    if (spotlightVidElRef.current) {
      spotlightVidElRef.current.srcObject = streamRef.current;
      spotlightVidElRef.current.play().catch(() => {});
    }
    if (gridUserVidElRef.current) {
      gridUserVidElRef.current.srcObject = streamRef.current;
      gridUserVidElRef.current.play().catch(() => {});
    }
  }, [streamReady]);

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
        if (behaviorVidRef.current) {
          behaviorVidRef.current.srcObject = stream;
          behaviorVidRef.current.play().catch(() => {});
        }
      } catch (e) { console.warn("Camera not available", e); }
    })();
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  useEffect(() => {
    if (!streamRef.current) return;
    if (screen === "lobby") attachStream(lobbyVidRef);
  }, [screen, attachStream]);

  /* ── Alert system ─────────────────────────────────────────────────────── */
  const triggerAlert = useCallback((reason: string) => {
    if (!isCallActiveRef.current) return;

    alertCountRef.current += 1;
    const count = alertCountRef.current;
    setAlertCount(count);

    const remaining = 3 - count;

    if (count < 3) {
      toast.warning(`⚠️ Warning ${count}/3: ${reason}. ${remaining} warning(s) left before interview ends.`);
    } else {
      // 3rd alert — inform AI, then end after a short delay
      toast.error(`🚫 Interview ending: ${reason}. Maximum warnings reached.`);

      const v = vapiRef.current;
      if (v) {
        try {
          v.send({
            type: "add-message",
            message: {
              role: "system",
              content:
                "IMPORTANT: The candidate has received 3 integrity warnings and the interview must be terminated immediately. In one brief sentence, inform the candidate that the interview is being ended due to multiple violations, then stop.",
            },
          });
        } catch (e) { /* ignore */ }
        // Give AI ~4 s to speak the farewell, then hard-stop
        setTimeout(() => {
          try { v.stop(); } catch (e) {}
          setIsCallActive(false);
          setIsSpeaking(false);
        }, 4000);
      } else {
        setIsCallActive(false);
        setIsSpeaking(false);
      }
    }
  }, []);

  /* ── Tab switch detection ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!isCallActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerAlert("Tab switching / window minimized detected");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isCallActive, triggerAlert]);

  /* ── Camera-off alert (only fires once per off-event) ─────────────────── */
  useEffect(() => {
    if (!isCallActive) return;

    if (!camOn && !camAlertIssuedRef.current) {
      camAlertIssuedRef.current = true;
      triggerAlert("Camera turned off");
    }

    if (camOn) {
      camAlertIssuedRef.current = false; // reset so turning off again triggers again
    }
  }, [camOn, isCallActive, triggerAlert]);

  /* ── Silence detection — prompt AI if candidate silent > 20 s ─────────── */
  useEffect(() => {
    if (!isCallActive) return;

    const interval = setInterval(() => {
      if (isSpeakingRef.current) return; // AI is talking, don't interrupt
      const silenceMs = Date.now() - lastUserSpeakRef.current;

      if (silenceMs > 20_000 && !silenceNotifiedRef.current) {
        silenceNotifiedRef.current = true; // throttle
        const v = vapiRef.current;
        if (v) {
          try {
            v.send({
              type: "add-message",
              message: {
                role: "system",
                content:
                  "The candidate has been silent for over 20 seconds. Politely ask if they need more time, are having trouble understanding the question, or are ready to proceed.",
              },
            });
          } catch (e) { /* ignore */ }
        }
        // Re-enable prompt after another 25 s to avoid spam
        setTimeout(() => { silenceNotifiedRef.current = false; }, 25_000);
      }
    }, 5_000);

    return () => clearInterval(interval);
  }, [isCallActive]);

  /* ── Interview info setup ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!interviewInfo) {
      toast.error("Interview details not found.");
      navigate(`/user/${interview_id}/interview-instruction`);
      return;
    }

    const rawDuration = interviewInfo?.duration || "5";
    const mins = parseInt(String(rawDuration), 10) || 5;
    setTimeLeft(mins * 60);

    const type = interviewInfo?.type || interviewInfo?.examType || "";
    setIsResumeInterview(type === "resume-based");

    setLoading(false);
  }, [interviewInfo, interview_id, navigate]);

  useEffect(() => {
    if (isResumeInterview) {
      fetch(`/api/resumes/${interview_id}`)
        .then(r => r.json())
        .then(({ data }) => setResumeData(data))
        .catch(() => toast.error("Could not load resume."));
    }
  }, [isResumeInterview, interview_id]);

  /* ── Clocks & timers ──────────────────────────────────────────────────── */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (screen === "lobby") return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [screen]);

  useEffect(() => {
    if (!isCallActive || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(s => {
      if (s <= 1) { toast("Interview time ended"); stopInterview(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [isCallActive]);

  /* ── Behavior detection ───────────────────────────────────────────────── */
  useEffect(() => {
    if (!isCallActive) { clearInterval(detectionIntervalRef.current); return; }

    // Track consecutive no-face detections to avoid false positives
    let consecutiveNoFace = 0;

    detectionIntervalRef.current = setInterval(() => {
      const vid = behaviorVidRef.current;
      if (vid && vid.readyState === vid.HAVE_ENOUGH_DATA) {
        const detected = detectSuspiciousBehavior(vid);
        if (detected) {
          behaviorTrackerRef.current.addEvent(detected);

          if (detected.noFaceDetected) {
            consecutiveNoFace++;
            setNoFaceWarning(true);
            // Only trigger alert after 3 consecutive no-face detections (3 s) to avoid flickers
            if (consecutiveNoFace === 3) {
              triggerAlert("No face detected — please stay in front of the camera");
            }
          } else {
            consecutiveNoFace = 0;
            setNoFaceWarning(false);
          }

          if (detected.multipleFaces) {
            triggerAlert("Multiple faces detected in camera");
          }
        } else {
          consecutiveNoFace = 0;
          setNoFaceWarning(false);
        }
      }
    }, 1000);

    return () => clearInterval(detectionIntervalRef.current);
  }, [isCallActive, triggerAlert]);

  /* ── Vapi initialization ──────────────────────────────────────────────── */
  useEffect(() => {
    const instance = new Vapi("e1b6fe14-f22f-4a75-af38-5136766216ec");
    setVapi(instance);

    instance.on("speech-start", () => { setIsSpeaking(true); });
    instance.on("speech-end", () => {
      setIsSpeaking(false);
      if (aiTranscriptBufferRef.current.trim()) {
        setAvatarSub(aiTranscriptBufferRef.current.trim());
        aiTranscriptBufferRef.current = "";
      }
    });
    instance.on("call-start", () => { setIsCallActive(true); toast("Call Connected"); });
    instance.on("error", (error: any) => toast.error(`Error: ${error?.message || "Unknown"}`));

    instance.on("message", (msg: any) => {
      conversationRef.current.push(msg);
      if (msg?.type === "transcript") {
        const text = msg.transcript || msg.text || "";
        if (msg.role === "assistant") {
          aiTranscriptBufferRef.current = text;
          setAvatarSub(text);
        } else {
          userTranscriptBufferRef.current = text;
          setUserSub(text);
          setIsListening(true);
        }
      }
    });

    instance.on("user-speech-start", () => {
      setIsListening(true);
      // Reset silence tracking whenever candidate starts speaking
      lastUserSpeakRef.current = Date.now();
      silenceNotifiedRef.current = false;
    });

    instance.on("user-speech-end", () => {
      setIsListening(false);
      // Update last-speak timestamp when candidate finishes too
      lastUserSpeakRef.current = Date.now();
      if (userTranscriptBufferRef.current.trim()) {
        setUserSub(userTranscriptBufferRef.current.trim());
        userTranscriptBufferRef.current = "";
      }
    });

    return () => { instance.stop(); };
  }, []);

  /* ── Start call ───────────────────────────────────────────────────────── */
  const startCall = useCallback(() => {
    if (!vapi || !interviewInfo) return;

    // Reset silence + alert tracking for new call
    lastUserSpeakRef.current = Date.now();
    silenceNotifiedRef.current = false;
    alertCountRef.current = 0;
    setAlertCount(0);

    const jobPosition = interviewInfo?.position || interviewInfo?.jobPosition || "the role";
    const jobDescription = interviewInfo?.jobDescription || "";
    const difficulty = interviewInfo?.difficulty || "Medium";
    const skills = Array.isArray(interviewInfo?.skills)
      ? interviewInfo.skills.join(", ")
      : interviewInfo?.skills || "";
    const numberOfQuestions = interviewInfo?.numberOfQuestions || 5;
    const candidateName = interviewInfo?.username || interviewInfo?.candidateName || "Candidate";

    let systemContent = "";
    let firstMessage = "";

    if (isResumeInterview) {
      systemContent = `You are a professional AI interviewer conducting a ${difficulty} level interview.\nCANDIDATE RESUME:\n${resumeData?.resumeText}\nROLE: ${jobPosition}\nJob Description: ${jobDescription}\nAsk ${numberOfQuestions} relevant questions one by one based on their resume and the role. Wait for a complete answer before asking the next question. Be professional and conversational.`;
      firstMessage = `Hi ${candidateName}, thank you for joining. I'm your AI interviewer for the ${jobPosition} position. Ready to begin?`;
    } else {
      let questionList: string[] = [];

      try {
        const rawQuestions = interviewInfo?.questions ?? interviewInfo?.questionList;

        if (Array.isArray(rawQuestions) && rawQuestions.length > 0) {
          questionList = rawQuestions
            .map((item: any) => (typeof item === "string" ? item : item?.question))
            .filter(Boolean);
        }

        if (questionList.length === 0 && typeof rawQuestions === "string") {
          const parsed = JSON.parse(rawQuestions);
          questionList = (Array.isArray(parsed) ? parsed : [])
            .map((item: any) => (typeof item === "string" ? item : item?.question))
            .filter(Boolean);
        }
      } catch (e) {
        console.error("Failed to parse questions:", e);
      }

      const sharedRules = `
STRICT RULES YOU MUST FOLLOW:
- NEVER repeat or paraphrase the candidate's answer back to them. Do not say things like "Great, you mentioned X..." or "So you're saying Y...". Acknowledge briefly (e.g. "Got it.", "Thank you.") and move on.
- NEVER mention difficulty level, passing score, or any internal interview metadata to the candidate.
- Ask ONE question at a time. Wait for a complete answer before asking the next.
- Be warm, professional, and concise. Keep your responses short — do not over-explain.
- If the candidate asks to stop, end the interview, or says they want to leave, immediately say a brief professional farewell and end the call. Do not ask why or try to continue.
- Do not use filler phrases like "That's a great question!" or "Excellent answer!". Keep acknowledgements natural and minimal.
- Stay fully focused on the interview. Do not go off-topic.`;

      if (questionList.length === 0) {
        console.warn("No pre-defined questions found — AI will generate questions dynamically.");

        systemContent = `You are a professional AI interviewer at a reputed tech company.

ROLE: ${jobPosition}
JOB DESCRIPTION: ${jobDescription}
REQUIRED SKILLS: ${skills}
NUMBER OF QUESTIONS: ${numberOfQuestions}

Your task:
1. Prepare ${numberOfQuestions} strong, relevant interview questions for a ${jobPosition} candidate covering the required skills.
2. Ask them one by one. After the candidate answers, acknowledge briefly and ask the next question.
3. After all questions are completed, thank the candidate professionally and end the interview.

${sharedRules}`;

        firstMessage = `Hi ${candidateName}, thanks for joining today. I'm your interviewer for the ${jobPosition} position. We'll go through a few questions — take your time with each answer. Shall we begin?`;
      } else {
        systemContent = `You are a professional AI interviewer at a reputed tech company.

INTERVIEW QUESTIONS (ask one by one in order):
${questionList.map((q, i) => `${i + 1}. ${q}`).join("\n")}

After all questions are completed, thank the candidate professionally and end the interview.

${sharedRules}`;

        firstMessage = `Hi ${candidateName}, thanks for joining today. I'm your interviewer for the ${jobPosition} position. We'll go through a few questions — take your time with each answer. Shall we begin?`;
      }
    }

    vapi.start({
      name: "AI Recruiter",
      firstMessage,
      transcriber: null,
      voice: { provider: "vapi", voiceId: "Neha", speed: 0.95, fillerInjectionEnabled: true },
      model: {
        provider: "openai",
        model: "gpt-4-turbo",
        messages: [{ role: "system", content: systemContent }],
        temperature: 0.8,
        maxTokens: 350,
      },
      endCallMessage: "Thank you for the interview! We'll be in touch soon. Have a great day!",
    });
  }, [vapi, interviewInfo, isResumeInterview, resumeData]);

  /* ── Generate feedback then navigate ─────────────────────────────────── */
  const generateFeedback = useCallback(async () => {
    setIsGeneratingFeedback(true);
    try {
      const conversation = conversationRef.current;
      if (conversation.length === 0) { navigate(`/user/${interview_id}/assessment-complete`); return; }

      const result = await fetch("/api/ai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation }),
      });
      const data = await result.json();
      const content = data?.content?.replace("```json", "").replace("```", "");
      if (content) {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: interviewInfo?.username,
            userEmail: interviewInfo?.userEmail,
            interview_id,
            feedback: JSON.parse(content),
          }),
        });
        await fetch("/api/behavior", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interview_id,
            userName: interviewInfo?.username,
            userEmail: interviewInfo?.userEmail,
            behaviorReport: behaviorTrackerRef.current.getReport(),
          }),
        }).catch(console.error);
      }
      toast.success("Feedback generated!");
    } catch (e) { console.error(e); }
    finally {
      setIsGeneratingFeedback(false);
      navigate(`/user/${interview_id}/assessment-complete`);
    }
  }, [interview_id, navigate, interviewInfo]);

  /* ── Call-end triggers feedback ──────────────────────────────────────── */
  useEffect(() => {
    if (!vapi) return;
    const handler = () => { setIsCallActive(false); setIsSpeaking(false); generateFeedback(); };
    vapi.on("call-end", handler);
    return () => vapi.off("call-end", handler);
  }, [vapi, generateFeedback]);

  /* ── Controls ─────────────────────────────────────────────────────────── */
  const stopInterview = () => {
    setIsCallActive(false);
    try { vapi?.stop(); } catch (e) {}
    toast("Interview stopped");
  };

  const handleJoin = () => {
    setScreen("spotlight");
    startCall();
  };

  const handleEndCall = () => {
    stopInterview();
    setScreen("lobby");
    setElapsed(0);
  };

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !micOn; });
    setMicOn(v => !v);
  };

  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !camOn; });
    setCamOn(v => !v);
  };

  /* ── Formatters ───────────────────────────────────────────────────────── */
  const formatElapsed = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const formatTimeLeft = (s: number) => {
    if (isNaN(s) || s < 0) return "00:00";
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };

  const formatClock = (d: Date) => {
    let h = d.getHours(), m = d.getMinutes();
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, "0")} ${ap}`;
  };

  const formatDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  /* ── Loading / feedback screens ──────────────────────────────────────── */
  if (loading || !interviewInfo) return (
    <div className="h-screen bg-[#050A24] flex items-center justify-center">
      <Loader2 className="animate-spin h-8 w-8 text-[#2D55FB]" />
      <span className="ml-3 text-white text-lg">Preparing Interview...</span>
    </div>
  );

  if (isGeneratingFeedback) return (
    <div className="h-screen bg-[#050A24] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin h-12 w-12 text-[#2D55FB]" />
      <h2 className="text-white text-xl font-bold">Generating Your Feedback...</h2>
      <p className="text-white/40 text-sm">Please wait while our AI analyzes your performance</p>
    </div>
  );

  /* ── Shared bottom controls ──────────────────────────────────────────── */
  const BottomBar = () => (
    <div className="shrink-0 bg-[#070e2b] border-t border-white/5 px-5 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span className="text-white/40 text-sm font-medium whitespace-nowrap">
          {interviewInfo?.position || interviewInfo?.jobPosition || "Interview"}
        </span>
        <div className="w-px h-5 bg-white/15" />
        <span className={`font-bold text-sm whitespace-nowrap ${timeLeft < 60 ? "text-red-400 animate-pulse" : "text-[#2D55FB]"}`}>
          ⏱ {formatTimeLeft(timeLeft)}
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <CtrlBtn onClick={toggleMic} active={micOn}>
          {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </CtrlBtn>
        <CtrlBtn onClick={toggleCam} active={camOn}>
          {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </CtrlBtn>
        <CtrlBtn>
          <MonitorUp className="h-4 w-4 text-gray-800" />
        </CtrlBtn>
        <CtrlBtn onClick={handleEndCall} danger>
          <PhoneOff className="h-4 w-4" />
        </CtrlBtn>
      </div>
      <div className="min-w-[80px] sm:min-w-[120px] flex justify-end">
        {noFaceWarning && (
          <span className="text-red-400 text-xs font-bold animate-pulse">⚠ No face detected</span>
        )}
        {!noFaceWarning && alertCount > 0 && (
          <span className="text-orange-400 text-xs font-bold">{alertCount}/3 warnings</span>
        )}
      </div>
    </div>
  );

  const username = interviewInfo?.username || "You";

  /* ══════════════════════════════════════════════════════════════════════════
     SCREEN 1 — LOBBY
  ══════════════════════════════════════════════════════════════════════════ */
  if (screen === "lobby") return (
    <div className="h-screen bg-[#050A24] bg-[radial-gradient(ellipse_at_65%_0%,rgba(45,85,251,0.4),transparent_60%),radial-gradient(ellipse_at_0%_100%,rgba(20,40,120,0.4),transparent_60%)] flex flex-col overflow-hidden">
      <video ref={behaviorVidRef} muted playsInline className="hidden" />

      <div className="flex items-center justify-between px-6 sm:px-10 py-5 shrink-0">
        <h1 className="text-white font-bold text-lg sm:text-xl tracking-tight">Vitric IQ</h1>
        <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
          <span>{formatClock(now)}</span>
          <span className="text-white/20 mx-1">|</span>
          <span>{formatDate(now)}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-6 pb-10">
        <motion.div
          className="relative w-full max-w-sm sm:max-w-md lg:max-w-xl xl:max-w-2xl bg-[#0a1035] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50"
          style={{ aspectRatio: "16/9" }}
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }}
        >
          <video
            ref={lobbyVidRef} muted playsInline
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
            <motion.button onClick={toggleMic} className={`w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur transition-all ${micOn ? "bg-white/15 border-white/25 text-white hover:bg-white/25" : "bg-red-500 border-red-400 text-white"}`} whileTap={{ scale: 0.9 }}>
              {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </motion.button>
            <motion.button onClick={toggleCam} className={`w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur transition-all ${camOn ? "bg-white/15 border-white/25 text-white hover:bg-white/25" : "bg-red-500 border-red-400 text-white"}`} whileTap={{ scale: 0.9 }}>
              {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-5"
          initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
        >
          <h2 className="text-white text-2xl sm:text-3xl font-semibold">Ready to Join?</h2>
          <p className="text-white/40 text-sm text-center max-w-xs">
            {interviewInfo?.position || interviewInfo?.jobPosition || "Interview"} • {interviewInfo?.duration || "N/A"}
          </p>
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
            className="px-10 py-3 bg-[#2D55FB] hover:bg-[#1e3fd4] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-[#2D55FB]/30"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          >
            Join Interview
          </motion.button>
        </motion.div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     SCREEN 2 — SPOTLIGHT VIEW
  ══════════════════════════════════════════════════════════════════════════ */
  if (screen === "spotlight") return (
    <div className="h-screen bg-[#070e2b] flex flex-col overflow-hidden">
      <video ref={behaviorVidRef} muted playsInline className="hidden" />

      <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#070e2b] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-sm">Time :</span>
          <span className="text-[#2D55FB] font-mono font-bold text-sm tracking-widest">{formatElapsed(elapsed)}</span>
          {isCallActive && <div className="flex items-center gap-1.5 ml-3 text-green-400 text-xs font-bold"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />LIVE</div>}
        </div>
        <motion.button
          onClick={() => setScreen("grid")}
          className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-medium transition-colors"
          whileTap={{ scale: 0.94 }}
        >
          Grid View
          <div className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <LayoutGrid className="h-4 w-4 text-white" />
          </div>
        </motion.button>
      </div>

      <div className="flex flex-1 min-h-0 gap-2.5 px-2.5 pb-2 pt-1">
        <div className="w-44 sm:w-52 shrink-0 flex flex-col gap-2">
          {/* ── User PiP tile — uses stable callback ref ── */}
          <div className="relative rounded-xl overflow-hidden bg-[#0d1535] border border-white/5 shrink-0" style={{ aspectRatio: "4/3" }}>
            <UserVideo
              streamRef={streamRef}
              camOn={camOn}
              streamReady={streamReady}
              username={username}
              onVideoMount={onSpotlightVideoMount}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2.5 z-10">
              <span className="text-white text-xs font-semibold drop-shadow">{username}</span>
            </div>
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
                {isListening && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />}
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">{userSub}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
          <AIAvatarTile isSpeaking={isSpeaking} isCallActive={isCallActive} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
            <AudioWave active={isSpeaking} />
          </div>
          <div className="absolute bottom-4 left-5 z-10">
            <span className="text-white font-medium text-sm">AI Recruiter</span>
          </div>
          {isCallActive && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-bold z-10">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />REC
            </div>
          )}
        </div>
      </div>

      <BottomBar />
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     SCREEN 3 — GRID VIEW
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="h-screen bg-[#070e2b] flex flex-col overflow-hidden">
      <video ref={behaviorVidRef} muted playsInline className="hidden" />

      <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#070e2b] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-sm">Time :</span>
          <span className="text-[#2D55FB] font-mono font-bold text-sm tracking-widest">{formatElapsed(elapsed)}</span>
          {isCallActive && <div className="flex items-center gap-1.5 ml-3 text-green-400 text-xs font-bold"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />LIVE</div>}
        </div>
        <motion.button
          onClick={() => setScreen("spotlight")}
          className="flex items-center gap-2 text-white/80 hover:text-white text-xs font-medium transition-colors"
          whileTap={{ scale: 0.94 }}
        >
          Spotlight View
          <div className="w-7 h-7 rounded-lg bg-[#2D55FB] flex items-center justify-center shadow-md shadow-[#2D55FB]/30">
            <LayoutGrid className="h-4 w-4 text-white" />
          </div>
        </motion.button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-6 pt-2 pb-1 gap-0">
        <div className="flex gap-4 sm:gap-5" style={{ flex: "0 0 auto", height: "clamp(200px, 58vh, 420px)" }}>

          {/* ── User tile — uses stable callback ref ── */}
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
            <div className="absolute bottom-4 left-4 z-10">
              <span className="text-white font-semibold text-base drop-shadow">{username}</span>
            </div>
            {isListening && (
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-1.5 bg-blue-600/80 text-white px-2 py-1 rounded-full text-xs font-bold">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />Speaking
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
            <AIAvatarTile isSpeaking={isSpeaking} isCallActive={isCallActive} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-12 right-3 z-10"><AudioWave active={isSpeaking} /></div>
            <div className="absolute bottom-4 left-4 z-10">
              <span className="text-white font-semibold text-base drop-shadow">AI Recruiter</span>
            </div>
            {isSpeaking && (
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-1.5 bg-green-600/80 text-white px-2 py-1 rounded-full text-xs font-bold">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />Speaking
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 sm:gap-5 mt-3" style={{ flex: "0 0 auto" }}>
          <div className="flex-1 flex items-start justify-center">
            <p className="text-white/65 text-sm text-center leading-snug max-w-xs">{userSub}</p>
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