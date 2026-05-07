import { getCurrentUserProfile } from "@/lib/queries/account";
import { getAccountLink } from "@/lib/auth/account-link";
import { getSocialLinks } from "@/lib/queries/storefront";
import { CompteShell } from "./CompteShell";

export default async function CompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, account, social] = await Promise.all([
    getCurrentUserProfile(),
    getAccountLink(),
    getSocialLinks(),
  ]);

  return (
    <CompteShell
      firstName={profile?.firstName ?? null}
      lastName={profile?.lastName ?? null}
      loyaltyTier={profile?.loyaltyTier ?? "bronze"}
      account={account}
      social={social}
    >
      {children}
    </CompteShell>
  );
}
