"use client";

import { useEffect, useState } from "react";
import { CAMERA_URL } from "../camera-link";
import { useGuest } from "../guest";
import { Lines, useLang, type Key } from "../i18n";

// The camera opens when the Holy Matrimony starts: Saturday, 14 November 2026, 11:00 GMT+8.
const OPENS_AT = new Date("2026-11-14T11:00:00+08:00").getTime();

const units: Key[] = ["count.days", "count.hours", "count.minutes", "count.seconds"];

// Local testing (localhost, or a phone on the same Wi-Fi) always has the camera open; the real site stays locked.
function isLocalHost(host: string) {
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)
  );
}

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
}

/**
 * Slide with the button to the guest camera.
 * Locked, with a countdown, until the Holy Matrimony begins. The camera address is not even in the page until then.
 * On localhost (staging) it is always open.
 * The guest's name from the invitation link (?to=) travels on as ?from=, so the camera
 * opens with the name already filled in. Without a name, the camera still opens normally.
 */
export default function CameraSlide() {
  const { t } = useLang();
  const guest = useGuest();
  const href = guest ? `${CAMERA_URL}?from=${encodeURIComponent(guest)}` : CAMERA_URL;
  // 0 until mounted, so the server and the first render agree: locked
  const [now, setNow] = useState(0);
  const [local, setLocal] = useState(false);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(() => {
      setLocal(isLocalHost(window.location.hostname));
      tick();
    }, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  const locked = !local && now < OPENS_AT;
  const left = split(OPENS_AT - now);

  return (
    <section className="sec cam" id="camera" aria-label="Guest camera">
      <div className="cam__body">
        <div className="cam__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8h3l1.6-2.2h6.8L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
            <circle cx="12" cy="13.2" r="3.6" />
          </svg>
        </div>
        <div className="event__head">
          <h2>{t("cam.title")}</h2>
          <i />
        </div>
        <p className="cam__text">
          <Lines k="cam.text" />
        </p>

        {locked ? (
          <>
            <div className="cam__count" role="timer" aria-label={t("cam.opensIn")}>
              {units.map((u, i) => (
                <div className="cam__cell" key={u}>
                  <b>{now ? String(left[i]).padStart(2, "0") : "--"}</b>
                  <span>{t(u)}</span>
                </div>
              ))}
            </div>
            <button type="button" className="event__btn cam__locked" disabled aria-disabled="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              {t("cam.locked")}
            </button>
            <p className="cam__note">{t("cam.opensIn")}</p>
          </>
        ) : (
          <>
            <a className="event__btn" href={href} target="_blank" rel="noopener noreferrer">
              {t("cam.open")}
            </a>
            <p className="cam__note">
              <Lines k="cam.note" />
            </p>
          </>
        )}
      </div>
    </section>
  );
}
