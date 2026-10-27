import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Gem } from "lucide-react";
import type { Piece } from "@/lib/jewelry";
import { formatPrice } from "@/lib/whatsapp";

export function PieceCard({ piece, index }: { piece: Piece; index: number }) {
  const [first, second] = piece.imageUrls;
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.7, delay: Math.min(index, 8) * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to="/joya/$id" params={{ id: piece.id }} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary shadow-soft transition-shadow duration-500 group-hover:shadow-lift">
          {first ? (
            <>
              <img
                src={first}
                alt={piece.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ease-lux group-hover:scale-105"
              />
              {second && (
                <img
                  src={second}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-lux group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="grid h-full place-items-center text-gold">
              <Gem className="h-10 w-10" strokeWidth={1} />
            </div>
          )}
          <div className="absolute inset-0 bg-veil opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {piece.status === "apartada" && (
            <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-[0.65rem] tracking-[0.2em] text-ink-foreground uppercase backdrop-blur">
              Apartada
            </span>
          )}
          {piece.featured && piece.status !== "apartada" && (
            <span className="absolute left-3 top-3 rounded-full bg-card/85 px-3 py-1 text-[0.65rem] tracking-[0.2em] text-gold-deep uppercase backdrop-blur">
              Destacada
            </span>
          )}
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-3 rounded-full bg-card/90 px-4 py-1.5 text-xs tracking-widest text-foreground uppercase opacity-0 backdrop-blur transition-all duration-500 ease-lux group-hover:translate-y-0 group-hover:opacity-100">
            Ver pieza
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-1 px-1 md:flex-row md:items-start md:justify-between md:gap-3">
          <div className="min-w-0 flex-1">
            <p className="eyebrow mb-1">{piece.category}</p>
            <h3 className="truncate font-display text-xl leading-tight text-foreground md:text-2xl">{piece.name}</h3>
          </div>
          <p className="shrink-0 font-display md:pt-4 text-lg text-gold-deep md:text-xl">{formatPrice(Number(piece.price))}</p>
        </div>
      </Link>
    </motion.article>
  );
}
