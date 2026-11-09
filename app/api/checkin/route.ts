import { NextResponse } from "next/server";
import { atVenue, distanceM, phaseAt, VENUE } from "../../checkin";

// same environment values as /api/rsvp (see README); pasted values sometimes carry stray spaces or quotes
const clean = (v?: string) => (v ?? "").trim().replace(/^["']|["']$/g, "").trim();
const scriptUrl = () => clean(process.env.GOOGLE_SCRIPT_URL);
const secret = () => clean(process.env.GOOGLE_SCRIPT_SECRET);

const hits = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 6;
}

/** A guest checks in: only on the day, after the reception starts, and at the venue. */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (throttled(ip)) return NextResponse.json({ ok: false, error: "slow down" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }

  // the date comes first
  const phase = phaseAt(Date.now());
  if (phase !== "open") return NextResponse.json({ ok: false, error: phase }, { status: 403 });

  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const accuracy = Number(body.accuracy) || 0;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }
  if (!atVenue({ lat, lng }, accuracy)) return NextResponse.json({ ok: false, error: "outside" }, { status: 403 });

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  const table = typeof body.table === "string" ? body.table.trim().slice(0, 24) : "";
  const pax = Number.isInteger(body.pax) ? Number(body.pax) : "";
  if (!name) return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });

  const url = scriptUrl();
  if (!url) return NextResponse.json({ ok: false, configured: false }, { status: 503 });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      // "attendance" keeps an older copy of the script (RSVP only) writing a readable row too
      body: JSON.stringify({
        secret: secret(),
        type: "checkin",
        name,
        attendance: "Checked in",
        message: "",
        lang: "",
        table,
        pax,
        distance: Math.round(distanceM({ lat, lng }, VENUE)),
      }),
      redirect: "follow",
      cache: "no-store",
    });
    const data = await res.json();
    if (!data.ok) throw new Error("sheet refused the request");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "could not save" }, { status: 502 });
  }
}
