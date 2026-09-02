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
    const [isFormVisible, setIsFormVisible] = useState(false)
    const [isConfigVisible, setIsConfigVisible] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<FormErrors>({})
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

    const [passwordOptions, setPasswordOptions] = useState({
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true
    })

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}
        if (!keys.title.trim()) newErrors.title = "El título es requerido"
        if (!keys.username.trim()) newErrors.username = "El usuario es requerido"
        if (!keys.password.trim()) {
            newErrors.password = "La contraseña es requerida"
        } else if (keys.password.length < 4) {
            newErrors.password = "Mínimo 4 caracteres"
        }
        if (keys.url && keys.url.trim()) {
            try { new URL(keys.url) } catch { newErrors.url = "URL inválida" }
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const resetForm = () => {
        setKeys({ title: "", application: "web", username: "", password: "", url: "", category: "", favorite: false })
        setErrors({})
        setShowPassword(false)
        setPasswordOptions({ length: 16, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true })
    }

    const handleGeneratePassword = () => {
        setKeys({ ...keys, password: generatePassword(passwordOptions) })
        setErrors({ ...errors, password: undefined })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return
        const id = crypto?.randomUUID?.() || Math.random().toString(36).substring(2, 15)
        setDataPasswordUpdate(toPasswordEntry({ id, ...keys }))
        resetForm()
        setIsFormVisible(false)
    }

    return (
        <section className="vault-panel rounded-xl p-4">
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <div className="flex items-center justify-between">
                    <label className="font-sora text-sm font-semibold">Agregar Contraseña</label>
                    <button
                        type="button"
                        onClick={() => setIsFormVisible(!isFormVisible)}
                        className="vault-icon-frame w-7 h-7 cursor-pointer"
                        aria-label={isFormVisible ? "Ocultar formulario" : "Mostrar formulario"}
                    >
                        <svg className={`w-4 h-4 transition-transform duration-200 ${isFormVisible ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {isFormVisible && (
                    <>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Título <span className="text-destructive">*</span></label>
                            <input
                                type="text" placeholder="Título" value={keys.title}
                                onChange={(e) => { setKeys({ ...keys, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: undefined }) }}
                                className={`w-full px-3 py-1.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.title ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-vault-amber/30 focus:border-vault-amber'}`}
                            />
                            {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Aplicación</label>
                            <select
                                value={keys.application}
                                onChange={(e) => setKeys({ ...keys, application: e.target.value, category: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-amber/30 focus:border-vault-amber transition-all"
                            >
                                <option value="web">Web</option>
                                <option value="app">App</option>
                                <option value="card">Card</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Usuario <span className="text-destructive">*</span></label>
                            <input
                                type="text" placeholder="Usuario" value={keys.username}
                                onChange={(e) => { setKeys({ ...keys, username: e.target.value }); if (errors.username) setErrors({ ...errors, username: undefined }) }}
                                className={`w-full px-3 py-1.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.username ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-vault-amber/30 focus:border-vault-amber'}`}
                            />
                            {errors.username && <p className="text-destructive text-xs mt-1">{errors.username}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Contraseña <span className="text-destructive">*</span></label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"} placeholder="Contraseña" value={keys.password}
                                    onChange={(e) => { setKeys({ ...keys, password: e.target.value }); if (errors.password) setErrors({ ...errors, password: undefined }) }}
                                    className={`w-full px-3 py-1.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 transition-all pr-20 ${errors.password ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-vault-amber/30 focus:border-vault-amber'}`}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                    <button type="button" onClick={handleGeneratePassword} className="p-1 rounded hover:bg-vault-amber/10 transition-colors" title="Generar contraseña">
                                        <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    </button>
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1 rounded hover:bg-vault-amber/10 transition-colors" title={showPassword ? "Ocultar" : "Mostrar"}>
                                        <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
                                    </button>
                                    <button type="button" onClick={() => copyToClipboard(keys.password)} className="p-1 rounded hover:bg-vault-amber/10 transition-colors"><Copy /></button>
                                </div>
                            </div>
                            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-muted-foreground">Configuración</label>
                                <button type="button" onClick={() => setIsConfigVisible(!isConfigVisible)} className="vault-icon-frame w-6 h-6 cursor-pointer">
                                    <svg className={`w-3 h-3 transition-transform duration-200 ${isConfigVisible ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                            </div>

                            {isConfigVisible && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-muted-foreground w-16">Longitud:</label>
                                        <input
                                            type="number" min="4" max="32" value={passwordOptions.length}
                                            onChange={(e) => setPasswordOptions({ ...passwordOptions, length: parseInt(e.target.value) || 12 })}
                                            className="flex-1 px-2 py-1 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-vault-amber/30 transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {([
                                            ['includeUppercase', 'Mayúsculas (A-Z)'],
                                            ['includeLowercase', 'Minúsculas (a-z)'],
                                            ['includeNumbers', 'Números (0-9)'],
                                            ['includeSymbols', 'Símbolos (!@#$)'],
                                        ] as const).map(([key, label]) => (
                                            <label key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={passwordOptions[key]}
                                                    onChange={(e) => setPasswordOptions({ ...passwordOptions, [key]: e.target.checked })}
                                                    className="w-3 h-3 rounded border-border accent-vault-amber"
                                                />
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button className="flex-1 py-1.5 text-sm">Agregar</Button>
                            <Button
                                type="button"
                                onClick={() => { resetForm(); setIsFormVisible(false) }}
                                className="flex-1 py-1.5 text-sm bg-secondary text-secondary-foreground"
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
