import { getCurrentUserNotificationPrefs } from "@/lib/queries/account";
import { NotificationsForm } from "./NotificationsForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Notifications — ISHYA",
};

export default async function NotificationsPage() {
  const prefs = await getCurrentUserNotificationPrefs();
  return <NotificationsForm prefs={prefs} />;
}
