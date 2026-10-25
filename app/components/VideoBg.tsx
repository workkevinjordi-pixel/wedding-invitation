/** Looping muted video behind every slide that has no photo of its own, under a 60% black veil. */
export default function VideoBg() {
  return (
    <div className="videobg" aria-hidden="true">
      <video
        className="videobg__video"
        src="/assets/video/bg-teaser.mp4"
        poster="/assets/video/bg-teaser-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
      />
      <div className="videobg__veil" />
    </div>
  );
}
