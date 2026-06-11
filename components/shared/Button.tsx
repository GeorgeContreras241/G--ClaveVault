import { ReactNode } from "react"

export const Button = ({ children, className, onClick, disabled }: { children: ReactNode, className?: string, onClick?: () => void, disabled?: boolean }) => {
   
    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={`${className || ''} flex gap-1 items-center justify-center text-white h-8 w-20 rounded-md border 
            bg-neutral-900 dark:border-gray-700 
            cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-xs font-semibold 
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className="w-5 h-5 flex items-center justify-center">{children}</span>

        </button>
    )
}