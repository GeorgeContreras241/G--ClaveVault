'use client';
import {
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sileo } from 'sileo';
import { Button } from '@/commons/components/ui/button';
import { apiFetch } from '@/commons/lib/apiFetch';
import {
  describeWebAuthnError,
  getWebAuthnEnvironmentError,
} from '@/commons/lib/webauthnEnvironment';
import type { WebAuthnRegisterProps } from '@/features/auth';

export const Register = ({ email, validateForm }: WebAuthnRegisterProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegisterWebauthn = async () => {
    if (!validateForm()) {
      return;
    }

    const environmentError = getWebAuthnEnvironmentError();
    if (environmentError) {
      setError(environmentError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiFetch('/api/auth/register/options', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error);
      }

      const attResp = await startRegistration({ optionsJSON: data.options });

      const verifyRes = await apiFetch('/api/auth/register/verify', {
        method: 'POST',
        body: JSON.stringify({ attResp, challengeId: data.challengeId }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.ok) {
        throw new Error(verifyData.error);
      }

      // Auto-login tras registrar. Si el autenticador falla o el usuario
      // cancela, el registro ya está hecho: se le indica que acceda.
      try {
        const loginOptionsRes = await apiFetch('/api/auth/login/options', {
          method: 'POST',
          body: JSON.stringify({ email }),
        });
        const loginOptionsData = await loginOptionsRes.json();
        if (!loginOptionsData.ok) {
          throw new Error(loginOptionsData.error);
        }

        const assertion = await startAuthentication({
          optionsJSON: loginOptionsData.options,
        });

        const loginVerifyRes = await apiFetch('/api/auth/login/verify', {
          method: 'POST',
          body: JSON.stringify({
            attResp: assertion,
            challengeId: loginOptionsData.challengeId,
          }),
        });
        const loginVerifyData = await loginVerifyRes.json();
        if (!loginVerifyData.ok) {
          throw new Error(loginVerifyData.error);
        }

        sileo.success({
          title: 'Registro completado',
          description: 'Bienvenido a ClaveVault.',
          duration: 1500,
        });
        router.push('/passwords');
      } catch (autoLoginError) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[webauthn:auto-login]', autoLoginError);
        }
        sileo.success({
          title: 'Registro exitoso',
          description: 'Ya puedes acceder con tu huella o llave.',
          duration: 4000,
        });
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[webauthn:register]', err);
      }
      setError(describeWebAuthnError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        onClick={handleRegisterWebauthn}
        disabled={isLoading}
        variant="outline"
        className="w-full h-10"
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          'Registrarse'
        )}
      </Button>
      <div className="min-h-3 flex items-center text-center justify-center">
        {error && (
          <p role="alert" className="text-caption text-red-500 leading-none">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
