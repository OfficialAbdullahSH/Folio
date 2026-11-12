/**
 * Writes the demo seed and its removal file (D-093).
 *
 * Run it with `npm run seed:demo` from the repository root. The data lives in
 * `src/search/demo-seed.ts` and is validated with the F-02 validators before any
 * SQL is written, so a broken demo fails here rather than in the SQL editor.
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildDemoRemovalSql,
  buildDemoSeedSql,
  DEMO_PORTFOLIOS,
} from "../src/search/demo-seed";

const root = process.cwd();
const seedPath = join(root, "supabase", "seed", "demo_portfolios.sql");
const removalPath = join(root, "supabase", "seed", "demo_portfolios_remove.sql");

const seed = buildDemoSeedSql(DEMO_PORTFOLIOS);
const removal = buildDemoRemovalSql(DEMO_PORTFOLIOS);

writeFileSync(seedPath, seed, "utf8");
writeFileSync(removalPath, removal, "utf8");

console.log(
  `Wrote ${DEMO_PORTFOLIOS.length} demo portfolios to ${seedPath} and ${removalPath}.`,
);
