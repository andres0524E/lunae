import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { Logo } from "./Logo";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/whatsapp";

export function SiteHeader() {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 120], [0, 1]);
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 border-b border-border/70 bg-background/80 backdrop-blur-xl"
      />
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
        <Link to="/" aria-label="Lunae, inicio">
          <Logo size="sm" />
        </Link>
        <nav className="flex items-center gap-1 md:gap-3">
          <Link
            to="/"
            onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
            className="hidden px-3 py-2 text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Catálogo
          </Link>
          <a
            href={whatsappLink("Hola Lunae ✨ Me gustaría ver más joyas.")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-sm text-foreground transition-all duration-300 hover:border-gold hover:bg-accent"
          >
            <WhatsAppIcon className="h-4 w-4 text-gold-deep" />
            <span className="hidden sm:inline">Escríbenos</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-14 text-center">
        <Logo />
        <p className="max-w-md font-display text-xl italic text-muted-foreground">
          Piezas que brillan como la luna, elegidas con cariño para ti.
        </p>
        <div className="hairline w-40" />
        <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-foreground">
            <WhatsAppIcon className="h-4 w-4" /> {WHATSAPP_DISPLAY}
          </a>
          <span>Entregas en persona · Apartados por WhatsApp</span>
        </div>
        <Link to="/admin" className="text-xs tracking-widest text-muted-foreground/60 uppercase hover:text-muted-foreground">
          Acceso privado
        </Link>
      </div>
    </footer>
  );
}

export function WhatsAppFab() {
  return (
    <motion.a
      href={whatsappLink("Hola Lunae ✨ Me gustaría más información.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Escribir por WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-gold-gradient text-primary-foreground shadow-gold md:bottom-8 md:right-8"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </motion.a>
  );
}
