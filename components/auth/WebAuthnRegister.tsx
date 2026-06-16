"use client"
import { useState, ReactNode } from "react"

interface WebAuthnRegisterProps {
    children: ReactNode;
    onClick?: () => void;
}

export const WebAuthnRegister = ({ children, onClick }: WebAuthnRegisterProps) => {
    const [error, setError] = useState<string | null>(null)

    const handleRegisterWebauthn = async () => {
        try {
            // TODO: Implement WebAuthn registration
            alert('WebAuthn registration')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrar el dispositivo')
        }
    }

    return (
        <div className="w-full cursor-pointer" onClick={onClick || handleRegisterWebauthn}>
            {error && (
                <p className="text-red-600 dark:text-red-400 text-xs mb-1" role="alert">
                    {error}
                </p>
            )}
            {children}
        </div>
    )
}
