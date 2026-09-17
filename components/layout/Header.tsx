import Link from "next/link";
import { Arrow } from "../icons/Arrow";


export const Header = ({ className }: { className?: string }) => {
    return (
        <header
            className={
                className ??
                "vault-panel flex w-full justify-center sticky top-0 z-50 px-4 py-1.5 md:px-6 rounded-lg"
            }
            aria-label="Navegación principal"
        >
            <div className="w-full max-w-5xl flex items-center justify-between gap-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-300 cursor-pointer"
                    aria-label="Volver al inicio"
                    title="Volver al inicio"
                >
                    <div className="w-4 h-4 rotate-180">
                        <Arrow />
                    </div>
                    <span className="hidden text-[0.65rem] font-medium tracking-widest uppercase sm:block">
                        Volver
                    </span>
                </Link>
                <p className="font-sora text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    ClaveVault
                </p>
            </div>
        </header>
    );
};
