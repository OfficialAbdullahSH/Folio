export const AUTH_FIELDS = ["email", "password", "username", "displayName"] as const;

export type AuthField = (typeof AUTH_FIELDS)[number];

export type AuthFieldErrors = Partial<Record<AuthField, string>>;

export type AuthFormState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: AuthFieldErrors;
};

export const initialAuthFormState: AuthFormState = { status: "idle" };

export function isAuthField(value: unknown): value is AuthField {
  return typeof value === "string" && (AUTH_FIELDS as readonly string[]).includes(value);
}
