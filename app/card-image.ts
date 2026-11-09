/** Draws the table card as one fully opaque image (no transparent corners or edges) so it looks right in any gallery. */

export type CardImage = {
  label: string; // TABLE CARD
  of: string; // THE WEDDING OF
  date: string; // SATURDAY, 14 / 11 / 2026
  dear: string;
  name: string;
  tableLabel: string;
  table: string;
  paxLabel: string;
  pax: string;
  whenLabel: string;
  when: string;
  venue: string;
  note: string;
};

const W = 1080;
const H = 1500;
const PHOTO_H = 700;
const BG = "#0a0a0a";
const PAD = 72;

const familyOf = (selector: string, fallback: string) => {
  const el = document.querySelector(selector);
  return el ? getComputedStyle(el).fontFamily : fallback;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Shrinks the font until the text fits the width. */
function fit(ctx: CanvasRenderingContext2D, text: string, weight: number, size: number, family: string, maxW: number) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(text).width > maxW && s > 22) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  return s;
}

function spaced(ctx: CanvasRenderingContext2D, px: number) {
  // letterSpacing is not in every browser yet; without it the text is simply a little tighter
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${px}px`;
}

export async function renderCard(c: CardImage): Promise<Blob> {
  await document.fonts.ready;
  const body = familyOf("body", "sans-serif");
  const jakarta = familyOf(".tcard__title p", body);
  const viaoda = familyOf(".tcard__title h2", "serif");

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("no canvas");

  // solid base: every pixel is painted
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#fff";

  // photo, cropped to fill
  const photo = await loadImage("/assets/img/bento-4.webp");
  const k = Math.max(W / photo.width, PHOTO_H / photo.height);
  const pw = photo.width * k;
  const ph = photo.height * k;
  ctx.drawImage(photo, -(pw - W) * 0.4, -(ph - PHOTO_H) * 0.5, pw, ph);
  const shade = ctx.createLinearGradient(0, PHOTO_H, 0, PHOTO_H * 0.3);
  shade.addColorStop(0, "rgba(0,0,0,0.85)");
  shade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, W, PHOTO_H);

  // badge
  spaced(ctx, 5);
  ctx.font = `700 26px ${body}`;
  const bw = ctx.measureText(c.label).width + 64;
  roundRect(ctx, PAD, 56, bw, 66, 33);
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText(c.label, PAD + 32, 99);

  // title block
  spaced(ctx, 6);
  ctx.font = `600 28px ${jakarta}`;
  ctx.fillText(c.of, PAD, PHOTO_H - 190);
  spaced(ctx, 0);
  ctx.fillStyle = "#f3f2ee";
  fit(ctx, "MELI & KEVIN", 400, 112, viaoda, W - PAD * 2);
  ctx.fillText("MELI & KEVIN", PAD, PHOTO_H - 78);
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  spaced(ctx, 1.5);
  ctx.font = `400 30px ${jakarta}`;
  ctx.fillText(c.date, PAD, PHOTO_H - 28);

  // tear line with side notches (painted in the base colour, so nothing is transparent)
  ctx.strokeStyle = "rgba(255,255,255,0.32)";
  ctx.lineWidth = 3;
  ctx.setLineDash([16, 12]);
  ctx.beginPath();
  ctx.moveTo(34, PHOTO_H);
  ctx.lineTo(W - 34, PHOTO_H);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = BG;
  for (const x of [0, W]) {
    ctx.beginPath();
    ctx.arc(x, PHOTO_H, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  // guest
  let y = PHOTO_H + 110;
  spaced(ctx, 1);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `400 32px ${body}`;
  ctx.fillText(c.dear, PAD, y);
  y += 84;
  spaced(ctx, 0);
  ctx.fillStyle = "#fff";
  fit(ctx, c.name, 700, 76, body, W - PAD * 2);
  ctx.fillText(c.name, PAD, y);

  // table and pax
  y += 56;
  const gap = 28;
  const bwid = (W - PAD * 2 - gap) / 2;
  const bh = 168;
  [
    { x: PAD, label: c.tableLabel, value: c.table },
    { x: PAD + bwid + gap, label: c.paxLabel, value: c.pax },
  ].forEach((b) => {
    roundRect(ctx, b.x, y, bwid, bh, 30);
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.32)";
    ctx.lineWidth = 3;
    ctx.stroke();
    spaced(ctx, 4);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = `600 24px ${body}`;
    ctx.fillText(b.label, b.x + 38, y + 56);
    spaced(ctx, 0);
    ctx.fillStyle = "#fff";
    fit(ctx, b.value, 700, 54, body, bwid - 76);
    ctx.fillText(b.value, b.x + 38, y + 124);
  });

  // reception
  y += bh + 84;
  spaced(ctx, 4);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = `600 24px ${body}`;
  ctx.fillText(c.whenLabel, PAD, y);
  spaced(ctx, 0);
  y += 56;
  ctx.fillStyle = "#fff";
  ctx.font = `700 36px ${body}`;
  ctx.fillText(c.when, PAD, y);
  y += 54;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  fit(ctx, c.venue, 300, 34, body, W - PAD * 2);
  ctx.fillText(c.venue, PAD, y);

  // note
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = `italic 300 28px ${body}`;
  ctx.fillText(c.note, PAD, H - 72);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("no image"))), "image/png"));
}

const safeFile = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 40) || "tamu";

/** Phones get the share sheet ("Save Image"); everything else gets a normal file download. */
export async function saveCard(c: CardImage, guest: string) {
  const blob = await renderCard(c);
  const file = new File([blob], `kartu-meja-${safeFile(guest)}.png`, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (matchMedia("(pointer: coarse)").matches && nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return; // the guest closed the sheet
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}
