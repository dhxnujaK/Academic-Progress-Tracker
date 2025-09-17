import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from './TopBar';

const GradeManager = () => {
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [semesterId, setSemesterId] = useState('');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchSemesters = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/semesters', { headers: authHeaders });
      setSemesters(res.data || []);
    } catch (e) {
      console.error('Failed to load semesters', e);
    }
  };

  const fetchModules = async (semId) => {
    if (!semId) return;
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/modules', { headers: authHeaders, params: { semesterId: semId } });
      setModules(res.data || []);
    } catch (e) {
      console.error('Failed to load modules', e);
    } finally {
      setLoading(false);
    }
  };

  const updateGrade = async (moduleId, grade) => {
    try {
      await axios.put(`http://localhost:8080/api/modules/${moduleId}`, { grade }, { headers: authHeaders });
      await fetchModules(semesterId);
    } catch (e) {
      console.error('Failed to update grade', e);
    }
  };

  useEffect(() => { fetchSemesters(); }, []);
  useEffect(() => { if (semesterId) fetchModules(semesterId); }, [semesterId]);

  return (
    <>
      <TopBar />
      <div className="min-h-screen relative overflow-hidden pt-24 px-4">
        {/* Themed background (matches registration pages) */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(40%_30%_at_10%_10%,rgba(59,130,246,0.12),transparent),radial-gradient(30%_30%_at_90%_0%,rgba(16,185,129,0.12),transparent),linear-gradient(to_bottom,rgba(241,245,249,1),rgba(248,250,252,1))]" />
          <div className="absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.35]" />
        </div>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="rounded-2xl border bg-white/80 backdrop-blur shadow-sm p-6 flex items-center justify-between">
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">Grades</span>
              <h1 className="mt-2 text-2xl font-bold text-slate-900">Manage Module Grades</h1>
              <p className="mt-1 text-sm text-slate-600">Choose a semester to view its modules and update letter grades.</p>
            </div>
            <Link to="/landing" className="rounded-lg border px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50">Back to main</Link>
          </div>

          <div className="rounded-2xl border bg-white/80 backdrop-blur shadow-sm p-6">
            <div className="mb-4 flex items-center gap-3">
              <label className="text-sm text-slate-700">Semester</label>
              <select
                className="rounded-lg border px-3 py-2 text-sm bg-white"
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
              >
                <option value="">Select semester</option>
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {!semesterId ? (
              <p className="text-sm text-slate-500">Pick a semester to see modules.</p>
            ) : loading ? (
              <p className="text-sm text-slate-500">Loading modules…</p>
            ) : modules.length === 0 ? (
              <p className="text-sm text-slate-500">No modules registered for this semester.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-2">Module</th>
                      <th className="py-2">Credits</th>
                      <th className="py-2">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map(m => (
                      <tr key={m.id} className="border-t">
                        <td className="py-2 pr-3 text-slate-800">{(m.code && m.name) ? `${m.code} : ${m.name}` : (m.code || m.name)}</td>
                        <td className="py-2 pr-3">{m.credits}</td>
                        <td className="py-2">
                          <select
                            className="rounded-md border px-2 py-1"
                            value={m.grade || ''}
                            onChange={(e) => updateGrade(m.id, e.target.value)}
                          >
                            <option value="">—</option>
                            {['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','F','I','S','U'].map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GradeManager;
