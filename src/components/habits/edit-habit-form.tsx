"use client";

import { useState } from "react";
import { Habit } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const habitSchema = z.object({
  name: z.string().min(1, "Habit name is required").max(50, "Habit name must be 50 characters or less"),
});

type HabitFormValues = z.infer<typeof habitSchema>;

interface EditHabitFormProps {
  habit: Habit;
  onSave: (habit: Habit) => void;
  onCancel: () => void;
}

export function EditHabitForm({ habit, onSave, onCancel }: EditHabitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: habit.name,
    },
  });

  const onSubmit = async (values: HabitFormValues) => {
    setIsSubmitting(true);
    try {
      const updatedHabit = {
        ...habit,
        name: values.name,
      };
      await onSave(updatedHabit);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Habit Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter habit name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}