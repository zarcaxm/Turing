import { useMemo, useState } from "react";
import { Task } from "@/types/task";
import { calculateCompletedScoresByDay } from "@/utils/scoring";

interface CalendarScreenProps {
    tasks: Task[];
}

interface CalendarDay {
    date: Date;
    key: string;
    dayNumber: number;
    score: number;
    isCurrentMonth: boolean;
    isToday: boolean;
}

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getDayKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function buildCalendarDays(monthDate: Date, scoresByDay: Record<string, number>): CalendarDay[] {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const leadingDays = firstDayOfMonth.getDay();
    const totalDaysInMonth = lastDayOfMonth.getDate();
    const totalCells = Math.ceil((leadingDays + totalDaysInMonth) / 7) * 7;
    const todayKey = getDayKey(new Date());

    return Array.from({ length: totalCells }, (_, index) => {
        const cellDate = new Date(year, month, index - leadingDays + 1);
        const dayKey = getDayKey(cellDate);

        return {
            date: cellDate,
            key: dayKey,
            dayNumber: cellDate.getDate(),
            score: scoresByDay[dayKey] ?? 0,
            isCurrentMonth: cellDate.getMonth() === month,
            isToday: dayKey === todayKey,
        };
    });
}

export function CalendarScreen({ tasks }: CalendarScreenProps) {
    const [displayMonth, setDisplayMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    const scoresByDay = useMemo(() => calculateCompletedScoresByDay(tasks), [tasks]);

    const calendarDays = useMemo(
        () => buildCalendarDays(displayMonth, scoresByDay),
        [displayMonth, scoresByDay]
    );

    const monthLabel = displayMonth.toLocaleString(undefined, {
        month: "long",
        year: "numeric",
    }).toUpperCase();

    const monthScore = calendarDays.reduce((total, day) => {
        if (!day.isCurrentMonth) {
            return total;
        }

        return total + day.score;
    }, 0);

    return (
        <section className="calendar-screen">
            <div className="calendar-header">
                <div>
                    <div className="calendar-title">COMPLETION LOG</div>
                    <div className="calendar-subtitle">{monthLabel}</div>
                </div>
                <div className="calendar-nav">
                    <button
                        className="calendar-nav-btn"
                        onClick={() => setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                        aria-label="Previous month"
                    >
                        [PREV]
                    </button>
                    <button
                        className="calendar-nav-btn"
                        onClick={() => {
                            const now = new Date();
                            setDisplayMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                        }}
                        aria-label="Current month"
                    >
                        [TODAY]
                    </button>
                    <button
                        className="calendar-nav-btn"
                        onClick={() => setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                        aria-label="Next month"
                    >
                        [NEXT]
                    </button>
                </div>
            </div>

            <div className="calendar-month-score">MONTH SCORE: {monthScore} PTS</div>

            <div className="calendar-grid">
                {DAY_LABELS.map((label) => (
                    <div key={label} className="calendar-weekday">
                        {label}
                    </div>
                ))}

                {calendarDays.map((day) => (
                    <div
                        key={day.key}
                        className={[
                            "calendar-day",
                            day.isCurrentMonth ? "" : "is-outside-month",
                            day.isToday ? "is-today" : "",
                            day.score > 0 ? "has-score" : "",
                        ].filter(Boolean).join(" ")}
                    >
                        <div className="calendar-day-number">{day.dayNumber}</div>
                        <div className="calendar-day-score">
                            {day.score > 0 ? `${day.score} PTS` : ""}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
