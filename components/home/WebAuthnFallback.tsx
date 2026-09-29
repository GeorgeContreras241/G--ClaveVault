export function WebAuthnFallback() {
  return (
    <div
      className="vault-action-card flex animate-pulse items-center gap-4 rounded-2xl p-4 md:p-6"
      aria-hidden="true"
    >
      <div className="h-12 w-12 shrink-0 rounded-xl bg-zinc-200 dark:bg-zinc-800 md:h-14 md:w-14" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-5 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-full max-w-[12rem] rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
