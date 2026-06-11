import Link from "next/link";
import { Arrow } from "../icons/Arrow";

export const Exit = () => {
    return (
        <div className="absolute top-4 left-4 md:top-12 md:left-12 lg:top-20 lg:left-28 
        border border-border-strong flex items-center justify-center rounded-sm p-2 
        cursor-pointer hover:bg-bg-elevated transition-colors">
            <Link href="/" className="w-10 h-10 rotate-180" title="Regresar">
                <Arrow />
            </Link>
        </div>
    )
}

