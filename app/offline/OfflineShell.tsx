"use client";

export function OfflineShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col">
      <div className="vault-bg"></div>
      <main>{children}</main>
    </section>
  );
}
