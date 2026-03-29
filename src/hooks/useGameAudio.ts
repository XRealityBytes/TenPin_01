/**
 * useGameAudio — thin Web Audio wrapper for game sound effects and announcements.
 *
 * Preloads audio clips on mount. Provides play('strike'), play('gutter-thud'),
 * etc. Supports mute toggle (default: muted until user interacts).
 * Respects prefers-reduced-motion. Lazy-loaded per route.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { AudioName } from "@/lib/assets";

/** All audio clips and their paths. */
const AUDIO_CLIPS: Record<AudioName, string> = {
  "ball-roll": "/assets/generated/audio/ball-roll.mp3",
  "pin-strike": "/assets/generated/audio/pin-strike.mp3",
  "spare-hit": "/assets/generated/audio/spare-hit.mp3",
  "gutter-thud": "/assets/generated/audio/gutter-thud.mp3",
  "pin-wobble": "/assets/generated/audio/pin-wobble.mp3",
  "ui-tap": "/assets/generated/audio/ui-tap.mp3",
  "announce-strike": "/assets/generated/audio/announce-strike.mp3",
  "announce-spare": "/assets/generated/audio/announce-spare.mp3",
  "announce-gutter": "/assets/generated/audio/announce-gutter.mp3",
  "announce-gameover": "/assets/generated/audio/announce-gameover.mp3",
  "announce-newframe": "/assets/generated/audio/announce-newframe.mp3",
};

interface GameAudio {
  /** Play a named audio clip. No-op if muted or clip not loaded. */
  play: (name: AudioName) => void;
  /** Whether audio is currently muted. */
  isMuted: boolean;
  /** Toggle mute state. */
  toggleMute: () => void;
  /** Whether audio is ready (context started, clips preloaded). */
  isReady: boolean;
}

export function useGameAudio(): GameAudio {
  const [isMuted, setIsMuted] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);
  const buffers = useRef(new Map<string, AudioBuffer>());
  const prefersReduced = useRef(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReduced.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReduced.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Lazy-init audio context + preload clips
  useEffect(() => {
    if (isMuted) return;

    const ctx = new AudioContext();
    audioCtx.current = ctx;

    const loadClip = async (name: string, url: string) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const arrayBuf = await res.arrayBuffer();
        const audioBuf = await ctx.decodeAudioData(arrayBuf);
        buffers.current.set(name, audioBuf);
      } catch {
        // clip not available — silent fallback
      }
    };

    Promise.all(
      Object.entries(AUDIO_CLIPS).map(([name, url]) => loadClip(name, url)),
    ).then(() => setIsReady(true));

    return () => {
      ctx.close();
      audioCtx.current = null;
      buffers.current.clear();
      setIsReady(false);
    };
  }, [isMuted]);

  const play = useCallback(
    (name: AudioName) => {
      if (isMuted || prefersReduced.current) return;
      const ctx = audioCtx.current;
      const buffer = buffers.current.get(name);
      if (!ctx || !buffer) return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    },
    [isMuted],
  );

  const toggleMute = useCallback(() => {
    setIsMuted((m) => !m);
  }, []);

  return { play, isMuted, toggleMute, isReady };
}
