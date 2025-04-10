import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { startOfDay } from "date-fns";

// Validate the request body for creating an entry
const createEntrySchema = z.object({
  date: z.coerce.date(),
});

// POST /api/habits/[id]/entries - Create a new entry for a habit
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the habit exists and belongs to the user
    const habit = await db.habit.findUnique({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Parse and validate the request body
    const body = await req.json();
    const result = createEntrySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error.format() },
        { status: 400 }
      );
    }

    // Normalize the date to start of day
    const normalizedDate = startOfDay(result.data.date);

    // Check if an entry already exists for this date
    const existingEntry = await db.habitEntry.findUnique({
      where: {
        habitId_date: {
          habitId: params.id,
          date: normalizedDate,
        },
      },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: "Entry already exists for this date" },
        { status: 409 }
      );
    }

    // Create the new entry
    const newEntry = await db.habitEntry.create({
      data: {
        habitId: params.id,
        date: normalizedDate,
        userId,
      },
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error(`Error in POST /api/habits/${params.id}/entries:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/habits/[id]/entries - Get all entries for a habit
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the habit exists and belongs to the user
    const habit = await db.habit.findUnique({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Get all entries for the habit
    const entries = await db.habitEntry.findMany({
      where: {
        habitId: params.id,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error(`Error in GET /api/habits/${params.id}/entries:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}