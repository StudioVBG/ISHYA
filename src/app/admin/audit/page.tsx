import { getAdminAuditLogs } from "@/lib/queries/admin";
import { AuditView } from "./AuditView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Audit — Admin ISHYA",
};

export default async function AdminAuditPage() {
  const logs = await getAdminAuditLogs();
  return <AuditView logs={logs} />;
}
