---
title: "ClaveVault - Documentación Técnica"
subtitle: "Gestor de Contraseñas Local-First con Cifrado del Lado del Cliente"
author: "Equipo de Desarrollo ClaveVault"
date: "02 de Agosto, 2026"
version: "1.0.0"
lang: es
geometry: margin=2.5cm
toc: true
toc-depth: 3
numbersections: true
header-includes:
  - \usepackage{hyperref}
  - \usepackage{longtable}
  - \usepackage{booktabs}
  - \usepackage{fancyhdr}
  - \pagestyle{fancy}
  - \fancyhead[L]{ClaveVault v1.0.0}
  - \fancyhead[R]{Documentación Técnica}
  - \fancyfoot[C]{\thepage}
---

\newpage

# Portada

---

<div style="text-align: center; margin-top: 100px;">

![ClaveVault Logo](public/next.svg){ width=200px }

<br><br>

# **ClaveVault**

## Documentación Técnica del Sistema

### Gestor de Contraseñas Local-First con Cifrado del Lado del Cliente

<br>

| Campo | Valor |
|---|---|
| **Proyecto** | ClaveVault (G--ClaveVault) |
| **Versión** | 1.0.0 |
| **Fecha** | 02 de Agosto, 2026 |
| **Autor** | Equipo de Desarrollo ClaveVault |
| **Estado** | En Desarrollo (Fase 1 Completada) |
| **Licencia** | MIT |

</div>

\newpage

# Historial de Versiones

| Versión | Fecha | Autor | Cambios Realizados |
|---|---|---|---|
| 1.0.0 | 02/08/2026 | Equipo ClaveVault | Versión inicial. Modo offline con cifrado AES-256-GCM. Generador de contraseñas. UI con tema vault. |
| 0.9.0 | 19/06/2026 | Equipo ClaveVault | Implementación de WebAuthn (registro/login). Base de datos PostgreSQL con Prisma. Sesiones con cookies httpOnly. |
| 0.8.0 | 15/06/2026 | Equipo ClaveVault | Arquitectura base. Configuración de Next.js 16. Estructura de proyecto. Sistema de componentes. |
| 0.1.0 | 01/06/2026 | Equipo ClaveVault | Inicio del proyecto. Definición de tecnologías y arquitectura. |

\newpage

# Tabla de Contenido

<!-- La tabla de contenido se genera automáticamente al exportar con pandoc o LaTeX -->
<!-- Ejecutar: pandoc DOCUMENTACION_TECNICA.md -o DOCUMENTACION_TECNICA.docx --toc --toc-depth=3 -->

\newpage

# Introducción

## Objetivo del Proyecto

ClaveVault es un **gestor de contraseñas local-first** diseñado para almacenar, organizar y proteger credenciales con cifrado del lado del cliente. El sistema opera en dos modos principales:

1. **Modo Offline**: Almacenamiento completamente local sin dependencia de servidores. Las credenciales se cifran usando AES-256-GCM y se almacenan en archivos `.enc` binarios.

2. **Modo Online**: Autenticación sin contraseña mediante WebAuthn/FIDO2, con almacenamiento seguro en PostgreSQL y sesiones basadas en cookies httpOnly.

El objetivo principal es proporcionar una solución segura, fácil de usar y transparente donde **el usuario mantiene el control total de sus datos**.

## Alcance

### Incluido en la Fase 1
- Gestión de contraseñas (CRUD completo)
- Cifrado AES-256-GCM con derivación de claves PBKDF2
- Generador de contraseñas configurable
- Interfaz de usuario con tema vault (claro/oscuro)
- Categorías y favoritos
- Búsqueda y filtrado
- Exportación de vault
- Autenticación WebAuthn (registro y login)
- Gestión de sesiones

### Planificado para Fase 2
- Sincronización multi-dispositivo
- Compartir contraseñas de forma segura
- Autenticación de dos factores (2FA) adicional
- Aplicación móvil nativa
- Importación desde otros gestores de contraseñas
- Auditoría de seguridad de contraseñas

## Público Objetivo

- **Usuarios finales** que buscan un gestor de contraseñas seguro y fácil de usar
- **Desarrolladores** que necesitan una solución open-source para gestionar credenciales
- **Equipos** que requieren un gestor de contraseñas con control total sobre los datos

## Tecnologías Utilizadas

### Stack Principal

| Categoría | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Next.js | ^16.2.4 | Framework full-stack con App Router |
| UI Library | React | 19.2.3 | Biblioteca de componentes |
| Lenguaje | TypeScript | ^5 | Tipado estático |
| Estilos | Tailwind CSS | ^4 | CSS utility-first |
| Componentes | shadcn/ui | ^4.11.0 | Biblioteca de componentes UI |
| State | Zustand | ^5.0.11 | Gestión de estado del lado del cliente |
| ORM | Prisma | ^7.9.0 | Mapeo objeto-relacional |
| Base de Datos | PostgreSQL | - | Base de datos relacional |
| Auth | WebAuthn | ^13.3.x | Autenticación sin contraseña |
| Crypto | Web Crypto API | Nativa | Cifrado AES-256-GCM |

### Herramientas de Desarrollo

| Herramienta | Propósito |
|---|---|
| ESLint | Linting del código |
| Prettier | Formato del código |
| pnpm | Gestor de paquetes |

## Convenciones de Nombres

### Archivos
- **Componentes React**: PascalCase (`WebAuthnLogin.tsx`, `PasswordCard.tsx`)
- **Utilidades y servicios**: camelCase (`encryptData.ts`, `generatePassword.tsx`)
- **Archivos de configuración**: kebab_case o camelCase (`next.config.ts`, `prisma.config.ts`)

### Variables y Funciones
- **Variables**: camelCase (`credentialId`, `sessionToken`)
- **Funciones**: camelCase (`generateOptions`, `verifyRegistration`)
- **Interfaces**: PascalCase (`PasswordEntry`, `WebAuthnConfig`)
- **Constantes**: SCREAMING_SNAKE_CASE (`RP_ID`, `DATABASE_URL`)

### Base de Datos
- **Tablas**: snake_case (`webauthn_credentials`, `audit_logs`)
- **Columnas**: snake_case (`credential_id`, `created_at`)
- **Índices**: prefijo `idx_` (`idx_webauthn_credentials_user_id`)

\newpage

# Arquitectura del Sistema

## Arquitectura General

ClaveVault sigue una arquitectura **híbrida local-first + servidor autenticado** que permite dos modos de operación independientes:

```mermaid
graph TB
    subgraph "Modo Offline (Sin Servidor)"
        UF[Usuario] --> |"Sube .enc + Password"| AF[AuthGuard]
        AF --> |"Descifra"| CM[Crypto Manager]
        CM --> |"PBKDF2 + AES-GCM"| VR[Vault Room]
        VR --> |"Zustand Store"| UI[Interfaz]
    end

    subgraph "Modo Online (Con Servidor)"
        UO[Usuario] --> |"WebAuthn Biometric"| WAO[WebAuthn API]
        WAO --> |"Options/Verify"| SRV[Servidor Next.js]
        SRV --> |"Session"| DB[(PostgreSQL)]
        SRV --> |"Authenticated"| UP[User Passwords Page]
    end

    subgraph "Capa Compartida"
        UI --> |"Mismos Componentes"| UP
    end
```

## Componentes del Sistema

### Frontend (Next.js App Router)

| Componente | Responsabilidad |
|---|---|
| `app/layout.tsx` | Layout raíz: fuentes, providers, SEO, modo oscuro |
| `app/page.tsx` | Página principal de inicio |
| `app/offline/` | Modo offline: gestor de contraseñas local |
| `app/online/` | Modo online: autenticación WebAuthn |
| `app/passwords/` | Página de contraseñas del usuario (server-rendered) |
| `app/api/auth/` | Rutas API para autenticación WebAuthn |

### Backend (Server Layer)

| Componente | Responsabilidad |
|---|---|
| `server/services/` | Lógica de negocio: AuthService, SessionService |
| `server/repositories/` | Acceso a datos: UserRepository, CredentialRepository |
| `server/models/` | Modelos de dominio: User, WebAuthnCredential, Challenge |
| `server/config/` | Configuración: WebAuthn RP config |

### Infraestructura

| Componente | Responsabilidad |
|---|---|
| `lib/db.ts` | Cliente Prisma singleton con adaptador PostgreSQL |
| `lib/crypto/` | Utilidades de cifrado: encrypt, decrypt, KDF, salt |
| `lib/vault/` | Gestión de archivos vault: save, load |
| `storage/` | Stores de Zustand: passwords, config |
| `context/` | React Contexts: local vault, cloud (placeholder) |

## Flujo de Información

### Flujo Modo Offline

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as Interfaz
    participant AG as AuthGuard
    participant CM as CryptoManager
    participant ZS as Zustand Store

    U->>UI: Arrastra archivo .enc
    U->>UI: Ingresa master password
    UI->>AG: Valida password (min 8 chars)
    AG->>CM: Carga vault (salt + iv + data)
    CM->>CM: PBKDF2(password, salt) -> AES Key
    CM->>CM: AES-256-GCM.decrypt(data, iv, key)
    CM->>ZS: Almacena PasswordEntry[]
    ZS->>UI: Renderiza gestor
    UI->>U: Muestra credenciales
```

### Flujo Modo Online

```mermaid
sequenceDiagram
    participant U as Usuario
    participant B as Browser
    participant S as Servidor
    participant DB as PostgreSQL

    Note over U,DB: Registro
    U->>B: Ingresa email
    B->>S: POST /api/auth/register/options
    S->>DB: Crea challenge
    S-->>B: Registration options
    B->>B: Authenticator.create()
    B->>S: POST /api/auth/register/verify
    S->>DB: Guarda user + credential
    S-->>B: Registro exitoso

    Note over U,DB: Login
    U->>B: Ingresa email
    B->>S: POST /api/auth/login/options
    S->>DB: Busca credential
    S-->>B: Authentication options
    B->>B: Authenticator.get()
    B->>S: POST /api/auth/login/verify
    S->>DB: Crea session
    S-->>B: Set-Cookie: session_token
    B->>S: GET /passwords (con cookie)
    S-->>B: Página autenticada
