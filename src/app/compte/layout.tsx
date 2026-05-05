import { getCurrentUserProfile } from "@/lib/queries/account";
import { getAccountLink } from "@/lib/auth/account-link";
import { CompteShell } from "./CompteShell";

export default async function CompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, account] = await Promise.all([
    getCurrentUserProfile(),
    getAccountLink(),
  ]);

  return (
    <CompteShell
      firstName={profile?.firstName ?? null}
      lastName={profile?.lastName ?? null}
      loyaltyTier={profile?.loyaltyTier ?? "bronze"}
      account={account}
    >
      {children}
    </CompteShell>
  );
}
