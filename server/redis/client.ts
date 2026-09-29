import { Redis } from '@upstash/redis';

/**
 * Interfaz mínima de KV que necesitan los servicios de seguridad.
 *
 * Permite usar Upstash (HTTP, apto para serverless/Vercel) en producción
 * y un almacén en memoria en local para no obligar a tener Redis para
 * `npm run dev`.
 */
export interface Kv {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  /** Devuelve el número de claves borradas (para consumos únicos atómicos). */
  del(key: string): Promise<number>;
  incr(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
}

type MemoryEntry = { value: string; expiresAt: number | null };

class MemoryKv implements Kv {
  private store = new Map<string, MemoryEntry>();

  private live(key: string): MemoryEntry | null {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry;
  }

  get(key: string): Promise<string | null> {
    return Promise.resolve(this.live(key)?.value ?? null);
  }

  set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
    return Promise.resolve();
  }

  del(key: string): Promise<number> {
    return Promise.resolve(this.store.delete(key) ? 1 : 0);
  }

  incr(key: string): Promise<number> {
    const entry = this.live(key);
    const next = (entry ? Number.parseInt(entry.value, 10) || 0 : 0) + 1;
    this.store.set(key, {
      value: String(next),
      expiresAt: entry?.expiresAt ?? null,
    });
    return Promise.resolve(next);
  }

  expire(key: string, ttlSeconds: number): Promise<number> {
    const entry = this.live(key);
    if (!entry) {
      return Promise.resolve(0);
    }
    entry.expiresAt = Date.now() + ttlSeconds * 1000;
    return Promise.resolve(1);
  }

  ttl(key: string): Promise<number> {
    const entry = this.live(key);
    if (!entry) {
      return Promise.resolve(-2);
    }
    if (entry.expiresAt === null) {
      return Promise.resolve(-1);
    }
    return Promise.resolve(
      Math.max(1, Math.ceil((entry.expiresAt - Date.now()) / 1000))
    );
  }
}

class UpstashKv implements Kv {
  constructor(private readonly redis: Redis) {}

  async get(key: string): Promise<string | null> {
    const value = await this.redis.get<unknown>(key);
    if (value === null || value === undefined) {
      return null;
    }
    return typeof value === 'string' ? value : String(value);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redis.set(key, value, { ex: ttlSeconds });
      return;
    }
    await this.redis.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<number> {
    return this.redis.expire(key, ttlSeconds);
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }
}

/**
 * El cliente se guarda en `globalThis` y no a nivel de módulo: en
 * desarrollo Turbopack recarga los módulos y middleware y Route Handlers
 * pueden vivir en contextos distintos. Sin esto, una sesión creada en una
 * ruta no se vería desde `proxy.ts` y los retos se "olvidarían" al
 * recargar.
 */
interface KvHolder {
  __claveVaultKv?: Kv;
  __claveVaultKvFallback?: boolean;
}

function holder(): KvHolder {
  return globalThis as unknown as KvHolder;
}

/**
 * Devuelve el cliente KV.
 *
 * - Con `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` → Upstash.
 * - Sin claves en local → almacén en memoria (suficiente para dev).
 * - Sin claves en producción → error explícito: no se puede degradar en
 *   silencio porque los retos WebAuthn y las sesiones dejarían de durar.
 */
export function getKv(): Kv {
  const scope = holder();
  if (scope.__claveVaultKv) {
    return scope.__claveVaultKv;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    scope.__claveVaultKv = new UpstashKv(
      new Redis({
        url,
        token,
        automaticDeserialization: false,
        enableAutoPipelining: true,
      })
    );
    return scope.__claveVaultKv;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[redis] Faltan UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN en el entorno. ' +
        'Añádelas en .env (y en el panel de Vercel) para que funcionen ' +
        'retos WebAuthn, sesiones y rate limiting.'
    );
  }

  if (!scope.__claveVaultKvFallback) {
    scope.__claveVaultKvFallback = true;
    console.warn(
      '[redis] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN no definidas: ' +
        'usando almacén en memoria (solo válido en local).'
    );
  }

  scope.__claveVaultKv = new MemoryKv();
  return scope.__claveVaultKv;
}
