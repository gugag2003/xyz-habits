import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = auth();
  
  // Se o usuário não estiver autenticado, redireciona para login
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Se estiver autenticado, redireciona para o dashboard
  redirect('/dashboard');
}