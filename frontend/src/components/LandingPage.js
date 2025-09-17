import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CalendarView from './CalendarView';
import TopBar from './TopBar';
import WeeklyChart from './WeeklyChart';

const LandingPage = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Student';
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [modules, setModules] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(120);
  const [editingGoal, setEditingGoal] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const timerSectionRef = useRef(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/modules/current-semester', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModules(res.data);
    } catch (err) {
      console.error('Error fetching modules for active semester:', err);
    }
  };

  const startTimer = () => {
    if (!selectedModuleId) return; // guard
    const start = new Date();
    setStartTime(start);
    const id = setInterval(() => {
      setElapsed(Math.floor((new Date() - start) / 1000));
    }, 1000);
    setIntervalId(id);
    setIsTimerActive(true);
    setTimeout(() => {
      timerSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const stopTimer = async () => {
    clearInterval(intervalId);
    const endTime = new Date();
    const token = localStorage.getItem('token');
    setIsSaving(true);
    try {
      await axios.post(
        'http://localhost:8080/api/study-sessions',
        {
          moduleId: selectedModuleId,
          startTime: startTime?.toISOString(),
          endTime: endTime.toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to save study session:', err);
      // optional: show a toast/alert
    } finally {
      setIsSaving(false);
      setStartTime(null);
      setElapsed(0);
      setIntervalId(null);
      setIsTimerActive(false);
    }
  };

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
      <>
        <TopBar />
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100 pt-24 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* LEFT PANEL */}
            <div className="col-span-1 space-y-6">
              {/* Welcome */}
              <div className="bg-white rounded-2xl shadow-md p-6 text-center">
                <h2 className="text-xl font-semibold text-gray-700">Welcome, {username} 🎓</h2>
                <p className="text-sm text-gray-500 mt-1">Here's your academic dashboard</p>
              </div>

              {/* GPA Summary */}
              <div className="bg-white rounded-2xl shadow-md p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-700">Your CGPA</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">3.85</p>
                <p className="text-sm text-gray-500">updated weekly</p>
              </div>

              {/* Study Timer */}
              <div className="bg-white rounded-2xl shadow-md p-6 text-center space-y-3">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Study Timer</h3>
                <select
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:opacity-60"
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  aria-label="Choose a module to start timing"
                >
                  <option value="" disabled>
                    — Select a module from your active semester —
                  </option>
                  {modules && modules.length > 0 ? (
                    modules.map((mod) => (
                      <option key={mod.id} value={mod.id}>
                        {mod.name}{mod.code ? ` (${mod.code})` : ''}{mod.credits ? ` • ${mod.credits} cr` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No modules found for the active semester
                    </option>
                  )}
                </select>
                <button
                  onClick={startTimer}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm w-full transition"
                  disabled={!selectedModuleId}
                  aria-disabled={!selectedModuleId}
                  title={!selectedModuleId ? 'Select a module to start timing' : 'Start timing your study session'}
                >
                  Start
                </button>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Actions</h3>

                <button
                    onClick={() => navigate('/register-semester')}
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded mb-2 transition"
                >
                  Register Semester
                </button>
                <button
                    onClick={() => navigate('/register-module')}
                    className="block w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded transition"
                >
                  Register Module
                </button>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="col-span-1 md:col-span-3 space-y-6">
              {/* Calendar Card */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Calendar</h2>
                <CalendarView onDateSelect={setSelectedDate} />
              </div>

              {/* Daily Summary */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Study Summary for {selectedDate.toDateString()}
                </h3>
                <p className="text-gray-500 text-sm">No data yet for this date.</p>
              </div>

              {/* Daily Goal Editable UI and Weekly Study Chart */}
              <div className="bg-white rounded-2xl shadow-md p-6 mt-6 max-w-4xl mx-auto text-center">
                <h3 className="text-lg font-semibold text-blue-700">Your Daily Study Goal</h3>
                {editingGoal ? (
                  <input
                    type="number"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(Number(e.target.value))}
                    onBlur={() => setEditingGoal(false)}
                    className="mt-2 px-4 py-1 border rounded w-24 text-center"
                  />
                ) : (
                  <p
                    className="text-xl font-bold text-blue-600 mt-2 cursor-pointer"
                    onClick={() => setEditingGoal(true)}
                    title="Click to edit"
                  >
                    {dailyGoal} minutes
                  </p>
                )}
              </div>
              <WeeklyChart dailyGoal={dailyGoal} />
            </div>
          </div>
        </div>
        {isTimerActive && (
          <div
            ref={timerSectionRef}
            className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 text-white flex flex-col items-center justify-center px-6 py-32 space-y-10"
          >
            <h2 className="text-xl sm:text-2xl md:text-4xl font-semibold text-blue-200 tracking-widest text-center uppercase">
              Studying: {modules.find(m => m.id === selectedModuleId)?.name || 'Module'}
            </h2>
            <div className="text-[3.5rem] sm:text-[4rem] md:text-[6rem] lg:text-[8rem] xl:text-[10rem] font-bold text-white font-poppins tracking-widest drop-shadow-xl">
              {formatTime(elapsed)}
            </div>
            <p className="text-md sm:text-lg md:text-xl text-blue-300 font-medium italic">
              20 mins more to complete 10 hrs today
            </p>
            <button
              onClick={stopTimer}
              disabled={isSaving}
              className="mt-6 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-wait px-8 py-3 rounded-full text-white font-semibold text-lg transition shadow-lg tracking-wide"
            >
              {isSaving ? 'Saving…' : 'Stop'}
            </button>
          </div>
        )}
      </>
  );
};

export default LandingPage;