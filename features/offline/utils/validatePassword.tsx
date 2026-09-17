export const validatePassword = (password: string): Result => {
    if (password.length < 8) {
        return {
            success: false,
            error: "Minimo 8 caracteres"
        };
    }

    return {
        success: true,
    }
};

type Result = {
    success: boolean
    error?: string
}
