"use client"
import { startRegistration } from "@simplewebauthn/browser"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface WebAuthnRegisterProps {
    email: string
    validateForm: () => boolean
}

export const WebAuthnRegister = ({ email, validateForm }: WebAuthnRegisterProps) => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRegisterWebauthn = async () => {
        if (!validateForm()) return

        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/auth/register/options', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            const data = await res.json()
            if (!data.ok) {
                throw new Error(data.error)
            }
            const attResp = await startRegistration({ optionsJSON: data.options })
            const verifyRes = await fetch('/api/auth/register/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attResp, email })
            })
            const verifyData = await verifyRes.json()
            if (!verifyData.ok) {
                throw new Error(verifyData.error)
            }

            alert('Registro exitoso')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrarse')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-1">
            <Button 
                type="button"
                onClick={handleRegisterWebauthn}
                disabled={isLoading}
                variant="outline"
                className="w-full h-10"
            >
                {isLoading ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : 'Registrarse'}
            </Button>
            <div className="h-3 flex items-center justify-center">
                {error && <p className="text-[10px] text-red-500 leading-none">{error}</p>}
            </div>
        </div>
    )
}
