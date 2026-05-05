"use client";

import { track as vercelTrack } from "@vercel/analytics";

// Pilotage analytique simple : un seul point d'entrée, des événements
// e-commerce normalisés, et la prise en compte du consentement marketing.
// Vercel Analytics est cookieless donc autorisé sans consentement, mais
// les events nominatifs (purchase, begin_checkout) sont tout de même gated
// par hasMarketingConsent() pour rester conforme.

const CONSENT_STORAGE_KEY = "ishya-consent-v1";

export type ConsentValue = "granted" | "denied" | "pending";

interface ConsentState {
  analytics: ConsentValue;
  marketing: ConsentValue;
  updatedAt: string;
}

export function getConsent(): ConsentState {
  if (typeof window === "undefined") {
    return { analytics: "pending", marketing: "pending", updatedAt: "" };
  }
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) {
      return { analytics: "pending", marketing: "pending", updatedAt: "" };
    }
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    return {
      analytics: parsed.analytics ?? "pending",
      marketing: parsed.marketing ?? "pending",
      updatedAt: parsed.updatedAt ?? "",
    };
  } catch {
    return { analytics: "pending", marketing: "pending", updatedAt: "" };
  }
}

export function setConsent(next: Omit<ConsentState, "updatedAt">) {
  if (typeof window === "undefined") return;
  const payload: ConsentState = { ...next, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent("ishya:consent-changed", { detail: payload }));
}

export function hasAnalyticsConsent(): boolean {
  return getConsent().analytics === "granted";
}

export function hasMarketingConsent(): boolean {
  return getConsent().marketing === "granted";
}

// ----------------------------------------------------------------------------
// Events e-commerce — modèle GA4 / Meta normalisé.
// ----------------------------------------------------------------------------

export interface AnalyticsItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  variantId?: string | null;
  category?: string | null;
}

type AllowedValue = string | number | boolean | null;
type EventProps = Record<string, AllowedValue>;

function safeTrack(eventName: string, props: EventProps) {
  try {
    vercelTrack(eventName, props);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[analytics] track failed:", eventName, err);
    }
  }
}

function flattenItems(items: AnalyticsItem[]): EventProps {
  const total = items.reduce(
    (sum, it) => sum + it.price * (it.quantity ?? 1),
    0,
  );
  return {
    items_count: items.length,
    items_quantity: items.reduce((s, it) => s + (it.quantity ?? 1), 0),
    items_value: Number(total.toFixed(2)),
    items_skus: items
      .map((it) => it.id)
      .slice(0, 5)
      .join(","),
  };
}

export function trackViewItem(item: AnalyticsItem) {
  safeTrack("view_item", {
    item_id: item.id,
    item_name: item.name,
    item_price: item.price,
    item_category: item.category ?? null,
  });
}

export function trackAddToCart(item: AnalyticsItem) {
  safeTrack("add_to_cart", {
    item_id: item.id,
    item_name: item.name,
    item_price: item.price,
    item_quantity: item.quantity ?? 1,
    value: Number((item.price * (item.quantity ?? 1)).toFixed(2)),
  });
}

export function trackRemoveFromCart(item: AnalyticsItem) {
  safeTrack("remove_from_cart", {
    item_id: item.id,
    item_name: item.name,
    item_quantity: item.quantity ?? 1,
  });
}

export function trackBeginCheckout(items: AnalyticsItem[], value: number) {
  if (!hasMarketingConsent()) return;
  safeTrack("begin_checkout", {
    value: Number(value.toFixed(2)),
    currency: "EUR",
    ...flattenItems(items),
  });
}

export function trackPurchase(params: {
  orderId: string;
  orderNumber: string;
  value: number;
  shipping?: number;
  discount?: number;
  items: AnalyticsItem[];
}) {
  if (!hasMarketingConsent()) return;
  safeTrack("purchase", {
    order_id: params.orderId,
    order_number: params.orderNumber,
    value: Number(params.value.toFixed(2)),
    shipping: Number((params.shipping ?? 0).toFixed(2)),
    discount: Number((params.discount ?? 0).toFixed(2)),
    currency: "EUR",
    ...flattenItems(params.items),
  });
}

export function trackSearch(query: string, resultsCount: number) {
  safeTrack("search", { query: query.slice(0, 80), results: resultsCount });
}

export function trackSignUp(method: "email" | "oauth") {
  safeTrack("sign_up", { method });
}

export function trackNewsletterSignup(source: string) {
  safeTrack("newsletter_signup", { source });
}
