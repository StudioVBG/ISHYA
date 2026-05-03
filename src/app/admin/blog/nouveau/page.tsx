import { BlogPostForm } from "../BlogPostForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nouvel article — Admin ISHYA",
};

export default function NouveauPostPage() {
  return <BlogPostForm post={null} />;
}
