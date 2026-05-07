import {
  getAdminAuditLogs,
  AUDIT_PAGE_SIZE,
  type AdminAuditFilters,
} from "@/lib/queries/admin";
import { AuditView } from "./AuditView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Audit — Admin ISHYA",
};

interface SearchParams {
  page?: string;
  action?: string;
  table?: string;
  user?: string;
  from?: string;
  to?: string;
  search?: string;
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const filters: AdminAuditFilters = {
    action: params.action || undefined,
    tableName: params.table || undefined,
    userId: params.user || undefined,
    dateFrom: params.from || undefined,
    dateTo: params.to || undefined,
    search: params.search || undefined,
  };

  const data = await getAdminAuditLogs(filters, page, AUDIT_PAGE_SIZE);
  return <AuditView data={data} filters={filters} />;
}
