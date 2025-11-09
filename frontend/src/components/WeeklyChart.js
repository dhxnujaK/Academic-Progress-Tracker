import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../services/api';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const fillForMinutes = (minutes, dailyGoalMinutes = 720) => {
  const ratio = Math.min(Math.max(minutes / dailyGoalMinutes, 0), 1);
  const lightness = 95 - ratio * 50; 
  return `hsl(221, 85%, ${lightness}%)`;
};

const toISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dy}`;
};

const startOfWeekMon = (date) => {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; 
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

const WeeklyChart = () => {
  const [weekly, setWeekly] = useState(() => days.map((day) => ({ day, minutes: 0 })));
  const [weekStart, setWeekStart] = useState(() => startOfWeekMon(new Date()));
  const [direction, setDirection] = useState(0); 

  const fetchWeek = async (startDate) => {
    try {
      const start = startOfWeekMon(startDate || new Date());
      const end = new Date(start); end.setDate(start.getDate() + 6);
      const res = await api.get('/study-sessions/heatmap', {
        params: { start: toISO(start), end: toISO(end) }
      });
      const secMap = res.data || {};
      const data = days.map((label, i) => {
        const d = new Date(start); d.setDate(start.getDate() + i);
        const key = toISO(d);
        const minutes = Math.round((secMap[key] || 0) / 60);
        return { day: label, minutes };
      });
      setWeekly(data);
    } catch (e) {
    }
  };

  useEffect(() => { fetchWeek(weekStart); }, [weekStart]);

  const prevWeek = () => {
    const d = new Date(weekStart); d.setDate(d.getDate() - 7); d.setHours(0,0,0,0);
    setDirection(-1);
    setWeekStart(startOfWeekMon(d));
  };
  const nextWeek = () => {
    const d = new Date(weekStart); d.setDate(d.getDate() + 7); d.setHours(0,0,0,0);
    setDirection(1);
    setWeekStart(startOfWeekMon(d));
  };
  const goToThisWeek = () => {
    const nowStart = startOfWeekMon(new Date());
    setDirection(nowStart > weekStart ? 1 : -1);
    setWeekStart(nowStart);
  };

  const headerRange = useMemo(() => {
    const start = new Date(weekStart);
    const end = new Date(weekStart); end.setDate(start.getDate() + 6);
    const fmt = (dt) => dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const year = start.getFullYear() === end.getFullYear() ? start.getFullYear() : `${start.getFullYear()}–${end.getFullYear()}`;
    return `${fmt(start)} – ${fmt(end)} ${year}`;
  }, [weekStart]);

  const maxMinutes = useMemo(() => weekly.reduce((m, d) => Math.max(m, d.minutes), 0), [weekly]);
  const useHours = maxMinutes >= 90; 
  const ticks = useMemo(() => {
    if (!useHours) {
      const max = Math.max(30, Math.ceil(maxMinutes / 10) * 10);
      const step = max <= 60 ? 10 : 20;
      const arr = [];
      for (let v = 0; v <= max; v += step) arr.push(v);
      return arr;
    }
    const maxH = Math.max(1, Math.ceil(maxMinutes / 60));
    return Array.from({ length: maxH + 1 }, (_, i) => i * 60);
  }, [maxMinutes, useHours]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="rounded-full border px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">Prev</button>
          <button onClick={goToThisWeek} className="rounded-full border px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">This week</button>
        </div>
        <h3 className="text-xl font-semibold text-blue-700 text-center">Weekly Study Overview</h3>
        <button onClick={nextWeek} className="rounded-full border px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">Next</button>
      </div>
      <div className="text-center text-xs text-slate-500 mb-3">{headerRange}</div>
      <div className="relative h-[300px] overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={weekStart.toISOString()}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis
                  label={{ value: useHours ? 'Hours' : 'Minutes', angle: -90, position: 'insideLeft' }}
                  ticks={ticks}
                  tickFormatter={(min) => (useHours ? Math.round(min / 60) : Math.round(min))}
                  domain={[0, ticks[ticks.length - 1] || 60]}
                  allowDecimals={false}
                />
                <Tooltip formatter={(value) => (useHours ? `${(value / 60).toFixed(2)} hrs` : `${Math.round(value)} min`)} />
                <Bar dataKey="minutes" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={500} animationEasing="ease-out">
                  {weekly.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={fillForMinutes(entry.minutes)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WeeklyChart;
