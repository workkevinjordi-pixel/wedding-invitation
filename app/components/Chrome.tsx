"use client";

import { useEffect, useState } from "react";
import { useLang } from "../i18n";

export default function Chrome() {
  const { lang, setLang } = useLang();
  const [ready, setReady] = useState(false);

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
