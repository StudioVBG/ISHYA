import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewTicketForm } from "./NewTicketForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nouvelle demande — ISHYA",
};

interface OrderOption {
  id: string;
  orderNumber: string;
}

async function getRecentOrders(): Promise<OrderOption[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("orders")
    .select("id, order_number")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
  }));
}

export default async function NewTicketPage() {
  const orders = await getRecentOrders();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/compte/tickets"
          className="inline-flex items-center gap-1.5 text-sm text-steel hover:text-ink"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à mes messages
        </Link>
      </div>

      <div>
        <h1 className="font-display text-2xl text-foreground">
          Nouvelle demande
        </h1>
        <p className="text-sm text-steel mt-1">
          Décrivez votre demande en quelques mots, notre équipe vous répondra
          sous 48&nbsp;h ouvrées.
        </p>
      </div>

      <NewTicketForm orders={orders} />
    </div>
  );
}
