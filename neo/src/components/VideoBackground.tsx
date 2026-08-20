export const MOTION_BG_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_051048_5ef213b5-26db-4da8-b604-7ef823760b6b.mp4';

export function VideoBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <video
        className="absolute inset-0 h-full w-full scale-105 object-cover"
        src={MOTION_BG_URL}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.72)_80%)]" />
    </div>
  );
}
