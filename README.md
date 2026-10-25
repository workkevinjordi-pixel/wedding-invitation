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

## Background music

The song is not part of this repository. To turn music on, add your own file at
`public/assets/audio/background-music.mp3` (the player starts it on the first tap).
