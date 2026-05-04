export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-beige-nude-light/30">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-terracotta/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-terracotta animate-spin" />
        </div>
        <p className="font-display text-sm tracking-[0.25em] text-muted uppercase">
          ISHYA
        </p>
      </div>
    </div>
  );
}
