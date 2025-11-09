import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';

import api from '../services/api';

// Normalize various backend error payloads to a user-friendly string
const getErrorMessage = (err) => {
  if (!err) return 'Something went wrong. Try again.';
  const data = err.response?.data;
  if (typeof data === 'string') return data;
  if (data?.message) return data.message; 
  if (data?.error) return data.error;     
  if (err.message) return err.message;    
  return 'Something went wrong. Try again.';
};

const SemesterRegistration = () => {
  const [number, setNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [semesters, setSemesters] = useState([]);

  // edit & delete controls
  const [editing, setEditing] = useState(null); 
  const [editNumber, setEditNumber] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // simple client-side checks for a better UX
  const parsedNumber = useMemo(() => (number === '' ? '' : Number(number)), [number]);
  const numError =
    parsedNumber !== '' && (Number.isNaN(parsedNumber) || parsedNumber < 1)
      ? 'Semester number must be a positive integer'
      : '';

  const dateError =
    startDate && endDate && new Date(endDate) < new Date(startDate)
      ? 'End date must be on or after the start date'
      : '';

  const canSubmit = !numError && !dateError && number !== '' && startDate && endDate;

  const loadSemesters = async () => {
    try {
      const res = await api.get('/semesters');
      setSemesters(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch semesters', e);
      setError(getErrorMessage(e));
    }
  };

  useEffect(() => {
    loadSemesters();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!canSubmit) return;

    try {
      const response = await api.post('/semesters', {
        number: parseInt(number, 10),
        startDate,
        endDate,
      });

      setMessage(`Semester ${response.data.number} registered successfully.`);
      setNumber('');
      setStartDate('');
      setEndDate('');

      await loadSemesters();

      // auto-clear the toast after a moment
      setTimeout(() => setMessage(''), 2400);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const fmtDate = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return d;
    }
  };

  const now = new Date();
  const statusFor = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    if (now < s) return { label: 'Upcoming', tone: 'bg-amber-50 text-amber-800 border-amber-200' };
    if (now > e) return { label: 'Completed', tone: 'bg-slate-50 text-slate-800 border-slate-200' };
    return { label: 'Active', tone: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  };

  // Open the edit dialog populated with the semester's current values
  const openEdit = (s) => {
    setEditing({ id: s.id, number: s.number, startDate: s.startDate, endDate: s.endDate });
    setEditNumber(String(s.number ?? ''));
    // Ensure date value is in YYYY-MM-DD for <input type="date">
    const toYMD = (d) => {
      if (!d) return '';
      const dt = new Date(d);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };
    setEditStartDate(toYMD(s.startDate));
    setEditEndDate(toYMD(s.endDate));
  };

  const closeEdit = () => {
    setEditing(null);
    setEditNumber('');
    setEditStartDate('');
    setEditEndDate('');
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await api.put(`/semesters/${editing.id}`, {
        number: parseInt(editNumber, 10),
        startDate: editStartDate,
        endDate: editEndDate,
      });
      closeEdit();
      await loadSemesters();
      setMessage('Semester updated successfully.');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setError(getErrorMessage(err) || 'Update failed. Please try again.');
    }
  };

  const askDelete = (id) => setDeletingId(id);
  const cancelDelete = () => setDeletingId(null);

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/semesters/${deletingId}`);
      setDeletingId(null);
      await loadSemesters();
      setMessage('Semester deleted.');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setError(getErrorMessage(err) || 'Delete failed. Please try again.');
    }
  };

return (
    <div className="min-h-screen relative overflow-hidden">
      <TopBar />
      {/* Soft gradient + grid background (no emojis) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(40%_30%_at_10%_10%,rgba(59,130,246,0.10),transparent),radial-gradient(30%_30%_at_90%_0%,rgba(16,185,129,0.10),transparent),linear-gradient(to_bottom,rgba(241,245,249,1),rgba(248,250,252,1))]" />
        <div className="absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.35]" />
      </div>

      {/* Header panel */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-24">
        <div className="rounded-2xl border bg-white/80 backdrop-blur shadow-sm px-6 sm:px-8 py-6 flex items-start justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              Semester workspace
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">Semester Registration</h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Create, edit, and organize your semesters. Add, edit, or remove semester periods as needed.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              to="/landing"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
            >
              Back to main
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* toast messages */}
        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {typeof error === 'string' ? error : String(error)}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form card */}
          <div className="rounded-2xl border bg-white/70 backdrop-blur shadow-sm overflow-hidden">
            <div className="border-b px-6 py-5">
              <h2 className="text-sm font-semibold tracking-wide text-slate-900">Register a new semester</h2>
              <p className="text-xs text-slate-500 mt-1">All fields are required.</p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
              <div>
                <label htmlFor="sem-number" className="block text-xs font-medium text-slate-600 mb-1">
                  Semester number
                </label>
                <input
                  id="sem-number"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 ${numError ? 'border-red-300 focus:ring-red-400/50' : ''}`}
                  placeholder="Ex:4"
                  required
                />
                <p className={`mt-1 text-[11px] ${numError ? 'text-red-600' : 'text-slate-400'}`}>
                  {numError}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="sem-start" className="block text-xs font-medium text-slate-600 mb-1">
                    Start date
                  </label>
                  <input
                    id="sem-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="sem-end" className="block text-xs font-medium text-slate-600 mb-1">
                    End date
                  </label>
                  <input
                    id="sem-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 ${dateError ? 'border-red-300 focus:ring-red-400/50' : ''}`}
                    required
                  />
                  <p className={`mt-1 text-[11px] ${dateError ? 'text-red-600' : 'text-slate-400'}`}>
                    {dateError }
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all hover:bg-blue-700 focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Register semester
              </button>
            </form>
          </div>

          {/* Registered semesters */}
          <section className="rounded-2xl border bg-white/80 backdrop-blur shadow-sm overflow-hidden">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Your semesters</div>
              <div className="flex items-center gap-3">
                <select className="hidden sm:block rounded-lg border px-3 py-2 text-xs text-slate-700 bg-white">
                  <option>All semesters</option>
                </select>
                <input
                  type="text"
                  placeholder="Search by number or date…"
                  className="rounded-lg border px-3 py-2 text-xs text-slate-700 bg-white w-44 sm:w-64"
                  disabled
                />
              </div>
            </div>
            <div className="p-6">
              {(!semesters || semesters.length === 0) ? (
                <div className="rounded-xl border bg-white/60 backdrop-blur px-5 py-8 text-center text-sm text-slate-500">
                  No semesters yet. Create your first semester above.
                </div>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
                  {semesters
                    .slice()
                    .sort((a, b) => (a.number ?? 0) - (b.number ?? 0))
                    .map((s) => {
                      const stat = statusFor(s.startDate, s.endDate);
                      return (
                        <li
                            key={s.id}
                            className="group rounded-2xl border bg-white/80 backdrop-blur shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div className="p-6 flex flex-col h-full">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="text-lg font-semibold text-slate-900">
                                Semester {s.number}
                              </h4>
                              <span
                                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${stat.tone}`}
                              >
                                {stat.label}
                              </span>
                            </div>

                            {/* Dates */}
                            <div className="flex-1 space-y-2 text-sm text-slate-600">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Start</span>
                                <span className="font-medium">{fmtDate(s.startDate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">End</span>
                                <span className="font-medium">{fmtDate(s.endDate)}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-5 flex justify-end gap-2">
                              <button
                                  type="button"
                                  onClick={() => openEdit(s)}
                                  className="rounded-md border px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              >
                                Edit
                              </button>
                              <button
                                  type="button"
                                  onClick={() => askDelete(s.id)}
                                  className="rounded-md border px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Edit dialog */}
        {editing && (
          <div className="fixed inset-0 z-20 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={closeEdit} />
            <div className="relative w-full max-w-md rounded-2xl border bg-white shadow-xl">
              <div className="px-5 py-4 border-b">
                <h4 className="text-sm font-semibold text-slate-900">Edit semester</h4>
              </div>
              <form onSubmit={submitEdit} className="px-5 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Semester number</label>
                  <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    required
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Start date</label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      required
                      className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">End date</label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      required
                      className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={closeEdit} className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Save changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        {deletingId && (
          <div className="fixed inset-0 z-20 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={cancelDelete} />
            <div className="relative w-full max-w-sm rounded-2xl border bg-white shadow-xl">
              <div className="px-5 py-4 border-b">
                <h4 className="text-sm font-semibold text-slate-900">Delete semester</h4>
              </div>
              <div className="px-5 py-5 text-sm text-slate-700">
                Are you sure you want to delete this semester? This action cannot be undone.
              </div>
              <div className="px-5 pb-5 flex justify-end gap-2">
                <button type="button" onClick={cancelDelete} className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
                <button type="button" onClick={confirmDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SemesterRegistration;
