import { VaultRepository } from './VaultRepository';

/**
 * Casos de uso de la bóveda cifrada.
 *
 * No toca la base de datos: delega en {@link VaultRepository}. El cifrado
 * y el descifrado ocurren en el cliente, así que aquí solo se orquesta la
 * lectura y la escritura del material cifrado.
 */
export class VaultService {
  static async findByUserId(userId: string) {
    return VaultRepository.findByUserId(userId);
  }

  static async upsert(
    userId: string,
    salt: Uint8Array,
    iv: Uint8Array,
    encryptedData: Uint8Array,
    version: number = 1
  ) {
    return VaultRepository.upsert(userId, salt, iv, encryptedData, version);
  }
}
