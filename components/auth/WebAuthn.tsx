"use client"

import WebAuthnIcon from "@/components/icons/WebAuthn"
import { WebAuthnRegister } from "@/components/auth/WebAuthnRegister"
import { WebAuthnLogin } from "@/components/auth/WebAuthnLogin"

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
                    <WebAuthnRegister text="Registrarse" className="w-full bg-blue-500 text-white hover:bg-blue-600" />
                    <WebAuthnLogin text="Iniciar sesión" className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700" />
                </div>

            </div>
        </div>
    )
}
