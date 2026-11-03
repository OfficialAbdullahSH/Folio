import { z } from "zod";

import { LIMITS, RESERVED_USERNAMES } from "./constants";

const reserved = new Set<string>(RESERVED_USERNAMES);

export const usernameSchema = z
  .string()
  .min(LIMITS.usernameMin, `Username must be at least ${LIMITS.usernameMin} characters`)
  .max(LIMITS.usernameMax, `Username must be at most ${LIMITS.usernameMax} characters`)
  .regex(
    /^[a-z0-9-]+$/,
    "Username may only contain lowercase letters, digits and hyphens",
  )
  .refine(
    (value) => !value.startsWith("-") && !value.endsWith("-"),
    "Username cannot start or end with a hyphen",
  )
  .refine((value) => !reserved.has(value.toLowerCase()), "Username is reserved");

export const displayNameSchema = z
  .string()
  .max(LIMITS.displayName, `Must be at most ${LIMITS.displayName} characters`)
  .refine((value) => value.trim().length > 0, "Display name is required");

export const headlineSchema = z
  .string()
  .max(LIMITS.headline, `Must be at most ${LIMITS.headline} characters`);

export const profileSchema = z.strictObject({
  username: usernameSchema,
  displayName: displayNameSchema,
  headline: headlineSchema,
});

export type Profile = z.infer<typeof profileSchema>;
