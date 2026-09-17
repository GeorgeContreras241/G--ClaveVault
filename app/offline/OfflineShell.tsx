"use client";

export function OfflineShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col h-[100dvh] w-full">
      <main>{children}</main>
    </section>
  );
}
