"use client"
import { startAuthentication } from "@simplewebauthn/browser"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface WebAuthnLoginProps {
    email: string
    validateForm: () => boolean
}

export const WebAuthnLogin = ({ email, validateForm }: WebAuthnLoginProps) => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLoginWebauthn = async () => {
        if (!validateForm()) return

        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/auth/login/options', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            const data = await res.json()
            if (!data.ok) {
                throw new Error(data.error)
            }

            const asseResp = await startAuthentication({ optionsJSON: data.options })

            const verificationResp = await fetch('/api/auth/login/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attResp: asseResp, email })
            })
            const verificationData = await verificationResp.json()
            if (!verificationData.ok) {
                throw new Error(verificationData.error)
            }
            alert('WebAuthn login exitoso')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-1">
            <Button 
                type="button"
                onClick={handleLoginWebauthn}
                disabled={isLoading}
                className="w-full h-11 font-medium"
                variant="secondary"
            >
                {isLoading ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : 'Acceder'}
            </Button>
            <div className="h-3 flex items-center justify-center">
                {error && <p className="text-[10px] text-red-500 leading-none">{error}</p>}
            </div>
        </div>
    )
}
