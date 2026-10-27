import { Prisma } from '@/commons/lib/generated/prisma/client';
import { MAX_VAULTS_PER_USER } from '@/commons/constants/vault';
import { VaultRepository } from './VaultRepository';
import { VaultError } from './VaultError';

export { MAX_VAULTS_PER_USER };

type VaultInput = {
  name: string;
  salt: Uint8Array;
  iv: Uint8Array;
  encryptedData: Uint8Array;
};

type VaultUpdateInput = {
  salt: Uint8Array;
  iv: Uint8Array;
  encryptedData: Uint8Array;
  version: number;
};

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

/**
 * Casos de uso de las bóvedas cifradas.
 *
 * El cifrado y el descifrado ocurren en el cliente. Aquí solo se orquesta
 * la lectura/escritura del material cifrado y se comprueba la propiedad.
 */
export class VaultService {
  static async list(userId: string) {
    return VaultRepository.listByUserId(userId);
  }

  static async get(userId: string, vaultId: string) {
    const vault = await VaultRepository.findByIdAndUserId(vaultId, userId);
    if (!vault) {
      throw new VaultError('Bóveda no encontrada', 404);
    }
    return vault;
  }

  static async create(userId: string, input: VaultInput) {
    const name = input.name.trim();

    const count = await VaultRepository.countByUserId(userId);
    if (count >= MAX_VAULTS_PER_USER) {
      throw new VaultError(
        `Has alcanzado el límite de ${MAX_VAULTS_PER_USER} bóvedas`,
        409
      );
    }

    const duplicated = await VaultRepository.existsByUserIdAndName(
      userId,
      name
    );
    if (duplicated) {
      throw new VaultError('Ya existe una bóveda con ese nombre', 409);
    }

    try {
      return await VaultRepository.create(
        userId,
        name,
        input.salt,
        input.iv,
        input.encryptedData
      );
    } catch (error) {
      // La comprobación anterior puede perder la carrera con otra petición.
      if (isUniqueViolation(error)) {
        throw new VaultError('Ya existe una bóveda con ese nombre', 409);
      }
      throw error;
    }
  }

  static async update(
    userId: string,
    vaultId: string,
    input: VaultUpdateInput
  ) {
    const result = await VaultRepository.updateWithVersion(
      vaultId,
      userId,
      input.version,
      input.salt,
      input.iv,
      input.encryptedData
    );

    if (result.count === 1) {
      return { version: input.version + 1 };
    }

    // `0` filas puede ser "no existe / no es tuya" o "la versión cambió".
    // Distinguirlo permite responder 404 o 409 sin filtrar datos.
    const existing = await VaultRepository.findByIdAndUserId(vaultId, userId);
    if (!existing) {
      throw new VaultError('Bóveda no encontrada', 404);
    }

    throw new VaultError(
      'La bóveda cambió en otra sesión. Vuelve a desbloquearla para continuar.',
      409
    );
  }

  static async remove(userId: string, vaultId: string) {
    const result = await VaultRepository.deleteByIdAndUserId(vaultId, userId);
    if (result.count === 0) {
      throw new VaultError('Bóveda no encontrada', 404);
    }
  }
}
