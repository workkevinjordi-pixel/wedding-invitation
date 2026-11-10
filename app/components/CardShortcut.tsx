"use client";

import { useEffect, useState } from "react";
import { useLang } from "../i18n";

/**
 * A small button that jumps to the table card. It appears from the third slide (the groom) onward, never on the cover or the verse,
 * and steps aside while the card itself or the RSVP and wishes slides are on screen (the RSVP thank-you has its own button).
 */
export default function CardShortcut() {
  const { t } = useLang();
  const [onCard, setOnCard] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const hideOn = ["table", "rsvp", "wishes"].map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!hideOn.length) return;
    const showing = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) showing.add(e.target);
          else showing.delete(e.target);
        }
        setOnCard(showing.size > 0);
      },
      { threshold: 0.5 },
    );
    hideOn.forEach((el) => io.observe(el));
    // "started" once the third slide has reached the middle of the screen (and stays true further down)
    const third = document.getElementById("couple");
    const start = third
      ? new IntersectionObserver(
          ([entry]) => setStarted(entry.boundingClientRect.top <= (entry.rootBounds?.height ?? window.innerHeight) * 0.5),
          { threshold: [0, 0.25, 0.5, 0.75, 1] },
        )
      : null;
    if (third) start?.observe(third);
    return () => {
      io.disconnect();
      start?.disconnect();
    };
  }, []);

  const hidden = onCard || !started;

  return (
    <button
      type="button"
      className={`quick${hidden ? " quick--hide" : ""}`}
      aria-label={t("card.quick")}
      tabIndex={hidden ? -1 : 0}
      onClick={() => document.getElementById("table")?.scrollIntoView({ behavior: "smooth" })}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h13A1.5 1.5 0 0 1 20 8.5V10a2 2 0 0 0 0 4v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 15.5V14a2 2 0 0 0 0-4Z" />
        <path d="M14.5 7v10" strokeDasharray="1.6 2.2" />
      </svg>
      <span>{t("card.quick")}</span>
    </button>
  );
}
