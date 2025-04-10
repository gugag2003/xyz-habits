"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  
  // Redireciona usuários autenticados para o dashboard
  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/dashboard");
    }
  }, [isLoaded, userId, router]);
  
  // Se ainda estiver carregando, mostra um indicador de carregamento
  if (!isLoaded) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }
  
  // Se não estiver autenticado, mostra a página de boas-vindas
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight mb-4">
        Bem-vindo ao Habit Tracker
      </h1>
      <p className="text-xl text-muted-foreground max-w-md mb-8">
        Acompanhe seus hábitos diários e construa consistência para alcançar seus objetivos.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/sign-in">Entrar</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/sign-up">Cadastrar</Link>
        </Button>
      </div>
    </div>
  );
}