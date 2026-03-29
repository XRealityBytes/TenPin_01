/**
 * URL safety helpers for links.
 *
 * - sanitizeHref  — strips dangerous protocols (javascript:, data:, etc.)
 * - isAppRouteHref — returns true for internal Next.js routes
 * - mergeRelValues — ensures `noopener noreferrer` on external links
 *
 * Ported from Rowans_Bowling_GC_01 for consistent link behaviour.
 */

const FALLBACK_HREF = "#";

const allowedProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);

function isSafeRelativeHref(href: string) {
  return (
    (href.startsWith("/") && !href.startsWith("//")) ||
    href.startsWith("./") ||
    href.startsWith("../") ||
    href.startsWith("#") ||
    href.startsWith("?")
  );
}

/** Return the href as-is if it's safe; otherwise return "#". */
export function sanitizeHref(href: string) {
  const trimmedHref = href.trim();

  if (!trimmedHref) {
    return FALLBACK_HREF;
  }

  if (isSafeRelativeHref(trimmedHref)) {
    return trimmedHref;
  }

  try {
    const parsedHref = new URL(trimmedHref);

    if (allowedProtocols.has(parsedHref.protocol)) {
      return trimmedHref;
    }
  } catch {
    /* malformed URL — fall through to fallback */
  }

  return FALLBACK_HREF;
}

/** True when the href points to an internal app route (starts with `/`). */
export function isAppRouteHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

/** Merge required rel values (e.g. `noopener`) into an existing rel string. */
export function mergeRelValues(
  rel: string | undefined,
  requiredValues: readonly string[],
) {
  const mergedValues = new Set(rel?.split(/\s+/).filter(Boolean) ?? []);

  requiredValues.forEach((value) => {
    mergedValues.add(value);
  });

  return mergedValues.size > 0 ? Array.from(mergedValues).join(" ") : undefined;
}
