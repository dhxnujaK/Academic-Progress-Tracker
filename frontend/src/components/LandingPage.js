import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarView from './CalendarView';
import TopBar from './TopBar';
import WeeklyChart from './WeeklyChart';
import api from '../services/api';

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

  // Daily totals (in seconds) from backend
  const [moduleToday, setModuleToday] = useState(0);
  const [allToday, setAllToday] = useState(0);
  // Snapshot totals when a session starts, so subsequent sessions keep adding correctly
  const [baseModuleToday, setBaseModuleToday] = useState(0);
  const [baseAllToday, setBaseAllToday] = useState(0);
  // Day breakdown for summary and calendar heat data
  const [dayBreakdown, setDayBreakdown] = useState({ date: '', totals: [], allSeconds: 0 });
  const [heatmapMinutes, setHeatmapMinutes] = useState({});
  // GPA overview
  const [cgpa, setCgpa] = useState(null);
  const [finishedSgpas, setFinishedSgpas] = useState([]);

  const quickActions = [
    {
      label: 'Register Semester',
      description: 'Add new semesters to organize your modules and grades.',
      action: () => navigate('/register-semester'),
      accent: 'bg-gradient-to-br from-blue-500 to-indigo-500',
      pillText: 'Semester setup',
      pillTone: 'bg-blue-50 text-blue-600 border border-blue-100',
    },
    {
      label: 'Register Module',
      description: 'Add new courses to track study progress.',
      action: () => navigate('/register-module'),
      accent: 'bg-gradient-to-br from-emerald-500 to-teal-500',
      pillText: 'Module manager',
      pillTone: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    },
  ];

  useEffect(() => {
    fetchModules();
  }, []);

  // Load GPA/SGPA overview
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/grades/overview');
        setCgpa(res.data?.cgpa ?? null);
        const list = Array.isArray(res.data?.semesters) ? res.data.semesters : [];
        setFinishedSgpas(list.filter(s => s.finished && s.sgpa != null));
      } catch (e) {
        // ignore
      }
    };
    load();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await api.get('/modules/current-semester');
      setModules(res.data);
    } catch (err) {
      console.error('Error fetching modules for active semester:', err);
    }
  };

  // grade management now lives on a dedicated page (/grades)

  const fetchTodaySummary = async (moduleId) => {
    try {
      const res = await api.get('/study-sessions/today-summary', {
        params: moduleId ? { moduleId } : undefined
      });
      setModuleToday(res.data.moduleSeconds || 0);
      setAllToday(res.data.allSeconds || 0);
    } catch (e) {
      console.error('Failed to fetch today summary', e);
    }
  };

  const toLocalDateISO = (dt) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const fetchDayBreakdown = async (dateISO) => {
    try {
      const res = await api.get('/study-sessions/by-day', {
        params: { date: dateISO }
      });
      setDayBreakdown(res.data || { date: dateISO, totals: [], allSeconds: 0 });
      setHeatmapMinutes((prev) => ({ ...prev, [dateISO]: Math.round(((res.data?.allSeconds) || 0) / 60) }));
    } catch (_) {
      // ignore
    }
  };

  const startTimer = () => {
    if (!selectedModuleId) return; // guard
    // Capture the current totals as a base so new sessions add on top
    setBaseModuleToday(moduleToday);
    setBaseAllToday(allToday);
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
    setIsSaving(true);
    try {
      await api.post('/study-sessions', {
        moduleId: selectedModuleId,
        startTime: startTime?.toISOString(),
        endTime: endTime.toISOString()
      });

      setModuleToday((prev) => prev + elapsed);
      setAllToday((prev) => prev + elapsed);
      // Refresh daily totals after persisting (reconcile with backend)
      fetchTodaySummary(selectedModuleId);
      // Refresh the day breakdown and heatmap for the session date
      const dISO = toLocalDateISO(endTime);
      fetchDayBreakdown(dISO);
    } catch (err) {
      console.error('Failed to save study session:', err);

    } finally {
      setIsSaving(false);
      setStartTime(null);
      setElapsed(0);
      setIntervalId(null);
      setIsTimerActive(false);
      // Reset bases; fresh bases will be captured on next start
      setBaseModuleToday(0);
      setBaseAllToday(0);
    }
  };

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Load day breakdown whenever the selected date changes
  useEffect(() => {
    const load = async () => {
      try {
        const d = toLocalDateISO(selectedDate);
        const res = await api.get('/study-sessions/by-day', {
          params: { date: d }
        });
        setDayBreakdown(res.data || { date: d, totals: [], allSeconds: 0 });
        setHeatmapMinutes((prev) => ({ ...prev, [d]: Math.round(((res.data?.allSeconds) || 0) / 60) }));
      } catch (e) {
        setDayBreakdown({ date: toLocalDateISO(selectedDate), totals: [], allSeconds: 0 });
      }
    };
    load();
  }, [selectedDate]);

  // Initial month heatmap (current month)
  useEffect(() => {
    const load = async () => {
      try {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
        const res = await api.get('/study-sessions/heatmap', {
          params: { start, end }
        });
        const mins = Object.fromEntries(Object.entries(res.data || {}).map(([k, v]) => [k, Math.round((v || 0) / 60)]));
        setHeatmapMinutes(mins);
      } catch (e) {}
    };
    load();
  }, []);

  // When module selection changes, update today’s summary
  useEffect(() => {
    if (selectedModuleId) {
      fetchTodaySummary(selectedModuleId);
    } else {
      setModuleToday(0);
      fetchTodaySummary(null);
    }

    setBaseModuleToday(0);
    setBaseAllToday(0);

  }, [selectedModuleId]);

  return (
      <>
        <TopBar />
        <div className="min-h-screen relative overflow-hidden pt-24 px-4">
          {/* Themed background (matches registration pages) */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(40%_30%_at_10%_10%,rgba(59,130,246,0.12),transparent),radial-gradient(30%_30%_at_90%_0%,rgba(16,185,129,0.12),transparent),linear-gradient(to_bottom,rgba(241,245,249,1),rgba(248,250,252,1))]" />
            <div className="absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.35]" />
          </div>

          {/* Header */}
          <section className="mx-auto max-w-7xl px-1 sm:px-2">
            <div className="rounded-2xl border bg-white/80 backdrop-blur shadow-sm px-6 sm:px-8 py-6 mb-6 flex items-center justify-between">
              <div>
                <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">Dashboard</span>
                <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">Welcome back{username ? `, ${username}` : ''}</h1>
                <p className="mt-1.5 text-sm text-slate-600">Track study, manage modules, and keep your grades tidy.</p>
              </div>
              <div className="hidden md:block text-right text-xs text-slate-500">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* LEFT PANEL */}
            <div className="col-span-1 space-y-6">
              {/* GPA Summary */}
              <div className="rounded-2xl border bg-white/80 backdrop-blur shadow-sm p-6 text-center cursor-pointer min-h-[140px] flex flex-col items-center justify-center" onClick={() => navigate('/grades')} title="Manage grades">
                <h3 className="text-lg font-semibold text-gray-700">Your CGPA</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{cgpa != null ? cgpa.toFixed(2) : '—'}</p>
                <p className="text-sm text-gray-500">Tap to manage grades</p>
              </div>

              {/* Finished semesters SGPA list (left side under CGPA) */}
              <div className="rounded-2xl border bg-white/80 backdrop-blur shadow-sm p-6 min-h-[200px]">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Finished Semesters (SGPA)</h3>
                {finishedSgpas.length === 0 ? (
                  <p className="text-sm text-gray-500">No finished semesters with grades yet.</p>
                ) : (
                  <ul className="divide-y">
                    {finishedSgpas.map(s => (
                      <li key={s.semesterId} className="py-2 flex items-center justify-between text-sm">
                        <span className="text-slate-700">{s.name || `Semester ${s.number}`}</span>
                        <span className="font-semibold text-slate-900">{Number(s.sgpa).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Study Timer */}
              <div className="rounded-2xl border bg-white/80 backdrop-blur shadow-sm p-6 text-center space-y-3 min-h-[170px] flex flex-col justify-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Study Timer</h3>
                <select
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:opacity-60"
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  aria-label="Choose a module to start timing"
                >
                  <option value="" disabled>
                    Select a module
                  </option>
                  {modules && modules.length > 0 ? (
                    modules.map((mod) => {
                      const code = mod.code || '';
                      const name = mod.name || '';
                      const label = code && name ? `${code} : ${name}` : (code || name || 'Module');
                      return (
                        <option key={mod.id} value={mod.id}>{label}</option>
                      );
                    })
                  ) : (
                    <option value="" disabled>
                      No modules found for the active semester
                    </option>
                  )}
                </select>
                <button
                  onClick={startTimer}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm w-full transition shadow-sm"
                  disabled={!selectedModuleId}
                  aria-disabled={!selectedModuleId}
                  title={!selectedModuleId ? 'Select a module to start timing' : 'Start timing your study session'}
                >
                  Start
                </button>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl border bg-white/80 backdrop-blur shadow-sm p-6 min-h-[160px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Quick Actions</h3>
                  <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600">
                    Shortcuts
                  </span>
                </div>
                <div className="space-y-3">
                  {quickActions.map((qa) => (
                      <button
                          key={qa.label}
                          onClick={qa.action}
                          className="group relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm ${qa.accent}`}>
                              {qa.label.split(' ')[1]?.charAt(0) ?? '•'}
                            </span>
                            <div className="space-y-0.5">
                              <p className="text-sm font-semibold text-slate-900">{qa.label}</p>
                              <p className="text-xs text-slate-500">{qa.description}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${qa.pillTone}`}>
                            {qa.pillText}
                          </span>
                        </div>
                        <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                              aria-hidden="true">
                          <span className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
                        </span>
                      </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="col-span-1 md:col-span-3 space-y-6">
              {/* Calendar Card */}
              <div className="rounded-2xl border bg-white/80 backdrop-blur shadow-sm p-6">
                <CalendarView onDateSelect={setSelectedDate} studyData={heatmapMinutes} dailyGoalMinutes={720} />
              </div>

              {/* Daily Summary */}
              <div className="rounded-2xl border bg-white/80 backdrop-blur shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Study Summary for {selectedDate.toDateString()}
                </h3>
                {(!dayBreakdown || !dayBreakdown.totals || dayBreakdown.totals.length === 0) ? (
                  <p className="text-gray-500 text-sm">No data yet for this date.</p>
                ) : (
                  <ul className="divide-y">
                    {dayBreakdown.totals.map((t) => (
                      <li key={t.moduleId} className="py-2 flex items-center justify-between text-sm">
                        <span className="text-slate-700">{(t.code && t.name) ? `${t.code} : ${t.name}` : (t.code || t.name)}</span>
                        <span className="font-semibold text-slate-900">{formatTime(t.seconds)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              

              {/* Daily Goal */}
              <div className="rounded-2xl border bg-white/80 backdrop-blur shadow-sm p-6 mt-6 text-center min-h-[140px] flex flex-col items-center justify-center">
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
              {/* Weekly Chart */}
              <div className="rounded-2xl border bg-white/80 backdrop-blur shadow-sm p-6">
                <WeeklyChart dailyGoal={dailyGoal} />
              </div>
            </div>
          </div>
        </div>
        {isTimerActive && (
          <div
            ref={timerSectionRef}
            className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 text-white flex flex-col items-center justify-center px-6 py-32 space-y-10"
          >
            <h2 className="text-xl sm:text-2xl md:text-4xl font-semibold text-blue-200 tracking-widest text-center uppercase">
              {(function(){
                const m = modules.find(m => String(m.id) === String(selectedModuleId));
                if (!m) return 'Module';
                const code = m.code || '';
                const name = m.name || '';
                return code && name ? `${code} : ${name}` : (code || name || 'Module');
              })()}
            </h2>
            <div className="text-[3.5rem] sm:text-[4rem] md:text-[6rem] lg:text-[8rem] xl:text-[10rem] font-bold text-white font-poppins tracking-widest drop-shadow-xl">
              {formatTime(elapsed)}
            </div>
            {/* Small live stats (exclude session; big timer shows it) */}
            <div className="text-blue-200/90 text-sm sm:text-base font-medium flex flex-col items-center gap-1">
              <div>Current module today: <span className="text-white/95 font-semibold">{formatTime(baseModuleToday + elapsed)}</span></div>
              <div>All modules today: <span className="text-white/95 font-semibold">{formatTime(baseAllToday + elapsed)}</span></div>
            </div>
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
