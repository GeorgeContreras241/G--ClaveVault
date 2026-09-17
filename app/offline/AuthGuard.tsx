"use client"
import { ReactNode } from "react"
import { OfflineUnlock } from "@/features/offline/OfflineUnlock";
import { useStoragePass } from "@/storage/useStoragePass";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const AuthGuard = ({ children }: { children: ReactNode }) => {
    const isUnLocked = useStoragePass((state) => state.isUnLocked);
    const setIsUnLocked = useStoragePass((state) => state.setIsUnLocked);

    if (!isUnLocked) {
        return (
            <div className="h-[100dvh] w-full py-6 relative z-10">
                <div className="max-w-4xl mx-auto px-4 flex flex-col h-full">
                    <div className="w-full">
                        <Header />
                    </div>
                    <main className="flex-1 flex items-center justify-center h-full">
                        <div className="w-full">
                            <OfflineUnlock onSuccess={() => setIsUnLocked(true)} />
                        </div>
                    </main>
                    <div className="w-full">
                        <Footer />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {children}
        </>
    )
}
