"use client";

import { useEffect } from "react";

/** Photos and art that drift against the scroll: [selector, travel in px, optional per-item pattern]. */
const LAYERS: [string, number | number[]][] = [
  [".sec > .cover-img", 34],
  [".rsvp__photo", 30],
  [".gift__bg", 30],
  [".accent-church", -18],
  [".accent-hotel", -18],
  [".verse__logo", -10],
  [".bento__cell img", [24, -16, 18, -24, 14, -18, 22]],
];

/** Things that fade and rise into place, one after another, when their slide comes on screen. */
const REVEALS = [
  ".hero__titles > *",
  ".hero__cta > *",
  ".verse__logo img",
  ".verse__tag",
  ".verse__ref",
  ".verse__text",
  ".person__ghost",
  ".person__role",
  ".person__name",
  ".person__full",
  ".person__parents",
  ".person__rule",
  ".person__ig",
  ".count__big",
  ".count__title",
  ".count__row",
  ".save",
  ".event__head",
  ".event__date",
  ".event__time",
  ".event__venue",
  ".event__addr",
  ".event__btn",
  ".rsvp__big",
  ".rsvp__lead > *",
  ".form__field",
  ".wishes__head",
  ".wish",
  ".gal__title",
  ".gal__swipe",
  ".gal__tap",
  ".gift__title",
  ".gift__copy",
  ".end__title",
  ".end__copy",
  ".end__names",
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Scroll choreography: parallax layers, staggered reveals and a thin progress line.
 * Everything is skipped for visitors who asked their device for reduced motion.
 */
export default function Motion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("motion");

    // ---- parallax layers --------------------------------------------------
    type Layer = { el: HTMLElement; section: HTMLElement; amp: number };
    const layers: Layer[] = [];
    for (const [selector, amp] of LAYERS) {
      document.querySelectorAll<HTMLElement>(selector).forEach((el, i) => {
        const section = el.closest<HTMLElement>(".sec");
        if (!section) return;
        el.dataset.px = "";
        layers.push({ el, section, amp: Array.isArray(amp) ? amp[i % amp.length] : amp });
      });
    }

    // ---- reveals ----------------------------------------------------------
    document.querySelectorAll<HTMLElement>(".sec").forEach((section) => {
      let index = 0;
      for (const selector of REVEALS) {
        section.querySelectorAll<HTMLElement>(selector).forEach((el) => {
          el.classList.add("reveal");
          el.style.setProperty("--d", String(Math.min(index++, 12)));
        });
      }
    });

    // slides currently on screen
    const visible = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const section = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(section);
          else visible.delete(section);
          if (entry.intersectionRatio >= 0.22) section.classList.add("is-in");
          else if (entry.intersectionRatio === 0) section.classList.remove("is-in"); // plays again on the way back
        }
        schedule();
      },
      { threshold: [0, 0.22, 0.5, 1] },
    );
    document.querySelectorAll<HTMLElement>(".sec").forEach((s) => io.observe(s));

    // ---- one animation frame per scroll burst -------------------------------
    let ticking = false;
    function schedule() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    function update() {
      ticking = false;
      const vh = window.innerHeight;
      for (const { el, section, amp } of layers) {
        if (!visible.has(section)) continue;
        const r = section.getBoundingClientRect();
        // -1 when the slide is about to enter from below, 0 when centred, +1 as it leaves above
        const p = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
        el.style.setProperty("--py", `${(p * amp).toFixed(1)}px`);
      }
      const max = root.scrollHeight - vh;
      root.style.setProperty("--sp", String(max > 0 ? clamp(window.scrollY / max, 0, 1) : 0));
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      io.disconnect();
      root.classList.remove("motion");
    };
  }, []);

  return (
    <div className="progress" aria-hidden="true">
      <i />
    </div>
  );
}
