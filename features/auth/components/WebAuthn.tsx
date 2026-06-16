"use client"

import WebAuthnIcon from "@/components/icons/WebAuthn"
import { WebAuthnRegister } from "@/components/auth/WebAuthnRegister"
import { WebAuthnLogin } from "@/components/auth/WebAuthnLogin"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

export const WebAuthn = () => {
    const [email, setEmail] = useState("")
    const [errors, setErrors] = useState<{ email?: string }>({})

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validateForm = (): boolean => {
        const newErrors: { email?: string } = {}

        if (!email.trim()) {
            newErrors.email = "El email es obligatorio"
        } else if (!validateEmail(email)) {
            newErrors.email = "El email no es válido"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    return (
        <div className="w-full flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-3">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-400/20 dark:to-blue-500/10 rounded-2xl border border-blue-200/50 dark:border-blue-400/30 shadow-lg shadow-blue-500/10 flex items-center justify-center transition-transform hover:scale-105">
                        <WebAuthnIcon />
                    </div>
                </div>
                <div className="text-center space-y-1">
                    <h1 className="font-sora text-2xl font-bold tracking-tight">
                        Acceso Biométrico
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Inicia sesión con huella dactilar, PIN o llave de seguridad
                    </p>
                </div>
            </div>

            <div className="w-full p-6 rounded-xl border bg-card/50 backdrop-blur-sm shadow-xl shadow-black/5">
                <form className="flex flex-col gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Correo electrónico
                        </Label>
                        <div className="relative">
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className={`h-11 pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                            />
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect width="20" height="16" x="2" y="4" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                        </div>
                        <div className="h-4">
                            {errors.email && (
                                <p className="text-[11px] text-red-500 leading-none">{errors.email}</p>
                            )}
                        </div>
                    </div>

                    <Separator className="my-1" />

                    <div className="grid grid-cols-2 gap-3">
                        <WebAuthnRegister email={email} validateForm={validateForm} />
                        <WebAuthnLogin email={email} validateForm={validateForm} />
                    </div>
                </form>
            </div>

            <p className="text-xs text-center text-muted-foreground max-w-[280px]">
                Tu identidad biométrica nunca sale de tu dispositivo. 
                Tecnología WebAuthn/FIDO2.
            </p>
        </div>
    )
}
