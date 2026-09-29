# ClaveVault - Gestor de Contraseñas Seguro

Gestor de contraseñas con encriptación local, autenticación WebAuthn y sincronización segura. Construido con Next.js 16 y enfocado en privacidad zero-knowledge.

## Características

### Fase 1 - Actual
- **Encriptación Local**: Contraseñas encriptadas con Web Crypto API (AES-GCM + PBKDF2)
- **Vault Seguro**: Sistema de bóveda con salt, IV y derived key por usuario
- **Gestión de Credenciales**: CRUD completo con búsqueda, filtros y favoritos
- **Generador de Contraseñas**: Opciones configurables (longitud, mayúsculas, números, símbolos)
- **Importación/Exportación**: Archivos `.enc` encriptados
- **Interfaz Vault**: Diseño moderno con tema personalizado
- **WebAuthn**: Autenticación biométrica y hardware (Face ID, huella, YubiKey) con sesiones en Redis
- **Seguridad de servidor**: Validaciones centralizadas, CSRF (origen + doble cookie), rate limiting y cabeceras HTTP seguras

### Fase 2 - Próximamente
- **Multi-dispositivo**: Sincronización segura entre dispositivos
- **Extensiones**: Browser extensions para autocompletado

## Tecnología

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Estado | Zustand |
| Base de datos | Prisma + PostgreSQL |
| Sesiones y retos | Upstash Redis (almacén en memoria en local) |
| Auth | WebAuthn + cookies `httpOnly` |
| Criptografía | Web Crypto API (PBKDF2, AES-GCM) |
| Notificaciones | Sileo |

## Estructura

```
ClaveVault/
├── app/                    # Next.js App Router (páginas, layouts, rutas API)
│   ├── (auth)/online/      # Ruta /online (login WebAuthn)
│   ├── offline/            # Ruta /offline (modo local)
│   ├── passwords/          # Ruta /passwords (dashboard)
│   └── api/auth/           # Rutas API (login, register, sesión)
├── features/               # Módulos de funcionalidad
│   ├── auth/               # WebAuthn (login, registro)
│   ├── manager/            # Gestor de contraseñas
│   ├── offline/            # AuthGuard, OfflineShell, OfflineUnlock
│   └── online/             # MasterKeyForm, OnlineProvider, PasswordsContent
├── components/             # Componentes presentacionales
│   ├── home/               # Acción y fallback de la portada
│   ├── icons/              # Iconos SVG
│   ├── layout/             # Header, Footer, SplitLayout
│   ├── providers/          # AppProviders (Theme + Toaster)
│   ├── shared/             # Loading, Target, ThemeToggle, VideoBackground
│   └── ui/                 # shadcn/ui (button, card, input, label, separator)
├── server/                 # Backend en capas
│   ├── config/             # Config WebAuthn
│   ├── http/               # Respuestas, errores y rate limit compartidos
│   ├── models/             # User, WebAuthnCredential
│   ├── redis/              # Cliente KV (Upstash en prod, memoria en local)
│   ├── repositories/       # UserRepository, CredentialRepository
│   ├── services/           # Auth, Session, Vault, Validation, Challenge, Csrf, RateLimit
│   └── utils/              # Cookies (jarra) y cripto (tokens, hash, timing-safe)
├── lib/                    # Utilidades compartidas
│   ├── crypto/             # encrypt, decrypt, kdfKey, generateSalt
│   ├── encoding/           # base64 (contrato de la API de bóveda)
│   ├── http/               # apiFetch (wrapper con cabecera CSRF)
│   ├── utils/manager/      # copyToClipboard, generatePassword, toPasswordEntry
│   └── vault/              # saveVault, loadVault
├── constants/              # Constantes (assets, categorías, avisos, targets)
├── storage/                # Store Zustand (useStoragePass)
├── hooks/                  # useMode
├── types/                  # Tipos compartidos
├── prisma/                 # Schema y migraciones
├── proxy.ts                # Middleware: origen, sesión y cookie CSRF
└── docs/                   # Documentación técnica
```

## Instalación

### Prerrequisitos
- Node.js 20+
- PostgreSQL
- npm

### Setup

```bash
# Clonar
git clone <repository-url>
cd ClaveVault

# Instalar dependencias
npm install

# Configurar base de datos y Redis
cp .env.example .env
# Editar DATABASE_URL, RP_ID, ORIGIN y las claves de Upstash Redis en .env

# Ejecutar migraciones y generar el cliente de Prisma
npx prisma migrate dev
npx prisma generate

# Iniciar desarrollo
npm run dev
```

> **Redis:** en producción son obligatorias `UPSTASH_REDIS_REST_URL` y
> `UPSTASH_REDIS_REST_TOKEN` (gratuitas en [Upstash](https://upstash.com/)).
> Si no están definidas, `npm run dev` usa un almacén en memoria que se
> vacía al reiniciar.

Abrir [http://localhost:3000](http://localhost:3000)

## Variables de Entorno

```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/clavevault"

# WebAuthn (Relying Party)
RP_ID="localhost"
ORIGIN="http://localhost:3000"

# Redis (Upstash) — obligatorio en producción
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# URL pública del sitio (SEO, sitemap, canonical)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Scripts

```bash
npm run dev            # Desarrollo
npm run build          # Build producción
npm run start          # Servidor producción
npm run lint           # ESLint
npm run lint:fix       # ESLint con auto-corrección
npm run format         # Formatear con Prettier
npm run format:check   # Verificar formato
```

## Seguridad

**Del lado del cliente (zero-knowledge)**
- **Zero Knowledge**: El servidor nunca ve tus contraseñas en texto plano
- **Encriptación Local**: Todo se cifra antes de salir del navegador
- **Derived Key**: PBKDF2 con salt único por usuario
- **AES-GCM**: Encriptación autenticada con IV aleatorio de 12 bytes

**Del lado del servidor**
- **Validaciones centralizadas**: toda la entrada pasa por `ValidationService` (Content-Type, tamaño por streaming, formato WebAuthn, `iv` de 12 bytes)
- **CSRF en dos capas**: validación de `Origin`/`Referer` en `proxy.ts` para todo POST + token de doble cookie (`X-CSRF-Token`, comparado en tiempo constante)
- **WebAuthn**: retos con TTL de 5 min, uso único atómico e índice aleatorio de 128 bits; la credencial se busca por `userId` y el email sale del reto, no del cliente
- **Sesiones en Redis**: token de 256 bits del que solo se persiste `sha256`, cookie `httpOnly` + `SameSite=Lax` + `Secure`, expiración deslizante de 30 min
- **Rate limiting**: 20 intentos / 15 min por IP en autenticación; 120 escrituras / min por usuario en la bóveda (`429` con `Retry-After`)
- **Cabeceras HTTP**: CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y HSTS en producción
- **Sin caché en la API**: todas las respuestas de `/api/*` llevan `Cache-Control: no-store`

## Roadmap

- [x] Sistema de vault con encriptación
- [x] CRUD de contraseñas
- [x] Generador de contraseñas
- [x] Importación/Exportación
- [x] WebAuthn integration
- [x] Validaciones de servidor como servicio
- [x] Protección CSRF
- [x] Sesiones y retos en Redis
- [ ] Sincronización multi-dispositivo
- [ ] Browser extensions

---

**ClaveVault** es un proyecto educativo. Para uso crítico, considera soluciones auditadas profesionalmente (Bitwarden, 1Password, etc.).
