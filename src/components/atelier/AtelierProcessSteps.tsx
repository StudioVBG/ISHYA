"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export type AtelierStep = {
  n: string;
  title: string;
  desc: string;
  image: string;
};

/**
 * Scrollytelling cinématique des étapes de l'atelier.
 *
 * Desktop ≥ 1024px : pin horizontal — les 4 panneaux défilent latéralement
 * pendant que la section reste fixe. Pattern Apple iPad / Locomotive.
 *
 * Mobile : empilement vertical normal (le pin scroll est UX-hostile sur mobile).
 *
 * Désactivé sous `prefers-reduced-motion: reduce`.
 */
export function AtelierProcessSteps({ steps }: { steps: AtelierStep[] }) {
  const scope = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const totalWidth = track.scrollWidth;
          const viewport = window.innerWidth;
          const distance = totalWidth - viewport;
          if (distance <= 0) return;

          const tween = gsap.to(track, {
            x: -distance,
            ease: "none",
            scrollTrigger: {
              trigger: scope.current,
              start: "top top",
              end: () => `+=${distance}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          });

          return () => {
            tween.scrollTrigger?.kill();
            tween.kill();
          };
        },
      );

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      className="relative bg-ink text-bone overflow-hidden lg:h-svh"
      aria-label="Le geste de l'atelier en quatre étapes"
    >
      {/* Eyebrow + titre — desktop : sticky par-dessus le track horizontal */}
      <div className="absolute top-0 left-0 right-0 z-10 px-(--gutter) pt-12 lg:pt-16 pointer-events-none">
        <div className="container">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-ember" aria-hidden />
            <span className="eyebrow text-bone/60">Le geste juste</span>
          </div>
          <h2
            className="font-display text-bone leading-[1.04] tracking-[-0.025em] max-w-2xl"
            style={{
              fontSize: "var(--text-h2)",
              fontVariationSettings: "'opsz' 144, 'SOFT' 50, 'WONK' 0",
              fontWeight: 400,
            }}
          >
            Quatre étapes,
            <em
              className="font-display italic text-ember ml-2"
              style={{ fontStyle: "italic", fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'WONK' 1" }}
            >
              beaucoup de patience.
            </em>
          </h2>
        </div>
      </div>

      {/* Indicateur de progression desktop */}
      <div className="hidden lg:flex absolute bottom-10 left-0 right-0 z-10 px-(--gutter) items-center justify-between text-bone/40 pointer-events-none">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase">
          Faire défiler →
        </span>
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase tabular-nums">
          01 — 04
        </span>
      </div>

      {/* Track : desktop horizontal pinned, mobile colonne classique */}
      <div
        ref={trackRef}
        className="
          flex flex-col lg:flex-row
          gap-y-20 lg:gap-y-0 lg:gap-x-0
          py-24 lg:py-0 lg:h-svh
          lg:will-change-transform
        "
      >
        {steps.map((step, i) => (
          <article
            key={step.n}
            className="
              relative shrink-0 px-(--gutter)
              w-full lg:w-screen lg:h-svh
              flex flex-col lg:flex-row items-center gap-10 lg:gap-16
              lg:pt-40 lg:pb-24
            "
          >
            {/* Image */}
            <div className="relative w-full lg:w-[48%] aspect-[4/5] lg:aspect-auto lg:h-full max-h-[70svh] overflow-hidden bg-ink-soft">
              <Image
                src={step.image}
                alt={step.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 48vw"
                priority={i === 0}
              />
              {/* Liseré ember signature */}
              <div className="absolute inset-y-0 left-0 w-px bg-ember/40" aria-hidden />
            </div>

            {/* Texte */}
            <div className="w-full lg:w-[44%] max-w-xl">
              <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-ember mb-4 block">
                Étape {step.n} / 04
              </span>
              <h3
                className="font-display text-bone mb-6"
                style={{
                  fontSize: "var(--text-h3)",
                  fontVariationSettings: "'opsz' 144, 'SOFT' 50, 'WONK' 0",
                  fontWeight: 400,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.1,
                }}
              >
                {step.title}
              </h3>
              <p className="text-bone/70 leading-relaxed text-base md:text-lg max-w-prose">
                {step.desc}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
