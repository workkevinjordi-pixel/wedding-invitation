"use client";

import { useState, type FormEvent } from "react";
import { Lines, useLang } from "../i18n";

type When = "now" | { d: number; h: number };
type Wish = { name: string; message: string; when: When };

const PAGE_SIZE = 8;

const seed: Wish[] = [
  { name: "Test", message: "Test", when: { d: 6, h: 5 } },
  { name: "Ggffgg", message: "Jggt", when: { d: 15, h: 20 } },
  { name: "Tomas", message: "Halo", when: { d: 35, h: 23 } },
  { name: "test", message: "test", when: { d: 36, h: 0 } },
];

export default function RsvpWishes() {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [attend, setAttend] = useState<"attend" | "not" | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"" | "need" | "attend" | "not">("");
  const [wishes, setWishes] = useState<Wish[]>(seed);
  const [page, setPage] = useState(1);

  const pages = Math.max(1, Math.ceil(wishes.length / PAGE_SIZE));
  const visible = wishes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !attend) {
      setStatus("need");
      return;
    }
    if (message.trim()) {
      setWishes((w) => [{ name: name.trim(), message: message.trim(), when: "now" }, ...w]);
      setPage(1);
    }
    setStatus(attend === "attend" ? "attend" : "not");
    setName("");
    setAttend(null);
    setMessage("");
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

          <div className="form__field" style={{ paddingTop: 0 }}>
            <button type="submit" className="pill form__submit">
              {t("rsvp.submit")}
            </button>
          </div>
          <p className="form__status" role="status" aria-live="polite">
            {status === "need" ? t("rsvp.errNeed") : status === "attend" ? t("rsvp.okAttend") : status === "not" ? t("rsvp.okNot") : ""}
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
              <time>{w.when === "now" ? t("wishes.now") : t("wishes.ago", w.when)}</time>
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
