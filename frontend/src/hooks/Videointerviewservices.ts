// All non-UI logic: HeyGen, GanAI, face-api loading, BehaviorTracker,
// fullscreen helpers, EAR calculation, and voice config.


import React from "react";
import * as faceapi from "@vladmandic/face-api";

// ─── FACE-API MODEL LOADING ───────────────────────────────────────────────────
const FACE_MODEL_URL =
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
let faceModelsLoaded = false;

export async function loadFaceModels() {
  if (faceModelsLoaded) return;
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(FACE_MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODEL_URL),
  ]);
  faceModelsLoaded = true;
}

// ─── FACE RECOGNITION CONSTANTS ──────────────────────────────────────────────
export const FACE_MATCH_THRESHOLD = 0.5;
export const REFERENCE_SAMPLE_COUNT = 8;
export const PERSON_CHANGE_TICKS = 4;
export const IDENTITY_CHECK_INTERVAL_MS = 5000;

// ─── VOICE CONFIG ─────────────────────────────────────────────────────────────
export const VOICE_CONFIG = {
  female: { voiceId: "Neha", speed: 1 },
  male: { voiceId: "Rohan", speed: 1 },
} as const;

// ─── AVATAR CONFIG ─────────────────────────────────────────────────────────
export const AVATAR_CONFIG = {
  heygen: {
    apiKey: "sk_V2_hgu_kBz4ii8AzWD_oRmNinOC4JiXq8Q8KcOXuKm84nrjnquG",
    avatarId: "a02648040d8140ffbff8157743559a98",
    voiceId: "",
    quality: "high" as const,
  },
  ganai: {
    apiKey: "",
    avatarId: "",
    voiceId: "",
    baseUrl: "https://api.gan.ai",
  },
};

export const USE_HEYGEN =
  !!AVATAR_CONFIG.heygen.apiKey && !!AVATAR_CONFIG.heygen.avatarId;
export const USE_GANAI =
  !USE_HEYGEN && !!AVATAR_CONFIG.ganai.apiKey && !!AVATAR_CONFIG.ganai.avatarId;

// ─── GAN.AI SERVICE ───────────────────────────────────────────────────────────
export const ganAi = {
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

// ─── HEYGEN SERVICE ───────────────────────────────────────────────────────────
export class HeyGenService {
  private avatar: any = null;
  private sessionData: any = null;
  private videoRef: React.RefObject<HTMLVideoElement | null>;
  onStateChange?: (speaking: boolean) => void;
  onStreamReady?: () => void;

  constructor(v: React.RefObject<HTMLVideoElement | null>) {
    this.videoRef = v;
  }

  async init(): Promise<boolean> {
    try {
      const mod = await import("@heygen/streaming-avatar" as any);
      const SA =
        mod.StreamingAvatar ??
        (mod as any).default?.StreamingAvatar ??
        (mod as any).default;
      const SE = mod.StreamingEvents ?? (mod as any).default?.StreamingEvents;
      if (typeof SA !== "function") throw new Error("not a constructor");
      this.avatar = new SA({ token: await this.getToken() });
      this.avatar.on(SE.AVATAR_START_TALKING, () => this.onStateChange?.(true));
      this.avatar.on(SE.AVATAR_STOP_TALKING, () => this.onStateChange?.(false));
      this.avatar.on(SE.STREAM_READY, (ev: any) => {
        if (this.videoRef.current && ev.detail) {
          this.videoRef.current.srcObject = ev.detail;
          this.videoRef.current
            .play()
            .catch(() => {})
            .then(() => this.onStreamReady?.());
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
      console.error("HeyGen:", e);
      return false;
    }
  }

  private async getToken(): Promise<string> {
    const r = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: { "x-api-key": AVATAR_CONFIG.heygen.apiKey },
    });
    return (await r.json())?.data?.token ?? "";
  }

  async speak(text: string) {
    if (!this.avatar || !this.sessionData) return;
    try {
      const mod = await import("@heygen/streaming-avatar" as any);
      const TT = mod.TaskType ?? (mod as any).default?.TaskType;
      await this.avatar.speak({
        sessionId: this.sessionData.session_id,
        text,
        task_type: TT?.REPEAT ?? "repeat",
      });
    } catch {}
  }

  async destroy() {
    try {
      await this.avatar?.stopAvatar();
    } catch {}
    this.avatar = null;
    this.sessionData = null;
  }
}

// ─── BEHAVIOR TRACKER ────────────────────────────────────────────────────────
export class BehaviorTracker {
  events: Array<{ type: string; timestamp: number }> = [];

  addEvent(t: string) {
    this.events.push({ type: t, timestamp: Date.now() });
  }

  getReport() {
    return {
      totalEvents: this.events.length,
      noFaceCount: this.events.filter((e) => e.type === "no_face").length,
      multipleFacesCount: this.events.filter((e) => e.type === "multiple_faces")
        .length,
      lookingAwayCount: this.events.filter((e) => e.type === "looking_away")
        .length,
      eyesClosedCount: this.events.filter((e) => e.type === "eyes_closed")
        .length,
      personSubstitutionCount: this.events.filter(
        (e) => e.type === "person_substitution",
      ).length,
      events: this.events,
    };
  }
}

// ─── EAR (Eye Aspect Ratio) ───────────────────────────────────────────────────
export const edPt = (a: faceapi.Point, b: faceapi.Point) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

export const earVal = (pts: faceapi.Point[]) =>
  pts.length < 6
    ? 1
    : (edPt(pts[1], pts[5]) + edPt(pts[2], pts[4])) /
      (2 * edPt(pts[0], pts[3]));

// ─── FULLSCREEN HELPERS ───────────────────────────────────────────────────────
export const isInFS = () =>
  !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement
  );

export const tryEnterFS = () => {
  try {
    if (!isInFS()) {
      const e = document.documentElement as any;
      (
        e.requestFullscreen ||
        e.webkitRequestFullscreen ||
        e.mozRequestFullScreen
      )?.call(e, { navigationUI: "hide" });
    }
  } catch {}
};

export const tryExitFS = async () => {
  try {
    if (isInFS()) {
      const d = document as any;
      await (
        d.exitFullscreen ||
        d.webkitExitFullscreen ||
        d.mozCancelFullScreen
      )?.call(document);
    }
  } catch {}
};

// ─── DETECTION CONSTANTS ──────────────────────────────────────────────────────
export const TICK_MS = 1000;
export const HARD_TICKS = 3;
export const MULTI_TICKS = 2;
export const EAR_HARD = 0.22;
export const GAZE_HARD = 0.22;
export const MULTI_CONFIDENCE = 0.28;
export const VIOLATION_COOLDOWN_MS = 12000;
export const IDENTITY_VIOLATION_COOLDOWN_MS = 15000;
export const POST_CLOSE_LOCK_MS = 6000;
export const USER_PAUSE_GRACE_MS = 5000;
export const MIN_ANSWER_LENGTH = 15;

// ─── INTERVIEW CONSTANTS ──────────────────────────────────────────────────────
export const SILENCE_THRESHOLD_SEC = 30;
export const MAX_SILENCE_WARNINGS = 5;