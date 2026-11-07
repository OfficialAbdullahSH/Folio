/**
 * Reads what the owner typed into a hex field and returns the canonical value, or
 * null when it is not six hex digits. Case is normalized here so the saved design
 * matches what the F-02 validator outputs (D-077).
 */
export function normalizeHexInput(value: string): string | null {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(value.trim());

  return match === null ? null : `#${(match[1] as string).toLowerCase()}`;
}