```

## Diagrama de Arquitectura Completa

```mermaid
graph LR
    subgraph "Capa de Presentación"
        A[Next.js App Router] --> B[React Components]
        B --> C[shadcn/ui]
        B --> D[Tailwind CSS]
        B --> E[Zustand Stores]
    end

    subgraph "Capa de API"
        F[Route Handlers] --> G[Services]
        G --> H[Repositories]
    end

    subgraph "Capa de Datos"
        H --> I[Prisma ORM]
        I --> J[(PostgreSQL)]
    end

    subgraph "Seguridad"
        K[WebAuthn/FIDO2] --> L[@simplewebauthn]
        M[Web Crypto API] --> N[AES-256-GCM]
        M --> O[PBKDF2]
        P[Session Manager] --> Q[httpOnly Cookies]
    end

    A --> F
    G --> K
    G --> P
    H --> M
```

\newpage

# Estructura del Proyecto

## Árbol de Directorios

```text
G--ClaveVault/
├── app/                              # Next.js App Router (páginas, layouts, rutas API)
│   ├── layout.tsx                    # Layout raíz (fuentes, providers, SEO)
│   ├── page.tsx                      # Página principal de inicio
│   ├── globals.css                   # Estilos globales (Tailwind v4 + tema vault)
│   ├── not-found.tsx                 # Página 404
│   ├── robots.ts                     # SEO robots.txt
│   ├── sitemap.ts                    # SEO sitemap
│   ├── (auth)/
│   │   └── online/
│   │       ├── layout.tsx            # Layout modo online (Header + Footer)
│   │       └── page.tsx              # Página WebAuthn login/register
│   ├── api/
│   │   └── auth/
│   │       ├── register/
│   │       │   ├── options/route.ts  # POST: Generar opciones de registro
│   │       │   └── verify/route.ts   # POST: Verificar registro
│   │       └── login/
│   │           ├── options/route.ts  # POST: Generar opciones de login
│   │           ├── verify/route.ts   # POST: Verificar login + crear sesión
│   │           └── logout/route.ts   # POST: Destruir sesión
│   ├── offline/
│   │   ├── layout.tsx                # Layout modo offline
│   │   ├── page.tsx                  # Gestor de contraseñas offline
│   │   ├── AuthGuard.tsx            # Guard de seguridad (master password)
│   │   ├── OfflineShell.tsx          # Wrapper LocalProvider
│   │   ├── loading.tsx               # Skeleton de carga
│   │   └── error.tsx                 # Error boundary
│   └── passwords/
│       ├── layout.tsx                # Layout de contraseñas
│       └── page.tsx                  # Página de contraseñas (server-rendered)
│
├── components/                       # Componentes React reutilizables
│   ├── auth/
│   │   ├── WebAuthnLogin.tsx         # Botón login WebAuthn
│   │   └── WebAuthnRegister.tsx      # Botón registro WebAuthn
│   ├── home/
│   │   ├── WebAuthnAction.tsx        # Card de acción WebAuthn
│   │   └── HomeFallbacks.tsx         # Skeletons de carga
│   ├── layout/
│   │   ├── Header.tsx                # Header global con enlace de retroceso
│   │   ├── Footer.tsx                # Footer global (redes sociales + toggle tema)
│   │   ├── Sidebar.tsx               # Sidebar placeholder
│   │   └── BackButton.tsx            # Botón de retroceso placeholder
│   ├── providers/
│   │   └── AppProviders.tsx          # ThemeProvider + Toaster
│   ├── vault/
│   │   ├── VaultHeader.tsx           # Header del vault (placeholder)
│   │   ├── VaultSearch.tsx           # Búsqueda del vault (placeholder)
│   │   └── VaultFilters.tsx          # Filtros del vault (placeholder)
│   ├── shared/
│   │   ├── Button.tsx                # Botón personalizado con variantes
│   │   ├── Target.tsx                # Badge de feature target
│   │   ├── exit.tsx                  # Icono de salida
│   │   └── themeMode/
│   │       └── ThemeToogle.tsx        # Toggle de tema claro/oscuro
│   ├── SeccionSubmit/
│   │   ├── ActionSubmit.tsx          # Formulario master password + upload .enc
│   │   ├── Menu.tsx                  # Componente menú
│   │   └── Search.tsx                # Componente búsqueda
│   ├── Social/
│   │   └── SocialSeccion.tsx         # Enlaces redes sociales + toggle tema
│   ├── seo/
│   │   └── JsonLd.tsx                # Datos estructurados JSON-LD
│   ├── icons/                        # 24 componentes de iconos SVG
│   │   ├── Add.tsx, App.tsx, Archive.tsx, Arrow.tsx, Card.tsx
│   │   ├── Copy.tsx, Dark.tsx, Delete.tsx, Edit.tsx, Exit.tsx
│   │   ├── Export.tsx, Eye.tsx, EyeClose.tsx, Favorite.tsx
│   │   ├── GitHub.tsx, Ligth.tsx, LinKedin.tsx, Lock.tsx
│   │   ├── LockEmpty.tsx, Search.tsx, Star.tsx, StarFilled.tsx
│   │   ├── Web.tsx, WebAuthn.tsx
│   └── ui/                           # Componentes base shadcn/ui
│       ├── button.tsx, card.tsx, input.tsx, label.tsx, separator.tsx
│
├── features/                         # Módulos de funcionalidad
│   ├── auth/
│   │   ├── index.ts                  # Export barrel
│   │   └── components/
│   │       ├── WebAuthn.tsx          # Página completa de autenticación WebAuthn
│   │       └── authGuard.tsx         # Guard placeholder
│   └── manager/
│       ├── Gestor.tsx                # Gestor principal de contraseñas
│       └── components/
│           ├── AddPassword.tsx       # Formulario agregar contraseña
│           ├── EditPassword.tsx      # Formulario editar contraseña
│           ├── Header_Gestor.tsx     # Header del gestor
│           └── PasswordCard.tsx      # Tarjeta de contraseña
│
├── server/                           # Capa del servidor
│   ├── config/
│   │   ├── index.ts                  # Export barrel
│   │   └── webauthn.config.ts        # Configuración WebAuthn RP
│   ├── models/
│   │   ├── index.ts                  # Export barrel
│   │   ├── User.ts                   # Modelo de dominio User
│   │   ├── WebAuthnCredential.ts     # Modelo de dominio WebAuthnCredential
│   │   └── Challenge.ts             # Modelo de dominio Challenge
│   ├── repositories/
│   │   ├── index.ts                  # Export barrel
│   │   ├── UserRepository.ts         # CRUD usuarios con Prisma
│   │   └── CredentialRepository.ts   # CRUD credenciales WebAuthn
│   └── services/
│       ├── index.ts                  # Export barrel
│       ├── AuthService.ts            # Lógica WebAuthn registro + autenticación
│       └── SessionService.ts         # Gestión de sesiones con cookies
│
├── lib/                              # Código compartido
│   ├── db.ts                         # Cliente Prisma singleton
│   ├── site.ts                       # Configuración del sitio
│   ├── utils.ts                      # Utilidad cn() (clsx + tailwind-merge)
│   ├── get-user.ts                   # Obtención de usuario desde sesión
│   ├── webauthn-store.ts             # Almacén de challenges en memoria
│   ├── crypto/
│   │   ├── encryptData.ts            # Cifrado AES-GCM
│   │   ├── decryptData.ts            # Descifrado AES-GCM
│   │   ├── genereteSalt.ts           # Generación de salt aleatorio
│   │   └── kdfKey.ts                 # Derivación de claves PBKDF2
│   ├── vault/
│   │   ├── saveVault.ts              # Guardar vault binario
│   │   └── loadVault.ts              # Cargar vault binario
│   ├── cache/
│   │   └── site.ts                   # Cache Next.js "use cache"
│   └── utils/
│       ├── Gestor/
│       │   ├── copyToClipboard.ts    # Copiar al portapapeles
│       │   ├── generatePassword.tsx  # Generador de contraseñas
│       │   └── toPasswordEntry.ts    # Mapeador de datos
│       └── SeccionSubmit/
│           ├── openVault.ts          # Cargar y parsear vault
│           ├── validatePassword.tsx  # Validación de password
│           └── validateVaultInputs.ts # Validación de inputs vault
│
├── context/                          # React Contexts
│   ├── cloudProvider.tsx             # Context cloud (placeholder)
│   ├── localProvider.tsx             # Context vault local
│   └── useLocalContext.ts            # Hook personalizado para LocalContext
│
├── storage/                          # Stores Zustand
│   ├── useStoragePass.tsx            # Store de entradas de contraseña
│   └── useStoreConfig.tsx            # Store de configuración
│
├── types/
│   └── index.ts                      # Todas las interfaces/tipos TypeScript
│
├── const/                            # Constantes
│   ├── buttonsNavegations.js         # Botones de categorías
│   ├── sileoConfig.js                # Configuración de notificaciones
│   └── target.js                     # Features targets página principal
│
├── utils/
│   └── commitGenerator.ts            # Generador de mensajes commit
│
├── prisma/
│   ├── schema.prisma                 # Esquema de base de datos
│   ├── prisma.config.ts              # Configuración Prisma
│   └── migrations/
│       └── 20260619020039_init/      # Migración inicial
│           └── migration.sql
│
├── public/                           # Assets estáticos
│   ├── file.svg, globe.svg, next.svg
│   └── vercel.svg, window.svg
│
├── .agents/                          # Skills de agentes IA
│   └── skills/                       # 13 skills de autoskills-registry
│
├── proxy.ts                          # Middleware proxy de sesión
├── next.config.ts                    # Configuración Next.js
├── tsconfig.json                     # Configuración TypeScript
├── postcss.config.mjs                # Configuración PostCSS
├── eslint.config.mjs                 # Configuración ESLint
├── .prettierrc                       # Configuración Prettier
├── components.json                   # Configuración shadcn/ui
├── package.json                      # Dependencias del proyecto
├── pnpm-lock.yaml                    # Lock file pnpm
└── README.md                         # Documentación del proyecto
```

## Responsabilidades por Carpeta

### `app/`
Capa de presentación y rutas API de Next.js App Router. Contiene todos los layouts, páginas, y endpoint handlers. Sigue el patrón de convenciones de archivos de Next.js.

### `components/`
Componentes React reutilizables organizados por dominio. Incluye componentes base de shadcn/ui en `ui/`, iconos SVG personalizados en `icons/`, y componentes de negocio en subcarpetas temáticas.

### `features/`
Módulos de funcionalidad completa. Cada feature contiene sus propios componentes y lógica de negocio. Patrón de agrupación por dominio.

### `server/`
Capa del servidor con arquitectura en capas:
- **config/**: Configuración de servicios externos
- **models/**: Modelos de dominio con métodos factory
- **repositories/**: Acceso a datos encapsulado con Prisma
- **services/**: Lógica de negocio

### `lib/`
Biblioteca compartida entre cliente y servidor. Incluye utilidades de cifrado, gestores de vault, y configuración del sitio.

### `context/`
React Contexts para manejo de estado global. Actualmente implementa el vault local; el cloud está en placeholder.

### `storage/`
Stores de Zustand para estado del lado del cliente. Separación entre datos de contraseñas y configuración.

### `types/`
Definiciones de tipos TypeScript centralizadas para todo el proyecto.

### `prisma/`
Esquema de base de datos, configuración y migraciones de Prisma.

\newpage

# Modelo de Datos

## Entidad: User

Representa un usuario registrado en el sistema.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | String | Identificador único | PK, CUID, auto-generado |
| `email` | String | Correo electrónico | UNIQUE, obligatorio |
| `createdAt` | DateTime | Fecha de creación | Default: now() |
| `updatedAt` | DateTime | Fecha de actualización | Auto-actualizado |

**Tabla mapeada:** `users`

**Relaciones:**
- Un User tiene muchas WebAuthnCredentials (1:N)
- Un User tiene un Vault (1:1)
- Un User tiene muchos AuditLogs (1:N)
- Un User tiene muchas Sessions (1:N)

## Entidad: WebAuthnCredential

Credencial WebAuthn registrada para un usuario.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | String | Identificador único | PK, CUID, auto-generado |
| `userId` | String | ID del usuario propietario | FK -> User.id |
| `credentialId` | String | ID de la credencial WebAuthn | UNIQUE, VARCHAR(255) |
| `publicKey` | Bytes | Clave pública de la credencial | Obligatorio |
| `counter` | BigInt | Contador de uso | Default: 0 |
| `transports` | String? | Transportes soportados | Text, nullable |
| `createdAt` | DateTime | Fecha de creación | Default: now(), Timestamptz |

**Tabla mapeada:** `webauthn_credentials`

**Índices:**
- `idx_webauthn_credentials_user_id` en campo `userId`

**Relaciones:**
- Muchas WebAuthnCredentials pertenecen a un User (N:1)

## Entidad: Vault

Almacén cifrado de credenciales del usuario.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | String | Identificador único | PK, UUID, auto-generado |
| `userId` | String | ID del usuario propietario | UNIQUE, UUID, FK implicita |
| `encryptedData` | Bytes | Datos cifrados del vault | Obligatorio |
| `version` | Int | Versión del vault | Default: 1 |
| `createdAt` | DateTime | Fecha de creación | Default: now(), Timestamptz |
| `updatedAt` | DateTime | Fecha de actualización | Auto-actualizado, Timestamptz |

**Tabla mapeada:** `vaults`

**Relaciones:**
- Un Vault pertenece a un User (1:1)

## Entidad: AuditLog

Registro de auditoría de acciones del usuario.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | String | Identificador único | PK, UUID, auto-generado |
| `userId` | String | ID del usuario | UUID, FK implicita |
| `action` | String | Acción realizada | VARCHAR(50) |
| `ipAddress` | String? | Dirección IP del cliente | INET, nullable |
| `userAgent` | String? | User-Agent del cliente | Text, nullable |
| `createdAt` | DateTime | Fecha de la acción | Default: now(), Timestamptz |

**Tabla mapeada:** `audit_logs`

**Índices:**
- `idx_audit_logs_user_id_created_at` en campos `(userId, createdAt DESC)`

**Relaciones:**
- Muchos AuditLogs pertenecen a un User (N:1)

## Entidad: Session

Sesión activa de un usuario.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | String | Token de sesión (UUID) | PK, auto-generado |
| `userId` | String | ID del usuario | FK -> User.id |
| `expiresAt` | DateTime | Fecha de expiración | Obligatorio |

**Tabla mapeada:** `sessions`

**Índices:**
- `idx_sessions_user_id` en campo `userId`

**Relaciones:**
- Muchas Sessions pertenecen a un User (N:1)

## Entidad: PasswordEntry (Cliente)

Entrada de contraseña en el vault del lado del cliente.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | String | Identificador único | UUID |
| `title` | String | Título de la entrada | Obligatorio |
| `username` | String | Nombre de usuario | Obligatorio |
| `password` | String | Contraseña cifrada | Obligatorio |
| `favorite` | Boolean | Marcada como favorita | Default: false |
| `url` | String | URL del servicio | Opcional |
| `category` | String | Categoría de la entrada | "web" \| "app" \| "card" |

\newpage

# Base de Datos

## Modelo Entidad-Relación

```mermaid
erDiagram
    users ||--o{ webauthn_credentials : "tiene"
    users ||--o| vaults : "tiene"
    users ||--o{ audit_logs : "genera"
    users ||--o{ sessions : "tiene"

    users {
        string id PK "CUID"
        string email UK "Email único"
        datetime createdAt "Fecha creación"
        datetime updatedAt "Fecha actualización"
    }

    webauthn_credentials {
        string id PK "CUID"
        string userId FK "Referencia a usuario"
        string credentialId UK "ID WebAuthn único"
        bytes publicKey "Clave pública"
        bigint counter "Contador de uso"
        string transports "Transportes"
        datetime createdAt "Fecha creación"
    }

    vaults {
        uuid id PK "UUID"
        uuid userId UK "Referencia a usuario"
        bytes encryptedData "Datos cifrados"
        int version "Versión del vault"
        datetime createdAt "Fecha creación"
        datetime updatedAt "Fecha actualización"
    }

    audit_logs {
        uuid id PK "UUID"
        uuid userId FK "Referencia a usuario"
        string action "Acción realizada"
        inet ipAddress "IP del cliente"
        text userAgent "User-Agent"
        datetime createdAt "Fecha de la acción"
    }

    sessions {
        string id PK "Token UUID"
        string userId FK "Referencia a usuario"
        datetime expiresAt "Fecha expiración"
    }
```

## Claves Primarias

| Tabla | Campo | Tipo | Generación |
|---|---|---|---|
| `users` | `id` | String | CUID (auto) |
| `webauthn_credentials` | `id` | String | CUID (auto) |
| `vaults` | `id` | UUID | UUID (auto) |
| `audit_logs` | `id` | UUID | UUID (auto) |
| `sessions` | `id` | String | UUID (del token) |

## Claves Foráneas

| Tabla | Campo | Tabla Referenciada | Campo Referenciado |
|---|---|---|---|
| `webauthn_credentials` | `userId` | `users` | `id` |
| `sessions` | `userId` | `users` | `id` |

## Índices

| Tabla | Índice | Campo(s) | Tipo |
|---|---|---|---|
| `webauthn_credentials` | `idx_webauthn_credentials_user_id` | `userId` | B-Tree |
| `audit_logs` | `idx_audit_logs_user_id_created_at` | `userId`, `createdAt DESC` | B-Tree compuesto |
| `sessions` | `idx_sessions_user_id` | `userId` | B-Tree |
| `users` | `users_email_key` | `email` | UNIQUE |
| `webauthn_credentials` | `webauthn_credentials_credential_id_key` | `credentialId` | UNIQUE |

## Restricciones

| Tabla | Restricción | Tipo | Descripción |
|---|---|---|---|
| `users` | `users_email_key` | UNIQUE | Email debe ser único |
| `webauthn_credentials` | `webauthn_credentials_credential_id_key` | UNIQUE | credentialId debe ser único |
| `vaults` | `vaults_user_id_key` | UNIQUE | Un usuario solo tiene un vault |
| `vaults` | `vaults_user_id_fkey` | FK | userId referencia a users.id |
| `webauthn_credentials` | `webauthn_credentials_user_id_fkey` | FK | userId referencia a users.id |
| `sessions` | `sessions_user_id_fkey` | FK | userId referencia a users.id |

## Estrategias de Migración

### Migración Inicial
La migración inicial (`20260619020039_init`) crea las 5 tablas base con todas las restricciones e índices necesarios.

```sql
-- Archivo: prisma/migrations/20260619020039_init/migration.sql

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "webauthn_credentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credential_id" VARCHAR(255) NOT NULL,
    "public_key" BYTEA NOT NULL,
    "counter" BIGINT NOT NULL DEFAULT 0,
    "transports" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "webauthn_credentials_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "webauthn_credentials_credential_id_key" ON "webauthn_credentials"("credential_id");
CREATE INDEX "idx_webauthn_credentials_user_id" ON "webauthn_credentials"("userId");

-- ... (tablas restantes)
```

### Comandos de Migración

```bash
# Crear nueva migración
npx prisma migrate dev --name <nombre_migracion>

# Aplicar migraciones en producción
npx prisma migrate deploy

# Regenerar cliente Prisma
npx prisma generate

# Resetear base de datos (¡CUIDADO!)
npx prisma migrate reset
```

\newpage

# API REST

## Endpoints de Autenticación

### POST `/api/auth/register/options`

Genera las opciones de registro WebAuthn para un email dado.

**Descripción:** Inicia el flujo de registro WebAuthn creando un challenge y las opciones necesarias para que el navegador registre una nueva credencial.

**Parámetros de Request:**

| Campo | Tipo | Ubicación | Descripción | Requerido |
|---|---|---|---|---|
| `email` | string | Body | Correo electrónico del usuario | Sí |

**Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Respuestas:**

| Código | Descripción | Body |
|---|---|---|
| 200 | Opciones generadas exitosamente | `{ "ok": true, "options": { ... } }` |
| 400 | Email inválido o faltante | `{ "ok": false, "error": "Email inválido" }` |
| 500 | Error interno del servidor | `{ "ok": false, "error": "Error al generar opciones" }` |

**Ejemplo de Respuesta 200:**
```json
{
  "ok": true,
  "options": {
    "rp": {
      "name": "ClaveVault",
      "id": "localhost"
    },
    "user": {
      "id": "cuid_generado",
      "name": "usuario@ejemplo.com",
      "displayName": "usuario@ejemplo.com"
    },
    "challenge": "challenge_en_base64",
    "pubKeyCredParams": [
      { "type": "public-key", "alg": -7 },
      { "type": "public-key", "alg": -257 }
    ],
    "timeout": 60000,
    "attestation": "direct"
  }
}
```

---

### POST `/api/auth/register/verify`

Verifica la respuesta de registro WebAuthn y crea el usuario y credencial.

**Descripción:** Completa el flujo de registro verificando la respuesta del authenticator, almacenando la credencial y creando el usuario.

**Parámetros de Request:**

| Campo | Tipo | Ubicación | Descripción | Requerido |
|---|---|---|---|---|
| `email` | string | Body | Correo electrónico | Sí |
| `credential` | object | Body | Respuesta del authenticator | Sí |

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "credential": {
    "id": "credential_id",
    "rawId": "raw_id_base64",
    "response": {
      "attestationObject": "attestation_base64",
      "clientDataJSON": "client_data_base64"
    },
    "type": "public-key",
    "clientExtensionResults": {}
  }
}
```

**Respuestas:**

| Código | Descripción | Body |
|---|---|---|
| 200 | Registro exitoso | `{ "ok": true }` |
| 400 | Verificación fallida | `{ "ok": false, "error": "Verificación fallida" }` |
| 500 | Error del servidor | `{ "ok": false, "error": "Error al verificar" }` |

---

### POST `/api/auth/login/options`

Genera las opciones de autenticación WebAuthn para un email.

**Descripción:** Inicia el flujo de login buscando las credenciales del usuario y creando un challenge de autenticación.

**Parámetros de Request:**

| Campo | Tipo | Ubicación | Descripción | Requerido |
|---|---|---|---|---|
| `email` | string | Body | Correo electrónico registrado | Sí |

**Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Respuestas:**

| Código | Descripción | Body |
|---|---|---|
| 200 | Opciones generadas | `{ "ok": true, "options": { ... } }` |
| 400 | Email inválido | `{ "ok": false, "error": "Email inválido" }` |
| 404 | Usuario no encontrado | `{ "ok": false, "error": "Usuario no encontrado" }` |
| 500 | Error del servidor | `{ "ok": false, "error": "Error al generar opciones" }` |

---

### POST `/api/auth/login/verify`

Verifica la respuesta de autenticación WebAuthn y crea la sesión.

**Descripción:** Completa el flujo de login verificando la respuesta del authenticator, validando el counter, creando la sesión y estableciendo la cookie httpOnly.

**Parámetros de Request:**

| Campo | Tipo | Ubicación | Descripción | Requerido |
|---|---|---|---|---|
| `email` | string | Body | Correo electrónico | Sí |
| `credential` | object | Body | Respuesta del authenticator | Sí |

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "credential": {
    "id": "credential_id",
    "rawId": "raw_id_base64",
    "response": {
      "authenticatorData": "auth_data_base64",
      "clientDataJSON": "client_data_base64",
      "signature": "signature_base64",
      "userHandle": "user_handle_base64"
    },
    "type": "public-key",
    "clientExtensionResults": {}
  }
}
```

**Respuestas:**

| Código | Descripción | Headers |
|---|---|---|
| 200 | Login exitoso | `Set-Cookie: session_token=...; HttpOnly; Secure; SameSite=Lax` |
| 400 | Verificación fallida | - |
| 404 | Credencial no encontrada | - |
| 500 | Error del servidor | - |

**Headers de Respuesta (200):**
```
Set-Cookie: session_token=uuid_token; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1800
```

---

### POST `/api/auth/login/logout`

Destruye la sesión activa del usuario.

**Descripción:** Elimina la sesión de la base de datos y limpia la cookie de sesión.

**Parámetros de Request:**
Ninguno (usa la cookie de sesión del request)

**Respuestas:**

| Código | Descripción | Headers |
|---|---|---|
| 200 | Logout exitoso | `Set-Cookie: session_token=; Max-Age=0` |
| 500 | Error del servidor | - |

**Body (200):**
```json
{
  "ok": true
}
```

## Formato de Respuesta Estándar

Todos los endpoints de autenticación siguen el siguiente formato:

```typescript
interface ApiResponse {
  ok: boolean;
  options?: object;    // Solo en respuestas de opciones
  error?: string;      // Solo en errores
}
```

## Codigos de Error HTTP

| Código | Significado | Uso en ClaveVault |
|---|---|---|
| 200 | OK | Operación exitosa |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | No autenticado |
| 404 | Not Found | Usuario o credencial no encontrada |
| 500 | Internal Server Error | Error interno del servidor |

\newpage

# Autenticación

## Visión General

ClaveVault implementa dos mecanismos de autenticación completamente independientes:

1. **Modo Offline**: Master password + cifrado local
2. **Modo Online**: WebAuthn/FIDO2 (sin contraseña)

## Autenticación Offline

### Flujo de Desbloqueo

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as ActionSubmit
    participant AG as AuthGuard
    participant CM as CryptoManager
    participant LS as localStorage
    participant ZS as Zustand Store

    alt Primera vez
        U->>UI: Arrastra archivo .enc
        U->>UI: Ingresa master password
        UI->>UI: Validar password (min 8 chars)
        UI->>CM: openVault(file, password)
        CM->>CM: Leer salt(16) + iv(12) + data del archivo
        CM->>CM: PBKDF2(password, salt, 200000) -> AES Key
        CM->>CM: AES-GCM.decrypt(data, iv, key)
        CM->>ZS: setEntries(PasswordEntry[])
        CM->>LS: Guardar salt
        CM->>AG: setIsUnLocked(true)
        AG->>UI: Mostrar gestor
    else Subsecuente
        U->>UI: Ingresa master password
        UI->>LS: Obtener salt guardado
        UI->>CM: PBKDF2(password, savedSalt) -> AES Key
        CM->>CM: Intentar descifrar datos conocidos
        CM->>AG: setIsUnLocked(true/false)
    end
```

### Cifrado de Vault

**Algoritmo:** AES-256-GCM

**Derivación de Clave:** PBKDF2
- Iteraciones: 200,000
- Hash: SHA-256
- Salida: CryptoKey para AES-256-GCM

**Formato del Archivo Vault (.enc):**
```
┌─────────────┬─────────────┬──────────────────────────────┐
│   Salt      │     IV      │      Ciphertext              │
│  (16 bytes) │  (12 bytes) │     (variable)               │
└─────────────┴─────────────┴──────────────────────────────┘
```

**Código de Ejemplo:**
```typescript
// lib/crypto/kdfKey.ts
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 200000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}
```

## Autenticación Online (WebAuthn)

### Conceptos WebAuthn

| Concepto | Descripción |
|---|---|
| **Relying Party (RP)** | El servidor que verifica la identidad (ClaveVault) |
| **Authenticator** | Dispositivo que genera y almacena claves (YubiKey, Touch ID, Windows Hello) |
| **Credential** | Par de claves pública/privada asociada al usuario |
| **Challenge** | Valor aleatorio que previene replay attacks |
| **Counter** | Contador que detecta clonación de credenciales |

### Configuración WebAuthn

```typescript
// server/config/webauthn.config.ts
export const webauthnConfig = {
  rpName: 'ClaveVault',
  rpID: process.env.RP_ID || 'localhost',
  origin: process.env.ORIGIN || 'http://localhost:3000',
  timeout: 60000,          // 60 segundos
  challengeTTL: 300,       // 5 minutos
  userVerification: 'required',
};
```

### Flujo de Registro

```mermaid
sequenceDiagram
    participant U as Usuario
    participant B as Browser
    participant S as Servidor
    participant A as Authenticator
    participant DB as PostgreSQL

    U->>B: Ingresa email
    B->>S: POST /register/options {email}
    S->>DB: Buscar usuario por email
    S->>S: Generar challenge aleatorio
    S->>DB: Guardar challenge (TTL 5min)
    S-->>B: RegistrationOptions

    B->>A: navigator.credentials.create(options)
    A->>A: Usuario verifica (biometría/PIN)
    A-->>B: Credential (publicKey, attestation)

    B->>S: POST /register/verify {email, credential}
    S->>DB: Obtener challenge
    S->>S: Verificar challenge coincide
    S->>S: Verificar attestation válida
    S->>DB: Crear User + WebAuthnCredential
    S-->>B: {ok: true}

    Note over U,DB: Login
    U->>B: Ingresa email
    B->>S: POST /login/options {email}
    S->>DB: Buscar credenciales del usuario
    S->>S: Generar challenge
    S->>DB: Guardar challenge
    S-->>B: AuthenticationOptions

    B->>A: navigator.credentials.get(options)
    A->>A: Usuario verifica
    A-->>B: Assertion (signature, authenticatorData)

    B->>S: POST /login/verify {email, credential}
    S->>DB: Obtener challenge + credential
    S->>S: Verificar challenge
    S->>S: Verificar firma con publicKey
    S->>S: Verificar counter incrementado
    S->>DB: Actualizar counter
    S->>DB: Crear Session (30min TTL)
    S-->>B: Set-Cookie: session_token=...
    B->>S: GET /passwords (con cookie)
```

### Registro WebAuthn (Código)

```typescript
// server/services/AuthService.ts
export async function generateRegistrationOptions(email: string) {
  const user = await userRepository.findByEmail(email);

  const options = await generateServerRegistrationOptions({
    rpName: webauthnConfig.rpName,
    rpID: webauthnConfig.rpID,
    userName: email,
    userDisplayName: email,
    attestationType: 'direct',
    authenticatorSelection: {
      userVerification: 'required',
    },
    timeout: webauthnConfig.timeout,
  });

  // Guardar challenge en memoria
  challengeStore.set(email, {
    challenge: options.challenge,
    userId: user?.id || email,
    createdAt: Date.now(),
  });

  return options;
}

export async function verifyRegistration(
  email: string,
  credential: RegistrationCredentialJSON
) {
  const stored = challengeStore.get(email);
  if (!stored) throw new Error('Challenge no encontrado');

  const verification = await verifyServerRegistrationResponse({
    credential,
    expectedChallenge: stored.challenge,
    expectedOrigin: webauthnConfig.origin,
    expectedRPID: webauthnConfig.rpID,
  });

  if (!verification.verified) {
    throw new Error('Verificación fallida');
  }

  // Crear usuario y credencial
  const user = await userRepository.create({ email });
  await credentialRepository.create({
    userId: user.id,
    credentialId: verification.credentialID,
    publicKey: verification.credentialPublicKey,
    counter: verification.counter,
    transports: credential.response?.transports,
  });

  challengeStore.delete(email);
  return { verified: true };
}
```

### Sesiones

**Gestión de Sesiones:**

| Aspecto | Detalle |
|---|---|
| **Tipo** | Cookie httpOnly |
| **Nombre** | `session_token` |
| **TTL** | 30 minutos |
| **Secure** | true en producción |
| **SameSite** | Lax |
| **Almacenamiento** | PostgreSQL tabla `sessions` |

**Código de Sesión:**
```typescript
// server/services/SessionService.ts
export async function createSession(userId: string): Promise<string> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

  await prisma.session.create({
    data: { id: token, userId, expiresAt },
  });

  return token;
}

export async function validateSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { id: token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function destroySession(token: string) {
  await prisma.session.delete({ where: { id: token } });
}
```

## Revocación de Sesiones

- **Logout**: Elimina la sesión de PostgreSQL y limpia la cookie
- **Expiración**: Sesiones expiran automáticamente después de 30 minutos
- **Invalidación**: Al cambiar de dispositivo, las sesiones anteriores pueden ser revocadas manualmente

\newpage

# Autorización

## Roles

Actualmente ClaveVault implementa un modelo de autorización simple basado en autenticación:

| Rol | Descripción | Permisos |
|---|---|---|
| **Guest** | Usuario no autenticado | Acceso a página principal, modo offline |
| **User** | Usuario autenticado | Acceso completo a modo online, gestión de vault |

## Protección de Rutas

### Middleware Proxy

```typescript
// proxy.ts
export async function sessionGuard(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/online', request.url));
  }

  const session = await validateSession(sessionToken);
  if (!session) {
    return NextResponse.redirect(new URL('/online', request.url));
  }

  return NextResponse.next();
}
```

### AuthGuard (Modo Offline)

```typescript
// app/offline/AuthGuard.tsx
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isUnLocked } = useLocalContext();

  if (!isUnLocked) {
    return <ActionSubmit />;
  }

  return <>{children}</>;
}
```

### Protección de Páginas

```typescript
// app/passwords/page.tsx
export default async function PasswordsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/online');
  }

  return <PasswordsView user={user} />;
}
```

## Policies (Planificado)

Para futuras versiones se contempla implementar:

- **Vault Policy**: Solo el propietario puede acceder a su vault
- **Share Policy**: Permisos de solo lectura/compartidos
- **Admin Policy**: Gestión de usuarios (panel admin)

\newpage

# Flujo de Negocio

## 1. Crear Vault Offline

**Descripción:** El usuario crea un nuevo vault cifrado desde cero.

**Entradas:**
- Master password (mínimo 8 caracteres)
- Nombre del vault (opcional)

**Salidas:**
- Archivo `.enc` cifrado descargable

**Validaciones:**
- Password mínimo 8 caracteres
- Password confirmado correctamente

**Errores Posibles:**
| Error | Causa | Solución |
|---|---|---|
| Password muy corta | Menos de 8 caracteres | Ingresar password más larga |
| Error de cifrado | API Web Crypto no disponible | Usar navegador compatible |

```mermaid
flowchart TD
    A[Inicio] --> B{¿Tiene vault existente?}
    B -->|No| C[Ingresar master password]
    C --> D[Validar password]
    D -->|Válido| E[Generar salt aleatorio]
    E --> F[Derivar clave PBKDF2]
    F --> G[Cifrar datos AES-256-GCM]
    G --> H[Crear archivo .enc]
    H --> I[Descargar vault]
    B -->|Si| J[Subir vault existente]
    J --> K[Ingresar master password]
    K --> L[Descifrar vault]
    L -->|Éxito| M[Mostrar credenciales]
    L -->|Error| N[Password incorrecto]
```

## 2. Agregar Contraseña

**Descripción:** El usuario agrega una nueva entrada de credenciales al vault.

**Entradas:**
- Título
- Usuario
- Contraseña (generada o manual)
- URL (opcional)
- Categoría (web/app/card)
- Favorito (boolean)

**Salidas:**
- Nueva entrada en el vault
- Vault re-cifrado y actualizado

**Validaciones:**
- Título obligatorio
- Usuario obligatorio
- Contraseña obligatoria (mínimo 8 caracteres si es manual)

**Errores Posibles:**
| Error | Causa | Solución |
|---|---|---|
| Campo requerido vacío | Título o usuario faltante | Completar campos obligatorios |
| Error de cifrado | Clave derivada inválida | Re-ingresar master password |

## 3. Login WebAuthn

**Descripción:** El usuario se autentica sin contraseña usando WebAuthn.

**Entradas:**
- Email registrado
- Verificación biométrica/PIN del authenticator

**Salidas:**
- Sesión autenticada (cookie httpOnly)
- Acceso a página de contraseñas

**Validaciones:**
- Email registrado en el sistema
- Credencial WebAuthn válida
- Challenge no expirado (5 min)
- Counter incrementado correctamente

**Errores Posibles:**
| Error | Causa | Solución |
|---|---|---|
| Usuario no encontrado | Email no registrado | Registrarse primero |
| Challenge expirado | Pasaron más de 5 minutos | Reintentar login |
| Verificación fallida | Firma inválida o counter | Verificar authenticator |
| Authenticator no disponible | Dispositivo sin soporte WebAuthn | Usar navegador compatible |

## 4. Exportar Vault

**Descripción:** El usuario exporta su vault como archivo `.enc` descargable.

**Entradas:**
- Vault desbloqueado en memoria

**Salidas:**
- Archivo `.enc` binario descargado

**Validaciones:**
- Vault debe estar desbloqueado

```mermaid
flowchart TD
    A[Inicio] --> B{Vault desbloqueado?}
    B -->|No| C[Error: Vault bloqueado]
    B -->|Si| D[Obtener datos del store]
    D --> E[Cifrar con clave derivada]
    E --> F[Crear blob binario]
    F --> G[Generar URL de descarga]
    G --> H[Trigger descarga]
    H --> I[Fin]
```

\newpage

# Manejo de Errores

## Errores HTTP

| Código | Nombre | Uso en ClaveVault |
|---|---|---|
| 200 | OK | Operación exitosa |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | Sesión expirada o inválida |
| 404 | Not Found | Usuario, credencial o recurso no encontrado |
| 500 | Internal Server Error | Error interno no controlado |

## Formato de Error API

```typescript
interface ErrorResponse {
  ok: false;
  error: string;    // Mensaje descriptivo del error
  details?: object; // Detalles adicionales (opcional)
}
```

## Errores de Cifrado

| Error | Descripción | Recuperación |
|---|---|---|
| `InvalidKeyError` | Clave derivada incorrecta | Re-ingresar master password |
| `DecryptionFailed` | Datos corruptos o IV inválido | Verificar integridad del archivo .enc |
| `WebCryptoNotAvailable` | API Web Crypto no soportada | Cambiar a navegador compatible |

## Errores de WebAuthn

| Error | Descripción | Recuperación |
|---|---|---|
| `ChallengeNotFound` | Challenge expirado o no existe | Reintentar operación |
| `InvalidAttestation` | Attestation no válida | Verificar authenticator |
| `CounterError` | Counter no incrementado | Posible clonación, verificar seguridad |
| `NotAllowedError` | Usuario canceló operación | Reintentar cuando usuario esté listo |

## Logs de Errores

```typescript
// Ejemplo de logging de errores
try {
  const result = await verifyRegistration(email, credential);
} catch (error) {
  console.error('[AuthService] Error en registro:', {
    email,
    error: error.message,
    timestamp: new Date().toISOString(),
  });
  throw new Error('Error al procesar registro');
}
```

## Estrategias de Recuperación

1. **Reintentar**: Para errores transitorios de red
2. **Re-autenticar**: Para errores de sesión expirada
3. **Fallback**: Para errores de WebAuthn, ofrecer método alternativo
4. **Notificar**: Mostrar mensajes de error claros al usuario

\newpage

# Configuración del Proyecto

## Variables de Entorno

### Archivo `.env`

```env
# Base de datos
DATABASE_URL=postgresql://postgres:1234@localhost:5432/vault

# WebAuthn (Relying Party)
RP_ID=localhost
ORIGIN=http://localhost:3000

# Next.js
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

### Referencia de Variables

| Variable | Tipo | Descripción | Default | Ejemplo |
|---|---|---|---|---|
| `DATABASE_URL` | Server | URL de conexión a PostgreSQL | - | `postgresql://user:pass@host:5432/db` |
| `RP_ID` | Server | ID del Relying Party WebAuthn | `localhost` | `clavevault.com` |
| `ORIGIN` | Server | Origen permitido para WebAuthn | `http://localhost:3000` | `https://clavevault.com` |
| `NODE_ENV` | Runtime | Entorno de ejecución | `development` | `production` |
| `NEXT_PUBLIC_SITE_URL` | Client | URL pública del sitio | `http://localhost:3000` | `https://clavevault.com` |

## Configuraciones

### Next.js (`next.config.ts`)

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: false,
  },
  allowedDevOrigins: ['192.168.0.105'],
};

