import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { PageTransition } from "@/components/ui/PageTransition";
import { WishlistHydrator } from "@/components/wishlist/WishlistHydrator";
import { getAccountLink } from "@/lib/auth/account-link";
import {
  getAnnouncementBanner,
  getMyWishlistProductIds,
  getFooterSocialLinks,
} from "@/lib/queries/storefront";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [account, announcement, wishlistIds, social] = await Promise.all([
    getAccountLink(),
    getAnnouncementBanner(),
    getMyWishlistProductIds(),
    getFooterSocialLinks(),
  ]);
  return (
    <>
      <CustomCursor />
      <Header account={account} announcement={announcement} />
      <CartDrawer />
      <WishlistHydrator
        productIds={wishlistIds}
        isAuthenticated={account.isAuthenticated}
      />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer social={social} />
    </>
  );
}
