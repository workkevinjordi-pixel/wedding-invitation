"use client";

import { useCallback, useEffect, useState } from "react";
import { Lines, useLang } from "../i18n";

type Photo = { src: string; w: number; alt: string };

// wide tiles (270) take landscape photos, tall tiles (120) take portraits
const top: Photo[] = [
  { src: "bento-6", w: 270, alt: "Meli and Kevin embracing on a lake at sunrise" },
  { src: "bento-2", w: 120, alt: "Meli and Kevin close together" },
  { src: "groom-kevin", w: 120, alt: "Kevin" },
  { src: "bento-4", w: 270, alt: "Meli and Kevin dancing on the beach" },
  { src: "bento-3", w: 120, alt: "Meli and Kevin on a boat at sunrise" },
];

const bottom: Photo[] = [
  { src: "bride-meli", w: 120, alt: "Meli" },
  { src: "bento-7", w: 270, alt: "Meli and Kevin walking on the beach" },
  { src: "hero-bg", w: 120, alt: "Meli and Kevin" },
  { src: "bento-8", w: 270, alt: "Meli and Kevin walking in a forest" },
  { src: "bento-5", w: 120, alt: "Meli and Kevin hugging in a park" },
];

const all = [...top, ...bottom];

export default function Gallery() {
  const { t } = useLang();
  const [active, setActive] = useState<number | null>(null);

  const step = useCallback(
    (d: number) => setActive((i) => (i === null ? i : (i + d + all.length) % all.length)),
    [],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, step]);

  const tile = (p: Photo, index: number) => (
    <button
      key={p.src}
      type="button"
      className="gal__item"
      style={{ width: p.w + 10, paddingRight: 10, background: "none" }}
      aria-label={`Open photo ${index + 1} of ${all.length}`}
      onClick={() => setActive(index)}
    >
      <span style={{ display: "block", width: p.w, height: 180, overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/assets/img/${p.src}.webp`} alt={p.alt} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </span>
    </button>
  );

  return (
    <section className="sec" id="gallery" aria-label="Gallery">
      <div className="gal gal--a scroll-x">{top.map((p, i) => tile(p, i))}</div>

      <h2 className="gal__title" style={{ fontWeight: 400 }}>
        <Lines k="gallery.title" />
      </h2>

      <div className="gal__swipe" aria-hidden="true">
        <span>{t("gallery.swipe")}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/img/arrow.png" alt="" />
      </div>

      <div className="gal__quote" aria-label={t("gallery.quote").replace(/\n/g, " ")}>
        <div aria-hidden="true">
          {t("gallery.quote").split("\n").map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>

      <div className="gal gal--b scroll-x">
        {bottom.map((p, i) => tile(p, top.length + i))}
      </div>

      <p className="gal__tap">{t("gallery.tap")}</p>

      {active !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo slideshow" onClick={() => setActive(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/assets/img/${all[active].src}.webp`} alt={`Meli and Kevin, photo ${active + 1}`} onClick={(e) => e.stopPropagation()} />
          <button type="button" className="lightbox__close" aria-label="Close" onClick={() => setActive(null)}>
            ×
          </button>
          <button
            type="button"
            className="lightbox__prev"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="lightbox__next"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}
