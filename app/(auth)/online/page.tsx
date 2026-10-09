import { WebAuthn } from '@/features/auth/Auth';

export default function Online() {
  return (
    <main className="flex-1 flex items-center justify-center h-full">
      <WebAuthn />
    </main>
  );
}
