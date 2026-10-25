import { NextResponse } from "next/server";

// Both values come from the environment (see README): the Apps Script web-app URL and a shared secret.
// pasted values sometimes carry stray spaces, newlines or quotes
const clean = (v?: string) => (v ?? "").trim().replace(/^["']|["']$/g, "").trim();
const scriptUrl = () => clean(process.env.GOOGLE_SCRIPT_URL);
const secret = () => clean(process.env.GOOGLE_SCRIPT_SECRET);

// best-effort throttle per visitor (resets when the server instance restarts)
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_HITS = 5;

function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_HITS;
}

/** The latest wishes, read back from the sheet. */
export async function GET() {
  const url = scriptUrl();
  if (!url) return NextResponse.json({ configured: false, wishes: [] });
  try {
    const res = await fetch(`${url}?secret=${encodeURIComponent(secret())}`, { cache: "no-store", redirect: "follow" });
    const data = await res.json();
    if (!data.ok || !Array.isArray(data.wishes)) throw new Error("sheet refused the request");
    return NextResponse.json({ configured: true, wishes: data.wishes.slice(0, 50) });
  } catch {
    return NextResponse.json({ configured: true, wishes: [], error: true }, { status: 502 });
  }
}

/** A guest's RSVP, appended to the sheet. */
export async function POST(request: Request) {
  const url = scriptUrl();
  if (!url) return NextResponse.json({ ok: false, configured: false }, { status: 503 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (throttled(ip)) return NextResponse.json({ ok: false, error: "slow down" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }

  // hidden field that real guests never fill in: quietly drop bots
  if (typeof body.website === "string" && body.website.trim() !== "") return NextResponse.json({ ok: true });

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 500) : "";
  const attendance = body.attendance === "attend" ? "Attend" : body.attendance === "not" ? "Not attend" : "";
  const lang = body.lang === "id" ? "id" : "en";
  if (!name || !attendance) return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // a "simple" request: Apps Script needs no preflight
      body: JSON.stringify({ secret: secret(), name, attendance, message, lang }),
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
