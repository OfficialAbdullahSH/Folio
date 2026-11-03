import { WORLDS } from "@/schema";

import { editorialWorld } from "./editorial";
import { terminalWorld } from "./terminal";
import type { World } from "./types";

export type WorldKey = (typeof WORLDS)[number];

export const worldRegistry: Record<WorldKey, World> = {
  editorial: editorialWorld,
  terminal: terminalWorld,
};
