import { apiFetch } from '@/commons/lib/apiFetch';
import { bytesToBase64 } from '@/commons/lib/encoding/base64';
import type { VaultSummary } from '@/types';

/** Bóveda con su material cifrado, tal y como la devuelve el servidor. */
export type VaultDetail = VaultSummary & {
  salt: string;
  iv: string;
  encryptedData: string;
};

type ApiBody = Record<string, unknown> | null;

export type VaultApiFailure = {
  ok: false;
  error: string;
  status: number;
};

export type CreateVaultInput = {
  name: string;
  salt: Uint8Array;
  iv: Uint8Array;
  encryptedData: Uint8Array;
};

export type UpdateVaultInput = {
  salt: Uint8Array;
  iv: Uint8Array;
  encryptedData: Uint8Array;
  version: number;
};

async function readBody(response: Response): Promise<ApiBody> {
  return response.json().catch(() => null) as Promise<ApiBody>;
}

function messageOf(body: ApiBody, fallback: string, status: number): string {
  return typeof body?.error === 'string' && body.error
    ? body.error
    : `${fallback} (${status})`;
}

function networkFailure(): VaultApiFailure {
  return {
    ok: false,
    error: 'No se pudo conectar con el servidor',
    status: 0,
  };
}

/** Lista los metadatos de las bóvedas del usuario autenticado. */
export async function listVaults(): Promise<
  { ok: true; vaults: VaultSummary[] } | VaultApiFailure
> {
  try {
    const response = await apiFetch('/api/vaults');
    const body = await readBody(response);

    if (!response.ok || !body?.ok) {
      return {
        ok: false,
        error: messageOf(
          body,
          'No se pudieron cargar las bóvedas',
          response.status
        ),
        status: response.status,
      };
    }

    return {
      ok: true,
      vaults: Array.isArray(body.vaults) ? (body.vaults as VaultSummary[]) : [],
    };
  } catch {
    return networkFailure();
  }
}

/** Obtiene el material cifrado de una bóveda concreta. */
export async function getVault(
  id: string
): Promise<{ ok: true; vault: VaultDetail } | VaultApiFailure> {
  try {
    const response = await apiFetch(`/api/vaults/${encodeURIComponent(id)}`);
    const body = await readBody(response);

    if (!response.ok || !body?.ok || !body.vault) {
      return {
        ok: false,
        error: messageOf(body, 'No se pudo abrir la bóveda', response.status),
        status: response.status,
      };
    }

    return { ok: true, vault: body.vault as VaultDetail };
  } catch {
    return networkFailure();
  }
}

/** Crea una bóveda ya cifrada en el cliente. */
export async function createVault(
  input: CreateVaultInput
): Promise<{ ok: true; vault: VaultSummary } | VaultApiFailure> {
  try {
    const response = await apiFetch('/api/vaults', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        salt: bytesToBase64(input.salt),
        iv: bytesToBase64(input.iv),
        encryptedData: bytesToBase64(input.encryptedData),
      }),
    });
    const body = await readBody(response);

    if (!response.ok || !body?.ok || !body.vault) {
      return {
        ok: false,
        error: messageOf(body, 'No se pudo crear la bóveda', response.status),
        status: response.status,
      };
    }

    return { ok: true, vault: body.vault as VaultSummary };
  } catch {
    return networkFailure();
  }
}

/** Reemplaza el blob cifrado usando la versión leída como control optimista. */
export async function updateVault(
  id: string,
  input: UpdateVaultInput
): Promise<
  { ok: true; version: number } | (VaultApiFailure & { conflict: boolean })
> {
  try {
    const response = await apiFetch(`/api/vaults/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({
        salt: bytesToBase64(input.salt),
        iv: bytesToBase64(input.iv),
        encryptedData: bytesToBase64(input.encryptedData),
        version: input.version,
      }),
    });
    const body = await readBody(response);

    if (!response.ok || !body?.ok) {
      return {
        ok: false,
        error: messageOf(body, 'No se pudo guardar la bóveda', response.status),
        status: response.status,
        conflict: response.status === 409,
      };
    }

    return { ok: true, version: Number(body.version) };
  } catch {
    return { ...networkFailure(), conflict: false };
  }
}

/** Elimina una bóveda y todo su contenido cifrado. */
export async function deleteVault(
  id: string
): Promise<{ ok: true } | VaultApiFailure> {
  try {
    const response = await apiFetch(`/api/vaults/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const body = await readBody(response);

    if (!response.ok || !body?.ok) {
      return {
        ok: false,
        error: messageOf(
          body,
          'No se pudo eliminar la bóveda',
          response.status
        ),
        status: response.status,
      };
    }

    return { ok: true };
  } catch {
    return networkFailure();
  }
}
