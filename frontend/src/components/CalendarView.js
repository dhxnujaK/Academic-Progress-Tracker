import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Monday-first labels
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Optional props: pass study heatmap in ISO keys and a goal in minutes
// Example: studyData = { '2025-06-25': 120, ... }
const CalendarView = ({ onDateSelect, studyData = {}, dailyGoalMinutes = 120 }) => {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [direction, setDirection] = useState(0); // -1 left, +1 right

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setDirection(-1);
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setDirection(1);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const startOfMonth = new Date(year, month, 1);
  // Normalize weekday to Monday=0 .. Sunday=6
  const toMon0 = (d) => (d + 6) % 7;
  const startWeekday = toMon0(startOfMonth.getDay());
  const endOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const totalCells = startWeekday + daysInMonth; // only enough to show current month
  const firstCellDate = new Date(year, month, 1 - startWeekday);
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const d = new Date(firstCellDate);
    d.setDate(firstCellDate.getDate() + i);
    return d;
  });

  const isToday = (d) =>
    d &&
    today.getDate() === d.getDate() &&
    today.getMonth() === d.getMonth() &&
    today.getFullYear() === d.getFullYear();

  const isSelected = (d) =>
    d &&
    selectedDate.getDate() === d.getDate() &&
    selectedDate.getMonth() === d.getMonth() &&
    selectedDate.getFullYear() === d.getFullYear();

  // Heat color based on study minutes vs goal (soft blue scale)
  const heatColor = (d) => {
    if (!d) return '#ffffff';
    const key = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString()
      .slice(0, 10);
    const minutes = studyData[key] || 0;
    const ratio = Math.max(0, Math.min(minutes / dailyGoalMinutes, 1));
    if (ratio === 0) return '#ffffff';
    const lightness = 95 - ratio * 50; // 95% -> 45%
    return `hsl(221 85% ${lightness}%)`;
  };

  const handleDateClick = (d) => {
    if (!d || d.getMonth() !== month) return;
    setSelectedDate(d);
    onDateSelect?.(d);
  };

  // Animation variants for month slide
  const pageVariants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 })
  };

  return (
    <div className="w-full rounded-2xl border bg-white/80 backdrop-blur shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          aria-label="Previous month"
          onClick={handlePrevMonth}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="stroke-current"><path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold text-slate-800 bg-white/70">
            <span>{currentDate.toLocaleString('default', { month: 'long' })}</span>
            <span className="text-slate-500">{year}</span>
          </div>
        </div>
        <button
          aria-label="Next month"
          onClick={handleNextMonth}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="stroke-current"><path d="M9 6l6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[12px] font-medium text-slate-500">
        {daysOfWeek.map((d) => (
          <div key={d} className="py-2 text-center select-none uppercase tracking-wide">{d}</div>
        ))}
      </div>

      <div className="relative mt-1">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={`${year}-${month}`}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="grid grid-cols-7 gap-1"
          >
            {cells.map((dateObj, idx) => {
              const inMonth = dateObj.getMonth() === month;
              const isT = isToday(dateObj);
              const isS = isSelected(dateObj);
              const bg = heatColor(dateObj);
              return (
                <motion.button
                  type="button"
                  key={idx}
                  onClick={() => handleDateClick(dateObj)}
                  whileHover={{ scale: inMonth ? 1.02 : 1 }}
                  whileTap={{ scale: inMonth ? 0.98 : 1 }}
                  className={`relative h-12 rounded-xl border text-sm flex items-center justify-center shadow-sm transition
                    ${inMonth ? 'cursor-pointer' : 'cursor-default bg-slate-50'}
                    ${isS ? 'text-white outline outline-2 outline-cyan-500' : ''}
                  `}
                  style={{
                    background:
                      inMonth && !isS
                        ? `linear-gradient(0deg, ${bg}, ${bg})`
                        : undefined,
                  }}
                  aria-current={isT ? 'date' : undefined}
                >
                  {/* Selected state background */}
                  {isS && (
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600" />
                  )}
                  {/* Today indicator when not selected */}
                  {isT && !isS && (
                    <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                  )}
                  <span
                    className={`relative select-none ${inMonth ? (isS ? 'text-white' : 'text-slate-800') : 'text-slate-400'}`}
                  >
                    {inMonth ? dateObj.getDate() : ''}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CalendarView;
