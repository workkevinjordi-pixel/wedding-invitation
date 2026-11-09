"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const GuestContext = createContext("");

/** What the table card shows for this guest: ?table=Mawar&pax=2 */
export type GuestSeat = { table: string; pax: number | null };
const SeatContext = createContext<GuestSeat>({ table: "", pax: null });

/** Makes a name from the link safe to show: no control characters or angle brackets, one space between words, 60 characters at most. */
export function cleanGuestName(raw: string | null) {
  if (!raw) return "";
  let name = raw
    .replace(/[\u0000-\u001f\u007f<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
  // "budi santoso" typed in lowercase becomes "Budi Santoso"; names that already have capitals are left alone
  if (name && name === name.toLowerCase()) {
    name = name.replace(/(^|[\s.'-])(\p{L})/gu, (_, before: string, letter: string) => before + letter.toUpperCase());
  }
  return name;
}

/** A table label from the link: plain text, one line, 24 characters at most. */
export function cleanTable(raw: string | null) {
  if (!raw) return "";
  return raw
    .replace(/[\u0000-\u001f\u007f<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
}

/** A head count from the link: a whole number from 1 to 99, otherwise nothing. */
export function cleanPax(raw: string | null) {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n >= 1 && n <= 99 ? n : null;
}

/** Reads the guest's name from the link: https://your-site/?to=Budi%20Santoso */
export function GuestProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState("");
  const [seat, setSeat] = useState<GuestSeat>({ table: "", pax: null });

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const rawTo = q.get("to");
    const guest = cleanGuestName(rawTo);
    const fromLink: GuestSeat = { table: cleanTable(q.get("table")), pax: cleanPax(q.get("pax")) };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read after mount to avoid a hydration mismatch
    setName(guest);
    setSeat(fromLink);
    // the guest list (in a Google Sheet) knows the table and head count; anything written in the link itself wins
    if (guest && (!fromLink.table || fromLink.pax === null)) {
      let cancelled = false;
      fetch(`/api/seat?to=${encodeURIComponent(rawTo ?? guest)}`)
        .then((r) => r.json())
        .then((d: { found?: boolean; table?: string; pax?: number | null }) => {
          if (cancelled || !d.found) return;
          setSeat({ table: fromLink.table || cleanTable(d.table ?? ""), pax: fromLink.pax ?? cleanPax(String(d.pax ?? "")) });
        })
        .catch(() => undefined);
      return () => {
        cancelled = true;
      };
    }
  }, []);

  return (
    <GuestContext.Provider value={name}>
      <SeatContext.Provider value={seat}>{children}</SeatContext.Provider>
    </GuestContext.Provider>
  );
}

/** The invited guest's name, or "" when the link has none. */
export function useGuest() {
  return useContext(GuestContext);
}

/** The guest's table and head count from the link; empty / null when the link has none. */
export function useSeat() {
  return useContext(SeatContext);
}
