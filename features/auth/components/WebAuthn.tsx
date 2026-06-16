"use client"

import WebAuthnIcon from "@/components/icons/WebAuthn"
import { WebAuthnRegister } from "@/components/auth/WebAuthnRegister"
import { WebAuthnLogin } from "@/components/auth/WebAuthnLogin"
import { Button } from "@/components/shared/Button"
import Link from "next/link"
import { Arrow } from "@/components/icons/Arrow"

export const WebAuthn = () => {
    return (
        <div className="max-w-[600px] w-full flex flex-col items-center justify-center gap-8 py-12">
            <Link
                href="/"
                className="self-start p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all duration-300"
                aria-label="Volver al inicio"
                title="Volver al inicio"
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
                            WebAuthn
                        </h1>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            Biometría, PIN o llave de seguridad
                        </p>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-3 mt-6">
                    <div className="w-full">
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            className="w-full border rounded-lg px-4 py-2 font-mono border-gray-300 dark:border-zinc-600/70 bg-white dark:bg-zinc-800/50 backdrop-blur-sm placeholder:text-zinc-500 dark:placeholder:text-gray-500 placeholder:italic placeholder:text-md focus:outline-none focus:ring-1 focus:ring-blue-500/50 dark:focus:ring-neutral-500/50 transition-all duration-300"
                        />
                    </div>
                    <WebAuthnRegister>
                        <Button variant="primary" fullWidth>Registrarse</Button>
                    </WebAuthnRegister>
                    <WebAuthnLogin>
                        <Button variant="secondary" fullWidth>Iniciar sesión</Button>
                    </WebAuthnLogin>
                </div>
            </div>
        </div>
    )
}
