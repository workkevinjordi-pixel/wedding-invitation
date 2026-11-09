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

## Personal guest links

Add `?to=Guest Name` to the invitation URL and the cover greets that guest ("Dear, Guest Name") and the RSVP name is pre-filled:

```
https://your-domain.com/?to=Budi%20Santoso
```

Spaces can be `%20` or `+`. In Google Sheets, build every link from a name column:

```
=HYPERLINK("https://your-domain.com/?to=" & ENCODEURL(A2), "Open")
```

Without `?to=` the cover says "Guest" / "Tamu".

### Table card

The slide after the RSVP and wishes is a table card with the guest's name, table and number of seats. Add them to the same link:

```
https://your-domain.com/?to=Budi%20Santoso&table=Mawar%207&pax=2
```

`table` is any short label (24 characters at most) and `pax` is a number from 1 to 99. The guest list can also supply them: set `GUEST_SHEET_CSV` (see `.env.example`) to the CSV export link of a sheet with the columns `NAMA UNDANGAN`, `PAX` and `NAMA MEJA`, and every `?to=Name` link finds its own table and pax. A link without any of it still shows the card, with a dash where the table or number would be. In Google Sheets, with name in A, table in B and pax in C:

```
=ARRAYFORMULA(IF(A2:A="", "", "https://your-domain.com/?to=" & ENCODEURL(A2:A) & "&table=" & ENCODEURL(B2:B) & "&pax=" & C2:C))
```

## Background music

The song is not part of this repository. To turn music on, add your own file at
`public/assets/audio/background-music.mp3` (the player starts it on the first tap).
