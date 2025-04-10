import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// DELETE /api/habits/[id]/entries/[entryId] - Delete a specific entry
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; entryId: string } }
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

    // Check if the entry exists and belongs to the habit
    const entry = await db.habitEntry.findUnique({
      where: {
        id: params.entryId,
        habitId: params.id,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Delete the entry
    await db.habitEntry.delete({
      where: {
        id: params.entryId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      `Error in DELETE /api/habits/${params.id}/entries/${params.entryId}:`,
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}