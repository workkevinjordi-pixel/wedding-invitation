"use client";

import { useEffect, useState } from "react";
import { useLang, type Key } from "../i18n";

// Saturday, 14 November 2026, 19:00 GMT+8 — the reception, which the countdown follows.
const TARGET = new Date("2026-11-14T19:00:00+08:00").getTime();

const units: Key[] = ["count.days", "count.hours", "count.minutes", "count.seconds"];

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [
    Math.floor(s / 86400),
    Math.floor((s % 86400) / 3600),
    Math.floor((s % 3600) / 60),
    s % 60,
  ];
}

export default function Countdown() {
  const { t } = useLang();
  const [left, setLeft] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    const tick = () => setLeft(split(TARGET - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="count__row" role="timer" aria-label="Time until the wedding">
      {units.map((u, i) => (
        <div className="count__cell" key={u}>
          <b key={left[i]} className="tick">
            {String(left[i]).padStart(2, "0")}
          </b>
          <span>{t(u)}</span>
        </div>
      ))}
    </div>
  );
}
