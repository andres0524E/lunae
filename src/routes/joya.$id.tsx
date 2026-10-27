import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, Gem, HandHeart } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/lunae/SiteChrome";
import { WhatsAppIcon } from "@/components/lunae/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { pieceQuery } from "@/lib/jewelry";
import { formatPrice, pieceMessage, whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/joya/$id")({
  loader: async ({ context, params }) => {
    const piece = await context.queryClient.ensureQueryData(pieceQuery(params.id));
    if (!piece) throw notFound();
    return { name: piece.name, description: piece.description, price: Number(piece.price) };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} · Lunae` : "Pieza no disponible · Lunae";
    const description = loaderData
      ? loaderData.description || `${loaderData.name} por ${formatPrice(loaderData.price)}. Apártala por WhatsApp.`
      : "Esta pieza ya no está disponible.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: PieceNotFound,
  component: PiecePage,
});

const ease = [0.22, 1, 0.36, 1] as const;

function PiecePage() {
  const { id } = Route.useParams();
  const { data: piece } = useSuspenseQuery(pieceQuery(id));
  const [active, setActive] = useState(0);
  const [pageUrl, setPageUrl] = useState<string | undefined>();
  useEffect(() => setPageUrl(window.location.href), []);

  if (!piece) return <PieceNotFound />;
  const images = piece.imageUrls;
  const sold = piece.status === "vendida";
  const reserved = piece.status === "apartada";

  return (
    <div className="min-h-screen bg-ivory-gradient">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 pt-24 md:px-8 md:pt-32">
        <Link to="/" hash="catalogo" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo
        </Link>

        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          {/* Galería */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-secondary shadow-lift">
              <AnimatePresence mode="wait">
                {images[active] ? (
                  <motion.img
                    key={images[active]}
                    src={images[active]}
                    alt={piece.name}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-gold">
                    <Gem className="h-14 w-14" strokeWidth={1} />
                  </div>
                )}
              </AnimatePresence>
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActive(i)}
                    aria-label={`Foto ${i + 1}`}
                    className={cn(
                      "relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300",
                      i === active ? "border-gold" : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Detalles */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.15 }}
            className="flex flex-col md:py-6"
          >
            <p className="eyebrow mb-3">{piece.category}</p>
            <h1 className="font-display text-5xl leading-none font-light md:text-6xl">{piece.name}</h1>
            <p className="mt-5 font-display text-3xl text-gold-deep">{formatPrice(Number(piece.price))}</p>
            <div className="hairline my-8 w-full opacity-60" />
            {piece.description && (
              <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">{piece.description}</p>
            )}

            <div className="mt-10 flex flex-col gap-3">
              {sold ? (
                <p className="rounded-2xl bg-secondary px-5 py-4 text-center text-sm text-muted-foreground">
                  Esta pieza ya encontró dueña. Escríbenos y te mostramos algo parecido.
                </p>
              ) : (
                <>
                  {reserved && (
                    <p className="rounded-2xl bg-secondary px-5 py-3 text-center text-sm text-muted-foreground">
                      Esta pieza está apartada. Pregunta y te avisamos si se libera.
                    </p>
                  )}
                  <Button asChild variant="gold" size="xl" className="w-full">
                    <a href={whatsappLink(pieceMessage({ name: piece.name, price: Number(piece.price) }, pageUrl))} target="_blank" rel="noreferrer">
                      <WhatsAppIcon className="!h-5 !w-5" />
                      {reserved ? "Preguntar por esta pieza" : "Apartar por WhatsApp"}
                    </a>
                  </Button>
                </>
              )}
              <p className="mt-2 flex items-center justify-center gap-2 text-xs tracking-wide text-muted-foreground">
                <HandHeart className="h-4 w-4 text-gold" strokeWidth={1.5} /> Entrega en persona · Pago al recibir
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function PieceNotFound() {
  return (
    <div className="min-h-screen bg-ivory-gradient">
      <SiteHeader />
      <div className="mx-auto flex max-w-md flex-col items-center px-6 pt-40 text-center">
        <h1 className="font-display text-4xl">Pieza no disponible</h1>
        <p className="mt-3 text-muted-foreground">Es posible que ya se haya vendido. Mira el resto de la colección.</p>
        <Button asChild variant="ink" size="lg" className="mt-8">
          <Link to="/">Ver catálogo</Link>
        </Button>
      </div>
    </div>
  );
}
