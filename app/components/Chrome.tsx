"use client";

import { useEffect, useState } from "react";
import { useLang } from "../i18n";

export default function Chrome() {
  const { lang, setLang } = useLang();
  const [ready, setReady] = useState(false);

  // every refresh (or return through the back button) starts over: first slide, no #hash, splash again
  useEffect(() => {
    try {
      history.scrollRestoration = "manual";
    } catch {
      /* not supported */
    }
    if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
    const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    toTop();
    // some browsers restore the old position a moment later; take it back
    const frame = requestAnimationFrame(toTop);
    const late = window.setTimeout(toTop, 300);
    window.addEventListener("load", toTop);
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload(); // restored from the back/forward cache
    };
    window.addEventListener("pageshow", onPageShow);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(late);
      window.removeEventListener("load", toTop);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  useEffect(() => {
    document.body.classList.add("locked");
    const t = window.setTimeout(() => {
      setReady(true);
      document.body.classList.remove("locked");
    }, 3500);
    return () => {
      window.clearTimeout(t);
      document.body.classList.remove("locked");
    };
  }, []);

  return (
    <>
      <div className={`loader${ready ? " done" : ""}`} aria-hidden={ready} role="status">
        <div className="loader__brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/img/logo-km.svg" alt="KM monogram" width={309.67} height={120} />
          <p>#inVINiteloveforMEL</p>
        </div>
      </div>

      <div className="lang" role="group" aria-label="Language">
        {(["id", "en"] as const).map((l) => (
          <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>
            {l === "id" ? "ID" : "EN"}
          </button>
        ))}
      </div>
    </>
  );
}
