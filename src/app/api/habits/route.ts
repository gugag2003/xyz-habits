import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

// GET /api/habits - Get all habits for the current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all habits with their entries
    const habits = await db.habit.findMany({
      where: {
        userId,
      },
      include: {
        entries: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(habits);
  } catch (error) {
    console.error("Error in GET /api/habits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Validate the request body for creating a new habit
const createHabitSchema = z.object({
  name: z.string().min(1).max(50),
});

// POST /api/habits - Create a new habit
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate the request body
    const body = await req.json();
    const result = createHabitSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error.format() },
        { status: 400 }
      );
    }

    // Create the new habit
    const newHabit = await db.habit.create({
      data: {
        name: result.data.name,
        userId,
      },
    });

    return NextResponse.json(newHabit, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/habits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}