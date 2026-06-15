// Pure UI components: no Vapi, no face-api, no state logic.

import React, { useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  User,
  Loader2,
  ShieldAlert,
  AlertTriangle,
  UserX,
} from "lucide-react";
import { motion } from "framer-motion";

// ─── CONSTANTS (shared) ───────────────────────────────────────────────────────
export const MAX_VIOLATIONS = 5;

export const VIOLATION_MSGS: Record<
  string,
  { title: string; body: (r: number) => string; spoken: string }
> = {
  "tab-switch": {
    title: "Tab Switch Detected",
    body: (r) =>
      r > 0
        ? `You navigated away. ${r} warning(s) remaining before automatic submission.`
        : `Maximum warnings reached. Interview will be submitted on completion.`,
    spoken: "I noticed you switched tabs. Please stay on the interview window.",
  },
  "camera-off": {
    title: "Camera Turned Off",
    body: (r) =>
      r > 0
        ? `Keep camera on. ${r} warning(s) remaining before automatic submission.`
        : `Maximum warnings reached. Interview will be submitted on completion.`,
    spoken:
      "Please turn your camera back on. Camera must remain on throughout the interview.",
  },
  "no-face": {
    title: "Face Not Detected",
    body: (r) =>
      r > 0
        ? `Sit in front of the camera. ${r} warning(s) remaining before automatic submission.`
        : `Maximum warnings reached. Interview will be submitted on completion.`,
    spoken:
      "I can't see your face. Please sit directly in front of the camera.",
  },
  "multiple-faces": {
    title: "Multiple People Detected",
    body: (r) =>
      r > 0
        ? `Only the candidate should be visible. ${r} warning(s) remaining.`
        : `Maximum warnings reached. Interview will be submitted on completion.`,
    spoken: "Multiple people detected. Only the candidate should be visible.",
  },
  "looking-away": {
    title: "Looking Away Detected",
    body: (r) =>
      r > 0
        ? `Please look at the screen. ${r} warning(s) remaining.`
        : `Maximum warnings reached. Interview will be submitted on completion.`,
    spoken: "Please look at the screen and face the camera.",
  },
  "eyes-closed": {
    title: "Eyes Closed / Drowsy",
    body: (r) =>
      r > 0
        ? `Please stay attentive. ${r} warning(s) remaining.`
        : `Maximum warnings reached. Interview will be submitted on completion.`,
    spoken: "Your eyes appear closed. Please stay attentive.",
  },
  "fullscreen-exit": {
    title: "Fullscreen Exited",
    body: (r) =>
      r > 0
        ? `Stay in fullscreen. ${r} warning(s) remaining.`
        : `Maximum warnings reached. Interview will be submitted on completion.`,
    spoken: "Please keep the interview in fullscreen mode.",
  },
  "person-substitution": {
    title: "Identity Mismatch Detected",
    body: (r) =>
      r > 0
        ? `The person in front of the camera does not match the registered candidate. ${r} warning(s) remaining.`
        : `Maximum warnings reached. Interview flagged for review.`,
    spoken:
      "The face in front of the camera does not match the registered candidate. Only the original candidate may complete this interview.",
  },
  "id-mismatch": {
    title: "ID Mismatch Error",
    body: (_r) =>
      `Different person detected. Only the registered candidate can proceed with this interview.`,
    spoken:
      "Different person detected. Only the registered candidate can proceed with this interview.",
  },
};

// ─── TYPES ───────────────────────────────────────────────────────────────────
export type TurnState =
  | "ai-speaking"
  | "user-turn"
  | "user-speaking"
  | "processing"
  | "idle";

export interface AlertState {
  type: string;
  count: number;
  title: string;
  body: string;
}

// ─── WaveBar ──────────────────────────────────────────────────────────────────
export const WaveBar = ({ delay, active }: { delay: number; active: boolean }) => (
  <motion.span
    className="inline-block w-0.75 rounded-full bg-white/80 mx-[1.5px]"
    style={{ minHeight: 3 }}
    animate={
      active
        ? { height: ["3px", "14px", "5px", "18px", "3px"] }
        : { height: "3px" }
    }
    transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

// ─── AudioWave ────────────────────────────────────────────────────────────────
export const AudioWave = ({ active = true }: { active?: boolean }) => (
  <div
    className={`flex items-center px-2.5 py-1.5 rounded-full shadow-lg transition-all ${active ? "bg-[#2D55FB] shadow-[#2D55FB]/40" : "bg-white/10"}`}
  >
    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mr-1.5 shrink-0">
      <span className="flex gap-0.5">
        <span className="w-0.75 h-2.25 bg-white rounded-sm block" />
        <span className="w-0.75 h-2.25 bg-white rounded-sm block" />
      </span>
    </div>
    {[
      0, 0.07, 0.14, 0.21, 0.1, 0.28, 0.05, 0.18, 0.12, 0.24, 0.08, 0.2, 0.16,
    ].map((d, i) => (
      <WaveBar key={i} delay={d} active={active} />
    ))}
  </div>
);

// ─── MicCircle ────────────────────────────────────────────────────────────────
export const MicCircle = ({ muted }: { muted: boolean }) => (
  <div
    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${muted ? "bg-red-500 shadow-red-500/40" : "bg-[#2D55FB] shadow-[#2D55FB]/40"}`}
  >
    {muted ? (
      <MicOff className="h-4 w-4 text-white" />
    ) : (
      <Mic className="h-4 w-4 text-white" />
    )}
  </div>
);

// ─── CtrlBtn ──────────────────────────────────────────────────────────────────
export const CtrlBtn = ({
  onClick,
  active = true,
  danger = false,
  children,
}: {
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.88 }}
    className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-colors ${danger ? "bg-red-500 hover:bg-red-400 text-white shadow-red-500/40" : active ? "bg-white hover:bg-gray-100 text-gray-800" : "bg-white text-red-500"}`}
  >
    {children}
  </motion.button>
);

