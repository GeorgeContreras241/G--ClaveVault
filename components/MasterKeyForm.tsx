"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { validatePassword } from "@/lib/utils/SeccionSubmit/validatePassword"

export function MasterKeyForm() {
  const [key, setKey] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const formData = new FormData(e.target as HTMLFormElement);
    const password = formData.get("password") as string;

    const validatePasswordResult = validatePassword(password);
    if (!validatePasswordResult.success) {
      setError("La master key es incorrecta. Por favor, inténtalo de nuevo.");
      return;
    }
    setLoading(true)

    try {
      // fetch al servidor para traer info de vault
      const res = true
      if(res.status === 200) {
        // Se maneja de logica de acceso al vauld traido de backend 
        console.log("Acceso al vault exitoso");
      } else {
        // Manejo de caso en el cual no haya guardado
        
      }
    } catch (error) {
      setError("Error al acceder al vault. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-6 flex items-center justify-center py-12">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKey(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Master Key</Label>
        <Input
          type="password"
          id="password"
          name="password"
          placeholder="Ingresa tu master key"
          value={key}
          onChange={handlePasswordChange}
          aria-invalid={!!error}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
      <Button type="submit" className="w-full">
        Acceder
      </Button>
    </form>
  )
}
