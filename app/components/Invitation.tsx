"use client";

import { useGuest } from "../guest";
import { Lines, useLang, type Key } from "../i18n";
import Chrome from "./Chrome";
import Countdown from "./Countdown";
import Gallery from "./Gallery";
import VideoBg from "./VideoBg";
import MusicPlayer from "./MusicPlayer";
import Motion from "./Motion";
import BrushReveal from "./BrushReveal";
import GiftCard from "./GiftCard";
import SaveDate from "./SaveDate";
import RsvpWishes from "./RsvpWishes";
import CameraSlide from "./CameraSlide";

const IMG = "/assets/img";

// the Wedding Frame slide is built but switched off until the frame artwork is ready
const SHOW_WEDDING_FRAME = false;

function Instagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Person(props: {
  id: string;
  photo: string;
  role: Key;
  first: string;
  full: string;
  relation: Key;
  parents: Key;
  handle: string;
  nameSize: string;
  ghostTop: number;
  jakarta?: boolean;
}) {
  const { t } = useLang();
  return (
    <section className={`sec person--script${props.jakarta ? " person--jakarta" : ""}`} id={props.id} aria-label={t(props.role)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img loading="lazy" decoding="async" className="cover-img" src={`${IMG}/${props.photo}.webp`} alt={props.full} />
      <div className="person__grad" />
      <div className="person__ghost" style={{ top: props.ghostTop }} aria-hidden="true">
        {props.first}
      </div>
      <h2 className="person__name" style={{ fontSize: props.nameSize, fontWeight: 400 }}>
        {props.first}
      </h2>
      <p className="person__full">{props.full}</p>
      <p className="person__parents">
        {t(props.relation)}
        <br />
        {t(props.parents)}
      </p>
      <div className="person__rule">
        <i />
      </div>
      <div className="person__ig">
        <a className="pill pill--ig" href={`https://www.instagram.com/${props.handle}`} target="_blank" rel="noopener noreferrer">
          <Instagram />
          <span>@{props.handle}</span>
        </a>
      </div>
      <div className="person__role">{t(props.role)}</div>
    </section>
  );
}

function Event(props: {
  title: Key;
  time?: string;
  venue: string;
  address: string;
  mapsUrl: string;
}) {
  const { t } = useLang();
  return (
    <div className="event">
      <div className="event__head">
        <h2>{t(props.title)}</h2>
        <i />
      </div>
      <p className="event__date">
        <Lines k="event.date" />
      </p>
      <p className="event__time">{props.time}</p>
      <p className="event__venue">{props.venue}</p>
      <p className="event__addr">{props.address}</p>
      <a className="event__btn" href={props.mapsUrl} target="_blank" rel="noopener noreferrer">
        {t("event.maps")}
      </a>
    </div>
  );
}

export default function Invitation() {
  const { t } = useLang();
  const guest = useGuest();
  return (
    <>
      <Chrome />
      <main className="inv" id="home">
        <VideoBg />
        <MusicPlayer />
        <Motion />
        {/* 1 — Cover */}
        <section className="sec hero" aria-label="Cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cover-img" src={`${IMG}/hero-bg.webp`} alt="Meli and Kevin" fetchPriority="high" decoding="async" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cover-img" style={{ opacity: 0.2 }} src={`${IMG}/hero-bg2.png`} alt="" />
          <div className="shade" style={{ opacity: 0.3 }} />
          <div className="hero__grad" />

          <div className="hero__titles">
            <p className="hero__of">{t("hero.of")}</p>
            <h1 className="hero__names">MELI &amp; KEVIN</h1>
            <p className="hero__date">{t("hero.date")}</p>
          </div>

          <div className="hero__cta">
            <small>{t("hero.dear")}</small>
            <strong style={guest.length > 26 ? { fontSize: "14px" } : guest.length > 18 ? { fontSize: "16px" } : undefined}>
              {guest || t("hero.guest")}
            </strong>
            <i />
            <em>{t("hero.note")}</em>
            <a
              className="hero__btn"
              href="#verse"
              onClick={(e) => {
                // scroll without leaving "#verse" in the address, so a refresh still starts at the cover
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("invitation:open"));
                document.getElementById("verse")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true">
                <path d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z" />
              </svg>
              {t("hero.open")}
            </a>
          </div>
        </section>

        {/* 2 — Verse */}
        <section className="sec verse" id="verse" aria-label="Verse">
          <div className="verse__logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img loading="lazy" decoding="async" src={`${IMG}/logo-km.svg`} alt="KM monogram" width={309.67} height={120} />
          </div>
          <p className="verse__tag">#inVINiteloveforMEL</p>
          <h2 className="verse__ref">{t("verse.ref")}</h2>
          <p className="verse__text">
            <Lines k="verse.text" />
          </p>
        </section>

        {/* 3 — Groom */}
        <Person
          id="couple"
          photo="groom-kevin"
          role="groom.role"
          first="Kevin"
          full="Kevin Jordi"
          relation="groom.relation"
          parents="groom.parents"
          handle="kvinjordi"
          nameSize="47.3px"
          ghostTop={484}
          jakarta
        />

        {/* 4 — Bride */}
        <Person
          id="bride"
          photo="bride-meli"
          role="bride.role"
          first="Meli"
          full="Meliawati Paembonan"
          relation="bride.relation"
          parents="bride.parents"
          handle="melipaembonan"
          nameSize="46.3px"
          ghostTop={469}
        />

        {/* 5 — Story: bento collage */}
        <section className="sec story" id="story" aria-label="Photo collage">
          <div className="bento">
            {[
              ["bento-6.webp", "a", "Meli and Kevin embracing on a lake at sunrise", "62% 60%"],
              ["bento-5.webp", "b", "Meli and Kevin embracing in a park", "65% 92%"],
              ["bento-4.webp", "c", "Meli and Kevin dancing on the beach", "50% 50%"],
              ["bento-2.webp", "d", "Meli and Kevin close together", "55% 55%"],
              ["bento-3.webp", "e", "Meli and Kevin on a boat at sunrise", "50% 58%"],
              ["bento-7.webp", "f", "Meli and Kevin walking on the beach", "55% 50%"],
              ["bento-8.webp", "g", "Meli and Kevin walking in a forest", "40% 68%"],
            ].map(([src, area, alt, pos]) => (
              <div key={area} className={`bento__cell bento__${area}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${IMG}/${src}`} alt={alt} loading="lazy" style={{ objectPosition: pos }} />
              </div>
            ))}
          </div>
        </section>

        {/* 6 — Countdown */}
        <section className="sec count" aria-label="Countdown">
          <div className="vline" style={{ left: 45, top: 0, height: 110 }} />
          <div className="vline" style={{ left: 45, bottom: 0, height: 525 }} />
          <p className="count__big" aria-label="14 November 2026">
            14
            <br />
            11
            <br />
            26
          </p>
          <div className="count__body">
            <h2 className="count__title">
            <Lines k="count.title" />
          </h2>
            <Countdown />
            <SaveDate />
          </div>
        </section>

        {/* 7 — Holy matrimony */}
        <section className="sec" id="event" aria-label="Holy matrimony">
          <BrushReveal className="accent-church" src={`${IMG}/church-white.webp`} />
          <Event title="event.matrimony" time="11.00 WITA"
            venue="Gereja Katolik Kristus Raja"
            address="Jl. Andalas No. 61, Makassar"
            mapsUrl="https://maps.app.goo.gl/9sm9GPKbGhxce9yL9"
          />
        </section>

        {/* 8 — Reception */}
        <section className="sec" aria-label="Reception">
          <BrushReveal className="accent-hotel" src={`${IMG}/hotel-white.webp`} />
          <Event title="event.reception" time="19.00 WITA"
            venue="Claro Hotel Makassar"
            address="Sandeq Ballroom"
            mapsUrl="https://maps.app.goo.gl/dGCSVLboviYuxy3x6"
          />
        </section>

        {/* 12 — Wedding frame (hidden for now: set SHOW_WEDDING_FRAME to true to bring it back) */}
        {SHOW_WEDDING_FRAME && (
          <section className="sec" style={{ height: 787 }} aria-label="Wedding frame">
            <div className="frame__img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" decoding="async" src={`${IMG}/frame.webp`} alt="Instagram wedding frame preview" />
            </div>
            <h2 className="frame__title">{t("frame.title")}</h2>
            <p className="frame__copy">
              <Lines k="frame.text" />
            </p>
            <div className="frame__btn">
              <a className="pill pill--sm" href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <Instagram />
                {t("frame.open")}
              </a>
            </div>
            <p className="frame__note">
              <Lines k="frame.note" />
            </p>
          </section>
        )}

        {/* 13–14 — RSVP + wishes */}
        <RsvpWishes />

        {/* 15 — Gallery */}
        <Gallery />

        {/* 15b — Guest camera */}
        <CameraSlide />

        {/* 16 — Gift */}
        <section className="sec gift" aria-label="Wedding gift">
          <div className="gift__hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img loading="lazy" decoding="async" className="cover-img gift__bg" src={`${IMG}/gift-bg.webp`} alt="Meli and Kevin holding hands on a boat" />
            <div className="gift__fade" />
            <h2 className="gift__title">
              <Lines k="gift.title" />
            </h2>
          </div>
          <div className="gift__body">
            <p className="gift__copy">
              <Lines k="gift.text" />
            </p>
            <GiftCard />
          </div>
        </section>

        {/* 17 — Closing */}
        <section className="sec end" aria-label="Thank you">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" decoding="async" className="cover-img" src={`${IMG}/rsvp-hero.webp`} alt="" />
          <div className="shade end__shade" />
          <h2 className="end__title">
            <Lines k="end.title" />
          </h2>
          <p className="end__copy">
            <Lines k="end.text" />
          </p>
          <p className="end__names">MELI &amp; KEVIN</p>
        </section>
      </main>
    </>
  );
}
