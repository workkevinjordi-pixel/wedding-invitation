"use client";

import { useState } from "react";
import { useLang } from "../i18n";

const TITLE = "Wedding of Kevin & Meli";
const MAPS = "https://maps.app.goo.gl/dGCSVLboviYuxy3x6";
const LOCATION = "Claro Hotel Makassar, Makassar";
// the reception: 14 Nov 2026, 19:00–21:00 GMT+8
const START = "20261114T110000Z";
const END = "20261114T130000Z";

const googleUrl =
  "https://calendar.google.com/calendar/render?" +
  new URLSearchParams({
    action: "TEMPLATE",
    text: TITLE,
    dates: `${START}/${END}`,
    location: LOCATION,
    details: `Location: ${MAPS}`,
  }).toString();

export default function SaveDate() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  // One tap does the likeliest thing for the device; the other options stay available below.
  function onSave() {
    setOpen(true);
    const apple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- static file, not a Next page
    if (apple) window.location.href = "/save-the-date.ics";
    else window.open(googleUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="save">
      <button type="button" className="pill" onClick={onSave}>
        {t("count.save")}
      </button>
      {open && (
        <div className="save__menu">
          <a href={googleUrl} target="_blank" rel="noopener noreferrer">
            {t("count.google")}
          </a>
          <a href="/save-the-date.ics">
            {t("count.ics")}
          </a>
        </div>
      )}
    </div>
  );
}
