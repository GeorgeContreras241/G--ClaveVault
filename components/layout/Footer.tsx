import GitHub from "../icons/GitHub";
import Linkedin from "../icons/LinKedin";

import { ThemeToggle } from "@/components/shared/themeMode/ThemeToogle";

export const Footer = ({ className }: { className?: string }) => {
    return (
        <footer
            className={
                className ??
                "vault-panel flex w-full justify-center rounded-2xl px-4 py-3 md:px-6 mt-auto"
            }
            aria-label="Enlaces y preferencias"
        >
            <div className="w-full max-w-5xl flex items-center justify-between gap-4">
                <p className="hidden text-[0.65rem] font-medium tracking-widest uppercase sm:block text-zinc-600 dark:text-zinc-400">
                    ClaveVault · local first
                </p>

                <div className="flex items-center gap-1 sm:ml-auto sm:justify-end">
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
                        className="group flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 hover:text-amber-600 dark:hover:text-vault-amber text-zinc-600 dark:text-zinc-400"
                    >
                        <span className="sr-only">LinkedIn</span>
                        <Linkedin />
                    </a>
                    <div className="ml-1 flex h-11 w-11 items-center justify-center rounded-xl">
                        <ThemeToggle className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
                    </div>
                </div>
            </div>
        </footer>
    )
}