export default nextConfig;
```

### TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Prettier (`.prettierrc`)

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "printWidth": 80,
  "trailingComma": "es5"
}
```

### ESLint (`eslint.config.mjs`)

```javascript
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default eslintConfig;
```

## Secrets

> **IMPORTANTE:** Nunca commitear archivos `.env` al repositorio.

Archivos que deben estar en `.gitignore`:

```gitignore
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

## Docker

### Estado Actual

> **Nota:** Actualmente el proyecto NO incluye configuración Docker. Se planifica agregar en futuras versiones.

### Dockerfile (Planificado)

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

### Docker Compose (Planificado)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/vault
      - RP_ID=localhost
      - ORIGIN=http://localhost:3000
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: vault
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

\newpage

# Despliegue

## Ambientes

| Ambiente | URL | Descripción |
|---|---|---|
| **Desarrollo** | `http://localhost:3000` | Desarrollo local con hot reload |
| **Testing** | - | (Planificado) Para pruebas automatizadas |
| **Staging** | - | (Planificado) Pre-producción |
| **Producción** | - | (Planificado) Despliegue final |

## Desarrollo Local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con configuración local

# 3. Iniciar PostgreSQL (con Docker o local)
docker run -d --name vault-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=1234 \
  -e POSTGRES_DB=vault \
  -p 5432:5432 \
  postgres:16-alpine

