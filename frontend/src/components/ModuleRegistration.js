import React, { useEffect, useMemo, useState } from 'react';
import TopBar from './TopBar';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ModuleRegistration = () => {
  // form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState('');
  const [semesterId, setSemesterId] = useState('');

  // data state
  const [semesters, setSemesters] = useState([]);
  const [modules, setModules] = useState([]);

  // ui state
  const [loadingSemesters, setLoadingSemesters] = useState(true);
  const [loadingModules, setLoadingModules] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState(null);
  const [query, setQuery] = useState('');
  const [viewSemesterId, setViewSemesterId] = useState(''); 
  // simple client-side validation hints
  const creditError = credits !== '' && Number(credits) < 1 ? 'Credits must be at least 1' : '';
  const codeError = code && !/^[A-Za-z0-9-_.]+$/.test(code) ? 'Use letters, numbers, dash, underscore, or dot' : '';

  // Edit/Delete state
  const [editing, setEditing] = useState(null); 
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // normalize varying backend shapes so the UI can filter reliably
  const normalizeModule = (m) => ({
    ...m,
    credits: m.credits ?? m.moduleCredits ?? m.module_credits ?? 0,
    semesterId:
        m.semesterId ??
        m.semester?.id ??
        m.semester_id ??
        m.moduleSemester ??
        m.module_semester ??
        '',
  });

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchSemesters(), fetchModules()]);
    };
    load();

  }, []);

  const fetchSemesters = async () => {
    try {
      setLoadingSemesters(true);
      const res = await api.get('/semesters');
      setSemesters(res.data || []);
    } catch (err) {
      console.error('Error fetching semesters:', err);
    } finally {
      setLoadingSemesters(false);
    }
  };

  const fetchModules = async () => {
    try {
      setLoadingModules(true);
      const res = await api.get('/modules');
      setModules((res.data || []).map(normalizeModule));
    } catch (err) {
      console.error('Error fetching modules:', err);
    } finally {
      setLoadingModules(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrors(null);

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      credits: Number(credits),
      semesterId: semesterId ? Number(semesterId) : null,
    };

    setSubmitting(true);
    try {
      const res = await api.post('/modules', payload);
      const savedRaw = res?.data || {};
      const saved = normalizeModule({
        ...savedRaw,
        id: savedRaw.id,
        name: savedRaw.name ?? payload.name,
        code: savedRaw.code ?? payload.code,
        credits: savedRaw.credits ?? payload.credits,
        semesterId: savedRaw.semesterId ?? payload.semesterId ?? '',
      });
      if (saved.id != null) {
        setModules((prev) => {
          const withoutNew = prev.filter((m) => m.id !== saved.id);
          const updated = [...withoutNew, saved];
          updated.sort((a, b) => {
            const left = (a.name || a.code || '').toString().toLowerCase();
            const right = (b.name || b.code || '').toString().toLowerCase();
            return left.localeCompare(right);
          });
          return updated;
        });
      } else {
        await fetchModules();
      }
      setMessage('Module added');
      setName('');
      setCode('');
      setCredits('');
      setSemesterId('');
      fetchModules();

      if (payload.semesterId != null) {
        setViewSemesterId(String(payload.semesterId));
      }
    } catch (err) {
      console.error(err);
      const data = err?.response?.data;
      if (data?.errors) setErrors(data.errors);
      setMessage(data?.message || 'Module registration failed');
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(''), 2400);
    }
  };

  const filteredModules = useMemo(() => {
    let base = modules;

    if (viewSemesterId !== '') {
      base = base.filter((m) => String(m.semesterId) === String(viewSemesterId));
    }

    if (!query) return base;
    const q = query.toLowerCase();
    return base.filter((m) =>
        [m.name, m.code, String(m.credits)]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [modules, query, viewSemesterId]);

  const currentSemName = (id) =>
      semesters.find((s) => String(s.id) === String(id))?.name ?? '—';


  // Edit/Delete handlers
  const openEdit = (m) => setEditing({ ...m });
  const closeEdit = () => setEditing(null);

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSavingEdit(true);
    setMessage('');
    try {
      const payload = {
        name: editing.name?.trim(),
        code: editing.code?.trim().toUpperCase(),
        credits: Number(editing.credits),
        semesterId: editing.semesterId ? Number(editing.semesterId) : null,
      };
      await api.put(`/modules/${editing.id}`, payload);
      setMessage('Module updated');
      await fetchModules();
      closeEdit();
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.message || 'Update failed');
    } finally {
      setSavingEdit(false);
      setTimeout(() => setMessage(''), 2400);
    }
  };

  const askDelete = (id) => {
    setDeletingId(id);
  };

  const cancelDelete = () => setDeletingId(null);

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/modules/${deletingId}`);
      setModules((prev) => prev.filter((m) => m.id !== deletingId));
      setMessage('Module deleted');
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
      setTimeout(() => setMessage(''), 2400);
    }
  };

  return (
      <div className="min-h-screen relative overflow-hidden">
        {/* background with modern soft gradients and subtle grid */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(40%_30%_at_10%_10%,rgba(59,130,246,0.12),transparent),radial-gradient(30%_30%_at_90%_0%,rgba(16,185,129,0.12),transparent),linear-gradient(to_bottom,rgba(241,245,249,1),rgba(248,250,252,1))]" />
          <div className="absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.35]" />
        </div>

        <TopBar />

        <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-24 pb-8">
          {/* Page header */}
          <div className="mb-6 rounded-2xl border bg-white/70 backdrop-blur shadow-sm p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-slate-700 bg-slate-50">Module workspace</span>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Module Registration</h1>
              <p className="mt-1 text-sm text-slate-600">Create, edit, and organize your modules by semester.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/landing" className="inline-flex items-center rounded-lg border px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Back to main
              </Link>
            </div>
          </div>
          {/* Toast */}
          {message && (
              <div className="fixed right-4 top-20 z-20">
                <div className="rounded-xl border bg-white/90 backdrop-blur shadow-lg px-4 py-3 text-sm text-slate-700">
                  {message}
                </div>
              </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Form card */}
            <section className="lg:col-span-2">
              <div className="rounded-2xl border bg-white/70 backdrop-blur shadow-sm">
                <div className="border-b px-5 py-4">
                  <h2 className="text-sm font-semibold tracking-wide text-slate-900">Register a new module</h2>
                  <p className="text-xs text-slate-500 mt-1">Fill the details below. All fields are required.</p>
                </div>

                {errors && (
                    <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <ul className="list-disc list-inside space-y-1">
                        {Object.entries(errors).map(([field, msg]) => (
                            <li key={field}><span className="font-medium">{field}</span>: {msg}</li>
                        ))}
                      </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="mod-name">Module name</label>
                    <div className="relative">
                      <input
                          id="mod-name"
                          type="text"
                          placeholder="Ex: Web Application Development"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="mod-code">Module code</label>
                      <div className="relative">
                        <input
                            id="mod-code"
                            type="text"
                            placeholder="Ex:EE4207"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            aria-invalid={!!codeError}
                            className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 uppercase ${codeError ? 'border-red-300 focus:ring-red-400/50' : ''}`}
                            onBlur={() => setCode((c) => c.trim().toUpperCase())}
                        />
                      </div>
                      <p className={`mt-1 text-[11px] ${codeError ? 'text-red-600' : 'text-slate-400'}`}>
                        {codeError}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="mod-credits">Credits</label>
                      <div className="relative">
                        <input
                            id="mod-credits"
                            type="number"
                            placeholder="Ex:2"
                            value={credits}
                            min={1}
                            onChange={(e) => setCredits(e.target.value)}
                            required
                            aria-invalid={!!creditError}
                            className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 ${creditError ? 'border-red-300 focus:ring-red-400/50' : ''}`}
                        />
                      </div>
                      <p className={`mt-1 text-[11px] ${creditError ? 'text-red-600' : 'text-slate-400'}`}>
                        {creditError}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="mod-sem">Semester</label>
                    <div className="relative">
                      <select
                          id="mod-sem"
                          value={semesterId}
                          onChange={(e) => {
                            setSemesterId(e.target.value);
                            setViewSemesterId(e.target.value);
                          }}
                          required
                          className="w-full appearance-none rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                      >
                        <option value="" disabled>
                          {loadingSemesters ? 'Loading semesters…' : 'Select semester'}
                        </option>
                        {!loadingSemesters &&
                            semesters.map((sem) => (
                                <option key={sem.id} value={sem.id}>
                                  {sem.name}
                                </option>
                            ))}
                      </select>
                    </div>
                  </div>

                  <button
                      type="submit"
                      disabled={submitting || !!creditError || !!codeError}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all hover:bg-blue-700 focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Saving…
                        </>
                    ) : (
                        <>
                          <span className="h-4 w-4 rounded-md bg-white/20" />
                          Add module
                        </>
                    )}
                  </button>
                </form>
              </div>
            </section>

            {/* List card */}
            <section className="lg:col-span-3">
              <div className="rounded-2xl border bg-white/70 backdrop-blur shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b px-5 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Your modules</h3>
                    <p className="text-xs text-slate-500">
                      {loadingModules ? 'Loading…' : `${filteredModules.length} of ${modules.length} shown`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Semester list filter */}
                    <div className="relative">
                      <select
                          value={viewSemesterId}
                          onChange={(e) => setViewSemesterId(e.target.value)}
                          className="w-40 sm:w-48 appearance-none rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="">All semesters</option>
                        {semesters.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Search field */}
                    <div className="relative">
                      <input
                          type="text"
                          placeholder="Search by name, code, credits"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="w-full sm:w-72 rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Skeleton */}
                {loadingModules ? (
                    <ul className="p-5 grid grid-cols-1 gap-3">
                      {[...Array(4)].map((_, i) => (
                          <li key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
                      ))}
                    </ul>
                ) : filteredModules.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">
                      <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center"><div /></div>
                      <p className="text-sm">No modules match your search.</p>
                    </div>
                ) : (
                    <ul className="p-5 grid grid-cols-1 gap-3">
                      {filteredModules.map((mod) => (
                        <li
                          key={mod.id}
                          className="group rounded-xl border bg-white hover:shadow-md transition-shadow p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{mod.code}</span>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-slate-500">{currentSemName(mod.semesterId)}</span>
                              </div>
                              <h4 className="mt-1 text-sm font-semibold text-slate-900 truncate">{mod.name}</h4>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs font-medium">
                                {mod.credits} credit{Number(mod.credits) === 1 ? '' : 's'}
                              </span>
                              <button
                                type="button"
                                onClick={() => openEdit(mod)}
                                className="rounded-md border px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => askDelete(mod.id)}
                                className="rounded-md border px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                )}
              </div>
            </section>
          </div>
        {/* Edit modal */}
        {editing && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl border">
              <div className="border-b px-4 py-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">Edit module</h4>
                <button onClick={closeEdit} className="text-slate-500 text-sm hover:text-slate-700">Close</button>
              </div>
              <form onSubmit={submitEdit} className="px-4 py-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={editing.name || ''}
                    onChange={(e) => setEditing((m) => ({ ...m, name: e.target.value }))}
                    required
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Code</label>
                    <input
                      type="text"
                      value={editing.code || ''}
                      onChange={(e) => setEditing((m) => ({ ...m, code: e.target.value }))}
                      required
                      className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 uppercase"
                      onBlur={() => setEditing((m) => ({ ...m, code: (m.code || '').trim().toUpperCase() }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Credits</label>
                    <input
                      type="number"
                      min={1}
                      value={editing.credits ?? 0}
                      onChange={(e) => setEditing((m) => ({ ...m, credits: e.target.value }))}
                      required
                      className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Semester</label>
                  <select
                    value={editing.semesterId ?? ''}
                    onChange={(e) => setEditing((m) => ({ ...m, semesterId: e.target.value }))}
                    required
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                  >
                    <option value="" disabled>Select semester</option>
                    {semesters.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={closeEdit} className="rounded-md border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={savingEdit} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                    {savingEdit ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Delete confirm */}
        {deletingId && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-sm rounded-xl bg-white shadow-xl border p-5">
              <h4 className="text-sm font-semibold text-slate-900">Delete module?</h4>
              <p className="mt-1 text-sm text-slate-600">This action cannot be undone.</p>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={cancelDelete} className="rounded-md border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                <button onClick={confirmDelete} className="rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Delete</button>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
  );
};

export default ModuleRegistration;
