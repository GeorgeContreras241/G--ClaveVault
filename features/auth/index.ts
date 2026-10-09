// Tipos feature de authentication
export interface WebAuthnLoginProps {
  email: string;
  validateForm: () => boolean;
}

export interface WebAuthnRegisterProps {
  email: string;
  validateForm: () => boolean;
}

export type AuthFormErrors = {
  email?: string;
};
