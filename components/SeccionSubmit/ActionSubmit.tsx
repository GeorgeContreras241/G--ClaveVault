"use client"
import { useEffect, Suspense } from "react"
import { useLocalContext } from "@/context/useLocalContext"
import Add from "../icons/Add";
import { sileoWarning, sileoError } from "@/const/sileoConfig";
import { sileo, Toaster } from "sileo"
import { useState } from "react";
import { useStoragePass } from "@/storage/useStoragePass";
import { validateVaultInputs } from "@/lib/utils/SeccionSubmit/validateVaultInputs";
import { Eye } from "../icons/Eye";
import { EyeClose } from "../icons/EyeClose";
import { validatePassword } from "@/lib/utils/SeccionSubmit/validatePassword";
import type { ActionSubmitProps } from "@/types";
import SeccionSocial from "../Social/SocialSeccion";
import { generateSalt } from "@/lib/crypto/genereteSalt";
import { deriveKey } from "@/lib/crypto/kdfKey";
import { SocialFallback } from "@/components/home/HomeFallbacks";
import Link from "next/link";
import { Arrow } from "../icons/Arrow";

//   i need review sileo alerts styles and refactor styles - Pending 

export const ActionSubmit = ({ onSuccess }: ActionSubmitProps) => {
    const { handleImport, handleReset, drcKey } = useLocalContext();

    // Debugging log
    const [file, setFile] = useState<File | null>(null);
    const [viewPass, setViewPass] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [fileError, setFileError] = useState('');
    // Storage of decrypted data
    const setDataPasswordInit = useStoragePass((state) => state.setDataPasswordInit);

    useEffect(() => {
        handleReset();
    }, []);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        validatePassword(password);
    };

    const handleClearFile = () => {
        setFile(null);
        setFileError('');
    };


    const handleNoFileScenario = async (password: string) => {
        sileo.warning({
            title: "Error Fatal",
            description: "Seguro que desea continuar sin archivo",
            duration: 5000,
            fill: "var(--color-bg-elevated)",
            styles: {
                title: "text-red! font-bold!",
                description: "text-white! text-center!",
            },
            button: {
                onClick: async () => {
                    const saltGenerated = await generateSalt();
                    localStorage.setItem("salt", JSON.stringify(Array.from(saltGenerated)));
                    const drcKeyResult = await deriveKey(password, saltGenerated);
                    drcKey.current = drcKeyResult;
                    onSuccess(true);
                    sileo.clear()
                },
                title: "Aceptar"
            },
        });
    };

    const processFileImport = async (file: File, password: string) => {
        // validacion de datos
        const validation = validateVaultInputs(password);
        if (validation !== true) {
            sileo.error(validation);
            return false;
        }
        //revisar datos pasa con datos incorrectos ojito - Completed

        const importResult = await handleImport(file, password);

        if (importResult.state === false) {
            sileo.error(sileoError);
            return false;
        }

        if (importResult.salt) {
            localStorage.setItem("salt", JSON.stringify(Array.from(importResult.salt)));
        }
        if (importResult.decryptedData) {
            const data = importResult.decryptedData;
            setDataPasswordInit(data);
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);
        const password = formData.get("password") as string;

        const validatePasswordResult = validatePassword(password);
        if (!validatePasswordResult.success) {
            setPasswordError(validatePasswordResult.error || "");
            sileo.error(sileoError);
            return;
        }

        setIsLoading(true);

        try {
            if (!file) {
                await handleNoFileScenario(password);
                return;
            }
            //revisar funcion processFileImport - Completed 
            const success = await processFileImport(file, password);
            if (success) {
                onSuccess(true);
            }
        } catch (error) {
            sileo.error({ title: "Error al descifrar el archivo" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;

        if (selectedFile) {
            if (!selectedFile.name.endsWith('.enc')) {
                setFileError('Solo se permiten archivos .enc');
                setFile(null);
                // Reset file input
                e.target.value = '';
            } else if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                setFileError('El archivo es demasiado grande (máximo 10MB)');
                setFile(null);
                e.target.value = '';
            } else {
                setFileError('');
                setFile(selectedFile);
            }
        } else {
            setFileError('');
            setFile(null);
        }
    };

    return (
        <div className="max-w-[600px] w-full flex flex-col items-center justify-center gap-8 py-12">
            <Toaster position="top-center" />
            <Link
                href="/"
                className="self-start p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all duration-300"
                aria-label="Volver al inicio"
                title="Volver al inicio"
            >
                <div className="w-5 h-5 rotate-180">
                    <Arrow />
                </div>
            </Link>
            <div className="offline vault-panel vault-rise w-full grid place-items-center rounded-3xl p-5 md:p-7">
                <div className="w-full grid place-items-center gap-2">
                    <div className="w-full flex gap-3 ">
                        <input className="hidden" id="file" type="file" onChange={handleFileChange} accept=".enc" />
                        <div className="flex-1 h-48 border-2 border-dashed border-gray-300 dark:border-blue-900/30 rounded-xl bg-gray-50 dark:bg-blue-950/10 hover:bg-gray-100
                     dark:hover:bg-blue-950/20 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group">
                            <label htmlFor="file" className="w-full h-full flex flex-col items-center justify-center cursor-pointer border rounded-lg border-blue-300 dark:border-blue-400/30 ">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-400/20 rounded-full border-2 border-blue-300 dark:border-blue-400/30 flex items-center 
                            justify-center mb-3 group-hover:scale-105 transition-transform ">
                                    <Add />
                                </div>
                                <span className="text-sm text-zinc-800 dark:text-gray-300 font-medium">Arrastra o haz clic para subir</span>
                                <span className="text-xs text-zinc-600 dark:text-gray-400 mt-1">Solo archivos .enc</span>
                            </label>
                        </div>
                        {file && (
                            <button
                                type="button"
                                onClick={handleClearFile}
                                className="grid place-content-center w-12 h-12 rounded-md bg-gray-200 border border-gray-300 dark:border-neutral-500 dark:bg-black  cursor-pointer
                            hover:bg-gray-300 dark:hover:bg-gray-800 transition-all duration-300 group"
                                title="Eliminar archivo"
                            >
                                <svg className="w-5 h-5 text-zinc-700 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-200 group-hover:scale-110 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <span className={`${file ? "text-green-700 dark:text-green-400 border-green-300 dark:border-green-400/50 bg-green-100 dark:bg-green-400/10"
                        : "text-red-700 dark:text-red-400 border-red-300 dark:border-red-400/50 bg-red-100 dark:bg-red-400/10"} 
                    text-sm border rounded px-2 py-1 w-full text-center transition-colors duration-300`}>
                        {fileError ? fileError : (file ? "Archivo Cargado Correctamente" : "Seleccione un archivo")}
                    </span>
                </div>
                <form className="w-full flex flex-col gap-3 mt-4 text-sm" onSubmit={handleSubmit}>
                    <div className="flex justify-between">
                        <label htmlFor="password" className="font-sora text-[1.5rem] text-start font-bold text-gray-900 dark:text-neutral-100">Clave Maestra</label>
                        {passwordError && (
                            <span id="password-error" className="text-red-600 dark:text-red-400 text-xs mt-1" role="alert">
                                {passwordError}
                            </span>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            type={viewPass ? "text" : "password"}
                            className={`w-full border rounded-lg px-4 py-2 font-mono pr-10 border-gray-300 dark:border-white bg-white dark:bg-zinc-800/50  backdrop-blur-sm placeholder:text-zinc-500 dark:placeholder:text-gray-500  placeholder:italic placeholder:text-md focus:outline-none focus:ring-1 focus:ring-blue-500/50 dark:focus:ring-neutral-500/50 transition-all duration-300 ${passwordError
                                    ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-300 dark:border-zinc-600/70'
                                }`}
                            placeholder="Ingresa Aqui"
                            id="password"
                            name="password"
                            autoComplete="off"
                            spellCheck="false"
                            autoCorrect="off"
                            onChange={handlePasswordChange}
                            aria-invalid={passwordError ? 'true' : 'false'}
                            aria-describedby={passwordError ? 'password-error' : undefined}
                        />
                        <button
                            type="button"
                            onClick={() => setViewPass(!viewPass)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-blue-900/30 text-zinc-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                            aria-label={viewPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                            {viewPass ? (
                                <Eye />
                            ) : (
                                <EyeClose />
                            )}
                        </button>
                    </div>
                    <button
                       className="w-full bg-blue-600 dark:bg-slate-900 hover:bg-blue-700 dark:hover:bg-slate-800/70 text-white rounded-lg p-3 cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-blue-500/20 shadow-lg"
                        type="submit"
                        disabled={isLoading}
                        aria-busy={isLoading}
                        aria-describedby="loading-status"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-white dark:text-white">Descifrando...</span>
                            </>
                        ) : (
                            file ? (
                                <span className="font-medium font-mono text-white dark:text-white">Decifrar</span>
                            ) : (
                                <span className="font-medium font-mono text-white dark:text-white">Iniciar</span>
                            )
                        )}
                    </button>
                    {isLoading && (
                        <span id="loading-status" className="sr-only">
                            Procesando archivo, por favor espere
                        </span>
                    )}
                </form>
            </div>
            <Suspense fallback={<SocialFallback />}>
                <SeccionSocial />
            </Suspense>
        </div>
    )
}