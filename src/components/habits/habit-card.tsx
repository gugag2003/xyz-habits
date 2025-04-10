"use client";

import { useState } from "react";
import { Habit, HabitEntry } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon, Edit2Icon, Trash2Icon } from "lucide-react";
import { HabitHeatmap } from "./habit-heatmap";
import { EditHabitForm } from "./edit-habit-form";
import { DeleteHabitDialog } from "./delete-habit-dialog";

interface HabitCardProps {
  habit: Habit;
  entries: HabitEntry[];
  onToggleDay: (habitId: string, date: Date) => void;
  onUpdate: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export function HabitCard({ habit, entries, onToggleDay, onUpdate, onDelete }: HabitCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{habit.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontalIcon className="h-5 w-5" />
                <span className="sr-only">Options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit2Icon className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsDeleteDialogOpen(true)}
                variant="destructive"
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <EditHabitForm 
            habit={habit} 
            onSave={(updatedHabit) => {
              onUpdate(updatedHabit);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <HabitHeatmap 
            habitId={habit.id} 
            entries={entries} 
            onToggleDay={onToggleDay} 
          />
        )}
      </CardContent>

      <DeleteHabitDialog 
        isOpen={isDeleteDialogOpen}
        habitName={habit.name}
        onConfirm={() => {
          onDelete(habit.id);
          setIsDeleteDialogOpen(false);
        }}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </Card>
  );
}