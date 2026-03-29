/**
 * Lightweight class-name merge utility.
 *
 * Joins truthy string values with a space. Falsy values (false, null,
 * undefined, "") are silently dropped — this lets callers use conditional
 * expressions inline without ternaries.
 *
 * @example
 *   cn("px-4", isActive && "bg-accent", undefined) // → "px-4 bg-accent"
 */
export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
