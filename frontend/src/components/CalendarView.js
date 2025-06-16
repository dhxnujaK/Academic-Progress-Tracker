import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarView = ({ onDateSelect }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [direction, setDirection] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
    }
  }, []);

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

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks = [];
  let day = 1 - firstDayOfMonth;

  while (day <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      if (day > 0 && day <= daysInMonth) {
        week.push(day);
      } else {
        week.push(null);
      }
      day++;
    }
    weeks.push(week);
  }

  const isToday = (dayNum) =>
    today.getDate() === dayNum &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  const isSelected = (dayNum) =>
    selectedDate.getDate() === dayNum &&
    selectedDate.getMonth() === month &&
    selectedDate.getFullYear() === year;

  const handleDateClick = (dayNum) => {
    const newDate = new Date(year, month, dayNum);
    setSelectedDate(newDate);
    onDateSelect?.(newDate);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xl font-bold mb-2">
        <button onClick={handlePrevMonth} className="text-gray-600 hover:text-blue-600 text-2xl">◀</button>
        <span>{currentDate.toLocaleString('default', { month: 'long' })} {year}</span>
        <button onClick={handleNextMonth} className="text-gray-600 hover:text-blue-600 text-2xl">▶</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm text-center font-semibold text-gray-600">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="relative h-[360px] overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${month}-${year}-${direction}`}
            initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }} // easeOutBack style for smoother fluid exit/enter
            className="absolute top-0 left-0 w-full grid grid-cols-7 gap-1 mt-1"
          >
            {weeks.flat().map((dayNum, idx) => (
              <div
                key={idx}
                onClick={() => dayNum && handleDateClick(dayNum)}
                className={`cursor-pointer h-12 flex items-center justify-center rounded-md border text-sm
                  ${isToday(dayNum) ? 'bg-blue-500 text-white font-bold' : ''}
                  ${isSelected(dayNum) ? 'ring-2 ring-cyan-500' : ''}
                  ${!isToday(dayNum) && !isSelected(dayNum) ? 'bg-white' : ''}`}
              >
                {dayNum || ''}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CalendarView;
