export const Target = ({ text }: { text: string }) => {
  return (
    <article
      className="group relative flex min-h-[2.75rem] items-center justify-center rounded-lg border px-2 py-2 text-center transition duration-300
      border-zinc-300 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-900/40 hover:border-amber-400 dark:hover:border-vault-amber/35 bg-amber-50 dark:bg-vault-amber/5 sm:min-h-[3rem] sm:px-3"
    >
      <span className="text-[0.58rem] font-medium leading-tight tracking-wide transition-colors duration-300 group-hover:text-amber-600 dark:group-hover:text-vault-amber-dim text-zinc-700 dark:text-zinc-300 group-hover:text-amber-600 dark:group-hover:text-vault-amber sm:text-[0.65rem]">
        {text}
      </span>
      <span
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-vault-amber transition-all duration-300 group-hover:w-[70%]"
        aria-hidden="true"
      />
    </article>
  );
};
// quitar demaciado generico