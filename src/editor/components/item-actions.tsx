"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import type { MoveDirection } from "../reducer";
import { cn } from "../lib/cn";
import { ICON_BUTTON } from "../lib/styles";

/**
 * Reorder and remove, one place for every list (D-069).
 *
 * Each control is 44px, carries a spoken label that names the item, and is disabled
 * at the ends so the button never does nothing when it is pressed.
 */
export function ItemActions({
  label,
  index,
  count,
  onMove,
  onRemove,
}: {
  label: string;
  index: number;
  count: number;
  onMove: (direction: MoveDirection) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={ICON_BUTTON}
        onClick={() => onMove("up")}
        disabled={index === 0}
        aria-label={`Move ${label} up`}
      >
        <ArrowUp aria-hidden="true" size={18} />
      </button>
      <button
        type="button"
        className={ICON_BUTTON}
        onClick={() => onMove("down")}
        disabled={index === count - 1}
        aria-label={`Move ${label} down`}
      >
        <ArrowDown aria-hidden="true" size={18} />
      </button>
      <button
        type="button"
        className={cn(ICON_BUTTON, "border-transparent text-danger hover:bg-danger-surface active:bg-danger-surface")}
        onClick={onRemove}
        aria-label={`Remove ${label}`}
      >
        <Trash2 aria-hidden="true" size={18} />
      </button>
    </div>
  );
}
