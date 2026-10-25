"use client";

import { useEffect, useRef } from "react";

/**
 * Looping muted video behind every slide that has no photo of its own, under a 60% black veil.
 * Safari (above all in Low Power Mode) refuses to autoplay, so it is also started by "Open invitation" and by the first touch.
 */
export default function VideoBg() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true; // React only sets the attribute; Safari wants the property
    const play = () => {
      if (video.paused) void video.play().catch(() => undefined);
    };
    const events: Array<keyof DocumentEventMap> = ["pointerup", "touchend", "click", "keydown", "scroll"];
    const detach = () => {
      events.forEach((e) => document.removeEventListener(e, onGesture, true));
      window.removeEventListener("invitation:open", onGesture);
    };
    function onGesture() {
      play();
      if (!video!.paused) detach();
    }
    play();
    events.forEach((e) => document.addEventListener(e, onGesture, true));
    window.addEventListener("invitation:open", onGesture);
    video.addEventListener("pause", () => {
      if (!document.hidden) play();
    });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) play();
    });
    return detach;
  }, []);

  return (
    <div className="videobg" aria-hidden="true">
      <video
        ref={ref}
        className="videobg__video"
        src="/assets/video/bg-teaser.mp4"
        poster="/assets/video/bg-teaser-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload nofullscreen noremoteplayback"
      />
      <div className="videobg__veil" />
    </div>
  );
}
