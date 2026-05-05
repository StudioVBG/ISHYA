import { FaqForm } from "../FaqForm";

export const metadata = {
  title: "Nouvelle question — Admin ISHYA",
};

export default function NewFaqPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Nouvelle question FAQ
      </h1>
      <FaqForm />
    </div>
  );
}
