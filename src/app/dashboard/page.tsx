"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Habit } from "@prisma/client";
import HabitList from "@/components/habits/habit-list";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirecionar para login se não estiver autenticado
    if (isLoaded && !userId) {
      router.push("/sign-in");
      return;
    }

    // Buscar hábitos quando o usuário estiver autenticado
    if (isLoaded && userId) {
      const fetchHabits = async () => {
        try {
          const response = await fetch("/api/habits");
          if (response.ok) {
            const data = await response.json();
            setHabits(data);
          }
        } catch (error) {
          console.error("Error fetching habits:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchHabits();
    }
  }, [isLoaded, userId, router]);

  // Se ainda estiver carregando a autenticação
  if (!isLoaded || (isLoaded && !userId)) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  // Se estiver carregando os hábitos
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando seus hábitos...</div>;
  }

  return (
    <main className="container mx-auto py-6 max-w-6xl px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Habit Tracker</h1>
        <ThemeToggle />
      </div>

      <HabitList initialHabits={habits} />
    </main>
  );
}