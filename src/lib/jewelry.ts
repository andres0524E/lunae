import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const CATEGORIES = ["Anillos", "Collares", "Aretes", "Pulseras", "Conjuntos", "Otros"] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = [
  { value: "disponible", label: "Disponible" },
  { value: "apartada", label: "Apartada" },
  { value: "vendida", label: "Vendida" },
] as const;
export type Status = (typeof STATUSES)[number]["value"];

export type JewelryRow = Tables<"jewelry">;
export type Piece = JewelryRow & { imageUrls: string[] };

const BUCKET = "jewelry";

export function photoUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function withImageUrls(rows: JewelryRow[]): Piece[] {
  return rows.map((r) => ({ ...r, imageUrls: r.images.map(photoUrl) }));
}

export async function fetchCatalog(): Promise<Piece[]> {
  const { data, error } = await supabase
    .from("jewelry")
    .select("*")
    .neq("status", "vendida")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return withImageUrls(data ?? []);
}

export async function fetchPiece(id: string): Promise<Piece | null> {
  const { data, error } = await supabase.from("jewelry").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [piece] = withImageUrls([data]);
  return piece ?? null;
}

export async function fetchAllForAdmin(): Promise<Piece[]> {
  const { data, error } = await supabase
    .from("jewelry")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return withImageUrls(data ?? []);
}

export const catalogQuery = () =>
  queryOptions({ queryKey: ["catalog"], queryFn: fetchCatalog, staleTime: 60_000 });

export const pieceQuery = (id: string) =>
  queryOptions({ queryKey: ["piece", id], queryFn: () => fetchPiece(id), staleTime: 60_000 });

export const adminQuery = () =>
  queryOptions({ queryKey: ["admin-jewelry"], queryFn: fetchAllForAdmin });

/** Resize a photo in the browser so uploads are fast from a phone. */
async function compressImage(file: File, maxSize = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), "image/webp", 0.85),
  );
}

export async function uploadPhoto(file: File): Promise<string> {
  let blob: Blob = file;
  try {
    blob = await compressImage(file);
  } catch {
    blob = file;
  }
  const ext = blob.type === "image/webp" ? "webp" : (file.name.split(".").pop() ?? "jpg");
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: blob.type || file.type, upsert: false });
  if (error) throw error;
  return path;
}

export async function removePhotos(paths: string[]) {
  if (!paths.length) return;
  await supabase.storage.from(BUCKET).remove(paths);
}
