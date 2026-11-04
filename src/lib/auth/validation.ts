import { z } from "zod";

import { displayNameSchema, LIMITS, usernameSchema } from "@/schema";

import { isAuthField, type AuthFieldErrors } from "./types";

const email = z
  .string()
  .transform((value) => value.trim())
  .pipe(
    z
      .string()
      .min(1, "Email is required")
      .max(LIMITS.url, `Email must be at most ${LIMITS.url} characters`)
      .pipe(z.email("Enter a valid email address")),
  );

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

const trimmed = (schema: z.ZodType<string, string>) =>
  z
    .string()
    .transform((value) => value.trim())
    .pipe(schema);

/**
 * Signup uses the F-02 profile schema for username and display name (D-032), so
 * the form, the database trigger and the public route agree on what a valid
 * profile is.
 */
export const signupSchema = z.object({
  email,
  password: passwordSchema,
  username: trimmed(usernameSchema),
  displayName: trimmed(displayNameSchema),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export type SignupValues = z.infer<typeof signupSchema>;
export type LoginValues = z.infer<typeof loginSchema>;

export function toFieldErrors(error: z.ZodError): AuthFieldErrors {
  const fieldErrors: AuthFieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];

    if (isAuthField(key) && fieldErrors[key] === undefined) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}
