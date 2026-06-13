export const WebAuthnLogin = ({ className, text }: { className?: string; text?: string }) => {
    return (
        <button className={className}>
            {text}
        </button>
    )
}