"use client"

import Link from "next/link"
import { Arrow } from "../icons/Arrow"
import WebAuthnIcon from "../icons/WebAuthn"

export const WebAuthnRegister = () => {
    return (
        <div className="max-w-[600px] w-full flex flex-col items-center justify-center gap-8 py-12">
            <Link
                href="/online"
                className="self-start p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all duration-300"
                aria-label="Volver"
                title="Volver"
            >
                <div className="w-5 h-5 rotate-180">
                    <Arrow />
                </div>
            </Link>

            <div className="vault-panel vault-rise w-full grid place-items-center rounded-3xl p-5 md:p-7">
                <div className="w-full flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-400/20 rounded-full border-2 border-blue-300 dark:border-blue-400/30 flex items-center justify-center">
                        <WebAuthnIcon />
                    </div>

                    <div className="text-center">
                        <h1 className="font-sora text-[1.5rem] font-bold text-gray-900 dark:text-neutral-100">
                            Crear Cuenta
                        </h1>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            Registra tu biometría o PIN para empezar
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="w-full mt-6 bg-blue-600 dark:bg-slate-900 hover:bg-blue-700 dark:hover:bg-slate-800/70 text-white rounded-lg p-3 cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-blue-500/20 shadow-lg"
                >
                    <span className="font-medium font-mono text-white dark:text-white">
                        Registrarse con WebAuthn
                    </span>
                </button>

                <div className="w-full mt-4 text-center">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        ¿Ya tienes cuenta?{" "}
                        <Link
                            href="/login"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                            Iniciar sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
