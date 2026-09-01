"use client"
import { useContext, useState } from "react"
import { MasterKeyForm } from "../MasterKeyForm"
import { Gestor } from "@/features/manager/Gestor"
import { LocalProvider } from "@/context/localProvider";


export const OnlineProvider = () => {
    const [look, setLook] = useState(false)
    return (
        <>
            {
                !look ? (
                    <MasterKeyForm look={look} setLook={setLook} />
                ) : (
                    <LocalProvider>
                        <Gestor />
                    </LocalProvider>
                )
            }
        </>
    )
}