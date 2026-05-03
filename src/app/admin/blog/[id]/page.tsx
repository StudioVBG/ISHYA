import { notFound } from "next/navigation";
import { getAdminBlogPostById } from "@/lib/queries/admin";
import { BlogPostForm } from "../BlogPostForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Éditer l'article — Admin ISHYA",
};

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getAdminBlogPostById(id);
  if (!post) notFound();
  return <BlogPostForm post={post} />;
}
