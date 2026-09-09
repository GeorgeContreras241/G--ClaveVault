"use client"
import { useState } from "react"
import { MasterKeyForm } from "../MasterKeyForm"
import { Gestor } from "@/features/manager/Gestor"

export const OnlineProvider = () => {
    const [look, setLook] = useState(false)
    return (
        <>
            {
                !look ? (
                    <MasterKeyForm look={look} setLook={setLook} />
                ) : (
                    <Gestor />
                )
            }
        </>
    )
}
