/**
 * The return path (D-097).
 *
 * `next` comes from a URL a stranger can write, so it is treated as hostile input.
 * A value is accepted only when it is a same-site path: one leading slash, no
 * scheme, no host, no backslash and no encoded separator. `//evil.example` and
 * `/\evil.example` are both navigable to another origin by the browser, which is
 * exactly the open redirect this function exists to stop.
 */

export const MAX_NEXT_PATH_LENGTH = 512;

const ENCODED_SEPARATOR = /%(?:2f|5c)/i;
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/;

export function safeNextPath(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const path = value.trim();

  if (path.length === 0 || path.length > MAX_NEXT_PATH_LENGTH) {
    return null;
  }

  if (!path.startsWith("/") || path.startsWith("//")) {
    return null;
  }

  if (path.includes("\\") || ENCODED_SEPARATOR.test(path)) {
    return null;
  }

  if (CONTROL_CHARACTER.test(path)) {
    return null;
  }

  return path;
}
