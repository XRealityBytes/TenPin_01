/**
 * PillLink — capsule-shaped link button with three tone variants.
 *
 * Tones:
 *  - "light"  → white bg, dark text (primary CTA)
 *  - "accent" → red bg, white text (brand CTA)
 *  - "ghost"  → transparent with subtle border (secondary actions)
 *
 * Ported from Rowans_Bowling_GC_01 for visual consistency.
 */
import { SmartLink } from "@/components/SmartLink";
import { cn } from "@/lib/cn";

type PillLinkProps = {
  href: string;
  children: React.ReactNode;
  tone?: "light" | "accent" | "ghost";
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export function PillLink({
  href,
  children,
  tone = "light",
  className,
  onClick,
}: PillLinkProps) {
  return (
    <SmartLink
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full border px-5 py-2.5 text-[0.78rem] font-medium uppercase tracking-[0.22em] transition-[transform,background-color,border-color,color,box-shadow] duration-(--duration-base) ease-(--ease-standard) hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        tone === "light" &&
          "border-border-strong bg-white text-black shadow-[0_12px_28px_rgba(255,255,255,0.12)] hover:border-white hover:bg-white/92",
        tone === "accent" &&
          "border-accent bg-accent text-white shadow-[0_12px_32px_rgba(255,0,0,0.24)] hover:border-white hover:bg-red-600",
        tone === "ghost" &&
          "border-border bg-white/5 text-white hover:border-white/40 hover:bg-white/10",
        className,
      )}
    >
      {children}
    </SmartLink>
  );
}
