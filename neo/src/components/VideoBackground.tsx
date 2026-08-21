export const MOTION_BG_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_051048_5ef213b5-26db-4da8-b604-7ef823760b6b.mp4';

export function VideoBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black" aria-hidden>
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          className="h-full w-full object-contain object-center"
          src={MOTION_BG_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.62)_82%)]" />
    </div>
  );
}
