"use client"
import { useState, ReactNode } from "react"

interface WebAuthnLoginProps {
    children: ReactNode;
    onClick?: () => void;
}

export const WebAuthnLogin = ({ children, onClick }: WebAuthnLoginProps) => {
    const [isError, setIsError] = useState(false)

    const handleLoginWebauthn = async () => {
        try {
            // TODO: Implement WebAuthn login
            alert('WebAuthn login')
        } catch {
            setIsError(true)
        }
    }

    return (
        <div className="w-full cursor-pointer" onClick={onClick || handleLoginWebauthn}>
            {isError && (
                <p className="text-red-600 dark:text-red-400 text-xs mb-1" role="alert">
                    Error al iniciar sesión
                </p>
            )}
            {children}
        </div>
    )
}