# 4. Ejecutar migraciones
npx prisma migrate dev

# 5. Iniciar servidor de desarrollo
pnpm dev
```

## Build de Producción

```bash
# Construir
pnpm build

# Iniciar
pnpm start
```

## CI/CD

> **Nota:** Actualmente el proyecto NO incluye pipeline CI/CD. Se planifica implementar con GitHub Actions.

### Pipeline Planificado

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsc --noEmit

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

  deploy:
    needs: [lint, typecheck, build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: echo "Deploying..."
```

## Despliegue en Vercel

```bash
# Instalar CLI de Vercel
npm i -g vercel

# Desplegar
vercel

# Desplegar en producción
vercel --prod
```

\newpage

# Seguridad

## HTTPS

> **Recomendación:** Siempre usar HTTPS en producción.

En desarrollo local se permite HTTP para conveniencia. En producción, todas las conexiones deben ser cifradas con TLS 1.2+.

## CORS

```typescript
// Configuración de CORS (Next.js maneja automáticamente)
// next.config.ts
const nextConfig = {
  allowedDevOrigins: ['192.168.0.105'],
};
```

## CSP (Content Security Policy)

> **Planificado:** Implementar headers CSP estrictos.

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

## XSS (Cross-Site Scripting)

**Medidas implementadas:**
- React escapa automáticamente el JSX
- Tailwind CSS previene inyección de estilos
- Next.js sanitiza entradas en server components

