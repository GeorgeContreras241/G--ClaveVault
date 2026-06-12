"use client"

import Link from "next/link"
import WebAuthnIcon from "../icons/WebAuthn"

export const WebAuthn = () => {
    return (
        <div className="max-w-[600px] w-full flex flex-col items-center justify-center gap-8 py-12">
            <div className="vault-panel vault-rise w-full grid place-items-center rounded-3xl p-5 md:p-7">
                <div className="w-full flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-400/20 rounded-full border-2 border-blue-300 dark:border-blue-400/30 flex items-center justify-center">
                        <WebAuthnIcon />
                    </div>

                    <div className="text-center">
                        <h1 className="font-sora text-[1.5rem] font-bold text-gray-900 dark:text-neutral-100">
                            WebAuthn
                        </h1>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            Biometría, PIN o llave de seguridad
                        </p>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-3 mt-6">
                    <Link
                        href="/register"
                        className="w-full bg-blue-600 dark:bg-slate-900 hover:bg-blue-700 dark:hover:bg-slate-800/70 text-white rounded-lg p-3 cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-blue-500/20 shadow-lg font-medium font-mono"
                    >
                        Registrarse
                    </Link>

                    <Link
                        href="/login"
                        className="w-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg p-3 cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-zinc-500/20 shadow-lg font-medium font-mono"
                    >
                        Iniciar sesión
                    </Link>
                </div>
            </div>
        </div>
    )
}
