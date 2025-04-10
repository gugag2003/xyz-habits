"use client";

import { useState, useEffect } from "react";
import { HabitEntry } from "@prisma/client";
import {
  eachDayOfInterval,
  isSameDay,
  subMonths,
  format,
  startOfWeek,
  getDay,
  endOfMonth,
  startOfMonth,
  subDays,
  addDays,
  isBefore,
  isAfter,
  getMonth,
  differenceInDays,
} from "date-fns";
import { cn } from "@/lib/utils";

interface HabitHeatmapProps {
  habitId: string;
  entries: HabitEntry[];
  onToggleDay: (habitId: string, date: Date) => void;
}

export function HabitHeatmap({ habitId, entries, onToggleDay }: HabitHeatmapProps) {
  // Default to showing the last 365 days
  const [view, setView] = useState<"year" | "month">("year");
  
  const today = new Date();
  const startDate = view === "year" 
    ? subDays(today, 364) // Show 365 days (including today)
    : startOfMonth(today);
  
  const endDate = today;

  // Get all days in the selected range
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Create an array of 7 arrays (one for each day of the week)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  const dayOfWeekOfStart = getDay(startDate);

  // Fill in empty cells before the start date
  for (let i = 0; i < dayOfWeekOfStart; i++) {
    currentWeek.push(null as unknown as Date); // Placeholder for empty cells
  }

  // Populate the days
  days.forEach((day) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });

  // Add the last week
  if (currentWeek.length > 0) {
    // Fill in empty cells after the end date
    while (currentWeek.length < 7) {
      currentWeek.push(null as unknown as Date); // Placeholder for empty cells
    }
    weeks.push(currentWeek);
  }

  // Check if a date has an entry
  const hasEntry = (date: Date): boolean => {
    return date && entries.some(entry => 
      isSameDay(new Date(entry.date), date)
    );
  };

  // Generate month labels for the year view
  const monthLabels = view === "year" ? generateMonthLabels(startDate, endDate) : [];

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium">
          {view === "year" 
            ? `Last 365 days (${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")})` 
            : format(today, "MMMM yyyy")}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setView("month")}
            className={cn(
              "px-2 py-1 text-xs rounded-md",
              view === "month" 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground"
            )}
          >
            Month
          </button>
          <button
            onClick={() => setView("year")}
            className={cn(
              "px-2 py-1 text-xs rounded-md",
              view === "year" 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground"
            )}
          >
            Year
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Day of week labels */}
        <div className="grid grid-cols-7 text-xs mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div key={i} className="text-center h-6 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>

        {/* Month labels for year view */}
        {view === "year" && (
          <div className="absolute top-0 -mt-6 w-full">
            <div className="grid grid-cols-12 text-xs">
              {monthLabels.map((month, i) => (
                <div key={i} className="col-span-1 text-center">
                  {month}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar grid */}
        <div className={cn(
          "grid gap-1",
          view === "year" ? "grid-cols-53" : "grid-cols-7"
        )}>
          {view === "year" 
            ? renderYearView(weeks, hasEntry, habitId, onToggleDay)
            : renderMonthView(weeks, hasEntry, habitId, onToggleDay)
          }
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end mt-2 space-x-2 text-xs">
          <div>Less</div>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "w-3 h-3 rounded-sm",
                getHeatmapColor(level > 0)
              )}
            />
          ))}
          <div>More</div>
        </div>
      </div>
    </div>
  );
}

// Helper function to render the year view (rotated calendar)
function renderYearView(
  weeks: Date[][],
  hasEntry: (date: Date) => boolean,
  habitId: string,
  onToggleDay: (habitId: string, date: Date) => void
) {
  // Transpose the weeks array to get columns of days
  const columns: (Date | null)[][] = [];
  
  for (let col = 0; col < weeks.length; col++) {
    columns[col] = [];
    for (let row = 0; row < 7; row++) {
      columns[col][row] = weeks[col]?.[row] || null;
    }
  }

  return columns.map((column, colIndex) => (
    <div key={colIndex} className="grid grid-rows-7 gap-1">
      {column.map((day, dayIndex) => (
        <div 
          key={dayIndex}
          className={cn(
            "w-3 h-3 rounded-sm cursor-pointer transition-colors",
            day ? getHeatmapColor(hasEntry(day)) : "opacity-0"
          )}
          onClick={() => day && onToggleDay(habitId, day)}
          title={day ? format(day, "PP") : ""}
        />
      ))}
    </div>
  ));
}

// Helper function to render the month view
function renderMonthView(
  weeks: Date[][],
  hasEntry: (date: Date) => boolean,
  habitId: string,
  onToggleDay: (habitId: string, date: Date) => void
) {
  return weeks.flatMap((week) =>
    week.map((day, dayIndex) => (
      <div
        key={day ? day.toISOString() : `empty-${dayIndex}`}
        className={cn(
          "w-8 h-8 rounded-md flex items-center justify-center",
          day ? getHeatmapColor(hasEntry(day)) : "opacity-0"
        )}
        onClick={() => day && onToggleDay(habitId, day)}
        title={day ? format(day, "PP") : ""}
      >
        {day && <span className="text-xs">{format(day, "d")}</span>}
      </div>
    ))
  );
}

// Helper function to generate month labels
function generateMonthLabels(startDate: Date, endDate: Date): string[] {
  const months: string[] = [];
  let currentDate = startDate;
  const monthsCount = 12; // We want to show 12 month labels

  for (let i = 0; i < monthsCount; i++) {
    const monthPosition = Math.floor((i / monthsCount) * 12);
    const monthDate = addDays(startDate, monthPosition * 30); // Approximate month positions
    
    if (isBefore(monthDate, endDate)) {
      months.push(format(monthDate, "MMM"));
    } else {
      months.push("");
    }
  }

  return months;
}

// Helper function to get heatmap colors based on activity
function getHeatmapColor(hasActivity: boolean): string {
  if (!hasActivity) {
    return "bg-muted border border-border";
  }
  return "bg-primary";
}