**Medidas pendientes:**
- Sanitización explícita de entradas de usuario
- Headers de seguridad HTTP

## CSRF (Cross-Site Request Forgery)

**Medidas implementadas:**
- Cookies con `SameSite=Lax`
- WebAuthn incluye verificación de origin
- Patrón POST para todas las mutaciones

## SQL Injection

**Protección:** Prisma ORM parametriza automáticamente todas las queries.

```typescript
// Prisma previene SQL injection automáticamente
const user = await prisma.user.findUnique({
  where: { email: userInput }, // Parameterized query
});
```

## Rate Limiting

> **Planificado:** Implementar rate limiting en endpoints de autenticación.

```typescript
// Ejemplo planificado con next-rate-limit
import rateLimit from 'next-rate-limit';

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                   // 10 intentos
  message: 'Demasiados intentos, intenta de nuevo en 15 minutos',
});
```

## Validación de Datos

```typescript
// Validación de entrada en ActionSubmit
export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function validateVaultInputs(data: VaultInput): boolean {
  return !!(data.email && data.password && data.password.length >= 8);
}
```

## Sanitización

- **Entradas de usuario:** Sanitización automática de React
- **Archivos:** Validación de extensión `.enc` antes de procesar
- **Passwords:** No se almacenan en texto plano (cifrado AES-256-GCM)

