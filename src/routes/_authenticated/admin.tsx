import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Eye, Gem, Loader2, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/lunae/Logo";
import { PieceForm } from "@/components/lunae/PieceForm";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { STATUSES, adminQuery, removePhotos, type Piece, type Status } from "@/lib/jewelry";
import { formatPrice } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Panel · Lunae" },
      { name: "description", content: "Administra las joyas del catálogo Lunae." },
      { property: "og:title", content: "Panel · Lunae" },
      { property: "og:description", content: "Administra las joyas del catálogo Lunae." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function useIsAdmin(userId: string) {
  return useQuery({
    queryKey: ["is-admin", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
}

function AdminPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAdmin = useIsAdmin(user.id);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-ivory-gradient pb-28">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-5">
          <Link to="/" aria-label="Ver catálogo">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/">
                <Eye /> <span className="hidden sm:inline">Ver catálogo</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={signOut}>
              <LogOut /> <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {isAdmin.isLoading ? (
        <div className="grid place-items-center pt-32">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : isAdmin.data ? (
        <Manager />
      ) : (
        <div className="mx-auto max-w-md px-6 pt-24 text-center">
          <h1 className="font-display text-3xl">Sin permiso</h1>
          <p className="mt-3 text-muted-foreground">
            Esta cuenta ({user.email}) no tiene acceso para administrar el catálogo.
          </p>
        </div>
      )}
    </div>
  );
}

function Manager() {
  const queryClient = useQueryClient();
  const { data: pieces = [], isLoading } = useQuery(adminQuery());
  const [filter, setFilter] = useState<Status | "todas">("todas");
  const [editing, setEditing] = useState<Piece | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Piece | null>(null);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-jewelry"] });
    queryClient.invalidateQueries({ queryKey: ["catalog"] });
    queryClient.invalidateQueries({ queryKey: ["piece"] });
  };

  const counts = {
    todas: pieces.length,
    disponible: pieces.filter((p) => p.status === "disponible").length,
    apartada: pieces.filter((p) => p.status === "apartada").length,
    vendida: pieces.filter((p) => p.status === "vendida").length,
  };
  const visible = filter === "todas" ? pieces : pieces.filter((p) => p.status === filter);

  async function setStatus(piece: Piece, status: Status) {
    queryClient.setQueryData<Piece[]>(["admin-jewelry"], (old) => old?.map((p) => (p.id === piece.id ? { ...p, status } : p)));
    const { error } = await supabase.from("jewelry").update({ status }).eq("id", piece.id);
    if (error) toast.error("No se pudo actualizar");
    else toast.success(`Marcada como ${STATUSES.find((s) => s.value === status)?.label.toLowerCase()}`);
    refresh();
  }

  async function confirmDelete() {
    if (!toDelete) return;
    const { error } = await supabase.from("jewelry").delete().eq("id", toDelete.id);
    if (error) toast.error("No se pudo eliminar");
    else {
      void removePhotos(toDelete.images);
      toast.success("Joya eliminada");
    }
    setToDelete(null);
    refresh();
  }

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <main className="mx-auto max-w-5xl px-5 pt-8">
      <div className="flex flex-col gap-1">
        <p className="eyebrow">Panel</p>
        <h1 className="font-display text-4xl md:text-5xl">Mis joyas</h1>
      </div>

      <div className="-mx-5 mt-6 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
        <div className="flex w-max gap-2">
          {([
            ["todas", "Todas"],
            ["disponible", "Disponibles"],
            ["apartada", "Apartadas"],
            ["vendida", "Vendidas"],
          ] as const).map(([v, label]) => (
            <Button key={v} variant="chip" size="sm" data-active={filter === v} onClick={() => setFilter(v)} className="h-9 px-4">
              {label} <span className="opacity-60">{counts[v]}</span>
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid place-items-center pt-24">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-gold/40 bg-card/60 px-6 py-16 text-center">
          <Gem className="mb-4 h-10 w-10 text-gold" strokeWidth={1} />
          <h2 className="font-display text-2xl">{pieces.length ? "Nada por aquí" : "Agrega tu primera joya"}</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Toma una foto, ponle nombre y precio. Aparecerá en el catálogo al instante.
          </p>
          {!pieces.length && (
            <Button variant="gold" size="xl" className="mt-6" onClick={openNew}>
              <Plus /> Agregar joya
            </Button>
          )}
        </div>
      ) : (
        <motion.ul layout className="mt-6 grid gap-4 sm:grid-cols-2">
          <AnimatePresence>
            {visible.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-4 rounded-2xl border border-border bg-card p-3 shadow-soft"
              >
                <button onClick={() => { setEditing(p); setFormOpen(true); }} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  {p.imageUrls[0] ? (
                    <img src={p.imageUrls[0]} alt={p.name} className={cn("h-full w-full object-cover", p.status === "vendida" && "grayscale")} />
                  ) : (
                    <Gem className="m-auto h-6 w-6 text-gold" strokeWidth={1} />
                  )}
                </button>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-display text-xl leading-tight">{p.name}</p>
                      <p className="text-sm text-gold-deep">{formatPrice(Number(p.price))} · <span className="text-muted-foreground">{p.category}</span></p>
                    </div>
                    <div className="flex shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Editar" onClick={() => { setEditing(p); setFormOpen(true); }}>
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive" aria-label="Eliminar" onClick={() => setToDelete(p)}>
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-auto grid grid-cols-3 gap-1 rounded-full bg-secondary p-1">
                    {STATUSES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => p.status !== s.value && setStatus(p, s.value)}
                        className={cn(
                          "rounded-full py-1.5 text-xs transition-all duration-300",
                          p.status === s.value ? "bg-ink text-ink-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      {pieces.length > 0 && (
        <motion.div initial={{ y: 80 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 22 }} className="fixed inset-x-0 bottom-5 z-30 flex justify-center px-5">
          <Button variant="gold" size="xl" className="w-full max-w-sm" onClick={openNew}>
            <Plus /> Agregar joya
          </Button>
        </motion.div>
      )}

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto bg-background px-6 pb-0 sm:max-w-lg">
          <SheetHeader className="px-0">
            <SheetTitle className="font-display text-3xl font-normal">{editing ? "Editar joya" : "Nueva joya"}</SheetTitle>
          </SheetHeader>
          {formOpen && (
            <PieceForm
              key={editing?.id ?? "new"}
              piece={editing}
              onDone={() => {
                setFormOpen(false);
                refresh();
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl font-normal">¿Eliminar “{toDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrará del catálogo junto con sus fotos. Si solo se vendió, mejor márcala como “Vendida”.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
