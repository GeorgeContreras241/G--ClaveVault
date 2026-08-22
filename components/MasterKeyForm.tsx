"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { validatePassword } from "@/lib/utils/SeccionSubmit/validatePassword"


export function MasterKeyForm({ look, setLook}: { look: boolean, setLook: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [key, setKey] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)


  async function handleSubmit(e: React.FormEvent) {
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
    await new Promise(r => setTimeout(r, 0))
    try {
      // fetch al servidor para traer info de vault
      setLook(true)
    } catch (error) {
      setError("Error al acceder al vault. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKey(e.target.value)
  }

  return (
    <>
      {loading === false ? (
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
      ) : (
        <div className="h-14 w-14 border-b-2 rounded-full border-white animate-spin"></div>
      )}
    </>

  )
}
