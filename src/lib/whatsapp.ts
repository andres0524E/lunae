export const WHATSAPP_NUMBER = "527711395823";
export const WHATSAPP_DISPLAY = "+52 771 139 5823";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function pieceMessage(piece: { name: string; price: number }, pageUrl?: string): string {
  const lines = [
    `Hola Lunae ✨ Me interesa apartar: *${piece.name}* (${formatPrice(piece.price)}).`,
    "¿Sigue disponible?",
  ];
  if (pageUrl) lines.push(pageUrl);
  return lines.join("\n");
}
