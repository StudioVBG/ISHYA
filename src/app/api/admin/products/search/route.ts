import { NextRequest } from "next/server";
import { searchAdminProducts } from "@/lib/queries/admin";
import { requireAdminRole } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminRole();
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: 403 });
  }

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const products = await searchAdminProducts(q, 20);
  return Response.json({ products });
}
