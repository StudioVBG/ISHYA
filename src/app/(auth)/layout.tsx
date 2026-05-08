import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Mon compte",
    template: "%s — ISHYA",
  },
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh">
      {/* Decorative left panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-gradient-to-br from-beige-nude via-beige-nude-light to-terracotta-light overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(197,165,114,0.15),transparent_60%)]" />

        {/* Decorative floral dots */}
        <div className="absolute top-16 left-16 w-24 h-24 rounded-full bg-ember/10 blur-2xl" />
        <div className="absolute bottom-24 right-20 w-32 h-32 rounded-full bg-ember/10 blur-3xl" />
        <div className="absolute top-1/3 right-16 w-16 h-16 rounded-full bg-ember/5 blur-xl" />

        <div className="relative z-10 text-center px-12">
          <Link href="/" className="inline-block">
            <h1 className="font-display text-5xl xl:text-6xl tracking-wider text-foreground/90">
              ISHYA
            </h1>
          </Link>
          <div className="mt-4 w-12 h-px bg-ember mx-auto" />
          <p className="mt-4 text-base tracking-widest uppercase text-foreground/50 font-sans">
            Bijoux floraux artisanaux
          </p>
        </div>
      </div>

      {/* Right side — form content */}
      <div className="flex flex-1 flex-col min-h-dvh">
        {/* Minimal header on mobile */}
        <header className="flex items-center justify-center py-6 lg:justify-start lg:px-12 lg:py-8">
          <Link href="/" className="lg:opacity-0 lg:pointer-events-none">
            <span className="font-display text-2xl tracking-wider text-foreground">
              ISHYA
            </span>
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-12">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
