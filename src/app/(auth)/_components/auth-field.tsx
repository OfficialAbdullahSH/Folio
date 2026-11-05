type AuthFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  hint?: string;
  error?: string;
};

export function AuthField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  hint,
  error,
}: AuthFieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="rounded-md border border-rule-strong bg-panel px-3 py-2 text-sm text-ink outline-none focus-visible:border-cta focus-visible:ring-2 focus-visible:ring-cta/30"
      />
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-soft">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className="rounded-md border border-danger/30 bg-danger-surface px-3 py-2 text-sm text-danger"
    >
      {message}
    </p>
  );
}
