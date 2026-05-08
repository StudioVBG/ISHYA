import DOMPurify from "isomorphic-dompurify";
import type { ReactNode } from "react";

const SANITIZE_OPTIONS: Parameters<typeof DOMPurify.sanitize>[1] = {
  // Liste explicite. `iframe` est admis mais filtré hard par le hook
  // `enforceIframeAllowlist` ci-dessous (uniquement YouTube).
  ALLOWED_TAGS: [
    "p",
    "br",
    "hr",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "s",
    "a",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "img",
    "iframe",
    "figure",
    "figcaption",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "span",
    "div",
  ],
  ALLOWED_ATTR: [
    "href",
    "title",
    "alt",
    "src",
    "srcset",
    "sizes",
    "loading",
    "rel",
    "target",
    "class",
    "id",
    "name",
    "colspan",
    "rowspan",
    // iframe (YouTube)
    "allow",
    "allowfullscreen",
    "frameborder",
    "width",
    "height",
  ],
  // Force schemes sûrs : pas de javascript: ni data: (sauf images en data: si jamais utilisé pour SVG inlinés — exclu volontairement).
  ALLOWED_URI_REGEXP:
    /^(?:(?:https?|mailto|tel):|\/|#)/i,
  // Pas de balises personnalisées
  ADD_TAGS: [],
  ADD_ATTR: [],
  // Empêche d'injecter une <a target="_blank"> sans rel="noopener noreferrer"
  ADD_URI_SAFE_ATTR: [],
  // Forbid event handlers (onclick, onerror, etc.)
  FORBID_ATTR: ["style", "onerror", "onload"],
  // Au cas où l'admin ajoute du <html><body>, on ne veut que le fragment
  WHOLE_DOCUMENT: false,
  KEEP_CONTENT: true,
};

/**
 * Allowlist stricte des iframes : YouTube uniquement (incluant la version
 * privacy-friendly youtube-nocookie). Tout autre `<iframe src=...>` est
 * supprimé du DOM lors du sanitize.
 */
const IFRAME_ALLOWLIST = [
  /^https:\/\/(?:www\.)?youtube\.com\/embed\/[\w-]+(?:\?.*)?$/,
  /^https:\/\/(?:www\.)?youtube-nocookie\.com\/embed\/[\w-]+(?:\?.*)?$/,
];

/**
 * Hooks DOMPurify (idempotents) :
 * - `afterSanitizeAttributes` sur `<a target="_blank">` → ajoute
 *   `rel="noopener noreferrer"` (anti tabnabbing).
 * - `uponSanitizeElement` sur `<iframe>` → drop si `src` n'est pas dans
 *   l'allowlist YouTube ; sinon force `loading="lazy"` +
 *   `referrerpolicy="strict-origin-when-cross-origin"`.
 */
function setupDomPurifyHooks() {
  if (
    (globalThis as { __ishya_dompurify_hooked?: boolean })
      .__ishya_dompurify_hooked
  ) {
    return;
  }
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
      node.setAttribute("rel", "noopener noreferrer");
    }
    if (node.tagName === "IFRAME") {
      const src = node.getAttribute("src") ?? "";
      const safe = IFRAME_ALLOWLIST.some((re) => re.test(src));
      if (!safe) {
        node.parentNode?.removeChild(node);
        return;
      }
      // Hardening sur les iframes admises (YouTube).
      node.setAttribute("loading", "lazy");
      node.setAttribute(
        "referrerpolicy",
        "strict-origin-when-cross-origin",
      );
      node.setAttribute(
        "allow",
        "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
      );
      node.setAttribute("allowfullscreen", "");
      // Empêche tout sandbox surprise injecté par l'admin.
      node.removeAttribute("sandbox");
    }
  });
  (
    globalThis as { __ishya_dompurify_hooked?: boolean }
  ).__ishya_dompurify_hooked = true;
}

setupDomPurifyHooks();

/**
 * Sanitize une chaîne HTML pour rendu via `dangerouslySetInnerHTML`.
 * Strip scripts, iframes, event handlers, javascript: URIs.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_OPTIONS) as unknown as string;
}

/**
 * Rend un body de blog/CMS : si la chaîne commence par `<`, on traite comme du
 * HTML (sanitizé via DOMPurify), sinon on traite comme du markdown léger
 * (paragraphes, titres ##/###, listes - / *).
 *
 * Le rendu markdown utilise React (pas de `dangerouslySetInnerHTML`) — donc
 * tout texte est automatiquement échappé par React.
 */
export function renderCmsBody(body: string | null): ReactNode {
  if (!body) return null;
  const trimmed = body.trim();

  if (trimmed.startsWith("<")) {
    return (
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(trimmed) }} />
    );
  }

  const blocks = trimmed.split(/\n{2,}/);
  return blocks.map((block, i) => {
    if (block.startsWith("### ")) {
      return (
        <h3 key={i} className="font-display text-xl mt-8 mb-3">
          {block.slice(4)}
        </h3>
      );
    }
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="font-display text-2xl mt-10 mb-4">
          {block.slice(3)}
        </h2>
      );
    }
    if (block.startsWith("- ") || block.startsWith("* ")) {
      const items = block.split(/\n/).map((l) => l.replace(/^[-*]\s*/, ""));
      return (
        <ul key={i} className="list-disc pl-6 space-y-1 my-4">
          {items.map((it, j) => (
            <li key={j}>{it}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="leading-relaxed mb-4">
        {block.split(/\n/).map((line, j, arr) => (
          <span key={j}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}
