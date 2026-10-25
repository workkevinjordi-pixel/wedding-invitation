# Wedding invitation — Meli & Kevin

A mobile-first digital wedding invitation built with Next.js (App Router), TypeScript and plain CSS.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Where things live

- `app/components/Invitation.tsx` — the slides, in order
- `app/i18n.tsx` — all text, in English and Bahasa Indonesia (the ID | EN switch)
- `app/gift-accounts.ts` — bank accounts and the WhatsApp number shown in the gift card
- `app/components/Countdown.tsx` and `SaveDate.tsx` — the wedding date and time (14 Nov 2026, 19:00 GMT+8)
- `public/assets/img` — photos (WebP), `public/assets/video` — the looping background video

## Google Sheets (RSVPs and wishes)

Guests' answers go straight into a Google Sheet, and the wishes list on the page is read back from the same sheet.
Until it is connected the form still works, but wishes only stay on the visitor's own device (the demo wishes are shown).

1. Create a Google Sheet. Open **Extensions → Apps Script**, replace the code with `google-apps-script/Code.gs`, and save.
2. In **Project Settings → Script properties** add `SECRET` with a long random string.
3. **Deploy → New deployment → Web app**: *Execute as* **Me**, *Who has access* **Anyone**. Authorise it and copy the `/exec` URL.
4. Copy `.env.example` to `.env.local` and fill in `GOOGLE_SCRIPT_URL` (the `/exec` URL) and `GOOGLE_SCRIPT_SECRET` (the same string as `SECRET`).
   On Vercel, add the same two variables under *Project Settings → Environment Variables*.
5. Restart the dev server, send a test RSVP, and check the new **RSVP** tab in the sheet.

Columns: Timestamp · Name · Attendance (`Attend` / `Not attend`) · Wishes · Language.
Only the name and the wish are shown on the page; attendance stays in the sheet.
Each wish appears on the page as soon as it is in the sheet, so to hide one just delete or clear that row (or the **Wishes** cell).

## Background music

The song is not part of this repository. To turn music on, add your own file at
`public/assets/audio/background-music.mp3` (the player starts it on the first tap).
