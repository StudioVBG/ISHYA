import { createAdminClient } from "@/lib/supabase/admin";
import { MessagesView, type ContactMessageRow } from "./MessagesView";

export const revalidate = 60;

export const metadata = {
  title: "Messages — Admin ISHYA",
};

export default async function AdminMessagesPage() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("contact_messages")
    .select("id, name, email, subject, message, status, ip_address, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[AdminMessagesPage]", error);
  }

  const messages: ContactMessageRow[] = (data ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    subject: m.subject,
    message: m.message,
    status: (m.status ?? "new") as ContactMessageRow["status"],
    ipAddress: m.ip_address ? String(m.ip_address) : null,
    createdAt: m.created_at,
  }));

  return <MessagesView messages={messages} />;
}
