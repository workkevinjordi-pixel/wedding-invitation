import { NextResponse } from "next/server";

// The guest list lives in a Google Sheet, never in the code (the repository is public, and so is this address).
// GUEST_SHEET_CSV is the sheet's CSV export link (README, "Table card"); the sheet must be readable by "anyone with the link".
const sheetCsv = () => (process.env.GUEST_SHEET_CSV ?? "").trim().replace(/^["']|["']$/g, "").trim();

type Seat = { table: string; pax: number | null };

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/** Minimal CSV reader: quoted cells may hold commas, quotes ("") and line breaks. */
function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

// EDELWEIS -> Edelweis
const titleCase = (s: string) => s.trim().toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, b: string, l: string) => b + l.toUpperCase());

let cache: { at: number; seats: Map<string, Seat> } | null = null;

async function seats() {
  if (cache && Date.now() - cache.at < 60_000) return cache.seats;
  const url = sheetCsv();
  if (!url) throw new Error("GUEST_SHEET_CSV is not set");
  const res = await fetch(url, { cache: "no-store", redirect: "follow" });
  if (!res.ok) throw new Error("sheet not readable");
  const rows = parseCsv(await res.text());
  const head = rows[0]?.map((h) => h.trim().toUpperCase()) ?? [];
  const iName = head.indexOf("NAMA UNDANGAN");
  const iPax = head.indexOf("PAX");
  const iTable = head.indexOf("NAMA MEJA");
  if (iName < 0) throw new Error("unexpected sheet layout");
  const map = new Map<string, Seat>();
  for (const r of rows.slice(1)) {
    const name = norm(r[iName] ?? "");
    if (!name) continue;
    const pax = Number.parseInt(r[iPax] ?? "", 10);
    map.set(name, {
      table: iTable >= 0 ? titleCase(r[iTable] ?? "").slice(0, 24) : "",
      pax: Number.isFinite(pax) && pax >= 1 && pax <= 99 ? pax : null,
    });
  }
  cache = { at: Date.now(), seats: map };
  return map;
}

const hits = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 30;
}

/** One guest's table and head count, looked up by the name in their link. Only that guest's row is ever returned. */
export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (throttled(ip)) return NextResponse.json({ found: false }, { status: 429 });
  const to = new URL(request.url).searchParams.get("to") ?? "";
  const key = norm(to.slice(0, 120));
  if (!key) return NextResponse.json({ found: false });
  try {
    const seat = (await seats()).get(key);
    return NextResponse.json(seat ? { found: true, ...seat } : { found: false });
  } catch {
    return NextResponse.json({ found: false });
  }
}
