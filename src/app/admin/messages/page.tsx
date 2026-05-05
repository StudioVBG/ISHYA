import { createAdminClient } from "@/lib/supabase/admin";
import { MessagesView, type ContactMessageRow } from "./MessagesView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Messages — Admin ISHYA",
};

interface RawContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  ip_address: string | null;
  created_at: string | null;
}

export default async function AdminMessagesPage() {
  const admin = createAdminClient() as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        order: (
          c: string,
          o: { ascending: boolean },
        ) => {
          limit: (n: number) => Promise<{
            data: RawContactMessage[] | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  };

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
    ipAddress: m.ip_address,
    createdAt: m.created_at,
  }));

  return <MessagesView messages={messages} />;
}
