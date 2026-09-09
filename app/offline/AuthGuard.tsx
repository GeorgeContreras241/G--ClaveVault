"use client"
import { ReactNode } from "react"
import { ActionSubmit } from "@/components/SeccionSubmit/ActionSubmit";
import { useStoragePass } from "@/storage/useStoragePass";

export const AuthGuard = ({ children }: { children: ReactNode }) => {
    const isUnLocked = useStoragePass((state) => state.isUnLocked);
    const setIsUnLocked = useStoragePass((state) => state.setIsUnLocked);

    if (!isUnLocked) {
        return (
            <section className="grid place-items-center h-dvh w-full px-2">
                <ActionSubmit onSuccess={() => setIsUnLocked(true)} />
            </section>
        )
    }

    return (
        <>
            {children}
        </>
    )
}
