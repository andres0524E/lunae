import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { ArrowDown, Gem, HandHeart, Sparkles } from "lucide-react";

import heroImg from "@/assets/hero-jewelry.jpg";
import moon from "@/assets/lunae-moon.png";
import { SiteFooter, SiteHeader, WhatsAppFab } from "@/components/lunae/SiteChrome";
import { PieceCard } from "@/components/lunae/PieceCard";
import { Button } from "@/components/ui/button";
import { CATEGORIES, catalogQuery } from "@/lib/jewelry";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lunae · Catálogo de joyería" },
      { name: "description", content: "Descubre las joyas de Lunae: anillos, collares, aretes y pulseras. Aparta tu pieza favorita por WhatsApp." },
      { property: "og:title", content: "Lunae · Catálogo de joyería" },
      { property: "og:description", content: "Anillos, collares, aretes y pulseras. Aparta tu pieza favorita por WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery()),
  component: Index,
});

const ease = [0.22, 1, 0.36, 1] as const;

function Index() {
  const { data: pieces } = useSuspenseQuery(catalogQuery());
  const [category, setCategory] = useState<string>("Todas");
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const available = useMemo(() => {
    const set = new Set(pieces.map((p) => p.category));
    return CATEGORIES.filter((c) => set.has(c));
  }, [pieces]);

  const filtered = category === "Todas" ? pieces : pieces.filter((p) => p.category === category);

  return (
    <div className="min-h-screen bg-ivory-gradient">
      <SiteHeader />

      {/* Hero */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[620px] overflow-hidden">
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <motion.img
            src={heroImg}
            alt="Collar de luna dorado y anillos sobre seda marfil"
            width={1600}
            height={1104}
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.2, ease }}
            className="h-full w-full object-cover object-[70%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent md:via-background/40" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </motion.div>

        <motion.div
          style={{ y: textY, opacity: fade }}
          className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 md:px-8"
        >
          <motion.img
            src={moon}
            alt=""
            aria-hidden
            initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 1.6, ease, delay: 0.3 }}
            className="animate-float mb-6 h-20 w-20 object-contain md:h-24 md:w-24"
          />
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.6 }}
            className="eyebrow mb-5"
          >
            Joyería · Colección actual
          </motion.p>
          <h1 className="max-w-2xl font-display text-6xl leading-[0.95] font-light text-foreground sm:text-7xl md:text-8xl">
            {["Brilla", "como la"].map((w, i) => (
              <motion.span
                key={w}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease, delay: 0.75 + i * 0.15 }}
                className="block"
              >
                {w}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease, delay: 1.05 }}
              className="block italic text-gold-gradient"
            >
              luna.
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.4 }}
            className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Piezas delicadas, elegidas una a una. Encuentra la tuya y apártala con un mensaje.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 1.6 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Button
              variant="gold"
              size="xl"
              onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
            >
              Ver catálogo <ArrowDown />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Promesa */}
      <section className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-3">
          {[
            { icon: Gem, title: "Piezas únicas", text: "Selección cuidada, muchas son de una sola pieza." },
            { icon: Sparkles, title: "Aparta fácil", text: "Un mensaje por WhatsApp y es tuya." },
            { icon: HandHeart, title: "Entrega en persona", text: "Te la entregamos en mano, con cariño." },
          ].map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, ease, delay: i * 0.12 }}
              className="flex flex-col items-center text-center"
            >
              <Icon className="mb-3 h-6 w-6 text-gold" strokeWidth={1.25} />
              <h3 className="font-display text-xl">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Catálogo */}
      <section id="catalogo" className="mx-auto max-w-7xl scroll-mt-24 px-5 pt-16 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease }}
          className="mb-10 flex flex-col items-center text-center"
        >
          <p className="eyebrow mb-3">El catálogo</p>
          <h2 className="font-display text-5xl font-light md:text-6xl">
            Nuestras <span className="italic text-gold-gradient">joyas</span>
          </h2>
          <div className="hairline mt-6 w-32" />
        </motion.div>

        {available.length > 1 && (
          <div className="-mx-5 mb-10 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
            <div className="mx-auto flex w-max gap-2">
              {["Todas", ...available].map((c) => (
                <Button
                  key={c}
                  variant="chip"
                  size="sm"
                  data-active={category === c}
                  onClick={() => setCategory(c)}
                  className="h-9 px-5 tracking-wide"
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyCatalog />
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-14 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <PieceCard key={p.id} piece={p} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <SiteFooter />
      <WhatsAppFab />
    </div>
  );
}

function EmptyCatalog() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-dashed border-gold/40 bg-card/60 px-8 py-16 text-center">
      <img src={moon} alt="" aria-hidden className="animate-float mb-5 h-16 w-16 object-contain" />
      <h3 className="font-display text-2xl">Muy pronto, nuevas piezas</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Estamos preparando la colección. Mientras tanto, escríbenos por WhatsApp para ver lo más nuevo.
      </p>
    </div>
  );
}
