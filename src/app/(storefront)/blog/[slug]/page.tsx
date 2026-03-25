"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Link2,
  Share2,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  image: string;
  content: React.ReactNode;
};

const articles: Article[] = [
  {
    slug: "comment-entretenir-vos-bijoux-en-fleurs-sechees",
    title: "Comment entretenir vos bijoux en fleurs séchées",
    excerpt:
      "Découvrez nos conseils d'experte pour préserver la beauté de vos bijoux ISHYA au fil du temps.",
    category: "Entretien",
    date: "12 mars 2026",
    readTime: "5 min",
    author: "Camille Laurent",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1600&h=700&fit=crop",
    content: (
      <>
        <p>
          Vos bijoux ISHYA sont de véritables petites œuvres d&apos;art, créées
          avec amour et minutie dans notre atelier parisien. Chaque pièce renferme
          des fleurs séchées naturelles, soigneusement préservées dans une résine
          époxy de haute qualité. Pour que votre bijou conserve tout son éclat au
          fil des années, voici nos conseils d&apos;entretien essentiels.
        </p>

        <h2>Évitez le contact avec l&apos;eau</h2>
        <p>
          Bien que la résine soit un matériau résistant, une exposition prolongée
          à l&apos;eau peut ternir sa brillance avec le temps. Nous vous
          recommandons de retirer vos bijoux avant la douche, le bain, la piscine
          ou toute activité aquatique. L&apos;eau chlorée et l&apos;eau salée
          sont particulièrement agressives pour la résine et les parties
          métalliques de vos bijoux.
        </p>
        <p>
          Si votre bijou entre accidentellement en contact avec l&apos;eau, pas de
          panique ! Séchez-le immédiatement avec un chiffon doux et sec.
          L&apos;important est d&apos;éviter l&apos;exposition prolongée.
        </p>

        <h2>Protégez-les des produits chimiques</h2>
        <p>
          Les parfums, crèmes hydratantes, laques, produits ménagers et autres
          substances chimiques peuvent altérer la surface de la résine et
          décolorer les éléments métalliques. Notre conseil : appliquez d&apos;abord
          vos produits cosmétiques, laissez-les sécher, puis mettez vos bijoux.
          C&apos;est la règle d&apos;or : vos bijoux doivent être les derniers que
          vous enfilez et les premiers que vous retirez.
        </p>

        <h2>Rangement optimal</h2>
        <p>
          Le rangement est crucial pour la longévité de vos bijoux en fleurs
          séchées. Voici les bonnes pratiques :
        </p>
        <ul>
          <li>
            <strong>Utilisez l&apos;écrin ISHYA</strong> fourni avec votre commande.
            Il est spécialement conçu pour protéger vos bijoux de la lumière et
            de la poussière.
          </li>
          <li>
            <strong>Évitez la lumière directe du soleil.</strong> Les rayons UV
            peuvent progressivement altérer les couleurs naturelles des fleurs
            séchées. Rangez vos bijoux dans un endroit sombre et sec.
          </li>
          <li>
            <strong>Séparez vos bijoux</strong> pour éviter les rayures. Ne les
            empilez pas et évitez le contact avec des surfaces dures ou
            d&apos;autres bijoux métalliques.
          </li>
          <li>
            <strong>Conservez-les au sec.</strong> L&apos;humidité peut favoriser
            l&apos;oxydation des parties métalliques. Un sachet de silice dans
            votre boîte à bijoux peut aider.
          </li>
        </ul>

        <h2>Nettoyage en douceur</h2>
        <p>
          Pour nettoyer vos bijoux ISHYA, utilisez simplement un chiffon doux et
          sec (type microfibre). Essuyez délicatement après chaque utilisation
          pour retirer les traces de doigts et l&apos;excès de sébum.
        </p>
        <p>
          Si nécessaire, vous pouvez utiliser un chiffon très légèrement humide,
          puis sécher immédiatement et complètement le bijou. <strong>N&apos;utilisez
          jamais</strong> de produits nettoyants, d&apos;alcool, de vinaigre ou de
          solutions abrasives.
        </p>

        <h2>Ce qu&apos;il faut retenir</h2>
        <p>
          Avec ces quelques gestes simples, vos bijoux ISHYA vous accompagneront
          fidèlement pendant de nombreuses années. La résine de qualité
          bijouterie que nous utilisons est conçue pour durer, et les fleurs
          séchées conservent admirablement bien leurs couleurs lorsqu&apos;elles
          sont correctement protégées. Pensez à vos bijoux comme à de petits
          jardins précieux : un peu d&apos;attention et de soin, et ils resteront
          magnifiques saison après saison.
        </p>
      </>
    ),
  },
  {
    slug: "guide-choisir-la-bague-parfaite",
    title: "Guide : Choisir la bague parfaite",
    excerpt:
      "Comment trouver la bague qui vous correspond ? Notre guide complet pour un choix éclairé.",
    category: "Guides",
    date: "5 mars 2026",
    readTime: "7 min",
    author: "Camille Laurent",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1600&h=700&fit=crop",
    content: (
      <>
        <p>
          Choisir une bague, qu&apos;elle soit pour soi ou pour offrir, est un
          moment particulier. Chez ISHYA, chaque bague est une pièce unique
          qui capture la beauté d&apos;une fleur pour l&apos;éternité. Pour
          vous aider à trouver la bague parfaite, nous avons rassemblé tous
          nos conseils dans ce guide complet.
        </p>

        <h2>Connaître sa taille de bague</h2>
        <p>
          C&apos;est la première étape et la plus importante. Nos bijoux en
          résine ne pouvant pas être redimensionnés après fabrication, il est
          essentiel de connaître sa taille exacte avant de commander. Voici
          les méthodes les plus fiables :
        </p>
        <ul>
          <li>
            <strong>La méthode du fil :</strong> enroulez un fil ou une fine
            bande de papier autour du doigt concerné. Marquez l&apos;endroit
            où le fil se rejoint et mesurez la longueur en millimètres. Cette
            valeur correspond à la circonférence de votre doigt.
          </li>
          <li>
            <strong>La méthode de la bague existante :</strong> si vous possédez
            déjà une bague qui vous va bien, mesurez son diamètre intérieur en
            millimètres et consultez notre guide de correspondance.
          </li>
          <li>
            <strong>Chez un bijoutier :</strong> c&apos;est la méthode la plus
            précise. Tout bijoutier peut mesurer votre tour de doigt en quelques
            secondes avec un baguier professionnel.
          </li>
        </ul>
        <p>
          Pensez à mesurer votre doigt en fin de journée, lorsque vos doigts
          sont légèrement plus gonflés. Évitez de mesurer par temps très froid
          (doigts trop fins) ou après un effort physique (doigts gonflés).
        </p>

        <h2>Choisir le style adapté à votre quotidien</h2>
        <p>
          Nos bagues se déclinent en plusieurs styles, chacun adapté à un mode
          de vie différent. Réfléchissez à la façon dont vous porterez votre
          bague au quotidien :
        </p>
        <ul>
          <li>
            <strong>Les bagues fines :</strong> délicates et discrètes, elles
            sont parfaites pour un port quotidien. Leur profil bas les rend
            confortables pour toutes les activités. Idéales aussi pour
            l&apos;accumulation (le « stacking »).
          </li>
          <li>
            <strong>Les bagues cabochon :</strong> avec leur dôme de résine
            arrondi, elles sont les pièces signatures d&apos;ISHYA. Plus
            présentes visuellement, elles sont un véritable sujet de
            conversation.
          </li>
          <li>
            <strong>Les bagues cocktail :</strong> plus imposantes et
            sculpturales, elles sont idéales pour les occasions spéciales ou
            pour celles qui aiment les accessoires statement.
          </li>
        </ul>

        <h2>Les fleurs et leurs significations</h2>
        <p>
          Chaque fleur porte en elle une symbolique. Chez ISHYA, nous avons
          sélectionné des variétés qui sont non seulement magnifiques en
          bijoux, mais aussi riches de sens :
        </p>
        <ul>
          <li>
            <strong>La rose :</strong> symbole universel d&apos;amour et
            d&apos;élégance. Nos roses terracotta sont la signature de la
            maison.
          </li>
          <li>
            <strong>Le gypsophile :</strong> symbole de pureté et de bonheur.
            Ses petites fleurs blanches créent un effet nuage absolument
            féérique dans la résine.
          </li>
          <li>
            <strong>La lavande :</strong> symbole de sérénité et de tendresse.
            Sa couleur violet doux apporte une note provençale à nos créations.
          </li>
          <li>
            <strong>L&apos;hortensia :</strong> symbole de gratitude et de grâce.
            Ses pétales délicats offrent un dégradé de couleurs unique dans la
            résine.
          </li>
        </ul>

        <h2>Offrir une bague ISHYA</h2>
        <p>
          Si vous cherchez un cadeau unique et personnel, une bague ISHYA est
          un choix parfait. Pour les cadeaux, nous vous conseillons de choisir
          une taille standard (52 ou 54 pour les femmes en France) si vous ne
          connaissez pas la taille exacte de la personne. Chaque bague est
          livrée dans un écrin ISHYA élégant, prêt à offrir. Vous pouvez
          ajouter un message personnalisé lors de votre commande.
        </p>

        <h2>En résumé</h2>
        <p>
          La bague parfaite est celle qui vous correspond : par sa taille, son
          style, la fleur qu&apos;elle renferme et l&apos;émotion qu&apos;elle
          vous procure. N&apos;hésitez pas à consulter notre guide des tailles
          en ligne ou à nous contacter pour un conseil personnalisé. Chez ISHYA,
          chaque bague est une promesse de nature et d&apos;éternité.
        </p>
      </>
    ),
  },
  {
    slug: "tendances-bijoux-floraux-2026",
    title: "Tendances bijoux floraux 2026",
    excerpt:
      "Les bijoux botaniques sont au cœur des tendances. Découvrez ce qui marquera 2026.",
    category: "Tendances",
    date: "28 février 2026",
    readTime: "6 min",
    author: "Camille Laurent",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1600&h=700&fit=crop",
    content: (
      <>
        <p>
          L&apos;année 2026 marque un tournant dans le monde de la bijouterie.
          Plus que jamais, la mode célèbre la nature, l&apos;artisanat et les
          pièces uniques qui racontent une histoire. Les bijoux floraux, et en
          particulier les créations en résine avec fleurs séchées, sont au
          cœur de cette tendance de fond. Voici les grands mouvements qui
          définissent cette année.
        </p>

        <h2>Le retour du fait-main et de l&apos;artisanat</h2>
        <p>
          Face à la fast fashion et à la production de masse, les
          consommatrices recherchent de plus en plus des pièces artisanales
          uniques. Le « slow jewelry », inspiré du mouvement slow fashion,
          valorise les créations faites à la main, en petites séries, avec des
          matériaux soigneusement sélectionnés. Chez ISHYA, cette philosophie
          est au cœur de notre démarche depuis le premier jour.
        </p>
        <p>
          Les réseaux sociaux, et notamment Instagram et TikTok, ont amplifié
          cette tendance en mettant en lumière les coulisses des ateliers
          artisanaux. Les vidéos montrant le processus de création — de la
          fleur fraîche au bijou fini — captivent des millions de spectateurs
          et renforcent l&apos;attrait pour ces pièces chargées d&apos;âme.
        </p>

        <h2>Les couleurs terracotta et nude dominent</h2>
        <p>
          Les palettes de couleurs 2026 font la part belle aux teintes
          naturelles et chaudes. Le terracotta, le nude rosé, l&apos;ivoire
          et l&apos;or doux sont les couleurs phares de la saison en
          bijouterie florale. Ces teintes s&apos;intègrent parfaitement dans
          les garde-robes actuelles et apportent une touche d&apos;élégance
          naturelle à toute tenue.
        </p>
        <p>
          La combinaison de fleurs séchées dans les tons terracotta avec des
          montures dorées crée un effet à la fois moderne et intemporel. C&apos;est
          cette alchimie que nous cultivons chez ISHYA avec notre palette
          signature, directement inspirée des teintes de la terre et des
          jardins méditerranéens.
        </p>

        <h2>L&apos;accumulation et le layering</h2>
        <p>
          L&apos;art de superposer et d&apos;accumuler les bijoux reste une
          tendance forte en 2026. Les bagues fines en résine florale se
          prêtent parfaitement au « stacking » : portez-en deux ou trois sur
          le même doigt ou sur des doigts adjacents pour un effet bohème-chic
          très actuel.
        </p>
        <p>
          Pour les colliers, le layering de chaînes de différentes longueurs
          — un ras-de-cou avec un pendentif en résine florale et un sautoir
          doré — crée un look sophistiqué et personnel. Les bracelets
          s&apos;accumulent aussi, mélangeant chaînes fines et pièces en
          résine pour un poignet plein de caractère.
        </p>

        <h2>La bijouterie éco-responsable</h2>
        <p>
          La durabilité n&apos;est plus une option, c&apos;est une attente.
          En 2026, les consommatrices veulent savoir d&apos;où viennent
          leurs bijoux, comment ils sont fabriqués et quel est leur impact
          environnemental. Les bijoux en fleurs séchées répondent naturellement
          à cette exigence : matériaux naturels, processus de fabrication à
          faible impact, absence de métaux précieux issus de l&apos;extraction
          minière.
        </p>
        <p>
          Chez ISHYA, nous allons plus loin en privilégiant des fleurs
          cultivées localement, des emballages recyclables et des résines
          hypoallergéniques. Notre engagement pour une bijouterie plus
          responsable est au cœur de notre identité de marque.
        </p>

        <h2>En conclusion</h2>
        <p>
          2026 est définitivement l&apos;année de la bijouterie florale et
          artisanale. Les tendances convergent vers des valeurs qui sont
          inscrites dans l&apos;ADN d&apos;ISHYA depuis sa création :
          authenticité, beauté naturelle, savoir-faire artisanal et respect de
          l&apos;environnement. Si vous n&apos;avez pas encore succombé à la
          magie des bijoux en fleurs séchées, c&apos;est le moment idéal pour
          découvrir nos collections.
        </p>
      </>
    ),
  },
];

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const article = articles.find((a) => a.slug === slug);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (!article) {
    return (
      <div className="py-32 text-center">
        <h1 className="font-display text-3xl mb-4">Article introuvable</h1>
        <Link href="/blog" className="btn-primary">
          Retour au journal
        </Link>
      </div>
    );
  }

  const otherArticles = articles.filter((a) => a.slug !== slug);

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setSubscribed(true);
  }

  return (
    <>
      {/* Cover */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 container px-4 pb-12 text-white">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <span className="bg-terracotta/90 text-white text-xs font-medium px-3 py-1 rounded-full">
                {article.category}
              </span>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-3xl md:text-4xl lg:text-5xl mt-4 max-w-3xl"
            >
              {article.title}
            </motion.h1>
            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-4 mt-4 text-sm text-white/80"
            >
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {article.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {article.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime} de lecture
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="py-12 md:py-16 px-4">
        <div className="container max-w-3xl mx-auto">
          {/* Share buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-10"
          >
            <span className="text-xs text-muted uppercase tracking-wider">
              Partager
            </span>
            <button
              onClick={handleCopyLink}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all",
                copied
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-border hover:border-terracotta/30 text-muted hover:text-terracotta"
              )}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Copié !
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5" />
                  Copier le lien
                </>
              )}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(article.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border hover:border-terracotta/30 text-muted hover:text-terracotta transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              Twitter
            </a>
          </motion.div>

          {/* Article content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose-article"
          >
            <div className="text-[15px] text-foreground/85 leading-[1.8] space-y-5 [&>h2]:font-display [&>h2]:text-xl [&>h2]:md:text-2xl [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:text-foreground [&>ul]:space-y-2 [&>ul]:pl-5 [&>ul]:list-disc [&>ul_li]:text-muted [&>p]:text-muted">
              {article.content}
            </div>
          </motion.div>

          {/* Newsletter CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-16 bg-beige-nude-light/50 border border-border rounded-2xl p-8 md:p-10 text-center"
          >
            <Mail className="w-8 h-8 text-terracotta mx-auto mb-3" />
            <h3 className="font-display text-xl md:text-2xl mb-2">
              Recevez nos prochains articles
            </h3>
            <p className="text-sm text-muted mb-6 max-w-md mx-auto">
              Inscrivez-vous à notre newsletter pour recevoir nos conseils,
              guides et nouveautés directement dans votre boîte mail.
            </p>
            {subscribed ? (
              <div className="inline-flex items-center gap-2 text-success text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Merci pour votre inscription !
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex gap-2 max-w-sm mx-auto"
              >
                <input
                  type="email"
                  required
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all"
                />
                <button type="submit" className="btn-primary shrink-0">
                  S&apos;inscrire
                </button>
              </form>
            )}
          </motion.div>

          {/* Related articles */}
          {otherArticles.length > 0 && (
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="mt-16"
            >
              <motion.h3
                variants={fadeInUp}
                className="font-display text-2xl mb-8"
              >
                Articles similaires
              </motion.h3>
              <motion.div
                variants={staggerContainer}
                className="grid sm:grid-cols-2 gap-6"
              >
                {otherArticles.map((a) => (
                  <motion.div key={a.slug} variants={staggerItem}>
                    <Link
                      href={`/blog/${a.slug}`}
                      className="group block bg-white border border-border rounded-xl overflow-hidden hover:border-terracotta/30 transition-all"
                    >
                      <div className="aspect-[16/9] relative overflow-hidden">
                        <Image
                          src={a.image}
                          alt={a.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5">
                        <p className="text-xs text-muted mb-2">
                          {a.date} · {a.readTime}
                        </p>
                        <h4 className="font-display text-base group-hover:text-terracotta transition-colors">
                          {a.title}
                        </h4>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}

          {/* Back to blog */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-12 text-center"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-terracotta transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au journal
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}
