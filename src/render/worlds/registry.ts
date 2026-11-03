import { WORLDS } from "@/schema";

import { baseWorld } from "./base";
import type { WorldSections } from "./types";

export type WorldKey = (typeof WORLDS)[number];

export const worldRegistry: Record<WorldKey, WorldSections> = {
  editorial: baseWorld,
  terminal: baseWorld,
};
