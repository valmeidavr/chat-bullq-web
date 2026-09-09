import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { RegisterForm } from '@/features/auth/components/register-form';

/**
 * Cadastro SÓ por convite. Sem `?invite=`, a página não existe pro público —
 * redireciona pro login (o backend também recusa registro sem convite).
 */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;
  if (!invite) redirect('/login');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
