export const WebAuthnRegister = ({ className, text }: { className?: string; text?: string }) => {
    return (
        <button className={className}>
            {text}
        </button>
    )
}