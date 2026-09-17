import GitHub from "../icons/GitHub";
import Linkedin from "../icons/LinkedIn";

import { ThemeToggle } from "@/components/shared/themeMode/ThemeToggle";

export const Footer = ({ className }: { className?: string }) => {
    return (
        <footer
            className={
                className ??
                "vault-panel flex w-full justify-center rounded-lg px-4 py-1.5 md:px-6 mt-auto"
            }
            aria-label="Enlaces y preferencias"
        >
            <div className="w-full max-w-5xl flex items-center justify-between gap-4">
                <p className="hidden text-[0.65rem] font-medium tracking-widest uppercase sm:block text-zinc-600 dark:text-zinc-400">
                    ClaveVault · local first
                </p>

                <div className="flex items-center gap-1 sm:ml-auto sm:justify-end ">
                    <a
                        href="https://github.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="GitHub"
                        className="group flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300  
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
                        className="group flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 hover:text-amber-600 dark:hover:text-vault-amber text-zinc-600 dark:text-zinc-400"
                    >
                        <span className="sr-only">LinkedIn</span>
                        <Linkedin />
                    </a>
                    <div className="group flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 hover:text-amber-600 dark:hover:text-vault-amber text-zinc-600 dark:text-zinc-400">
                        <ThemeToggle className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </footer>
    )
}