// ─── UserVideo ────────────────────────────────────────────────────────────────
export const UserVideo = React.memo(
  ({
    camOn,
    streamReady,
    username,
    onVideoMount,
  }: {
    camOn: boolean;
    streamReady: boolean;
    username: string;
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
            {streamReady ? (
              <VideoOff className="h-8 w-8 text-[#2D55FB]/60" />
            ) : (
              <User className="h-8 w-8 text-[#2D55FB]/50" />
            )}
          </div>
          <span className="text-white/30 text-xs">
            {streamReady ? "Camera Off" : username}
          </span>
        </div>
      )}
    </>
  ),
);

// ─── ViolationModal ───────────────────────────────────────────────────────────


export const ViolationToast = React.memo(
  ({ alert, onClose }: { alert: AlertState; onClose: () => void }) => {
    const atMax = alert.count >= MAX_VIOLATIONS;
    const firedRef = useRef(false);
    const safeClose = useCallback(() => {
      if (firedRef.current) return;
      firedRef.current = true;
      onClose();
    }, [onClose]);

    useEffect(() => {
      const t = setTimeout(safeClose, atMax ? 5000 : 8000);
      return () => clearTimeout(t);
    }, [safeClose, atMax]);

    const isPersonSwap = alert.type === "person-substitution";
    const color = atMax ? "#ef4444" : isPersonSwap ? "#f97316" : "#f59e0b";

    return (
      <div
        style={{
          position: "fixed",
          top: 72,
          right: 16,
          zIndex: 9999,
          width: 272,
          borderRadius: 10,
          border: `1px solid ${color}44`,
          background: "rgba(7,14,43,0.96)",
          backdropFilter: "blur(10px)",
          overflow: "hidden",
          animation: "toastIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}@keyframes shrink{from{width:100%}to{width:0%}}`}</style>

        {/* top accent line */}
        <div style={{ height: 3, background: color }} />

        <div style={{ padding: "10px 12px 8px" }}>
          {/* header row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            {/* icon */}
            <div
              style={{
                width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                background: `${color}22`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {atMax
                ? <ShieldAlert size={14} color={color} />
                : isPersonSwap
                  ? <UserX size={14} color={color} />
                  : <AlertTriangle size={14} color={color} />}
            </div>

            {/* title */}
            <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", flex: 1, lineHeight: 1.3, margin: 0 }}>
              {atMax ? "Max Warnings Reached" : alert.title}
            </p>

            {/* warning count badge */}
            <span
              style={{
                fontSize: 11, fontWeight: 700,
                color: color,
                background: `${color}18`,
                border: `1px solid ${color}44`,
                borderRadius: 99,
                padding: "2px 8px",
                whiteSpace: "nowrap",
                letterSpacing: "0.02em",
              }}
            >
              {alert.count}/{MAX_VIOLATIONS}
            </span>
          </div>

          {/* body */}
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.45, margin: "0 0 8px" }}>
            {alert.body}
          </p>

          {/* pip dots */}
          <div style={{ display: "flex", gap: 3 }}>
            {[...Array(MAX_VIOLATIONS)].map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1, height: 3, borderRadius: 99,
                  background: i < alert.count ? color : "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* shrinking progress bar */}
        <div
          style={{
            height: 2,
            background: `${color}55`,
            animation: `shrink ${atMax ? 5 : 8}s linear forwards`,
          }}
        />
      </div>
    );
  },
);

// ─── TurnIndicator ────────────────────────────────────────────────────────────
export const TurnIndicator = ({
  turnState,
  pauseCountdown,
}: {
  turnState: TurnState;
  pauseCountdown: number;
}) => {
  if (turnState === "ai-speaking") {
    return (
      <div className="flex items-center gap-1.5 bg-emerald-600/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
        <div className="flex gap-0.5 items-center">
          {[0, 0.08, 0.16].map((d, i) => (
            <motion.div
              key={i}
              className="w-0.5 h-3 bg-white rounded-full"
              animate={{ scaleY: [0.4, 1, 0.4] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: d }}
            />
          ))}
        </div>
        AI Speaking
      </div>
    );
  }
  if (turnState === "user-speaking") {
    return (
      <div className="flex items-center gap-1.5 bg-blue-600/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
        <div className="flex gap-0.5 items-center">
          {[0, 0.08, 0.16].map((d, i) => (
            <motion.div
              key={i}
              className="w-0.5 h-3 bg-white rounded-full"
              animate={{ scaleY: [0.4, 1, 0.4] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: d }}
            />
          ))}
        </div>
        You're Speaking
      </div>
    );
  }
  if (turnState === "user-turn") {
    return (
      <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-400/40 backdrop-blur-sm text-blue-300 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        Your Turn to Respond
        {pauseCountdown > 0 && (
          <span className="text-blue-400/70 text-[10px]">
            ({pauseCountdown}s)
          </span>
        )}
      </div>
    );
  }
  if (turnState === "processing") {
    return (
      <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white/50 px-3 py-1.5 rounded-full text-xs">
        <Loader2 className="w-3 h-3 animate-spin" />
        Processing…
      </div>
    );
  }
  return null;
};