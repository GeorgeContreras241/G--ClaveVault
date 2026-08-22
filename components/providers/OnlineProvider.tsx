"use client"
import { useContext, useState } from "react"
import { MasterKeyForm } from "../MasterKeyForm"
import { Gestor } from "@/features/manager/Gestor"
import { AuthGuard } from "@/app/offline/AuthGuard"
import { LocalContext } from "@/context/localProvider";

export const OnlineProvider = () => {
    const localContext = useContext(LocalContext);
    const [look, setLook] = useState(false)
    return (
        <section>
            {
                !look ? (
                    <MasterKeyForm look={look} setLook={setLook} />
                ) : (

                    <Gestor />

                )
            }
        </section>
    )
}