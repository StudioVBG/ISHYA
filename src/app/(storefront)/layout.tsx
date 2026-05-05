import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { PageTransition } from "@/components/ui/PageTransition";
import { getAccountLink } from "@/lib/auth/account-link";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await getAccountLink();
  return (
    <>
      <CustomCursor />
      <Header account={account} />
      <CartDrawer />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
