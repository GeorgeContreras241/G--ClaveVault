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

### Fase 2 - Próximamente
- **WebAuthn**: Autenticación biométrica y hardware (Face ID, huella, YubiKey)
- **Multi-dispositivo**: Sincronización segura entre dispositivos
- **Extensiones**: Browser extensions para autocompletado

## Tecnología

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Estado | Zustand |
| Base de datos | Prisma + PostgreSQL |
| Auth | WebAuthn, sesiones con cookies |
| Criptografía | Web Crypto API (PBKDF2, AES-GCM) |
| Notificaciones | Sileo |

## Estructura

```
ClaveVault/
├── app/                    # Next.js App Router
│   ├── api/auth/          # API routes (login, register, vault)
│   ├── offline/           # Página offline
│   └── passwords/         # Dashboard de contraseñas
├── components/             # Componentes React
│   ├── layout/            # Header, Footer
│   ├── providers/         # Context providers
│   ├── ui/                # shadcn/ui components
│   └── icons/             # Iconos SVG
├── features/               # feature-based modules
│   └── manager/           # Gestor de contraseñas
├── server/                 # Backend logic
│   └── services/          # AuthService, SessionService, VaultService
├── lib/                    # Utilidades
│   ├── crypto/            # encrypt, decrypt, deriveKey, generateSalt
│   └── vault/             # saveVault, loadVault
├── context/                # React Context (LocalProvider)
├── storage/                # Zustand stores
├── prisma/                 # Schema y migraciones
└── types/                  # TypeScript types
```

## Instalación

### Prerrequisitos
- Node.js 20+
- PostgreSQL
- npm o pnpm

### Setup

```bash
# Clonar
git clone <repository-url>
cd ClaveVault

# Instalar dependencias
npm install

# Configurar base de datos
cp .env.example .env
# Editar DATABASE_URL en .env

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Variables de Entorno

```env
DATABASE_URL="postgresql://user:password@localhost:5432/clavevault"
```

## Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run start    # Servidor producción
npm run lint     # ESLint
```

## Seguridad

- **Zero Knowledge**: El servidor nunca ve tus contraseñas en texto plano
- **Encriptación Local**: Todo se cifra antes de salir del navegador
- **Derived Key**: PBKDF2 con salt único por usuario
- **AES-GCM**: Encriptación autenticada
- **WebAuthn**: Autenticación sin contraseñas (fase 2)

## Roadmap

- [x] Sistema de vault con encriptación
- [x] CRUD de contraseñas
- [x] Generador de contraseñas
- [x] Importación/Exportación
- [ ] WebAuthn integration
- [ ] Sincronización multi-dispositivo
- [ ] Browser extensions

---

**ClaveVault** es un proyecto educativo. Para uso crítico, considera soluciones auditadas profesionalmente (Bitwarden, 1Password, etc.).
