"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useGuest } from "../guest";
import { Lines, useLang } from "../i18n";

// `at` = when it was written (read from the sheet)
type Wish = { name: string; message: string; at?: number };

const PAGE_SIZE = 8;

// remembered on this device so a returning guest sees their confirmation instead of the form
type Saved = { name: string; attendance: "attend" | "not"; message: string };
// one entry per personal link (?to=Name), so another guest opening the invitation on the same device starts with an empty form
const savedKey = (guest: string) => `rsvp-submitted:v2:${guest.trim().toLowerCase() || "_"}`;

function readSaved(guest: string): Saved | null {
  try {
    const v = JSON.parse(window.localStorage.getItem(savedKey(guest)) ?? "null");
    if (v && typeof v.name === "string" && (v.attendance === "attend" || v.attendance === "not")) {
      return { name: v.name, attendance: v.attendance, message: typeof v.message === "string" ? v.message : "" };
    }
  } catch {}
  return null;
}

export default function RsvpWishes({ wishesOnly = false }: { wishesOnly?: boolean }) {
  const { t, lang } = useLang();
  const guest = useGuest();
  // what the guest typed; until they type, the name from their personal link is used
  const [typed, setTyped] = useState<string | null>(null);
  const name = typed ?? guest;
  const [attend, setAttend] = useState<"attend" | "not" | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"" | "need" | "attend" | "not" | "error">("");
  const [sending, setSending] = useState(false);
  // undefined = not read from this device yet; null = nothing submitted
  const [saved, setSaved] = useState<Saved | null | undefined>(undefined);
  const [now, setNow] = useState(0); // "now" lives in state so rendering stays pure; refreshed every minute
  // null = still loading; [] = nobody has written one yet
  const [wishes, setWishes] = useState<Wish[] | null>(null);
  const [page, setPage] = useState(1);

  const list = wishes ?? [];
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const visible = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // the wishes come from the Google Sheet; until one is connected (or if it cannot be reached) the list stays empty
  useEffect(() => {
    let cancelled = false;
    fetch("/api/rsvp")
      .then((r) => r.json())
      .then((data: { configured?: boolean; wishes?: { at: number; name: string; message: string }[] }) => {
        if (!cancelled) setWishes(data.configured && Array.isArray(data.wishes) ? data.wishes : []);
      })
      .catch(() => {
        if (!cancelled) setWishes([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setSaved(readSaved(guest)), 0);
    return () => window.clearTimeout(id);
  }, [guest]);

  // On phones the keyboard covers the lower half of the screen: while a field has focus, drop the slide snapping
  // (it fights the keyboard) and scroll the field into the visible part of the screen once the keyboard is up.
  useEffect(() => {
    const isField = (el: EventTarget | null): el is HTMLElement =>
      el instanceof HTMLElement && (el.classList.contains("form__input") || el.classList.contains("form__area"));
    let timer: number | undefined;
    const reveal = (el: HTMLElement) => {
      const vv = window.visualViewport;
      const viewH = vv?.height ?? window.innerHeight;
      const top = el.getBoundingClientRect().top - (vv?.offsetTop ?? 0);
      const bottom = top + el.offsetHeight;
      if (top < 80 || bottom > viewH - 16) {
        window.scrollTo({ top: window.scrollY + top - Math.max(80, viewH * 0.25), behavior: "smooth" });
      }
    };
    const onIn = (e: FocusEvent) => {
      if (!isField(e.target)) return;
      const el = e.target;
      document.documentElement.classList.add("typing");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => reveal(el), 350); // after the keyboard has slid up
      window.visualViewport?.addEventListener("resize", () => reveal(el), { once: true });
    };
    const onOut = (e: FocusEvent) => {
      if (!isField(e.target)) return;
      window.clearTimeout(timer);
      document.documentElement.classList.remove("typing");
    };
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      window.clearTimeout(timer);
      document.documentElement.classList.remove("typing");
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
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
    if (sending || saved) return;
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
        setWishes((w) => [{ name: name.trim(), message: message.trim(), at: Date.now() }, ...(w ?? [])]);
        setPage(1);
      }
      const done: Saved = { name: name.trim(), attendance: attend, message: message.trim() };
      try {
        window.localStorage.setItem(savedKey(guest), JSON.stringify(done));
      } catch {}
      setSaved(done);
      setStatus("");
      setTyped("");
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
      {!wishesOnly && (
      <section className="sec rsvp" id="rsvp" aria-labelledby="rsvp-title">
        <div className="rsvp__hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="rsvp__photo" src="/assets/img/rsvp-hero.webp" alt="Meli and Kevin holding hands on the beach" loading="lazy" decoding="async" />
          <div className="rsvp__shade" />
          <h2 className="rsvp__big" id="rsvp-title">
            {t("rsvp.label")}
          </h2>
          <div className="rsvp__lead">
            <p className="rsvp__title">
              <Lines k="rsvp.title" />
            </p>
            <p className="rsvp__copy">
              <Lines k="rsvp.text" />
            </p>
          </div>
        </div>

        {saved === undefined ? (
          <div className="form form--pending" aria-hidden="true" />
        ) : saved ? (
          <div className="form form--done" role="status" aria-live="polite">
            <svg className="done__icon" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
              <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M19 33l9 9 17-19" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="done__title">{t("rsvp.doneTitle")}</h3>
            <p className="done__sub">{t("rsvp.doneSub")}</p>
            <dl className="done__card">
              <div>
                <dt>{t("rsvp.name")}</dt>
                <dd>{saved.name}</dd>
              </div>
              <div>
                <dt>{t("rsvp.doneStatus")}</dt>
                <dd>{saved.attendance === "attend" ? t("rsvp.attend") : t("rsvp.notAttend")}</dd>
              </div>
              {saved.message && (
                <div>
                  <dt>{t("rsvp.wishes")}</dt>
                  <dd>{saved.message}</dd>
                </div>
              )}
            </dl>
            <p className="done__text">{saved.attendance === "attend" ? t("rsvp.okAttend") : t("rsvp.okNot")}</p>
            <button
              type="button"
              className="done__cardbtn"
              onClick={() => document.getElementById("table")?.scrollIntoView({ behavior: "smooth" })}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h13A1.5 1.5 0 0 1 20 8.5V10a2 2 0 0 0 0 4v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 15.5V14a2 2 0 0 0 0-4Z" />
                <path d="M14.5 7v10" strokeDasharray="1.6 2.2" />
              </svg>
              {t("rsvp.viewCard")}
            </button>
            <p className="done__note">{t("rsvp.doneNote")}</p>
          </div>
        ) : (
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
              onChange={(e) => setTyped(e.target.value)}
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
        )}
      </section>
      )}

      <section className="sec wishes" id="wishes" aria-labelledby="wishes-title">
        <div className="wishes__head">
          <h2 id="wishes-title">{t("wishes.title")}</h2>
          <i />
        </div>
        <div className="wishes__list">
          {wishes === null ? (
            <div className="wishes__loading" aria-hidden="true">
              {[0, 1].map((i) => (
                <div className="wish wish--skeleton" key={i}>
                  <span className="sk sk--name" />
                  <span className="sk sk--line" />
                  <span className="sk sk--short" />
                </div>
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="wishes__empty">
              <p className="wishes__empty-title">{t("wishes.emptyTitle")}</p>
              <p className="wishes__empty-text">{t("wishes.emptyText")}</p>
              {!wishesOnly && (
              <button
                type="button"
                className="wishes__cta"
                onClick={() => {
                  const field = document.getElementById("rsvp-wishes");
                  field?.scrollIntoView({ behavior: "smooth", block: "center" });
                  window.setTimeout(() => field?.focus({ preventScroll: true }), 450);
                }}
              >
                {t("wishes.emptyCta")}
              </button>
              )}
            </div>
          ) : (
            <>
              {visible.map((w, i) => (
                <article className="wish" key={`${w.name}-${i}`}>
                  <b>{w.name}</b>
                  <p>{w.message}</p>
                  <time>{ago(w)}</time>
                </article>
              ))}
              {pages > 1 && (
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
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
