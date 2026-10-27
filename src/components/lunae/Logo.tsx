import moon from "@/assets/lunae-moon.png";
import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const moonSize = size === "lg" ? "h-24 w-24" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const text = size === "lg" ? "text-6xl md:text-7xl tracking-[0.35em]" : size === "sm" ? "text-lg tracking-[0.3em]" : "text-2xl tracking-[0.32em]";
  return (
    <span className={cn("inline-flex items-center gap-2.5", size === "lg" && "flex-col gap-4", className)}>
      <img src={moon} alt="" aria-hidden className={cn(moonSize, "object-contain")} width={73} height={76} />
      <span className={cn("font-display font-medium text-gold-gradient", text, size === "lg" && "pl-[0.35em]")}>
        LUNAE
      </span>
    </span>
  );
}
