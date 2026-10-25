"use client";

import { CAMERA_URL } from "../camera-link";
import { useGuest } from "../guest";
import { Lines, useLang } from "../i18n";

/**
 * Slide with the button to the guest camera.
 * The guest's name from the invitation link (?to=) travels on as ?from=, so the camera
 * opens with the name already filled in. Without a name, the camera still opens normally.
 */
export default function CameraSlide() {
  const { t } = useLang();
  const guest = useGuest();
  const href = guest ? `${CAMERA_URL}?from=${encodeURIComponent(guest)}` : CAMERA_URL;

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
        <a className="event__btn" href={href} target="_blank" rel="noopener noreferrer">
          {t("cam.open")}
        </a>
        <p className="cam__note">
          <Lines k="cam.note" />
        </p>
      </div>
    </section>
  );
}
