import { validateDesign } from "@/schema";
import type { DesignDocument } from "@/schema";

export const DESIGN_MESSAGE_TYPE = "folio:design";

export type DesignMessage = {
  type: typeof DESIGN_MESSAGE_TYPE;
  design: DesignDocument;
};

export type MessageContext = {
  origin: string;
  parent: unknown;
};

export function createDesignMessage(design: DesignDocument): DesignMessage {
  return { type: DESIGN_MESSAGE_TYPE, design };
}

/** The design inside a message, or null when the message is not one or is invalid. */
export function parseDesignMessage(data: unknown): DesignDocument | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }

  const record = data as Record<string, unknown>;

  if (record.type !== DESIGN_MESSAGE_TYPE) {
    return null;
  }

  const design = validateDesign(record.design);

  return design.success ? design.data : null;
}

/**
 * The design to show for an incoming message, or null when it must be ignored.
 *
 * A frame accepts only a message from its own parent, from the same origin, and
 * carrying a design the F-02 validator accepts (D-073).
 */
export function designFromMessage(
  event: { origin: string; source: unknown; data: unknown },
  context: MessageContext,
): DesignDocument | null {
  if (context.parent === null || context.parent === undefined) {
    return null;
  }

  if (event.origin !== context.origin) {
    return null;
  }

  if (event.source !== context.parent) {
    return null;
  }

  return parseDesignMessage(event.data);
}
