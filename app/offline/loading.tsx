export default function OfflineLoading() {
  return (
    <div
      className="grid min-h-full place-items-center px-2"
      aria-busy="true"
      aria-label="Cargando gestor offline"
    >
      <div className="vault-panel w-full max-w-lg animate-pulse space-y-4 rounded-3xl p-6 md:p-8">
        <div className="h-6 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-3/4 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
