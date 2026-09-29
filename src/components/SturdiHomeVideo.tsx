export default function SturdiHomeVideo({ className = "", src = "/videos/vendor-signup.mp4", label = "SturdiHome overview video" }: { className?: string; src?: string; label?: string }) {
  return (
    <video
      controls
      playsInline
      preload="metadata"
      className={`mx-auto block h-auto max-h-[70vh] w-full rounded-lg border border-brand-gold/30 bg-black object-contain shadow-sm ${className}`}
      aria-label={label}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support embedded video.
    </video>
  );
}
