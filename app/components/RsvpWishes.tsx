"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Lines, useLang } from "../i18n";

// `at` = when it was written (from the sheet); `seed` = the demo wishes shown until the sheet is connected
type Wish = { name: string; message: string; at?: number; seed?: { d: number; h: number } };

const PAGE_SIZE = 8;

const seed: Wish[] = [
  { name: "Test", message: "Test", seed: { d: 6, h: 5 } },
  { name: "Ggffgg", message: "Jggt", seed: { d: 15, h: 20 } },
  { name: "Tomas", message: "Halo", seed: { d: 35, h: 23 } },
  { name: "test", message: "test", seed: { d: 36, h: 0 } },
];

export default function RsvpWishes() {
  const { t, lang } = useLang();
  const [name, setName] = useState("");
  const [attend, setAttend] = useState<"attend" | "not" | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"" | "need" | "attend" | "not" | "error">("");
  const [sending, setSending] = useState(false);
  const [now, setNow] = useState(0); // "now" lives in state so rendering stays pure; refreshed every minute
  const [wishes, setWishes] = useState<Wish[]>(seed);
  const [page, setPage] = useState(1);

  const pages = Math.max(1, Math.ceil(wishes.length / PAGE_SIZE));
  const visible = wishes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // when the Google Sheet is connected, show the real wishes instead of the demo ones
  useEffect(() => {
    let cancelled = false;
    fetch("/api/rsvp")
      .then((r) => r.json())
      .then((data: { configured?: boolean; wishes?: { at: number; name: string; message: string }[] }) => {
        if (!cancelled && data.configured && Array.isArray(data.wishes)) setWishes(data.wishes);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 60000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  function ago(w: Wish) {
    if (w.seed) return t("wishes.ago", w.seed);
    const at = w.at ?? 0;
    const mins = Math.max(0, Math.floor(((now || at) - at) / 60000));
    if (mins < 1) return t("wishes.now");
    if (mins < 60) return t("wishes.minutes", { m: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t("wishes.hours", { h: hours });
    return t("wishes.ago", { d: Math.floor(hours / 24), h: hours % 24 });
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    if (!name.trim() || !attend) {
      setStatus("need");
      return;
    }
    const honeypot = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    setSending(true);
    setStatus("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), attendance: attend, message: message.trim(), lang, website: honeypot }),
      });
      // 503 = no sheet connected yet (local preview): keep the wish on this device only
      if (!res.ok && res.status !== 503) throw new Error("not saved");
      if (message.trim()) {
        setWishes((w) => [{ name: name.trim(), message: message.trim(), at: Date.now() }, ...w]);
        setPage(1);
      }
      setStatus(attend === "attend" ? "attend" : "not");
      setName("");
      setAttend(null);
      setMessage("");
    } catch {
      setStatus("error");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <section className="sec rsvp" id="rsvp" aria-labelledby="rsvp-title">
        <div className="rsvp__hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="rsvp__photo" src="/assets/img/rsvp-hero.webp" alt="Meli and Kevin holding hands on the beach" loading="lazy" decoding="async" />
          <div className="rsvp__shade" />
          <h2 className="rsvp__big" id="rsvp-title">
            {t("rsvp.label")}
          </h2>
          <div className="rsvp__lead">
            <p className="rsvp__title">{t("rsvp.title")}</p>
            <p className="rsvp__copy">
              <Lines k="rsvp.text" />
            </p>
          </div>
        </div>

        <form className="form" onSubmit={submit} noValidate>
          <div className="form__field">
            <label className="form__label" htmlFor="rsvp-name">
              {t("rsvp.name")}
            </label>
            <input
              id="rsvp-name"
              className="form__input"
              type="text"
              placeholder={t("rsvp.namePh")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="form__field">
            <span className="form__label" id="attendance-label">
              {t("rsvp.attendance")}
            </span>
            <div className="form__choices" role="group" aria-labelledby="attendance-label">
              <button
                type="button"
                className="form__choice"
                aria-pressed={attend === "attend"}
                onClick={() => setAttend("attend")}
              >
                {t("rsvp.attend")}
              </button>
              <button
                type="button"
                className="form__choice"
                aria-pressed={attend === "not"}
                onClick={() => setAttend("not")}
              >
                {t("rsvp.notAttend")}
              </button>
            </div>
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor="rsvp-wishes">
              {t("rsvp.wishes")}
            </label>
            <textarea
              id="rsvp-wishes"
              className="form__area"
              placeholder={t("rsvp.wishesPh")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* hidden trap for bots: real guests never see or fill this */}
          <div className="form__trap" aria-hidden="true">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="form__field" style={{ paddingTop: 0 }}>
            <button type="submit" className="pill form__submit" disabled={sending}>
              {sending ? t("rsvp.sending") : t("rsvp.submit")}
            </button>
          </div>
          <p className="form__status" role="status" aria-live="polite">
            {status === "need" ? t("rsvp.errNeed") : status === "error" ? t("rsvp.errSend") : status === "attend" ? t("rsvp.okAttend") : status === "not" ? t("rsvp.okNot") : ""}
          </p>
        </form>
      </section>

      <section className="sec wishes" aria-labelledby="wishes-title">
        <div className="wishes__head">
          <h2 id="wishes-title">{t("wishes.title")}</h2>
          <i />
        </div>
        <div className="wishes__list">
          {visible.map((w, i) => (
            <article className="wish" key={`${w.name}-${i}`}>
              <b>{w.name}</b>
              <p>{w.message}</p>
              <time>{ago(w)}</time>
            </article>
          ))}
          <div className="pager">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              {t("wishes.prev")}
            </button>
            <span>
              {page} / {pages}
            </span>
            <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              {t("wishes.next")}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
