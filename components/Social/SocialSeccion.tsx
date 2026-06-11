import GitHub from "../icons/GitHub";
import Linkedin from "../icons/LinKedin";
import { ThemeToggle } from "@/components/shared/themeMode/ThemeToogle";

type SeccionSocialProps = {
  className?: string;
};

const SeccionSocial = ({ className }: SeccionSocialProps) => {
  return (
    <footer
      className={
        className ??
        "vault-panel flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3 md:px-6"
      }
      aria-label="Enlaces y preferencias"
    >
      <p className="hidden text-[0.65rem] font-medium tracking-widest uppercase sm:block text-zinc-600 dark:text-zinc-400">
        ClaveVault · local first
      </p>

      <div className="flex w-full items-center justify-center gap-1 sm:ml-auto sm:w-auto sm:justify-end">
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
          className="group flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300  
          hover:text-amber-600 dark:hover:text-vault-amber text-zinc-600 dark:text-zinc-400"
        >
          <span className="sr-only">GitHub</span>
          <GitHub />
        </a>
        <a
          href="https://linkedin.com/"
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn"
          className="group flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300  hover:text-amber-600 dark:hover:text-vault-amber text-zinc-600 dark:text-zinc-400"
        >
          <span className="sr-only">LinkedIn</span>
          <Linkedin />
        </a>
        <div className="ml-1 flex h-11 w-11 items-center justify-center rounded-xl">
          <ThemeToggle className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
        </div>
      </div>
    </footer>
  );
};

export default SeccionSocial;
