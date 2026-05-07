import { getSocialLinks } from "@/lib/queries/storefront";
import { ContactView } from "./ContactView";

export const metadata = {
  title: "Contact — ISHYA",
  description:
    "Contactez ISHYA — questions sur un produit, suivi de commande, partenariat ou simplement envie de dire bonjour.",
};

export default async function ContactPage() {
  const social = await getSocialLinks();
  return <ContactView social={social} />;
}
