/** Check-in rules, shared by the card on the page and the API that records it. */

// Claro Hotel Makassar (Sandeq Ballroom), from the Google Maps pin
export const VENUE = { lat: -5.169214, lng: 119.4327631 };

// how close a guest must be to the venue, in metres (phones are imprecise indoors)
export const RADIUS_M = 300;

// check-in is open for the whole wedding day (GMT+8); the guest still has to be at the venue
export const OPENS_AT = new Date("2026-11-14T00:00:00+08:00").getTime();
export const CLOSES_AT = new Date("2026-11-15T00:00:00+08:00").getTime();

export type Phase = "before" | "open" | "after";

export function phaseAt(now: number): Phase {
  return now < OPENS_AT ? "before" : now >= CLOSES_AT ? "after" : "open";
}

/** Metres between two coordinates (haversine). */
export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

/** True when the position is at the venue; a poor GPS fix (accuracy, in metres) is given up to 100 m of slack. */
export function atVenue(pos: { lat: number; lng: number }, accuracy = 0) {
  const slack = Math.min(Math.max(accuracy, 0), 100);
  return distanceM(pos, VENUE) - slack <= RADIUS_M;
}
