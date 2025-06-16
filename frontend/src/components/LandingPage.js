import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarView from './CalendarView';
import TopBar from './TopBar';

const LandingPage = () => {
  const username = localStorage.getItem('username') || 'Student';
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <>
      <TopBar />
      <div className="min-h-screen bg-gray-100 pt-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Panel */}
          <div className="col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-700">GPA Summary</h2>
              <p className="text-3xl font-bold text-blue-700 mt-2">3.85</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-700">Study Timer</h2>
              <p className="text-2xl font-bold text-green-600 mt-2">7h 30m</p>
              <p className="text-sm text-gray-500">this week</p>
            </div>
          </div>

          {/* Center Panel - Calendar + Summary */}
          <div className="col-span-1 md:col-span-3 space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Calendar</h2>
              <CalendarView onDateSelect={setSelectedDate} />
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Study Summary for {selectedDate.toDateString()}
              </h3>
              <p className="text-gray-500 text-sm">No data yet for this date.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;