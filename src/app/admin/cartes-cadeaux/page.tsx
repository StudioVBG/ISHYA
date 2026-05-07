import { createAdminClient } from "@/lib/supabase/admin";
import { GiftCardsView, type GiftCardRow } from "./GiftCardsView";

export const revalidate = 60;

export const metadata = {
  title: "Cartes cadeaux — Admin ISHYA",
};

export default async function AdminGiftCardsPage() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("gift_cards")
    .select(
      "id, code, initial_amount, amount_remaining, currency, recipient_email, recipient_name, sender_name, sender_email, message, delivery_date, status, paid_at, sent_at, expires_at, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[AdminGiftCardsPage]", error);
  }

  const cards: GiftCardRow[] = (data ?? []).map((g) => ({
    id: g.id,
    code: g.code,
    initialAmount: Number(g.initial_amount),
    amountRemaining: Number(g.amount_remaining),
    currency: g.currency ?? "EUR",
    recipientEmail: g.recipient_email,
    recipientName: g.recipient_name,
    senderName: g.sender_name,
    senderEmail: g.sender_email,
    message: g.message,
    deliveryDate: g.delivery_date,
    status: (g.status ?? "pending") as GiftCardRow["status"],
    paidAt: g.paid_at,
    sentAt: g.sent_at,
    expiresAt: g.expires_at,
    createdAt: g.created_at,
  }));

  return <GiftCardsView cards={cards} />;
}
