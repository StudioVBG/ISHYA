import type { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

type AdminClient = ReturnType<typeof createAdminClient>;

// Tables où l'on génère un slug : on garde la liste explicite pour que
// supabase-js infère correctement les types Database.
type SlugTable =
  | "products"
  | "categories"
  | "collections"
  | "blog_posts"
  | "cms_pages"
  | "packs";

// Slug généré côté serveur à partir d'un nom : NFD-stripped + lowercase + ASCII.
// Si "bague-or" est déjà pris, tente "bague-or-2", "bague-or-3", … L'admin ne
// saisit donc jamais d'URL et n'a pas à comprendre la notion de slug.
export async function uniqueSlug(
  admin: AdminClient,
  table: SlugTable,
  base: string,
  fallback = "item",
): Promise<string> {
  const root = slugify(base) || fallback;
  let candidate = root;
  for (let i = 2; i < 1000; i++) {
    const { data } = await admin
      .from(table)
      .select("id")
      .eq("slug", candidate)
      .limit(1);
    if (!data || data.length === 0) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${Date.now()}`;
}