## Prácticas de Seguridad Adicionales

| Práctica | Estado |
|---|---|
| Nunca almacenar secrets en código fuente | ✅ Implementado |
| Cookies httpOnly | ✅ Implementado |
| Cookie Secure en producción | ✅ Implementado |
| Validación de challenge WebAuthn | ✅ Implementado |
| Counter verification | ✅ Implementado |
| PBKDF2 con 200K iteraciones | ✅ Implementado |
| AES-256-GCM (no AES-CBC) | ✅ Implementado |
| Rate limiting | ❌ Planificado |
| CSP headers | ❌ Planificado |
| HSTS | ❌ Planificado |

\newpage

# Testing

## Estado Actual

> **Nota:** Actualmente el proyecto NO incluye tests automatizados. Se planifica implementar en futuras versiones.

## Framework Recomendado

| Tipo | Framework | Propósito |
|---|---|---|
| Unit Testing | Vitest | Pruebas unitarias de utilidades y servicios |
| Integration Testing | Vitest + MSW | Pruebas de integración con mocks de API |
| E2E Testing | Playwright | Pruebas end-to-end del flujo completo |
| Component Testing | React Testing Library | Pruebas de componentes React |

## Plan de Tests

### Unit Testing (Prioridad Alta)

```typescript
// __tests__/crypto/encryptData.test.ts
import { describe, it, expect } from 'vitest';
import { encryptData } from '@/lib/crypto/encryptData';
import { decryptData } from '@/lib/crypto/decryptData';

describe('Cifrado AES-256-GCM', () => {
  it('debería cifrar y descifrar datos correctamente', async () => {
    const data = 'Datos sensibles de prueba';
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const encrypted = await encryptData(data, key);
    const decrypted = await decryptData(encrypted, key);

    expect(decrypted).toBe(data);
  });
});
```

### Integration Testing (Prioridad Media)

```typescript
// __tests__/services/AuthService.test.ts
import { describe, it, expect } from 'vitest';
import { generateRegistrationOptions } from '@/server/services/AuthService';

describe('AuthService', () => {
  it('debería generar opciones de registro válidas', async () => {
    const options = await generateRegistrationOptions('test@example.com');

    expect(options.rp.name).toBe('ClaveVault');
    expect(options.challenge).toBeDefined();
    expect(options.userVerification).toBe('required');
  });
});
```

### E2E Testing (Prioridad Baja)

```typescript
// e2e/offline-flow.spec.ts
import { test, expect } from '@playwright/test';

test('flujo completo offline', async ({ page }) => {
  await page.goto('/offline');

  // Subir vault
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('test/fixtures/test.vault');

  // Ingresar password
  await page.fill('input[type="password"]', 'testpassword123');
  await page.click('button[type="submit"]');

  // Verificar que se muestra el gestor
  await expect(page.locator('text=Gestor de Contraseñas')).toBeVisible();
});
```

## Cobertura

> **Meta:** Alcanzar 80% de cobertura en unit testing y 60% en integration testing.

```bash
# Ejecutar tests con cobertura
vitest run --coverage

# Reporte de cobertura
npx vitest --coverage --reporter=text
```

\newpage

# Logging y Monitoreo

## Logs

### Niveles de Log

| Nivel | Uso | Ejemplo |
|---|---|---|
| `debug` | Información detallada para desarrollo | Datos de request/response |
| `info` | Eventos normales del sistema | Login exitoso, registro nuevo |
| `warn` | Advertencias no críticas | Challenge próximo a expirar |
| `error` | Errores que requieren atención | Fallo de autenticación, error de DB |

### Formato de Log

```typescript
// Formato recomendado
{
  "timestamp": "2026-08-02T12:00:00.000Z",
  "level": "info",
  "service": "AuthService",
  "message": "Registro exitoso",
  "metadata": {
    "email": "usuario@ejemplo.com",
    "credentialId": "abc123",
    "ip": "192.168.1.1"
  }
}
```

### Implementación

```typescript
// lib/logger.ts (planificado)
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  log(level: LogLevel, service: string, message: string, metadata?: object) {
    if (level >= this.level) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: LogLevel[level],
        service,
        message,
        metadata,
      }));
    }
  }

  info(service: string, message: string, metadata?: object) {
    this.log(LogLevel.INFO, service, message, metadata);
  }

  error(service: string, message: string, metadata?: object) {
    this.log(LogLevel.ERROR, service, message, metadata);
  }
}

export const logger = new Logger();
```

## Auditoría

### Tabla de Auditoría

| Campo | Descripción |
|---|---|
| `userId` | Usuario que realizó la acción |
| `action` | Tipo de acción realizada |
| `ipAddress` | Dirección IP del cliente |
| `userAgent` | Navegador del cliente |
| `createdAt` | Timestamp de la acción |

### Acciones Auditadas

| Acción | Descripción |
|---|---|
| `LOGIN` | Inicio de sesión exitoso |
| `LOGOUT` | Cierre de sesión |
| `REGISTER` | Registro de nueva credencial WebAuthn |
| `VAULT_UNLOCK` | Desbloqueo del vault offline |
| `PASSWORD_ADD` | Agregado de nueva contraseña |
| `PASSWORD_EDIT` | Edición de contraseña existente |
| `PASSWORD_DELETE` | Eliminación de contraseña |
| `VAULT_EXPORT` | Exportación del vault |

## Métricas (Planificado)

| Métrica | Descripción |
|---|---|
| Login attempts | Intentos de login por minuto |
| Failed logins | Intentos fallidos |
| Active sessions | Sesiones activas |
| Vault operations | Operaciones sobre vaults |
| API response time | Tiempo de respuesta de la API |
| Error rate | Tasa de errores |

## Alertas (Planificado)

| Alerta | Condición | Acción |
|---|---|---|
| Login failures spike | >10 intentos fallidos en 5 min | Notificar al admin |
| Unusual activity | Login desde IP nueva | Notificar al usuario |
| DB connection issues | Conexión fallida | Reiniciar pool |

\newpage

# Arquitectura de Decisiones (ADR)

## ADR-001: Arquitectura Local-First

### Título
Implementar arquitectura híbrida local-first + servidor

### Problema
Necesitamos un gestor de contraseñas que funcione sin conexión a internet pero que también soporte sincronización multi-dispositivo en el futuro.

### Opciones

1. **Solo local (sin servidor)**: Datos solo en el dispositivo del usuario
   - Pros: Máxima privacidad, sin dependencia de infraestructura
   - Contras: Sin sincronización, pérdida de datos si se pierde el dispositivo

