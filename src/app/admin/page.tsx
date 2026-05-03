import {
  getAdminDashboardStats,
  getAdminLowStock,
  getAdminOrders,
} from "@/lib/queries/admin";
import { DashboardView } from "./DashboardView";

export const metadata = {
  title: "Dashboard — Admin ISHYA",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, recentOrders, lowStock] = await Promise.all([
    getAdminDashboardStats(),
    getAdminOrders({ limit: 8 }),
    getAdminLowStock(),
  ]);

  return (
    <DashboardView
      stats={stats}
      recentOrders={recentOrders}
      lowStock={lowStock}
    />
  );
}
