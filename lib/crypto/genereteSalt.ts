export const generateSalt = async () => {
    const salt = await crypto.getRandomValues(new Uint8Array(16))
    return salt
}