2. **Solo servidor (cloud-first)**: Todos los datos en el servidor
   - Pros: Sincronización automática, backup centralizado
   - Contras: Requiere confianza en el servidor, punto único de fallo

3. **Híbrido local-first + servidor**: Dos modos de operación
   - Pros: Flexibilidad, funciona offline, preparado para sincronización
   - Contras: Mayor complejidad de desarrollo

### Decisión
Implementar arquitectura híbrida con dos modos independientes: offline (solo local) y online (con servidor WebAuthn).

### Consecuencias
- **Positivas**: Flexibilidad para diferentes casos de uso, preparado para futuro
- **Negativas**: Mayor complejidad, dos flujos de autenticación distintos
- **Neutrales**: Necesidad de mantener dos modos actualizados

---

## ADR-002: WebAuthn como Autenticación Online

### Título
Usar WebAuthn/FIDO2 en lugar de contraseñas para autenticación online

### Problema
Necesitamos una forma segura de autenticar usuarios en el modo online sin requerir contraseñas adicionales.

### Opciones

1. **Contraseñas tradicionales + bcrypt**: Sistema convencional
   - Pros: Familiar para usuarios, amplio soporte
   - Contras: Vulnerable a phishing, credential stuffing

2. **WebAuthn/FIDO2**: Autenticación sin contraseña
   - Pros: Seguro contra phishing, no hay contraseñas que robar
   - Contras: Requiere hardware compatible, UX puede ser confusa

3. **Magic Links**: Autenticación por email
   - Pros: Simple de implementar, sin hardware especial
   - Contras: Lento, depende de email, vulnerable a interceptación

### Decisión
Implementar WebAuthn/FIDO2 como mecanismo de autenticación principal.

### Consecuencias
- **Positivas**: Seguridad significantly superior, sin contraseñas que comprometer
- **Negativas**: Requiere navegador compatible, algunos usuarios pueden tener dificultades
- **Neutrales**: Necesidad de documentar proceso de registro

---

## ADR-003: AES-256-GCM para Cifrado

### Título
Usar AES-256-GCM con PBKDF2 para cifrado del vault

### Problema
Necesitamos un algoritmo de cifrado seguro y eficiente para proteger las credenciales del vault offline.

### Opciones

1. **AES-256-GCM**: Cifrado simétrico autenticado
   - Pros: Rápido, autenticado, ampliamente soportado por Web Crypto API
   - Contras: Requiere gestión de IV

2. **AES-256-CBC + HMAC**: Cifrado + MAC separado
   - Pros: bien understood
   - Contras: Más lento, susceptible a padding oracle attacks

3. **ChaCha20-Poly1305**: Cifrado alternativo
   - Pros: Rápido en software
   - Contras: No soportado por Web Crypto API

### Decisión
Usar AES-256-GCM con derivación de clave PBKDF2 (200K iteraciones, SHA-256).

### Consecuencias
- **Positivas**: Seguridad comprobada, soporte nativo en navegadores
- **Negativas**: Gestión correcta de IV es crítica
- **Neutrales**: Estándar de la industria

---

## ADR-004: Next.js App Router

### Título
Usar Next.js 16 con App Router en lugar de Pages Router

### Problema
Necesitamos un framework full-stack que soporte React Server Components, layouts anidados, y API routes.

### Opciones

1. **Next.js Pages Router**: Router tradicional
   - Pros: Estable, bien documentado, amplia comunidad
   - Contras: Sin RSC, menos flexibilidad

2. **Next.js App Router**: Router moderno
   - Pros: RSC, layouts anidados, server actions, streaming
   - Contras: Nuevo, menos documentado, learning curve

3. **Remix**: Framework alternativo
   - Pros: Buen DX, loader/action pattern
   - Contras: Menos features, menor ecosistema

### Decisión
Usar Next.js 16 con App Router.

### Consecuencias
- **Positivas**: Acceso a RSC, mejor performance, features modernas
- **Negativas**: Learning curve, posibles breaking changes
- **Neutrales**: Comunidad activa, buena documentación oficial

\newpage

# Convenciones de Desarrollo

## Naming

### Archivos
```
Componentes:      PascalCase.tsx    (WebAuthnLogin.tsx)
Utilidades:       camelCase.ts      (encryptData.ts)
Configuración:    camelCase.config.ts (webauthn.config.ts)
Estilos:          kebab-case.css    (globals.css)
```

### Código
```typescript
// Variables y funciones: camelCase
const credentialId = 'abc123';
function generateOptions() { }

// Interfaces y tipos: PascalCase
interface PasswordEntry { }
type Category = 'web' | 'app' | 'card';

// Constantes: SCREAMING_SNAKE_CASE
const RP_ID = 'localhost';
const MAX_ITERATIONS = 200000;

// Clases: PascalCase
class AuthService { }
class Challenge { }
```

## Commits

Formato: Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Tipos
| Tipo | Descripción |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `style` | Formato (no afecta lógica) |
| `refactor` | Refactorización |
| `test` | Tests |
| `chore` | Tareas de mantenimiento |
| `perf` | Mejora de performance |

### Ejemplos
```bash
feat(auth): implement WebAuthn registration flow
fix(crypto): correct PBKDF2 iteration count
docs(readme): update installation instructions
refactor(services): extract session logic to SessionService
```

## Branches

### Nomenclatura
```
feature/<nombre-funcionalidad>
bugfix/<descripcion-bug>
hotfix/<descripcion-critica>
release/<version>
```

### Ejemplos
```bash
feature/webauthn-login
feature/password-generator
bugfix/challenge-expired
hotfix/session-leak
release/v1.0.0
```

## Pull Requests

### Título
```
feat(auth): implement WebAuthn login
```

### Descripción
```markdown
## Descripción
Implementa el flujo de login usando WebAuthn/FIDO2.

## Cambios
- Agregue endpoint POST /api/auth/login/options
- Agregue endpoint POST /api/auth/login/verify
- Implemente SessionService para gestionar sesiones
- Agregue cookie httpOnly con session_token

## Testing
- [x] Unit tests para AuthService
- [x] Integration tests para endpoints
- [ ] E2E tests pendientes

## Notas
- Requiere PostgreSQL corriendo
- Testing con YubiKey o Windows Hello
```

## Code Review

### Checklist
- [ ] Código sigue las convenciones del proyecto
- [ ] No hay secrets expuestos
- [ ] Tipos TypeScript correctos
- [ ] Manejo de errores apropiado
- [ ] No hay console.logs innecesarios
- [ ] Performance aceptable
- [ ] Seguridad verificada

## Formato del Código

### Herramientas
- **Prettier**: Formato automático
- **ESLint**: Detección de problemas

### Configuración
```bash
# Formatear todo el proyecto
pnpm prettier --write .

# Verificar lint
pnpm lint

# Auto-fix
pnpm lint --fix
```

\newpage

# Guía para Nuevos Desarrolladores

## Instalación

### Prerrequisitos
- Node.js 20+
- pnpm (recomendado) o npm
- PostgreSQL 16+
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/usuario/G--ClaveVault.git
cd G--ClaveVault

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración de PostgreSQL

# 4. Iniciar PostgreSQL (si no tienes uno local)
docker run -d --name vault-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=1234 \
  -e POSTGRES_DB=vault \
  -p 5432:5432 \
  postgres:16-alpine

# 5. Ejecutar migraciones
npx prisma migrate dev

# 6. Iniciar servidor de desarrollo
pnpm dev
```

## Ejecutar

```bash
# Desarrollo
pnpm dev

# Build de producción
pnpm build
pnpm start

# Lint
pnpm lint
```

## Crear una Rama

```bash
# Rama de feature
git checkout -b feature/nombre-funcionalidad

# Rama de bugfix
git checkout -b bugfix/descripcion-bug
```

## Agregar Funcionalidades

### 1. Crear componente
```typescript
// components/mi-modulo/MiComponente.tsx
export function MiComponente({ prop1, prop2 }: MiComponenteProps) {
  return (
    <div>
      {/* Contenido */}
    </div>
  );
}
```

### 2. Crear servicio (si aplica)
```typescript
// server/services/MiService.ts
export async function miFuncion() {
  // Lógica de negocio
}
```

### 3. Crear endpoint (si aplica)
```typescript
// app/api/mi-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Procesar
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Error' }, { status: 500 });
  }
}
```

### 4. Agregar tipos
```typescript
// types/index.ts
export interface MiTipo {
  campo: string;
}
```

## Crear Migraciones

```bash
# 1. Modificar schema.prisma

# 2. Crear migración
npx prisma migrate dev --name mi-migracion

# 3. Verificar migración generada
# prisma/migrations/YYYYMMDDHHMMSS_mi-migracion/migration.sql

# 4. Aplicar en desarrollo
npx prisma migrate dev
```

## Desplegar

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g verencial

# Desplegar
vercel

# Desplegar en producción
vercel --prod
```

### Docker (Planificado)
```bash
# Construir imagen
docker build -t clavevault .

# Ejecutar
docker run -p 3000:3000 -e DATABASE_URL=... clavevault
```

\newpage

# FAQ

## Preguntas Generales

### ¿Qué es ClaveVault?
ClaveVault es un gestor de contraseñas local-first que almacena, organiza y protege credenciales con cifrado del lado del cliente. Ofrece dos modos: offline (sin servidor) y online (con autenticación WebAuthn).

### ¿Es seguro usar ClaveVault?
Sí. ClaveVault usa cifrado AES-256-GCM con derivación de claves PBKDF2 (200,000 iteraciones). Los datos nunca se almacenan en texto plano. En modo offline, los datos nunca salen de tu navegador.

### ¿Necesito internet para usar ClaveVault?
En modo offline, no. Las credenciales se almacenan localmente en archivos `.enc` cifrados. Solo necesitas internet para el modo online (WebAuthn).

### ¿Qué navegadores son compatibles?
Cualquier navegador moderno que soporte Web Crypto API y WebAuthn:
- Chrome 67+
- Firefox 60+
- Safari 13+
- Edge 79+

## Preguntas Técnicas

### ¿Por qué WebAuthn en lugar de contraseñas?
WebAuthn es significativamente más seguro que las contraseñas tradicionales:
- No hay contraseñas que robar o recordar
- Inmune a phishing
- Inmune a credential stuffing
- Usa criptografía de clave pública

