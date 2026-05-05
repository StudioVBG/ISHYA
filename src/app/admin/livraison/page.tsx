import { createAdminClient } from "@/lib/supabase/admin";
import { LivraisonView, type ShippingMethodRow, type ShippingZoneRow } from "./LivraisonView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Livraison — Admin ISHYA",
};

export default async function AdminLivraisonPage() {
  const admin = createAdminClient();

  const [zonesRes, methodsRes] = await Promise.all([
    admin
      .from("shipping_zones")
      .select("id, name, countries, is_active, created_at")
      .order("name", { ascending: true }),
    admin
      .from("shipping_methods")
      .select(
        "id, zone_id, name, carrier, description, price, free_above, estimated_days_min, estimated_days_max, sort_order, is_active",
      )
      .order("sort_order", { ascending: true }),
  ]);

  if (zonesRes.error) console.error("[livraison/zones]", zonesRes.error);
  if (methodsRes.error) console.error("[livraison/methods]", methodsRes.error);

  const zones: ShippingZoneRow[] = (zonesRes.data ?? []).map((z) => ({
    id: z.id,
    name: z.name,
    countries: z.countries ?? [],
    isActive: z.is_active ?? true,
  }));

  const methods: ShippingMethodRow[] = (methodsRes.data ?? []).map((m) => ({
    id: m.id,
    zoneId: m.zone_id,
    name: m.name,
    carrier: m.carrier,
    description: m.description,
    price: Number(m.price ?? 0),
    freeAbove: m.free_above != null ? Number(m.free_above) : null,
    estimatedDaysMin: m.estimated_days_min,
    estimatedDaysMax: m.estimated_days_max,
    sortOrder: m.sort_order ?? 0,
    isActive: m.is_active ?? true,
  }));

  return <LivraisonView zones={zones} methods={methods} />;
}
