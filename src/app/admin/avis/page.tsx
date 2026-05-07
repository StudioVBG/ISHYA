import {
  getAdminReviews,
  REVIEWS_PAGE_SIZE,
  type AdminReviewFilters,
} from "@/lib/queries/admin";
import { AvisView } from "./AvisView";

export const revalidate = 60;

export const metadata = {
  title: "Avis — Admin ISHYA",
};

interface SearchParams {
  page?: string;
  rating?: string;
  approved?: string;
  search?: string;
}

export default async function AdminAvisPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const ratingNum = Number(params.rating);
  const filters: AdminReviewFilters = {
    rating: ratingNum >= 1 && ratingNum <= 5 ? ratingNum : undefined,
    approved:
      params.approved === "pending" || params.approved === "approved"
        ? params.approved
        : "all",
    search: params.search || undefined,
  };

  const data = await getAdminReviews(filters, page, REVIEWS_PAGE_SIZE);
  return <AvisView data={data} filters={filters} />;
}
