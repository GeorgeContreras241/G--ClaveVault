export const CapabilityChip = ({ text }: { text: string }) => {
  return (
    <article
      className="group relative flex min-h-[2.75rem] items-center justify-center rounded-lg border px-2 py-2 text-center transition duration-300
      border-border bg-vault-amber/5 hover:border-vault-amber/35 sm:min-h-[3rem] sm:px-3"
    >
      <span className="text-meta font-medium leading-ui tracking-meta transition-colors duration-300 text-foreground group-hover:text-vault-amber-dim">
        {text}
      </span>
      <span
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-vault-amber transition-all duration-300 group-hover:w-[70%]"
        aria-hidden="true"
      />
    </article>
  );
};
