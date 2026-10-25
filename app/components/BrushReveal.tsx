"use client";

import { useEffect, useRef, useState } from "react";

/** Line-art that is "brushed" onto the slide (a left-to-right bristle swipe) the first time the slide is on screen. */
export default function BrushReveal({ src, className }: { src: string; className: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const slide = ref.current?.closest("section");
    if (!slide) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(slide);
    return () => io.disconnect();
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img loading="lazy" decoding="async" ref={ref} className={`${className} brush${drawn ? " is-drawn" : ""}`} src={src} alt="" aria-hidden="true" />
  );
}
