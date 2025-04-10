"use client";

import { useEffect, useState } from "react";
import { Habit, HabitEntry } from "@prisma/client";
import { HabitCard } from "./habit-card";
import { CreateHabitForm } from "./create-habit-form.tsx";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { startOfDay } from "date-fns";

type HabitWithEntries = Habit & {
  entries: HabitEntry[];
};

interface HabitListProps {
  initialHabits: Habit[];
}

export default function HabitList({ initialHabits }: HabitListProps) {
  const [habits, setHabits] = useState<HabitWithEntries[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load habits and entries
  useEffect(() => {
    const fetchHabitsWithEntries = async () => {
      try {
        const response = await fetch("/api/habits");
        if (!response.ok) throw new Error("Failed to fetch habits");
        
        const data = await response.json();
        setHabits(data);
      } catch (error) {
        console.error("Error fetching habits:", error);
        // Fallback to initial habits if API fails
        setHabits(initialHabits.map(habit => ({ ...habit, entries: [] })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchHabitsWithEntries();
  }, [initialHabits]);

  // Handle creating a new habit
  const handleCreateHabit = async (name: string) => {
    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error("Failed to create habit");
      
      const newHabit = await response.json();
      setHabits(prevHabits => [...prevHabits, { ...newHabit, entries: [] }]);
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating habit:", error);
    }
  };

  // Handle updating a habit
  const handleUpdateHabit = async (updatedHabit: Habit) => {
    try {
      const response = await fetch(`/api/habits/${updatedHabit.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: updatedHabit.name }),
      });

      if (!response.ok) throw new Error("Failed to update habit");
      
      setHabits(prevHabits => 
        prevHabits.map(habit => 
          habit.id === updatedHabit.id 
            ? { ...habit, name: updatedHabit.name } 
            : habit
        )
      );
    } catch (error) {
      console.error("Error updating habit:", error);
    }
  };

  // Handle deleting a habit
  const handleDeleteHabit = async (id: string) => {
    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete habit");
      
      setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  // Handle toggling a day for a habit
  const handleToggleDay = async (habitId: string, date: Date) => {
    // Normalize the date to start of day to ensure consistent comparison
    const normalizedDate = startOfDay(date);
    
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      // Check if an entry exists for this date
      const existingEntryIndex = habit.entries.findIndex(
        entry => startOfDay(new Date(entry.date)).getTime() === normalizedDate.getTime()
      );

      if (existingEntryIndex >= 0) {
        // Entry exists, delete it
        const entryId = habit.entries[existingEntryIndex].id;
        const response = await fetch(`/api/habits/${habitId}/entries/${entryId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete entry");
        
        setHabits(prevHabits => 
          prevHabits.map(h => {
            if (h.id === habitId) {
              return {
                ...h,
                entries: h.entries.filter((_, i) => i !== existingEntryIndex)
              };
            }
            return h;
          })
        );
      } else {
        // Entry doesn't exist, create it
        const response = await fetch(`/api/habits/${habitId}/entries`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ date: normalizedDate }),
        });

        if (!response.ok) throw new Error("Failed to create entry");
        
        const newEntry = await response.json();
        
        setHabits(prevHabits => 
          prevHabits.map(h => {
            if (h.id === habitId) {
              return {
                ...h,
                entries: [...h.entries, newEntry]
              };
            }
            return h;
          })
        );
      }
    } catch (error) {
      console.error("Error toggling day:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading your habits...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Habits</h2>
        <Button onClick={() => setIsCreating(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Habit
        </Button>
      </div>

      {isCreating && (
        <CreateHabitForm
          onSave={handleCreateHabit}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {habits.length === 0 && !isCreating ? (
        <div className="text-center p-8 border rounded-lg bg-muted/50">
          <p className="mb-4">You don't have any habits yet.</p>
          <Button onClick={() => setIsCreating(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create your first habit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              entries={habit.entries}
              onToggleDay={handleToggleDay}
              onUpdate={handleUpdateHabit}
              onDelete={handleDeleteHabit}
            />
          ))}
        </div>
      )}
    </div>
  );
}