"use client"
import { Button } from "@/components/shared/Button"
import { Copy } from "@/components/icons/Copy"
import { useState } from "react"
import { useStoragePass } from "@/storage/useStoragePass"
import { generatePassword } from "@/lib/utils/Gestor/generatePassword"
import { copyToClipboard } from "@/lib/utils/Gestor/copyToClipboard"
import type { FormErrors } from "@/types"
import { toPasswordEntry } from "@/lib/utils/Gestor/toPasswordEntry"



export const AddPassword = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isConfigVisible, setIsConfigVisible] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const setDataPasswordUpdate = useStoragePass((state) => state.setDataPasswordUpdate)
    const [keys, setKeys] = useState({
        title: "",
        application: "web",
        username: "",
        password: "",
        url: "",
        category: "",
        favorite: false
    })

    // Estado para opciones de configuración de contraseña
    const [passwordOptions, setPasswordOptions] = useState({
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true
    })
    // Función para validar el formulario
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!keys.title.trim()) {
            newErrors.title = "El título es requerido";
        }

        if (!keys.username.trim()) {
            newErrors.username = "El usuario es requerido";
        }

        if (!keys.password.trim()) {
            newErrors.password = "La contraseña es requerida";
        } else if (keys.password.length < 4) {
            newErrors.password = "La contraseña debe tener al menos 4 caracteres";
        }

        if (keys.url && keys.url.trim()) {
            try {
                new URL(keys.url);
            } catch {
                newErrors.url = "URL inválida";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Función para resetear el formulario
    const resetForm = () => {
        setKeys({
            title: "",
            application: "web",
            username: "",
            password: "",
            url: "",
            category: "",
            favorite: false
        });
        setErrors({});
        setShowPassword(false);
        setPasswordOptions({
            length: 16,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true
        });
    };

    // Función para generar y asignar contraseña aleatoria
    const handleGeneratePassword = () => {
        const newPassword = generatePassword(passwordOptions);
        setKeys({ ...keys, password: newPassword });
        setErrors({ ...errors, password: undefined });
    }

    // tool tip Ventana emergente para agregar contraseña componente Reutilizable
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const id =
            crypto?.randomUUID?.() ||
            Math.random().toString(36).substring(2, 15);
        setDataPasswordUpdate(toPasswordEntry({ id, ...keys }));
        resetForm();
        setIsFormVisible(false);
    }

    return (
        <section className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-fit">
            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
                <div className="flex items-center justify-between">
                    <label htmlFor="Agregar Contraseña" className="block text-sm md:text-base font-bold text-gray-900 dark:text-gray-200 mb-1">
                        Agregar Contraseña
                    </label>
                    <button
                        type="button"
                        onClick={() => setIsFormVisible(!isFormVisible)}
                        className="p-1 bg-black border rounded-md border-gray-700 hover:bg-gray-900 hover:border-gray-600 transition-all duration-200 cursor-pointer"
                        aria-label={isFormVisible ? "Ocultar formulario" : "Mostrar formulario"}
                    >
                        <svg
                            className={`w-5 h-5 text-white transition-transform duration-200 ${isFormVisible ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
                {isFormVisible && (
                    <>
                        <div>
                            <label htmlFor="title" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Título <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                placeholder="Título"
                                value={keys.title}
                                onChange={(e) => {
                                    setKeys({ ...keys, title: e.target.value });
                                    if (errors.title) setErrors({ ...errors, title: undefined });
                                }}
                                className={`w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border rounded-sm focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 dark:text-white ${errors.title ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400'}`}
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>
                        <div>
                            <label htmlFor="application" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Aplicación
                            </label>
                            <select
                                id="application"
                                value={keys.application}
                                onChange={(e) => setKeys({ ...keys, application: e.target.value, category: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white transition-all duration-200"
                            >
                                <option value="web">Web</option>
                                <option value="app">App</option>
                                <option value="card">Card</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Usuario <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Usuario"
                                value={keys.username}
                                onChange={(e) => {
                                    setKeys({ ...keys, username: e.target.value });
                                    if (errors.username) setErrors({ ...errors, username: undefined });
                                }}
                                className={`w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border rounded-sm focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 dark:text-white ${errors.username ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400'}`}
                            />
                            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                        </div>
                        <div className="">
                            <label htmlFor="password" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Contraseña <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Contraseña"
                                    value={keys.password}
                                    onChange={(e) => {
                                        setKeys({ ...keys, password: e.target.value });
                                        if (errors.password) setErrors({ ...errors, password: undefined });
                                    }}
                                    className={`w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border rounded-sm focus:outline-none focus:ring-2 transition-all duration-200 
                                        text-gray-900 dark:text-white ${errors.password ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 
                                            'border-gray-300 dark:border-gray-600 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400'}`}
                                />
                                <div className="absolute top-2.5 right-3 z-10 flex gap-1">
                                    <button
                                        className="bg-transparent px-1 hover:scale-110 transition-transform duration-200 cursor-pointer"
                                        onClick={handleGeneratePassword}
                                        title="Generar contraseña aleatoria"
                                        type="button"
                                    >
                                        <svg
                                            className="w-4 h-4 text-black dark:text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                    <button
                                        className="bg-transparent px-1 hover:scale-110 transition-transform duration-200 cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)}
                                        title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                        type="button"
                                    >
                                        {showPassword ? (
                                            <svg
                                                className="w-4 h-4 text-black dark:text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="w-4 h-4 text-black dark:text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                    <button className="bg-transparent px-1 hover:scale-110 transition-transform duration-200 cursor-pointer" onClick={() => copyToClipboard(keys.password)}><Copy /></button>
                                </div>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        {/* Opciones de configuración de contraseña */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Configuración de Contraseña
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsConfigVisible(!isConfigVisible)}
                                    className="p-1 bg-black border rounded-md border-gray-700 hover:bg-gray-900 hover:border-gray-600 transition-all duration-200 cursor-pointer"
                                    aria-label={isConfigVisible ? "Ocultar configuración" : "Mostrar configuración"}
                                >
                                    <svg
                                        className={`w-4 h-4 text-white transition-transform duration-200 ${isConfigVisible ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>

                            {isConfigVisible && (
                                <>
                                    {/* Longitud */}
                                    <div className="flex items-center space-x-2">
                                        <label htmlFor="length" className="text-xs text-gray-700 dark:text-gray-300 w-20">
                                            Longitud:
                                        </label>
                                        <input
                                            id="length"
                                            type="number"
                                            min="4"
                                            max="32"
                                            value={passwordOptions.length}
                                            onChange={(e) => setPasswordOptions({ ...passwordOptions, length: parseInt(e.target.value) || 12 })}
                                            className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white transition-all duration-200"
                                        />
                                    </div>
                                    {/* Opciones de caracteres */}
                                    <div className="flex flex-wrap gap-2 ">
                                        <label className="flex items-center space-x-2 text-xs">
                                            <input
                                                type="checkbox"
                                                id="uppercase"
                                                checked={passwordOptions.includeUppercase}
                                                onChange={(e) => setPasswordOptions({ ...passwordOptions, includeUppercase: e.target.checked })}
                                                className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">Mayúsculas (A-Z)</span>
                                        </label>

                                        <label className="flex items-center space-x-2 text-xs">
                                            <input
                                                type="checkbox"
                                                id="lowercase"
                                                checked={passwordOptions.includeLowercase}
                                                onChange={(e) => setPasswordOptions({ ...passwordOptions, includeLowercase: e.target.checked })}
                                                className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">Minúsculas (a-z)</span>
                                        </label>

                                        <label className="flex items-center space-x-2 text-xs">
                                            <input
                                                type="checkbox"
                                                id="numbers"
                                                checked={passwordOptions.includeNumbers}
                                                onChange={(e) => setPasswordOptions({ ...passwordOptions, includeNumbers: e.target.checked })}
                                                className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">Números (0-9)</span>
                                        </label>

                                        <label className="flex items-center space-x-2 text-xs">
                                            <input
                                                type="checkbox"
                                                id="symbols"
                                                checked={passwordOptions.includeSymbols}
                                                onChange={(e) => setPasswordOptions({ ...passwordOptions, includeSymbols: e.target.checked })}
                                                className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">Símbolos (!@#$%^&*)</span>
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button className="flex-1 py-1.5 text-sm flex items-center justify-center">
                                Agregar
                            </Button>
                            <Button 
                                onClick={() => {
                                    resetForm();
                                    setIsFormVisible(false);
                                }}
                                className="flex-1 py-1.5 text-sm flex items-center justify-center bg-gray-500 hover:bg-gray-600"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </>
                )}
            </form>
        </section>
    )
}