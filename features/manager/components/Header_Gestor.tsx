"use client"
import { useLocalContext } from "@/context/useLocalContext"
import { Exit } from "@/components/icons/Exit";
import { Export } from "@/components/icons/Export"
import { Search } from "@/components/icons/Search";
import { Button } from "@/components/ui/button";
import { useStoragePass } from "@/storage/useStoragePass";
import { ThemeToggle } from "@/components/shared/themeMode/ThemeToogle";
import { CATEGORY_BUTTONS } from "@/const/buttonsNavegations";
import { HeaderGestorProps } from "@/types";
import { useRouter } from "next/navigation";

export const Header_Gestor = ({ setSearchTerm, setSelectedCategory, selectedCategory, searchTerm }: HeaderGestorProps) => {
    const router = useRouter();
    const { handleExport, handleReset, isResetting } = useLocalContext()
    const dataPassword = useStoragePass((state) => state.dataPassword)

    return (
        <header className="vault-panel rounded-xl p-4 md:p-6">
            <div className="flex flex-row justify-between items-center mb-4">
                <h1 className="font-sora text-xl md:text-4xl font-bold tracking-tight">Clave vault</h1>
                <article className="flex items-center gap-2">
                    <ThemeToggle className="h-5 w-5" />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(dataPassword)}
                    >
                        <Export />
                        <span className="hidden sm:inline">Exportar</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                            await handleReset();
                            router.push('/offline');
                        }}
                        disabled={isResetting}
                    >
                        {isResetting ? (
                            <div className="h-4 w-4 border-b-2 rounded-full border-current animate-spin" />
                        ) : (
                            <>
                                <Exit />
                                <span className="hidden sm:inline">Salir</span>
                            </>
                        )}
                    </Button>
                </article>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Buscar contraseñas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-amber/30 focus:border-vault-amber transition-all"
                />
            </div>

            <div className="flex gap-2 flex-wrap">
                {CATEGORY_BUTTONS.map((button) => (
                    <Button
                        key={button.id}
                        variant={selectedCategory === button.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(button.value)}
                        className={selectedCategory === button.value ? "bg-vault-amber text-black hover:bg-vault-amber/80" : ""}
                    >
                        {button.label}
                    </Button>
                ))}
            </div>
        </header>
    )
}
