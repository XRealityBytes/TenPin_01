/**
 * Container — centred content wrapper with fluid gutters.
 *
 * Constrains content to --content-max-width (88 rem) and applies horizontal
 * gutter padding that scales with the viewport via clamp().
 */
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[var(--content-max-width)] px-[var(--space-gutter)]",
        className,
      )}
      {...props}
    />
  );
}
