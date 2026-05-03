import { getCurrentUserProfile } from "@/lib/queries/account";
import { CompteShell } from "./CompteShell";

export default async function CompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentUserProfile();

  return (
    <CompteShell
      firstName={profile?.firstName ?? null}
      lastName={profile?.lastName ?? null}
      loyaltyTier={profile?.loyaltyTier ?? "bronze"}
    >
      {children}
    </CompteShell>
  );
}
