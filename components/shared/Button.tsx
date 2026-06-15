import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 dark:bg-slate-900 text-white hover:bg-blue-700 dark:hover:bg-slate-800/70 shadow-lg hover:scale-[1.02] focus:ring-blue-500/20",
  secondary:
    "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700",
  ghost:
    "bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-lg focus:ring-red-500/20",
};

export const Button = ({
  children,
  variant = "primary",
  loading = false,
  loadingText,
  icon,
  fullWidth = false,
  className = "",
  disabled,
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3
        font-medium text-sm transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
        cursor-pointer
        ${variants[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText && <span>{loadingText}</span>}
        </>
      ) : (
        <>
          {icon && <span className="h-4 w-4 flex items-center justify-center">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
