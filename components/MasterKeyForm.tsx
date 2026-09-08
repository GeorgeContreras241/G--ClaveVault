"use client"
import { useState, } from "react"
import { Shield, KeyRound, Lock, EyeOff, AlertTriangle, WifiOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { validatePassword } from "@/lib/utils/SeccionSubmit/validatePassword"
import { useStoragePass } from "@/storage/useStoragePass"
// cryptography
import { decrypt } from "@/lib/crypto/decryptData"
import { encrypt } from "@/lib/crypto/encryptData"
import { deriveKey } from "@/lib/crypto/kdfKey" 
import { generateSalt } from "@/lib/crypto/genereteSalt"



export function MasterKeyForm({ look, setLook }: { look: boolean, setLook: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [key, setKey] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  //storage
  const setDerivedKey = useStoragePass((state) => state.setDerivedKey)
  const setSalt = useStoragePass((state) => state.setSalt)
  const setDataPasswordInit = useStoragePass((state) => state.setDataPasswordInit)


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const formData = new FormData(e.target as HTMLFormElement);
    const password = formData.get("password") as string;

    const validatePasswordResult = validatePassword(password);
    if (!validatePasswordResult.success) {
      setError("Master Key inválida.");
      return;
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 0))
    try {
      // operacion de consultal a base de datos para si hay datos guardados previamente
      const response = await fetch("/api/auth/me",{
        credentials: "include",// enviar cokkkies de sesión
      })
      if(!response.ok){
        throw new Error("Error al acceder al vault. Por favor, inténtalo de nuevo.");
      }
      const data = await response.json()
       if(!data.hasVault){
        // Guardar en inicial
        return
      }


    } catch (error) {
      setError("Error al acceder al vault. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
      setLook(true)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKey(e.target.value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-14 w-14 border-b-2 rounded-full border-vault-amber animate-spin" />
      </div>
    )
  }

  return (
    <section className="relative flex flex-col items-center min-h-full px-4 pb-8 md:pb-12">
      <div className="vault-rise max-w-3xl w-full flex flex-col items-center text-center mb-6 md:mb-8">
        <div className="flex flex-row items-center justify-center gap-3 mb-4 md:mb-5">
          <div className="vault-rise vault-rise-delay-1 mb-4 md:mb-6 flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-vault-amber/10 border border-vault-amber/20">
            <KeyRound className="w-5 h-5 md:w-7 md:h-7 text-vault-amber" />
          </div>
          <h1 className="vault-rise vault-rise-delay-2 font-sora text-2xl md:text-4xl font-bold tracking-tight mb-3 md:mb-4">
            Crea tu Master Key
          </h1>
        </div>
        <p className="vault-rise vault-rise-delay-3 text-muted-foreground text-start text-sm md:text-base leading-relaxed">
          Necesitamos una clave maestra que nunca olvidarás. Con ella se cifran y descifran todas tus contraseñas.
          No se guarda en ningún lugar. Si la olvidas, tus datos quedan perdidos para siempre.
        </p>
      </div>

      <div className="vault-rise vault-rise-delay-3 w-full max-w-3xl mb-8 md:mb-10">
        <form onSubmit={handleSubmit} className="vault-panel rounded-xl p-4 md:p-6 space-y-3 md:space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" >
                Master Key
              </Label>
              {error && (
                <p className="text-xs md:text-sm text-destructive">{error}</p>
              )}
            </div>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="Ingresa tu master key"
              value={key}
              onChange={handlePasswordChange}
              aria-invalid={!!error}
            />

          </div>
          <Button type="submit" className="w-full">
            Acceder
          </Button>
        </form>
      </div>

      <div className="vault-rise vault-rise-delay-3 w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10">
        <FeatureCard
          icon={<Lock className="w-5 h-5" />}
          title="Cifrado local"
          description="Tus contraseñas se cifran en tu dispositivo antes de sincronizarse. Nadie más puede leerlas."
        />
        <FeatureCard
          icon={<EyeOff className="w-5 h-5" />}
          title="Sin rastro digital"
          description="La master key nunca se envía al servidor. Solo existe en tu memoria y en tu máquina."
        />
        <FeatureCard
          icon={<Shield className="w-5 h-5" />}
          title="Resistente a ataques"
          description="Incluso si el servidor es comprometido, tus datos permanecen cifrados e inaccesibles."
        />
        <FeatureCard
          icon={<WifiOff className="w-5 h-5" />}
          title="Funciona sin conexión"
          description="Accede a tus contraseñas guardadas localmente aunque no tengas conexión a internet."
        />
      </div>

      <div className="vault-rise vault-rise-delay-4 w-full max-w-3xl mb-8 md:mb-10">
        <div className="vault-panel rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4 md:mb-5">
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-vault-amber" />
            <h2 className="font-sora text-base md:text-lg font-semibold">Recomendaciones de seguridad</h2>
          </div>
          <ul className="space-y-2.5 md:space-y-3 text-xs md:text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-vault-amber" />
              Usa entre 16 y 32 caracteres con letras, números y símbolos.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-vault-amber" />
              Evita palabras comunes, fechas o información personal.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-vault-amber" />
              No reutilices esta contraseña en ningún otro servicio.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-vault-amber" />
              Considera usar una passphrase de 4+ palabras aleatorias (ej: <span className="font-mono text-foreground/70">correct-horse-battery-staple</span>).
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-vault-amber" />
              Anótala en un lugar seguro offline si temes olvidarla.
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="vault-action-card border border-neutral-900 rounded-xl p-3.5 md:p-5 flex flex-row items-center gap-3 md:gap-4 text-left group cursor-default">
      <div className="vault-icon-frame w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
        {icon}
      </div>
      <div className="flex flex-col">
        <h3 className="font-sora font-semibold text-xs md:text-sm mb-0.5 md:mb-1">{title}</h3>
        <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
