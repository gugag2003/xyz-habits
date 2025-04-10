"use client";

import { SignIn } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignInPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  // Redireciona usuários já autenticados para o dashboard
  useEffect(() => {
    if (isLoaded && userId) {
      router.push('/dashboard');
    }
  }, [isLoaded, userId, router]);

  // Se ainda estiver carregando ou já redirecionando, mostrar indicador de loading
  if (!isLoaded || (isLoaded && userId)) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] py-10">
      <SignIn redirectUrl="/dashboard" />
    </div>
  );
}