### ¿Qué pasa si pierdo mi master password?
En modo offline, si pierdes tu master password, **no hay forma de recuperar tus datos**. El cifrado AES-256-GCM es computacionalmente inviable de romper. Asegúrate de guardar tu master password en un lugar seguro.

### ¿Cómo funciona el cifrado?
1. Derivación de clave: PBKDF2 (password + salt aleatorio) → AES-256-GCM key
2. Cifrado: AES-256-GCM (datos + IV aleatorio) → datos cifrados
3. Almacenamiento: [salt(16 bytes) + iv(12 bytes) + ciphertext]

### ¿Puedo importar contraseñas de otros gestores?
Actualmente no. Estamos planificando soporte para importación desde:
- Google Chrome
- LastPass
- 1Password
- Bitwarden
- KeePass

### ¿Por qué el challenge de WebAuthn no se encuentra?
Los challenges se almacenan en un `Map` en memoria del servidor. Si el servidor se reinicia (en desarrollo), los challenges se pierden. En producción, esto no debería ocurrir. Solución: usar `pnpm build && pnpm start` en lugar de `pnpm dev`.

## Preguntas de Desarrollo

### ¿Cómo agrego un nuevo tipo de categoría?
1. Agregar el tipo en `types/index.ts`
2. Actualizar el componente de selección de categoría
3. Agregar el botón de navegación en `const/buttonsNavegations.js`

### ¿Cómo agrego un nuevo endpoint API?
1. Crear archivo en `app/api/<ruta>/route.ts`
2. Implementar los métodos HTTP (GET, POST, etc.)
3. Seguir el formato de respuesta `{ ok: boolean, ... }`

### ¿Cómo ejecuto los tests?
Actualmente no hay tests configurados. Estamos planificando implementar Vitest para unit testing y Playwright para E2E.

\newpage

# Roadmap

## Fase 1 (Completada) ✅

- [x] Arquitectura base del proyecto
- [x] Modo offline con cifrado AES-256-GCM
- [x] Generador de contraseñas configurable
- [x] UI con tema vault (claro/oscuro)
- [x] Categorías y favoritos
- [x] Búsqueda y filtrado
- [x] Exportación de vault
- [x] Autenticación WebAuthn (registro + login)
- [x] Gestión de sesiones
- [x] Base de datos PostgreSQL con Prisma

## Fase 2 (En Progreso) 🔄

- [ ] Tests automatizados (Vitest + Playwright)
- [ ] Rate limiting en endpoints de auth
- [ ] Headers de seguridad HTTP (CSP, HSTS)
- [ ] Docker y Docker Compose
- [ ] CI/CD con GitHub Actions
- [ ] Auditoría de seguridad de contraseñas
- [ ] Importación desde otros gestores

## Fase 3 (Planificada) 📋

- [ ] Sincronización multi-dispositivo
- [ ] Compartir contraseñas de forma segura
- [ ] Autenticación de dos factores (2FA) adicional
- [ ] Aplicación móvil nativa (React Native)
- [ ] Panel de administración
- [ ] Soporte para múltiples vaults

## Fase 4 (Futuro) 🔮

- [ ] End-to-end encryption para sincronización
- [ ] Zero-knowledge architecture completa
- [ ] Soporte hardware key (YubiKey)
- [ ] Integración con navegadores (extension)
- [ ] API pública para integraciones
- [ ] Auditoría de seguridad externa

\newpage

# Glosario

| Término | Definición |
|---|---|
| **AES-256-GCM** | Advanced Encryption Standard con 256 bits de clave en modo Galois/Counter Mode. Algoritmo de cifrado simétrico autenticado. |
| **AuthGuard** | Componente React que protege el acceso a funcionalidades requiriendo autenticación. |
| **Attestation** | Declaración criptográfica que prueba que una credencial fue creada por un authenticator legítimo. |
| **Authenticator** | Dispositivo o software que genera y almacena claves criptográficas (YubiKey, Touch ID, Windows Hello). |
| **Barrel Export** | Patrón de exportación centralizada usando un archivo `index.ts`. |
| **Challenge** | Valor aleatorio generado por el servidor para prevenir ataques de replay. |
| **CIPHER** | Algoritmo de cifrado. En ClaveVault se usa AES-256-GCM. |
| **Client-Side Encryption** | Cifrado de datos del lado del cliente antes de enviarlos al servidor. |
| **Counter** | Contador en WebAuthn que se incrementa con cada uso para detectar clonación de credenciales. |
| **CUID** | Collision-resistant Unique Identifier. Tipo de ID generado por Prisma. |
| **E2E** | End-to-End. Pruebas que validan flujos completos del usuario. |
| **FIDO2** | Fast Identity Online 2. Estándar de autenticación sin contraseña. |
| **httpOnly** | Atributo de cookie que impide acceso desde JavaScript (previene XSS). |
| **KDF** | Key Derivation Function. Función para derivar claves criptográficas (PBKDF2 en ClaveVault). |
| **Local-First** | Arquitectura donde los datos se almacenan localmente con opción de sincronización. |
| **PBKDF2** | Password-Based Key Derivation Function 2. Algoritmo de derivación de claves. |
| **RP** | Relying Party. El servidor que verifica la identidad del usuario (ClaveVault). |
| **RSC** | React Server Components. Componentes de React que se renderizan en el servidor. |
| **Salt** | Valor aleatorio agregado a la contraseña antes de derivar la clave (previene rainbow tables). |
| **SameSite** | Atributo de cookie que controla envío en requests cross-site. |
| **Session** | Estado del usuario autenticado almacenado temporalmente en el servidor. |
| **Vault** | Almacén cifrado de credenciales del usuario. |
| **WebAuthn** | Web Authentication API. Estándar W3C para autenticación sin contraseña. |
| **XSS** | Cross-Site Scripting. Ataque de inyección de scripts maliciosos. |
| **CSRF** | Cross-Site Request Forgery. Ataque que fuerza acciones no autorizadas. |
| **Zero-Knowledge** | Arquitectura donde el servidor nunca tiene acceso a los datos descifrados. |

\newpage

# Anexos

## Anexo A: Diagramas Adicionales

### Diagrama de Componentes React

```mermaid
graph TB
    subgraph "Layout"
        L[AppProviders] --> T[ThemeProvider]
        L --> N[Toaster]
    end

    subgraph "Modo Offline"
        OP[OfflineLayout] --> LP[LocalProvider]
        LP --> AG[AuthGuard]
        AG --> G[Gestor]
        G --> HC[PasswordCard]
        G --> AP[AddPassword]
        G --> EP[EditPassword]
        G --> HG[Header_Gestor]
    end

    subgraph "Modo Online"
        OL[OnlineLayout] --> WA[WebAuthn]
        WA --> WLR[WebAuthnLogin]
        WA --> WRE[WebAuthnRegister]
    end
```

### Diagrama de Estados del Vault

```mermaid
stateDiagram-v2
    [*] --> Bloqueado
    Bloqueado --> Desbloqueando: Ingresar password
    Desbloqueando --> Desbloqueado: Éxito
    Desbloqueando --> Bloqueado: Error
    Desbloqueado --> Bloqueado: Logout / Timeout
    Desbloqueado --> Exportando: Export vault
    Exportando --> Desbloqueado: Completado
```

## Anexo B: Ejemplos de Código

### Ejemplo: Generador de Contraseñas

```typescript
// lib/utils/Gestor/generatePassword.tsx
interface PasswordConfig {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export function generatePassword(config: PasswordConfig): string {
  const chars = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  };

  let charset = '';
  if (config.uppercase) charset += chars.uppercase;
  if (config.lowercase) charset += chars.lowercase;
  if (config.numbers) charset += chars.numbers;
  if (config.symbols) charset += chars.symbols;

  if (charset.length === 0) charset = chars.lowercase;

  let password = '';
  const array = new Uint32Array(config.length);
  crypto.getRandomValues(array);

  for (let i = 0; i < config.length; i++) {
    password += charset[array[i] % charset.length];
  }

  return password;
}
```

### Ejemplo: Cifrado de Datos

```typescript
// lib/crypto/encryptData.ts
export async function encryptData(
  data: string,
  key: CryptoKey
): Promise<{ iv: Uint8Array; ciphertext: ArrayBuffer }> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );

  return { iv, ciphertext };
}
```

### Ejemplo: Descifrado de Datos

```typescript
// lib/crypto/decryptData.ts
export async function decryptData(
  ciphertext: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
```

## Anexo C: Referencias

### Documentación Oficial
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [WebAuthn Spec](https://www.w3.org/TR/webauthn-3/)
- [SimpleWebAuthn Docs](https://simplewebauthn.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Estándares de Seguridad
- [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html) - Digital Identity Guidelines
- [FIDO2 Specifications](https://fidoalliance.org/fido2/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

### Herramientas
- [Vercel](https://vercel.com) - Deploy de Next.js
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## Anexo D: Enlaces del Proyecto

| Recurso | URL |
|---|---|
| Repositorio | `https://github.com/usuario/G--ClaveVault` |
| Documentación | `https://clavevault.com/docs` |
| Issues | `https://github.com/usuario/G--ClaveVault/issues` |
| Changelog | `https://github.com/usuario/G--ClaveVault/blob/main/CHANGELOG.md` |

## Anexo E: Scripts Disponibles

| Script | Comando | Descripción |
|---|---|---|
| Desarrollo | `pnpm dev` | Inicia servidor de desarrollo |
| Build | `pnpm build` | Construye para producción |
| Start | `pnpm start` | Inicia servidor de producción |
| Lint | `pnpm lint` | Verifica código con ESLint |
| Prisma Generate | `npx prisma generate` | Genera cliente Prisma |
| Prisma Migrate | `npx prisma migrate dev` | Ejecuta migraciones |
| Prisma Studio | `npx prisma studio` | Abre Prisma Studio |

---

<div style="text-align: center; margin-top: 50px;">

**Fin del Documento**

ClaveVault v1.0.0 - Documentación Técnica

© 2026 Equipo de Desarrollo ClaveVault. Licencia MIT.

</div>
