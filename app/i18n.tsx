"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "id";

const en = {
  "hero.of": "THE WEDDING OF",
  "hero.date": "SATURDAY, 14 / 11 / 2026",
  "hero.dear": "Dear,",
  "hero.guest": "Guest",
  "hero.note": "We apologize if there is any misspelling of name or title.",
  "hero.open": "OPEN INVITATION",
  "music.play": "Play music",
  "music.pause": "Pause music",
  "music.volume": "Volume",

  "verse.ref": "Mark 10:6-9",
  "verse.text":
    "“But at the beginning of creation God ‘made them\nmale and female.’ ‘For this reason a man will leave his\nfather and mother and be united to his wife, and the\ntwo will become one flesh.’ So they are no longer two,\nbut one flesh. Therefore what God has joined together,\nlet no one separate.”",

  "groom.role": "THE GROOM",
  "groom.relation": "Son of",
  "groom.parents": "Mr. Rudy Apa & Mrs. Yulita Lambe",
  "bride.role": "THE BRIDE",
  "bride.relation": "Daughter of",
  "bride.parents": "Mr. Max C. Paembonan & Mrs. Sazthabina Ranteallo",


  "count.title": "ALMOST TIME FOR\nOUR CELEBRATION",
  "count.days": "Days",
  "count.hours": "Hours",
  "count.minutes": "Minutes",
  "count.seconds": "Seconds",
  "count.save": "SAVE THE DATE",
  "count.google": "Google Calendar",
  "count.ics": "Apple / Outlook",

  "event.date": "Saturday,\n14 November 2026",
  "event.matrimony": "HOLY MATRIMONY",
  "event.reception": "RECEPTION",
  "event.maps": "GOOGLE MAPS",




  "frame.title": "WEDDING FRAME",
  "frame.text": "Capture the joyful moments of our wedding day\nusing the Wedding Frame provided below.",
  "frame.open": "OPEN FRAME",
  "frame.note": "*We recommend updating your Instagram app to\nthe latest version.",

  "rsvp.label": "RSVP",
  "rsvp.title": "WILL YOU ATTEND?",
  "rsvp.text":
    "We kindly request your prompt response to confirm\nyour attendance at our upcoming event. Alongside\nyour RSVP, please take a moment to extend your\nwarm regards and best wishes.",
  "rsvp.name": "NAME",
  "rsvp.namePh": "Guest Name",
  "rsvp.attendance": "ATTENDANCE",
  "rsvp.attend": "ATTEND",
  "rsvp.notAttend": "NOT ATTEND",
  "rsvp.wishes": "WISHES",
  "rsvp.wishesPh": "Write your wishes and blessings",
  "rsvp.submit": "SUBMIT",
  "rsvp.errNeed": "Please add your name and choose attendance.",
  "rsvp.errSend": "We couldn't send that just now. Please try again.",
  "rsvp.sending": "SENDING…",
  "rsvp.okAttend": "Thank you — we can't wait to see you!",
  "rsvp.okNot": "Thank you for letting us know.",

  "wishes.title": "WISHES",
  "wishes.emptyTitle": "No wishes yet",
  "wishes.emptyText": "Be the first to leave a blessing for Meli & Kevin.",
  "wishes.emptyCta": "Write a wish",
  "wishes.ago": "{d} days {h} hours ago",
  "wishes.now": "just now",
  "wishes.minutes": "{m} minutes ago",
  "wishes.hours": "{h} hours ago",
  "wishes.prev": "← Prev",
  "wishes.next": "Next →",

  "gallery.title": "Moments\nin Time",
  "gallery.swipe": "Swipe to see more",
  "gallery.tap": "Tap image for slideshow view",
  "gallery.quote": "\"To love and be loved is to feel the\nsun from both sides.\" - David\nViscott",

  "cam.title": "GUEST CAMERA",
  "cam.text": "Take photos with your own phone during the celebration. Every shot goes into one shared album that opens for everyone after the event.",
  "cam.open": "OPEN CAMERA",
  "cam.note": "No app to install, no sign-up.",

  "gift.title": "WEDDING\nGIFT",
  "gift.text": "The greatest gift is having you with us. If you’d like\nto give a token of love, we would be truly grateful.",
  "gift.copy": "Copy account number",
  "gift.copyLabel": "Copy",
  "gift.copied": "Copied",
  "gift.note": "Want to send a gift?",
  "gift.noteSub": "Let us know",
  "gift.contact": "Contact us",

  "end.title": "WITH HEARTFELT\nGRATITUDE FOR YOUR\nPRESENCE AND BLESSINGS",
  "end.text": "We can’t wait to share this special moment with\nyou. Your presence will make our day even more\nmeaningful.",
};

export type Key = keyof typeof en;

