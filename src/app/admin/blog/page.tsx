import { getAdminBlogPosts } from "@/lib/queries/admin";
import { BlogList } from "./BlogList";

export const revalidate = 60;

export const metadata = {
  title: "Blog — Admin ISHYA",
};

export default async function AdminBlogPage() {
  const posts = await getAdminBlogPosts();
  return <BlogList posts={posts} />;
}
