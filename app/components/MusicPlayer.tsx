"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "../i18n";

const DEFAULT_VOLUME = 0.7;
const FADE_S = 0.7;
const STORAGE_KEY = "invitation-volume";

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

/**
 * Background music.
 * - Tries to autoplay; browsers usually block sound until the first tap/click, so it then starts on that first touch.
 * - Volume goes through a Web Audio gain node so the slider also works on iPhone (which ignores audio.volume).
 */
export default function MusicPlayer() {
  const { t } = useLang();
  const audioRef = useRef<HTMLAudioElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const pauseTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const wantedRef = useRef(false); // the guest wants music on
  const manualOffRef = useRef(false); // the guest switched it off themselves
  const volumeRef = useRef(DEFAULT_VOLUME);
  const rootRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [volOpen, setVolOpen] = useState(false);

  const ensureGraph = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const audio = audioRef.current;
    if (!audio) return null;
    const Ctx = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination);
    ctxRef.current = ctx;
    gainRef.current = gain;
    return ctx;
  }, []);

  const rampTo = useCallback((to: number, seconds: number) => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) return;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(to, now + seconds);
  }, []);

  /** Starts playback; resolves false when the browser still blocks sound. */
  const start = useCallback(async (): Promise<boolean> => {
    const audio = audioRef.current;
    const ctx = ensureGraph();
    if (!audio || !ctx) return false;
    try {
      if (ctx.state !== "running") await ctx.resume();
      if (ctx.state !== "running") return false;
      if (pauseTimer.current) window.clearTimeout(pauseTimer.current);
      await audio.play();
      wantedRef.current = true;
      setPlaying(true);
      rampTo(volumeRef.current, FADE_S);
      return true;
    } catch {
      return false;
    }
  }, [ensureGraph, rampTo]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    wantedRef.current = false;
    setPlaying(false);
    rampTo(0, FADE_S);
    if (pauseTimer.current) window.clearTimeout(pauseTimer.current);
    pauseTimer.current = window.setTimeout(() => audio.pause(), FADE_S * 1000);
  }, [rampTo]);

  const toggle = useCallback(() => {
    if (wantedRef.current) {
      manualOffRef.current = true;
      stop();
    } else {
      manualOffRef.current = false;
      void start();
    }
  }, [start, stop]);

  const setVolume = useCallback((v: number) => {
    volumeRef.current = v;
    setVolumeState(v);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(v));
    } catch {
      /* storage unavailable */
    }
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (ctx && gain && wantedRef.current) {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(v, now, 0.05);
    }
  }, []);

  // Restore the guest's volume, try to autoplay, and fall back to the first touch/click.
  useEffect(() => {
    try {
      const saved = parseFloat(window.localStorage.getItem(STORAGE_KEY) ?? "");
      if (!Number.isNaN(saved) && saved >= 0 && saved <= 1) {
        volumeRef.current = saved;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- read after mount to avoid a hydration mismatch
        setVolumeState(saved);
      }
    } catch {
      /* storage unavailable */
    }

    let done = false;
    const events: Array<keyof DocumentEventMap> = ["pointerup", "touchend", "click", "keydown"];
    const detach = () => events.forEach((e) => document.removeEventListener(e, onGesture, true));
    async function onGesture(ev: Event) {
      if (done || manualOffRef.current) return;
      if ((ev.target as Element | null)?.closest?.(".music")) return; // the player's own controls decide
      if (await start()) {
        done = true;
        detach();
      }
    }
    events.forEach((e) => document.addEventListener(e, onGesture, true));
    void start().then((ok) => {
      if (ok) {
        done = true;
        detach();
      }
    });
    return detach;
  }, [start]);

  // "Open invitation" is also a real tap.
  useEffect(() => {
    const onOpen = () => {
      if (!wantedRef.current && !manualOffRef.current) void start();
    };
    window.addEventListener("invitation:open", onOpen);
    return () => window.removeEventListener("invitation:open", onOpen);
  }, [start]);

  // Silence while the tab/app is in the background; resume if the guest had it on.
  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) audio.pause();
      else if (wantedRef.current) void audio.play().catch(() => undefined);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // The volume panel closes itself after a moment, or when tapping elsewhere.
  const armClose = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setVolOpen(false), 3500);
  }, []);
  useEffect(() => {
    if (!volOpen) return;
    armClose();
    const onOutside = (e: Event) => {
      if (!rootRef.current?.contains(e.target as Node)) setVolOpen(false);
    };
    document.addEventListener("pointerdown", onOutside);
    return () => {
      document.removeEventListener("pointerdown", onOutside);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, [volOpen, armClose]);

  useEffect(
    () => () => {
      if (pauseTimer.current) window.clearTimeout(pauseTimer.current);
    },
    [],
  );

  const level = volume === 0 ? "off" : volume < 0.45 ? "low" : "high";

  return (
    <div ref={rootRef} className={`music${playing ? " is-playing" : ""}${volOpen ? " vol-open" : ""}`}>
      <audio ref={audioRef} src="/assets/audio/background-music.mp3" loop preload="metadata" />

      <button
        type="button"
        className="music__btn"
        aria-pressed={playing}
        aria-label={playing ? t("music.pause") : t("music.play")}
        onClick={toggle}
      >
        <span className="vinyl" aria-hidden="true">
          <span className="vinyl__label">
            <svg className="vinyl__glyph vinyl__glyph--play" viewBox="0 0 24 24">
              <path d="M9 6v12l10-6z" fill="currentColor" />
            </svg>
            <svg className="vinyl__glyph vinyl__glyph--pause" viewBox="0 0 24 24">
              <rect x="7" y="6" width="3.6" height="12" rx="1" fill="currentColor" />
              <rect x="13.4" y="6" width="3.6" height="12" rx="1" fill="currentColor" />
            </svg>
          </span>
        </span>
      </button>

      <div className="music__right">
        <div className="music__panel" aria-hidden={!volOpen}>
          <input
            className="music__slider"
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(volume * 100)}
            tabIndex={volOpen ? 0 : -1}
            aria-label={t("music.volume")}
            style={{ ["--fill" as string]: `${Math.round(volume * 100)}%` }}
            onChange={(e) => {
              setVolume(Number(e.target.value) / 100);
              armClose();
            }}
          />
        </div>

        <button
          type="button"
          className="music__vol"
          aria-expanded={volOpen}
          aria-label={t("music.volume")}
          onClick={() => setVolOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor" stroke="none" />
            {level === "off" ? (
              <path d="m16 9.5 5 5m0-5-5 5" />
            ) : (
              <>
                <path d="M15.5 9.2a4 4 0 0 1 0 5.6" />
                {level === "high" && <path d="M18.2 6.6a7.6 7.6 0 0 1 0 10.8" />}
              </>
            )}
          </svg>
        </button>

      </div>
    </div>
  );
}
