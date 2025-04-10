import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Validate the request body for updating a habit
const updateHabitSchema = z.object({
  name: z.string().min(1).max(50),
});

// GET /api/habits/[id] - Get a specific habit with its entries
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const habit = await db.habit.findUnique({
      where: {
        id: params.id,
        userId,
      },
      include: {
        entries: true,
      },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json(habit);
  } catch (error) {
    console.error(`Error in GET /api/habits/${params.id}:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/habits/[id] - Update a habit
export async function PATCH(
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
    const result = updateHabitSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error.format() },
        { status: 400 }
      );
    }

    // Update the habit
    const updatedHabit = await db.habit.update({
      where: {
        id: params.id,
      },
      data: {
        name: result.data.name,
      },
    });

    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error(`Error in PATCH /api/habits/${params.id}:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/habits/[id] - Delete a habit
export async function DELETE(
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

    // Delete the habit (this will also delete all entries due to cascade delete)
    await db.habit.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error in DELETE /api/habits/${params.id}:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}