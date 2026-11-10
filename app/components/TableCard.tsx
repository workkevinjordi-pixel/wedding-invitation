"use client";

import { useEffect, useRef, useState } from "react";
import { saveCard } from "../card-image";
import { atVenue, phaseAt } from "../checkin";
import { useGuest, useSeat } from "../guest";
import { useLang } from "../i18n";

const doneKey = (guest: string) => `checkin:v1:${guest.trim().toLowerCase() || "_"}`;

function readDone(guest: string): number | null {
  try {
    const v = Number(window.localStorage.getItem(doneKey(guest)));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

/**
 * Table card, the second slide: who the invitation is for, which table, and how many seats.
 * All three come from the guest's personal link: ?to=Budi%20Santoso&table=Mawar&pax=2
 */
export default function TableCard() {
  const { t } = useLang();
  const guest = useGuest();
  const seat = useSeat();
  const table = seat.table;
  const pax = seat.pax;
  const name = guest || t("hero.guest");

  const [now, setNow] = useState(0); // 0 until mounted, so the server and the first render agree
  const [doneAt, setDoneAt] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 15000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setDoneAt(readDone(guest)), 0);
    return () => window.clearTimeout(id);
  }, [guest]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  function say(message: string) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3800);
  }

  async function download() {
    if (saving) return;
    setSaving(true);
    try {
      await saveCard(
        {
          label: t("card.label"),
          of: t("hero.of"),
          date: t("hero.date"),
          dear: t("card.dear"),
          name,
          tableLabel: t("card.table"),
          table: table || "—",
          paxLabel: t("card.pax"),
          pax: pax ? t("card.paxUnit", { n: pax }) : "—",
          whenLabel: t("card.when"),
          when: t("card.date"),
          venue: t("card.venue"),
          note: t("card.note"),
        },
        name,
      );
    } catch {
      say(t("card.errSend"));
    } finally {
      setSaving(false);
    }
  }

  // the date is checked first, the location second
  const phase = now ? phaseAt(now) : "before";

  function checkIn() {
    if (busy || doneAt) return;
    if (phaseAt(Date.now()) !== "open") return;
    if (!("geolocation" in navigator)) {
      say(t("card.locFail"));
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        if (!atVenue(pos, p.coords.accuracy)) {
          setBusy(false);
          say(t("card.outside"));
          return;
        }
        try {
          const res = await fetch("/api/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...pos, accuracy: p.coords.accuracy, name, table, pax }),
          });
          if (res.status === 403) {
            const data = (await res.json().catch(() => ({}))) as { error?: string };
            say(data.error === "outside" ? t("card.outside") : t(data.error === "after" ? "card.ended" : "card.notStarted"));
            return;
          }
          // 503 = no sheet connected yet (local preview): keep the check-in on this device only
          if (!res.ok && res.status !== 503) throw new Error("not saved");
          const at = Date.now();
          try {
            window.localStorage.setItem(doneKey(guest), String(at));
          } catch {}
          setDoneAt(at);
          say(t("card.doneToast"));
        } catch {
          say(t("card.errSend"));
        } finally {
          setBusy(false);
        }
      },
      (err) => {
        setBusy(false);
        say(err.code === err.PERMISSION_DENIED ? t("card.denied") : t("card.locFail"));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  }

  const time = doneAt
    ? new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" }).format(doneAt)
    : "";

  return (
    <section className="sec tcard" id="table" aria-label={t("card.label")}>
      <article className="tcard__card">
        <div className="tcard__top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/img/bento-4.webp" alt="" loading="lazy" decoding="async" />
          <div className="tcard__shade" />
          <span className="tcard__badge">{t("card.label")}</span>
          <div className="tcard__title">
            <p>{t("hero.of")}</p>
            <h2>MELI &amp; KEVIN</h2>
            <small>{t("hero.date")}</small>
          </div>
        </div>

        <div className="tcard__body">
          <p className="tcard__dear">{t("card.dear")}</p>
          <p
            className="tcard__name"
            style={name.length > 60 ? { fontSize: "20px", lineHeight: "26px" } : name.length > 30 ? { fontSize: "22px", lineHeight: "28px" } : undefined}
          >
            {name}
          </p>

          <div className="tcard__stats">
            <div>
              <span>{t("card.table")}</span>
              <b>{table || "—"}</b>
            </div>
            <div>
              <span>{t("card.pax")}</span>
              <b>{pax ? t("card.paxUnit", { n: pax }) : "—"}</b>
            </div>
          </div>

          <div className="tcard__when">
            <span>{t("card.when")}</span>
            <p>{t("card.date")}</p>
            <p>{t("card.venue")}</p>
          </div>

          {doneAt ? (
            <div className="tcard__done" role="status">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
              <div>
                <b>{t("card.done")}</b>
                <span>{t("card.doneAt", { time: `${time} WITA` })}</span>
              </div>
            </div>
          ) : (
            <>
              <button type="button" className="tcard__btn" disabled={phase !== "open" || busy} onClick={checkIn}>
                {busy ? t("card.checking") : t("card.checkin")}
              </button>
              {phase !== "open" && <p className="tcard__help">{t(phase === "after" ? "card.ended" : "card.notStarted")}</p>}
            </>
          )}

          <button type="button" className="tcard__save" onClick={download} disabled={saving}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" />
            </svg>
            {saving ? t("card.saving") : t("card.download")}
          </button>

          <p className="tcard__note">{t("card.note")}</p>
        </div>
      </article>

      <div className={`tcard__toast${toast ? " show" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </section>
  );
}
