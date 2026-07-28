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
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                    <WebAuthnIcon />
                </div>
                <div className="text-center space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight">
                        Bienvenido
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Inicia sesión con huella dactilar, PIN o llave de seguridad
                    </p>
                </div>
            </div>

            <div className="w-full p-6 rounded-lg border border-border bg-background">
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
                                className={`h-10 pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
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
                        <div className="h-2">
                            {errors.email && (
                                <p className="text-[11px] text-red-500 leading-none text-end">{errors.email}</p>
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
