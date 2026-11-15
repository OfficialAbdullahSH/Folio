import { AppHeader } from "@/components/app-header";
import { AppShell } from "@/components/app-shell";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell header={<AppHeader />}>
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16"
      >
        {children}
      </main>
    </AppShell>
  );
}
