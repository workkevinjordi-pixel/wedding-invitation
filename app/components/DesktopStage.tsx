"use client";

import { useEffect } from "react";
import { useGuest } from "../guest";
import { Lines, useLang } from "../i18n";

const DESIGN_H = 780; // every slide is drawn 780px tall
const MIN_WIDTH = 960; // below this the invitation stays the plain phone column

/**
 * Desktop experience. Sets --fit so one slide is exactly one screen tall (nothing is cropped),
 * and shows the cover photo and the names beside the invitation column.
 */
export default function DesktopStage() {
  const { t } = useLang();
  const guest = useGuest();

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      if (window.innerWidth < MIN_WIDTH) {
        root.style.removeProperty("--fit");
        root.classList.remove("desktop");
        return;
      }
      const fit = Math.min(1.9, Math.max(0.6, window.innerHeight / DESIGN_H));
      root.style.setProperty("--fit", fit.toFixed(4));
      root.classList.add("desktop");
    };
    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      root.style.removeProperty("--fit");
      root.classList.remove("desktop");
    };
  }, []);

  return (
    <aside className="stage" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="stage__photo" src="/assets/img/hero-cover.webp" alt="" decoding="async" />
      <div className="stage__shade" />
      <div className="stage__text">
        <p className="stage__of">{t("hero.of")}</p>
        <h2 className="stage__names">
          MELI <span>&amp;</span> KEVIN
        </h2>
        <p className="stage__date">{t("hero.date")}</p>
        <p className="stage__tag">
          <Lines k="count.title" />
        </p>
        {guest && (
          <p className="stage__guest">
            {t("hero.dear")} <b>{guest}</b>
          </p>
        )}
      </div>
      <p className="stage__hint">
        {t("desk.hint")}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14m0 0-6-6m6 6 6-6" />
        </svg>
      </p>
    </aside>
  );
}
