"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent } from "@/lib/analytics";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const current = getConsent();
    if (current.analytics === "pending" && current.marketing === "pending") {
      setVisible(true);
    } else {
      setAnalytics(current.analytics === "granted");
      setMarketing(current.marketing === "granted");
    }
  }, []);

  if (!visible) return null;

  const acceptAll = () => {
    setConsent({ analytics: "granted", marketing: "granted" });
    setVisible(false);
  };

  const refuseAll = () => {
    setConsent({ analytics: "denied", marketing: "denied" });
    setVisible(false);
  };

  const saveChoices = () => {
    setConsent({
      analytics: analytics ? "granted" : "denied",
      marketing: marketing ? "granted" : "denied",
    });
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Préférences de cookies"
      className="fixed bottom-0 inset-x-0 z-[60] p-4 sm:p-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl bg-white border border-gray-200 shadow-xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Nous respectons votre vie privée
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          ISHYA utilise des outils de mesure d&apos;audience anonymes pour
          améliorer le site, et — avec votre accord — des cookies marketing
          pour mesurer la performance de nos campagnes. Vous pouvez modifier
          ce choix à tout moment depuis la page{" "}
          <Link href="/cookies" className="underline text-terracotta">
            Cookies
          </Link>
          .
        </p>

        {showDetails && (
          <div className="mt-4 space-y-3">
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked
                disabled
                className="mt-1 accent-terracotta"
              />
              <span>
                <strong className="block text-gray-900">
                  Strictement nécessaires
                </strong>
                Indispensables au fonctionnement (panier, session, sécurité).
                Toujours actifs.
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1 accent-terracotta"
              />
              <span>
                <strong className="block text-gray-900">
                  Mesure d&apos;audience
                </strong>
                Statistiques anonymisées (Vercel Analytics) — pages vues,
                performance.
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="mt-1 accent-terracotta"
              />
              <span>
                <strong className="block text-gray-900">
                  Marketing &amp; conversion
                </strong>
                Suivi des achats et campagnes (events e-commerce, pixels
                publicitaires).
              </span>
            </label>
          </div>
        )}

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="text-sm text-gray-600 underline underline-offset-2 sm:mr-auto"
          >
            {showDetails ? "Masquer le détail" : "Personnaliser"}
          </button>
          <button
            type="button"
            onClick={refuseAll}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Tout refuser
          </button>
          {showDetails ? (
            <button
              type="button"
              onClick={saveChoices}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800"
            >
              Enregistrer mes choix
            </button>
          ) : (
            <button
              type="button"
              onClick={acceptAll}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-terracotta text-white hover:bg-terracotta-dark"
            >
              Tout accepter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
