"use client";

import { useEffect, useState } from "react";
import { useLang } from "../i18n";

/** A small button, always in reach, that jumps to the table card. It steps aside while the card itself is on screen. */
export default function CardShortcut() {
  const { t } = useLang();
  const [onCard, setOnCard] = useState(false);

  useEffect(() => {
    const card = document.getElementById("table");
    if (!card) return;
    const io = new IntersectionObserver(([entry]) => setOnCard(entry.isIntersecting), { threshold: 0.5 });
    io.observe(card);
    return () => io.disconnect();
  }, []);

  return (
    <button
      type="button"
      className={`quick${onCard ? " quick--hide" : ""}`}
      aria-label={t("card.quick")}
      tabIndex={onCard ? -1 : 0}
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