const id: Record<Key, string> = {
  "hero.of": "PERNIKAHAN",
  "hero.date": "SABTU, 14 / 11 / 2026",
  "hero.dear": "Kepada Yth.,",
  "hero.guest": "Tamu",
  "hero.note": "Mohon maaf apabila terdapat kesalahan penulisan nama atau gelar.",
  "hero.open": "BUKA UNDANGAN",
  "music.play": "Putar musik",
  "music.pause": "Jeda musik",
  "music.volume": "Volume",

  "verse.ref": "Markus 10:6-9",
  "verse.text":
    "“Sejak semula, pada waktu penciptaan, Allah\nmenjadikan mereka laki-laki dan perempuan.\nSebab itu laki-laki akan meninggalkan ayahnya\ndan ibunya dan bersatu dengan isterinya,\nsehingga keduanya itu menjadi satu daging.\nDemikianlah mereka bukan lagi dua, melainkan\nsatu. Karena itu, apa yang telah dipersatukan\nAllah, tidak boleh diceraikan manusia.”",

  "groom.role": "SANG PRIA",
  "groom.relation": "Putra dari",
  "groom.parents": "Bapak Rudy Apa & Ibu Yulita Lambe",
  "bride.role": "SANG WANITA",
  "bride.relation": "Putri dari",
  "bride.parents": "Bapak Max C. Paembonan & Ibu Sazthabina Ranteallo",


  "count.title": "SEGERA TIBA HARI\nPERAYAAN KAMI",
  "count.days": "Hari",
  "count.hours": "Jam",
  "count.minutes": "Menit",
  "count.seconds": "Detik",
  "count.save": "SIMPAN TANGGAL",
  "count.google": "Google Kalender",
  "count.ics": "Apple / Outlook",

  "event.date": "Sabtu,\n14 November 2026",
  "event.matrimony": "PEMBERKATAN NIKAH",
  "event.reception": "RESEPSI",
  "event.maps": "GOOGLE MAPS",




  "frame.title": "FRAME PERNIKAHAN",
  "frame.text": "Abadikan momen bahagia hari pernikahan kami\nmenggunakan Frame Pernikahan di bawah ini.",
  "frame.open": "BUKA FRAME",
  "frame.note": "*Kami sarankan memperbarui aplikasi Instagram Anda\nke versi terbaru.",

  "rsvp.label": "RSVP",
  "rsvp.title": "AKAN HADIRKAH ANDA?",
  "rsvp.text":
    "Mohon konfirmasi kehadiran Anda pada acara kami\nsecepatnya. Bersama RSVP Anda, sampaikan pula\nucapan dan doa terbaik untuk kami.",
  "rsvp.name": "NAMA",
  "rsvp.namePh": "Nama Tamu",
  "rsvp.attendance": "KEHADIRAN",
  "rsvp.attend": "HADIR",
  "rsvp.notAttend": "TIDAK HADIR",
  "rsvp.wishes": "UCAPAN",
  "rsvp.wishesPh": "Tulis ucapan dan doa Anda",
  "rsvp.submit": "KIRIM",
  "rsvp.errNeed": "Mohon isi nama Anda dan pilih kehadiran.",
  "rsvp.errSend": "Belum berhasil terkirim. Silakan coba lagi.",
  "rsvp.sending": "MENGIRIM…",
  "rsvp.okAttend": "Terima kasih — kami tak sabar bertemu Anda!",
  "rsvp.okNot": "Terima kasih telah memberi tahu kami.",

  "wishes.title": "UCAPAN",
  "wishes.emptyTitle": "Belum ada ucapan",
  "wishes.emptyText": "Jadilah yang pertama menuliskan doa dan ucapan untuk Meli & Kevin.",
  "wishes.emptyCta": "Tulis ucapan",
  "wishes.ago": "{d} hari {h} jam yang lalu",
  "wishes.now": "baru saja",
  "wishes.minutes": "{m} menit yang lalu",
  "wishes.hours": "{h} jam yang lalu",
  "wishes.prev": "← Sebelumnya",
  "wishes.next": "Berikutnya →",

  "gallery.title": "Momen\nKita",
  "gallery.swipe": "Geser untuk lainnya",
  "gallery.tap": "Ketuk gambar untuk tampilan slideshow",
  "gallery.quote": "\"Mencintai dan dicintai adalah\nmerasakan matahari dari kedua\nsisi.\" - David Viscott",

  "cam.title": "KAMERA TAMU",
  "cam.text": "Abadikan momen lewat HP Anda selama acara. Semua foto masuk ke satu album bersama yang terbuka untuk semua tamu setelah acara selesai.",
  "cam.open": "BUKA KAMERA",
  "cam.note": "Tanpa aplikasi, tanpa daftar.",

  "gift.title": "HADIAH\nPERNIKAHAN",
  "gift.text": "Kehadiran Anda adalah hadiah terindah bagi kami.\nBila berkenan memberikan tanda kasih,\nkami akan sangat berterima kasih.",
  "gift.copy": "Salin nomor rekening",
  "gift.copyLabel": "Salin",
  "gift.copied": "Disalin",
  "gift.note": "Ingin mengirim kado?",
  "gift.noteSub": "Kabari kami",
  "gift.contact": "Hubungi kami",

  "end.title": "TERIMA KASIH\nATAS KEHADIRAN\nDAN DOA RESTU ANDA",
  "end.text": "Kami tak sabar berbagi momen istimewa ini\ndengan Anda. Kehadiran Anda akan membuat\nhari kami semakin bermakna.",
};

const dict: Record<Lang, Record<Key, string>> = { en, id };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key, vars?: Record<string, string | number>) => string;
};

const LangContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "invitation-lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    const initial: Lang =
      stored === "id" || stored === "en" ? stored : navigator.language?.toLowerCase().startsWith("id") ? "id" : "en";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read after mount to avoid a hydration mismatch
    setLangState(initial);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => {
        let s = dict[lang][key];
        if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
        return s;
      },
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}

/** Renders a translated string, turning "\n" into <br />. */
export function Lines({ k }: { k: Key }) {
  const { t } = useLang();
  const parts = t(k).split("\n");
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}
