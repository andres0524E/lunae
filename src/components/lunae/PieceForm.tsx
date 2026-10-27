import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, STATUSES, photoUrl, removePhotos, uploadPhoto, type Piece, type Status } from "@/lib/jewelry";
import { cn } from "@/lib/utils";

type Photo = { path: string; url: string };

export function PieceForm({ piece, onDone }: { piece: Piece | null; onDone: () => void }) {
  const [name, setName] = useState(piece?.name ?? "");
  const [price, setPrice] = useState(piece ? String(piece.price) : "");
  const [category, setCategory] = useState(piece?.category ?? "Anillos");
  const [status, setStatus] = useState<Status>((piece?.status as Status) ?? "disponible");
  const [description, setDescription] = useState(piece?.description ?? "");
  const [featured, setFeatured] = useState(piece?.featured ?? false);
  const [photos, setPhotos] = useState<Photo[]>(
    piece ? piece.images.map((path, i) => ({ path, url: piece.imageUrls[i] ?? "" })) : [],
  );
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const freshUploads = useRef<string[]>([]);
  const saved = useRef(false);

  useEffect(() => {
    return () => {
      // Clean up photos uploaded in a form that was closed without saving
      if (!saved.current && freshUploads.current.length) void removePhotos(freshUploads.current);
    };
  }, []);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    await Promise.all(
      list.map(async (file) => {
        try {
          const path = await uploadPhoto(file);
          freshUploads.current.push(path);
          const url = photoUrl(path);
          setPhotos((p) => [...p, { path, url }]);
        } catch {
          toast.error(`No se pudo subir ${file.name}`);
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
    if (fileRef.current) fileRef.current.value = "";
  }

  function makeMain(i: number) {
    setPhotos((p) => {
      const main = p[i];
      return main ? [main, ...p.filter((_, j) => j !== i)] : p;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const priceNum = Number(price.replace(/[^0-9.]/g, ""));
    if (!name.trim()) {
      toast.error("Escribe el nombre de la joya");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      toast.error("Revisa el precio");
      return;
    }
    setSaving(true);
    const payload = {
      name: name.trim(),
      price: priceNum,
      category,
      status,
      description: description.trim(),
      featured,
      images: photos.map((p) => p.path),
    };
    const { error } = piece
      ? await supabase.from("jewelry").update(payload).eq("id", piece.id)
      : await supabase.from("jewelry").insert(payload);
    setSaving(false);
    if (error) {
      toast.error("No se pudo guardar: " + error.message);
      return;
    }
    saved.current = true;
    if (piece) {
      const removed = piece.images.filter((p) => !payload.images.includes(p));
      void removePhotos(removed);
    }
    toast.success(piece ? "Cambios guardados" : "Joya agregada al catálogo ✨");
    onDone();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      {/* Fotos */}
      <div>
        <Label className="mb-2 block text-sm">Fotos</Label>
        <div className="grid grid-cols-3 gap-3">
          {photos.map((p, i) => (
            <div key={p.path} className="group relative aspect-square overflow-hidden rounded-xl bg-secondary">
              {p.url && <img src={p.url} alt="" className="h-full w-full object-cover" />}
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-ink/80 px-2 py-0.5 text-[0.6rem] tracking-wider text-ink-foreground uppercase">
                  Principal
                </span>
              )}
              <button type="button" onClick={() => setPhotos((ps) => ps.filter((_, j) => j !== i))} aria-label="Quitar foto" className="absolute top-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-full bg-card/90 text-foreground shadow-soft">
                <X className="h-4 w-4" />
              </button>
              {i !== 0 && (
                <button type="button" onClick={() => makeMain(i)} aria-label="Usar como principal" className="absolute top-1.5 left-1.5 grid h-7 w-7 place-items-center rounded-full bg-card/90 text-gold-deep shadow-soft">
                  <Star className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <div key={`up-${i}`} className="grid aspect-square place-items-center rounded-xl bg-secondary">
              <Loader2 className="h-5 w-5 animate-spin text-gold" />
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gold/40 text-gold-deep transition-colors hover:border-gold hover:bg-accent"
          >
            <Camera className="h-6 w-6" strokeWidth={1.5} />
            <span className="text-xs">Agregar</span>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        <p className="mt-2 text-xs text-muted-foreground">La primera foto es la que se ve en el catálogo.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Anillo Luna dorada" className="h-12 rounded-xl text-base" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="price">Precio (MXN)</Label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground">$</span>
          <Input id="price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="450" className="h-12 rounded-xl pl-8 text-base" />
        </div>
      </div>

      <ChipGroup label="Tipo de joya" options={CATEGORIES.map((c) => ({ value: c, label: c }))} value={category} onChange={setCategory} />
      <ChipGroup label="Estado" options={STATUSES.map((s) => ({ value: s.value, label: s.label }))} value={status} onChange={(v) => setStatus(v as Status)} />

      <div className="space-y-1.5">
        <Label htmlFor="desc">Descripción (opcional)</Label>
        <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Material, medida, detalles…" rows={3} className="rounded-xl text-base" />
      </div>

      <label className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <span>
          <span className="block text-sm font-medium">Destacar</span>
          <span className="block text-xs text-muted-foreground">Aparece primero en el catálogo</span>
        </span>
        <Switch checked={featured} onCheckedChange={setFeatured} />
      </label>

      <div className="sticky bottom-0 -mx-6 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
        <Button type="submit" variant="gold" size="xl" className="w-full" disabled={saving || uploading > 0}>
          {saving && <Loader2 className="animate-spin" />}
          {uploading > 0 ? "Subiendo fotos…" : piece ? "Guardar cambios" : "Publicar joya"}
        </Button>
      </div>
    </form>
  );
}

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Button key={o.value} type="button" variant="chip" data-active={value === o.value} onClick={() => onChange(o.value)} className={cn("h-10 px-4")}>
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
