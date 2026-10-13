export const buildVaultFile = (
  salt: Uint8Array,
  iv: Uint8Array,
  data: Uint8Array
) => {
  const buffer: Uint8Array = new Uint8Array(
    salt.length + iv.length + data.length
  );

  buffer.set(salt, 0);
  buffer.set(iv, 16);
  buffer.set(data, 28);

  return buffer;
};
