

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const mockData = [
  { day: 'Mon', minutes: 180 },
  { day: 'Tue', minutes: 240 },
  { day: 'Wed', minutes: 120 },
  { day: 'Thu', minutes: 300 },
  { day: 'Fri', minutes: 90 },
  { day: 'Sat', minutes: 210 },
  { day: 'Sun', minutes: 60 },
];

const WeeklyChart = () => {
  const dailyGoalMinutes = 250;
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-10 w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold text-blue-700 text-center mb-4">
        Weekly Study Overview
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} tickFormatter={(min) => (min / 60)} />
          <Tooltip formatter={(value) => `${(value / 60).toFixed(1)} hrs`} />
          <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
            {mockData.map((entry, index) => {
              const ratio = Math.min(entry.minutes / dailyGoalMinutes, 1);
              const lightness = 90 - ratio * 50;
              const fill = `hsl(221, 85%, ${lightness}%)`;
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;