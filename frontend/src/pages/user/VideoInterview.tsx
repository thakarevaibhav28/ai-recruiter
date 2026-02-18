import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, LayoutGrid, MonitorUp, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Screen = "lobby" | "spotlight" | "grid";

/* ── Waveform ─────────────────────────────────────────────────────────────── */
const WaveBar = ({ delay }: { delay: number }) => (
  <motion.span
    className="inline-block w-0.75 rounded-full bg-white/80 mx-[1.5px]"
    style={{ minHeight: 3 }}
    animate={{ height: ["3px", "14px", "5px", "18px", "3px"] }}
    transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const AudioWave = () => (
  <div className="flex items-center px-2.5 py-1.5 bg-[#2D55FB] rounded-full shadow-lg shadow-[#2D55FB]/40">
    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mr-1.5 shrink-0">
      <span className="flex gap-0.5">
        <span className="w-0.75 h-2.25 bg-white rounded-sm block" />
        <span className="w-0.75 h-2.25 bg-white rounded-sm block" />
      </span>
    </div>
    {[0, 0.07, 0.14, 0.21, 0.1, 0.28, 0.05, 0.18, 0.12, 0.24, 0.08, 0.2, 0.16].map((d, i) => (
      <WaveBar key={i} delay={d} />
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


const VideoInterview: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("lobby");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [elapsed, setElapsed] = useState(248);
  const [streamReady, setStreamReady] = useState(false);
  const [now, setNow] = useState(new Date());

  // subtitle simulation
  const [avatarSub, setAvatarSub] = useState("Great! Let's start with a quick introduction. Please tell me a bit about yourself");
  const [userSub, setUserSub] = useState("I'm a software developer with 2 years of experience in full-stack development");

  // We keep ONE stream; mirror it to all video elements
  const streamRef = useRef<MediaStream | null>(null);
  // refs for each video element
  const lobbyVidRef = useRef<HTMLVideoElement>(null);
  const spotlightPipRef = useRef<HTMLVideoElement>(null);
  const gridUserRef = useRef<HTMLVideoElement>(null);

  const attachStream = useCallback((ref: React.RefObject<HTMLVideoElement>) => {
    if (ref.current && streamRef.current) {
      ref.current.srcObject = streamRef.current;
      ref.current.play().catch(() => {});
    }
  }, []);

  /* Start camera once on mount */
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
      } catch (e) {
        console.warn("Camera not available", e);
      }
    })();
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  /* Re-attach stream whenever screen changes */
  useEffect(() => {
    if (!streamRef.current) return;
    if (screen === "lobby") attachStream(lobbyVidRef);
    if (screen === "spotlight") attachStream(spotlightPipRef);
    if (screen === "grid") attachStream(gridUserRef);
  }, [screen, attachStream]);

  /* Clock */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* Interview timer */
  useEffect(() => {
    if (screen === "lobby") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [screen]);

  const formatElapsed = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const formatClock = (d: Date) => {
    let h = d.getHours(), m = d.getMinutes();
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, "0")} ${ap}`;
  };

  const formatDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !micOn; });
    setMicOn((v) => !v);
  };

  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !camOn; });
    setCamOn((v) => !v);
  };

  const handleJoin = () => setScreen("spotlight");
  const handleEndCall = () => { setScreen("lobby"); setElapsed(248); };

  /* ── User video tile helper ──────────────────────────────────────────────── */
  const UserVideo = ({
    vidRef, showName = true,
  }: { vidRef: React.RefObject<HTMLVideoElement>; showName?: boolean }) => (
    <>
      <video
        ref={vidRef}
        muted playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-100" : "opacity-0"}`}
        style={{ transform: "scaleX(-1)" }} // mirror like a selfie
      />
      {(!camOn || !streamReady) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a5e] to-[#060c25]">
          <div className="w-16 h-16 rounded-full bg-[#2D55FB]/20 border border-[#2D55FB]/30 flex items-center justify-center mb-2">
            {streamReady ? <VideoOff className="h-8 w-8 text-[#2D55FB]/60" /> : <User className="h-8 w-8 text-[#2D55FB]/50" />}
          </div>
          <span className="text-white/30 text-xs">{streamReady ? "Camera Off" : "Rohan"}</span>
        </div>
      )}
    </>
  );

  /* ── Shared bottom controls ──────────────────────────────────────────────── */
  const BottomBar = () => (
    <div className="shrink-0 bg-[#070e2b] border-t border-white/5 px-5 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span className="text-white/40 text-sm font-medium whitespace-nowrap">10 Questions</span>
        <div className="w-px h-5 bg-white/15" />
        <span className="text-white font-bold text-xl sm:text-2xl whitespace-nowrap">30 Min</span>
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
      <div className="min-w-[80px] sm:min-w-[120px]" />
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     SCREEN 1 — LOBBY
  ══════════════════════════════════════════════════════════════════════════ */
  if (screen === "lobby") return (
    <div className="h-screen bg-[#050A24] bg-[radial-gradient(ellipse_at_65%_0%,rgba(45,85,251,0.4),transparent_60%),radial-gradient(ellipse_at_0%_100%,rgba(20,40,120,0.4),transparent_60%)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 sm:px-10 py-5 shrink-0">
        <h1 className="text-white font-bold text-lg sm:text-xl tracking-tight">Vitric IQ</h1>
        <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
          <span>{formatClock(now)}</span>
          <span className="text-white/20 mx-1">|</span>
          <span>{formatDate(now)}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-6 pb-10">
        {/* Camera preview */}
        <motion.div
          className="relative w-full max-w-sm sm:max-w-md lg:max-w-xl xl:max-w-2xl bg-[#0a1035] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50"
          style={{ aspectRatio: "16/9" }}
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }}
        >
          {/* Live camera */}
          <video
            ref={lobbyVidRef}
            muted playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-100" : "opacity-0"}`}
            style={{ transform: "scaleX(-1)" }}
          />
          {/* Fallback */}
          {(!camOn || !streamReady) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a5e] to-[#050A24] gap-3">
              <div className="w-20 h-20 rounded-full bg-[#2D55FB]/20 border border-[#2D55FB]/30 flex items-center justify-center">
                {streamReady ? <VideoOff className="h-10 w-10 text-[#2D55FB]/60" /> : <User className="h-10 w-10 text-[#2D55FB]/50" />}
              </div>
              <span className="text-white/30 text-sm">{streamReady ? "Camera off" : "Waiting for camera…"}</span>
            </div>
          )}
          {/* Mic + Cam controls */}
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <motion.button
              onClick={toggleMic}
              className={`w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur transition-all ${micOn ? "bg-white/15 border-white/25 text-white hover:bg-white/25" : "bg-red-500 border-red-400 text-white"}`}
              whileTap={{ scale: 0.9 }}
            >
              {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </motion.button>
            <motion.button
              onClick={toggleCam}
              className={`w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur transition-all ${camOn ? "bg-white/15 border-white/25 text-white hover:bg-white/25" : "bg-red-500 border-red-400 text-white"}`}
              whileTap={{ scale: 0.9 }}
            >
              {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </motion.button>
          </div>
        </motion.div>

        {/* Join panel */}
        <motion.div
          className="flex flex-col items-center gap-5"
          initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
        >
          <h2 className="text-white text-2xl sm:text-3xl font-semibold">Ready to Join ?</h2>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-700 border-2 border-[#2D55FB] flex items-center justify-center shadow-lg">
              <User className="h-6 w-6 text-white/80" />
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-orange-400 flex items-center justify-center -ml-3 shadow-lg">
              <User className="h-6 w-6 text-white/80" />
            </div>
          </div>
          <p className="text-white/50 text-sm -mt-2">Rohan and Aavtar</p>
          <motion.button
            onClick={handleJoin}
            className="px-10 py-3 bg-[#2D55FB] hover:bg-[#1e3fd4] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-[#2D55FB]/30"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          >
            Join
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
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#070e2b] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-sm">Time :</span>
          <span className="text-[#2D55FB] font-mono font-bold text-sm tracking-widest">{formatElapsed(elapsed)}</span>
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

      {/* Main area */}
      <div className="flex flex-1 min-h-0 gap-2.5 px-2.5 pb-2 pt-1">
        {/* Left: PiP + transcript */}
        <div className="w-44 sm:w-52 shrink-0 flex flex-col gap-2">
          {/* User PiP */}
          <div
            className="relative rounded-xl overflow-hidden bg-[#0d1535] border border-white/5 shrink-0"
            style={{ aspectRatio: "4/3" }}
          >
            <UserVideo vidRef={spotlightPipRef} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2.5 z-10">
              <span className="text-white text-xs font-semibold drop-shadow">Rohan</span>
            </div>
            <div className="absolute bottom-2 right-2.5 z-10">
              <MicCircle muted={!micOn} />
            </div>
          </div>

          {/* Transcript cards */}
          <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
            <div className="bg-[#0e1640]/90 rounded-xl p-3 border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#7a9cff] text-[11px] font-semibold">Avatar:</span>
                <button className="text-gray-600 hover:text-gray-400 text-xs leading-none">✕</button>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">{avatarSub}</p>
            </div>
            <div className="bg-[#0e1640]/90 rounded-xl p-3 border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#7a9cff] text-[11px] font-semibold">Candidate (You):</span>
                <button className="text-gray-600 hover:text-gray-400 text-xs leading-none">✕</button>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">{userSub}</p>
            </div>
          </div>
        </div>

        {/* Main avatar feed */}
        <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&q=85"
            alt="Avatar"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          {/* Audio wave */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
            <AudioWave />
          </div>
          {/* Name */}
          <div className="absolute bottom-4 left-5 z-10">
            <span className="text-white font-medium text-sm">Avatar</span>
          </div>
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
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#070e2b] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-sm">Time :</span>
          <span className="text-[#2D55FB] font-mono font-bold text-sm tracking-widest">{formatElapsed(elapsed)}</span>
        </div>
        <motion.button
          onClick={() => setScreen("spotlight")}
          className="flex items-center gap-2 text-white/80 hover:text-white text-xs font-medium transition-colors"
          whileTap={{ scale: 0.94 }}
        >
          Grid View
          <div className="w-7 h-7 rounded-lg bg-[#2D55FB] flex items-center justify-center shadow-md shadow-[#2D55FB]/30">
            <LayoutGrid className="h-4 w-4 text-white" />
          </div>
        </motion.button>
      </div>

      {/* Grid tiles area + subtitles */}
      <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-6 pt-2 pb-1 gap-0">

        {/* Two video tiles */}
        <div className="flex gap-4 sm:gap-5" style={{ flex: "0 0 auto", height: "clamp(200px, 58vh, 420px)" }}>

          {/* Rohan tile */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
            {/* Portrait bg fallback */}
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=85"
              alt="Rohan"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-0" : "opacity-100"}`}
            />
            {/* Live camera */}
            <video
              ref={gridUserRef}
              muted playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${camOn && streamReady ? "opacity-100" : "opacity-0"}`}
              style={{ transform: "scaleX(-1)" }}
            />
            {/* Cam off overlay */}
            {(!camOn || !streamReady) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a5e]/80 to-[#060c25]/80">
                <div className="w-14 h-14 rounded-full bg-[#2D55FB]/20 border border-[#2D55FB]/30 flex items-center justify-center mb-2">
                  {streamReady ? <VideoOff className="h-7 w-7 text-[#2D55FB]/60" /> : <User className="h-7 w-7 text-[#2D55FB]/50" />}
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
            {/* Mic badge */}
            <div className="absolute bottom-12 right-3 z-10">
              <MicCircle muted={!micOn} />
            </div>
            {/* Name */}
            <div className="absolute bottom-4 left-4 z-10">
              <span className="text-white font-semibold text-base drop-shadow">Rohan</span>
            </div>
          </div>

          {/* Avatar tile */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#0d1535] border border-white/5">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&q=85"
              alt="Avatar"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
            {/* Audio wave */}
            <div className="absolute bottom-12 right-3 z-10">
              <AudioWave />
            </div>
            {/* Name */}
            <div className="absolute bottom-4 left-4 z-10">
              <span className="text-white font-semibold text-base drop-shadow">Avatar</span>
            </div>
          </div>
        </div>

        {/* ── Subtitle strip ── */}
        <div className="flex gap-4 sm:gap-5 mt-3" style={{ flex: "0 0 auto" }}>
          {/* User subtitle */}
          <div className="flex-1 flex items-start justify-center">
            <p className="text-white/65 text-sm text-center leading-snug max-w-xs">
              {userSub}
            </p>
          </div>
          {/* Avatar subtitle */}
          <div className="flex-1 flex items-start justify-center">
            <p className="text-white/65 text-sm text-center leading-snug max-w-xs">
              {avatarSub}
            </p>
          </div>
        </div>

        {/* Remaining space to push bar down */}
        <div className="flex-1" />
      </div>

      <BottomBar />
    </div>
  );
};

export default VideoInterview;