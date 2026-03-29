/**
 * SmartLink — adaptive link component.
 *
 * Renders a Next.js <Link> for internal app routes and a plain <a> for
 * external URLs. All hrefs are sanitised to prevent javascript: injection.
 * External links opened in a new tab automatically get `noopener noreferrer`.
 *
 * Ported from Rowans_Bowling_GC_01 for consistent navigation behaviour.
 */
import type { AnchorHTMLAttributes } from "react";
import { forwardRef } from "react";

import Link from "next/link";

import { isAppRouteHref, mergeRelValues, sanitizeHref } from "@/lib/href";

type SmartLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  prefetch?: boolean;
};

export const SmartLink = forwardRef<HTMLAnchorElement, SmartLinkProps>(
  function SmartLink(
    { href, prefetch = false, children, rel, target, ...props },
    ref,
  ) {
    const safeHref = sanitizeHref(href);
    const safeRel =
      target === "_blank"
        ? mergeRelValues(rel, ["noopener", "noreferrer"])
        : rel;

    if (isAppRouteHref(safeHref)) {
      return (
        <Link
          ref={ref}
          href={safeHref}
          prefetch={prefetch}
          rel={safeRel}
          target={target}
          {...props}
        >
          {children}
        </Link>
      );
    }

    return (
      <a ref={ref} href={safeHref} rel={safeRel} target={target} {...props}>
        {children}
      </a>
    );
  },
);
