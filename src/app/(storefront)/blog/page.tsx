import { getPublishedBlogPosts } from "@/lib/queries/storefront";
import { BlogList } from "./BlogList";

export const revalidate = 300;

export const metadata = {
  title: "Le Journal — ISHYA",
  description:
    "Conseils d'entretien, guides d'achat, tendances et coulisses de notre atelier.",
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();
  return <BlogList posts={posts} />;
}
