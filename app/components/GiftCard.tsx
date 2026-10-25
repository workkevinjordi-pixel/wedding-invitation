"use client";

import { useEffect, useRef, useState } from "react";
import { giftAccounts, giftContact } from "../gift-accounts";
import { useLang } from "../i18n";

/** Glass card with the bank accounts (each with a copy button) and a WhatsApp contact row. */
export default function GiftCard() {
  const { t } = useLang();
  const [copied, setCopied] = useState<number | null>(null);
  const [seen, setSeen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const copiedTimer = useRef<number | null>(null);

  // rows fade in one after another the first time the card is on screen
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    },
    [],
  );

  async function copy(index: number, value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // older browsers: select a throw-away field and use the legacy command
      const field = document.createElement("textarea");
      field.value = value;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(index);
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(null), 1800);
  }

  return (
    <div ref={boxRef} className={`gift__box${seen ? " is-in" : ""}`}>
      <ul className="gift__list">
        {giftAccounts.map((a, i) => (
          <li key={`${a.bank}-${i}`} className="gift__row" style={{ ["--i" as string]: i }}>
            <span className={`gift__badge${a.logo ? " gift__badge--logo" : ""}`} aria-hidden="true">
              {a.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.logo} alt="" width={32} height={10} loading="lazy" decoding="async" />
              ) : (
                a.bank
              )}
            </span>
            <span className="gift__info">
              <b>{a.holder}</b>
              <span>
                {a.bank} · {a.number}
              </span>
            </span>
            <button
              type="button"
              className={`gift__copy-btn${copied === i ? " is-copied" : ""}`}
              aria-label={`${t("gift.copy")}: ${a.holder}`}
              onClick={() => copy(i, a.number)}
            >
              {copied === i ? t("gift.copied") : t("gift.copyLabel")}
            </button>
          </li>
        ))}

        <li className="gift__row" style={{ ["--i" as string]: giftAccounts.length }}>
          <span className="gift__badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3.5" y="9" width="17" height="11.5" rx="1.8" />
              <path d="M12 9v11.5M3.5 13h17M12 9c-1.2-3.6-5.6-4.2-5.6-1.6C6.4 9 9 9 12 9Zm0 0c1.2-3.6 5.6-4.2 5.6-1.6C17.6 9 15 9 12 9Z" />
            </svg>
          </span>
          <span className="gift__info">
            <b>{t("gift.note")}</b>
            <span>{t("gift.noteSub")}</span>
          </span>
          <a className="gift__cta" href={`https://wa.me/${giftContact.whatsapp}`} target="_blank" rel="noopener noreferrer">
            {t("gift.contact")}
          </a>
        </li>
      </ul>
    </div>
  );
}
