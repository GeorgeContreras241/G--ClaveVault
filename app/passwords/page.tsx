import { Suspense } from 'react';
import { Loading } from '@/commons/components/shared/Loading';
import { getUser } from '@/commons/lib/get-user';
import { redirect } from 'next/navigation';
import { PasswordsContent } from '@/features/online';

export default function PasswordsPage() {
  return (
    <Suspense fallback={<Loading text="Cargando contraseñas..." />}>
      <PasswordsInit />
    </Suspense>
  );
}

async function PasswordsInit() {
  const user = await getUser();

  if (!user) {
    redirect('/online');
  }

  return <PasswordsContent />;
}
