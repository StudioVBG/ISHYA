import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUserTicketById } from "@/lib/queries/account";
import { TicketThread } from "./TicketThread";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ma demande — ISHYA",
};

export default async function MyTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getCurrentUserTicketById(id);
  if (!ticket) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/compte/tickets"
          className="inline-flex items-center gap-1.5 text-sm text-steel hover:text-ink"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à mes messages
        </Link>
      </div>

      <TicketThread ticket={ticket} />
    </div>
  );
}
