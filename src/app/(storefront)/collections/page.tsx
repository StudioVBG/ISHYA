import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllCollections } from "@/lib/queries/storefront";

export const revalidate = 300;

export const metadata = {
  title: "Collections",
  description:
    "Chaque collection ISHYA raconte une histoire unique, inspirée par la beauté de la nature et l'art floral.",
};

export default async function CollectionsPage() {
  const collections = await getAllCollections();

  return (
    <>
      <section className="bg-beige-nude-light/50 py-16 px-4">
        <div className="container">
          <div className="text-center">
            <p className="text-terracotta uppercase tracking-widest text-xs mb-3">
              Nos univers
            </p>
            <h1 className="font-display text-4xl md:text-5xl mb-4">Collections</h1>
            <p className="text-muted max-w-lg mx-auto">
              Chaque collection raconte une histoire unique, inspirée par la
              beauté de la nature et l&apos;art floral.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {collections.map((collection, index) => (
              <div
                key={collection.id}
                className={index === 0 ? "md:col-span-2" : ""}
              >
                <Link
                  href={`/collections/${collection.slug}`}
                  className="group block relative rounded-2xl overflow-hidden"
                >
                  <div
                    className={
                      index === 0 ? "aspect-[21/9] relative" : "aspect-[16/10] relative"
                    }
                  >
                    {collection.image_url && (
                      <Image
                        src={collection.image_url}
                        alt={collection.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes={index === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <h2 className="font-display text-2xl md:text-3xl text-white mb-2">
                      {collection.name}
                    </h2>
                    {collection.description && (
                      <p className="text-white/80 text-sm mb-4 max-w-md line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-2 text-sm text-white font-medium group-hover:gap-3 transition-all">
                      Découvrir
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
