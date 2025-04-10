"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const habitSchema = z.object({
  name: z.string().min(1, "Habit name is required").max(50, "Habit name must be 50 characters or less"),
});

type HabitFormValues = z.infer<typeof habitSchema>;

interface CreateHabitFormProps {
  onSave: (name: string) => void;
  onCancel: () => void;
}

export function CreateHabitForm({ onSave, onCancel }: CreateHabitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: HabitFormValues) => {
    setIsSubmitting(true);
    try {
      await onSave(values.name);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>Create New Habit</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
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
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Habit"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}