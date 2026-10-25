"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const GuestContext = createContext("");

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

/** Reads the guest's name from the link: https://your-site/?to=Budi%20Santoso */
export function GuestProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState("");

  useEffect(() => {
    const fromLink = cleanGuestName(new URLSearchParams(window.location.search).get("to"));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read after mount to avoid a hydration mismatch
    setName(fromLink);
  }, []);

  return <GuestContext.Provider value={name}>{children}</GuestContext.Provider>;
}

/** The invited guest's name, or "" when the link has none. */
export function useGuest() {
  return useContext(GuestContext);
}
