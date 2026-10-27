import { describe, expect, it } from "vitest";
import { pieceMessage, whatsappLink } from "@/lib/whatsapp";

describe("WhatsApp para apartar", () => {
  it("abre el chat del número de Lunae (+52 771 139 5823)", () => {
    expect(whatsappLink()).toBe("https://wa.me/527711395823");
  });

  it("el mensaje incluye el nombre y precio en pesos de la joya", () => {
    const msg = pieceMessage({ name: "Anillo Luna", price: 450 });
    expect(msg).toContain("Anillo Luna");
    expect(msg).toContain("$450");
    expect(whatsappLink(msg)).toContain(encodeURIComponent("Anillo Luna"));
  });
});
