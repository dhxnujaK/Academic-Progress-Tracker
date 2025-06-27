import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ModuleRegistration = () => {
  const [moduleName, setModuleName] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [credit, setCredit] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [modules, setModules] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSemesters();
    fetchModules();
  }, []);

  const fetchSemesters = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/semesters');
      setSemesters(res.data);
    } catch (err) {
      console.error('Error fetching semesters:', err);
    }
  };

  const fetchModules = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/modules');
      setModules(res.data);
    } catch (err) {
      console.error('Error fetching modules:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/modules', {
        name: moduleName,
        code: moduleCode,
        credit,
        semesterId
      });
      setMessage('✅ Module registered successfully');
      setModuleName('');
      setModuleCode('');
      setCredit('');
      setSemesterId('');
      fetchModules();
    } catch (err) {
      console.error(err);
      setMessage('❌ Module registration failed');
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-100 to-blue-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl grid md:grid-cols-2 overflow-hidden">
          {/* Left Side – Form */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Register Module</h2>
            {message && (
                <p
                    className={`text-sm font-medium text-center mb-4 ${
                        message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                  {message}
                </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                  type="text"
                  placeholder="Module Name"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  required
                  className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
              />
              <input
                  type="text"
                  placeholder="Module Code"
                  value={moduleCode}
                  onChange={(e) => setModuleCode(e.target.value)}
                  required
                  className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
              />
              <input
                  type="number"
                  placeholder="Credit"
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  required
                  className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
              />
              <select
                  value={semesterId}
                  onChange={(e) => setSemesterId(e.target.value)}
                  required
                  className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Semester</option>
                {semesters.map((sem) => (
                    <option key={sem.id} value={sem.id}>
                      {sem.name}
                    </option>
                ))}
              </select>
              <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                Register Module
              </button>
            </form>
          </div>

          {/* Right Side – List */}
          <div className="p-8 bg-gray-50 overflow-y-auto">
            <h3 className="text-xl font-semibold text-blue-700 mb-4 text-center">Registered Modules</h3>
            {modules.length === 0 ? (
                <p className="text-sm text-center text-gray-500">No modules added yet.</p>
            ) : (
                <ul className="space-y-3 max-h-[400px] overflow-y-auto">
                  {modules.map((mod) => (
                      <li key={mod.id} className="bg-white rounded-lg shadow-sm p-4 border">
                        <div className="font-semibold text-gray-800">{mod.name}</div>
                        <div className="text-sm text-gray-500">{mod.code} — {mod.credit} credits</div>
                      </li>
                  ))}
                </ul>
            )}
          </div>
        </div>
      </div>
  );
};

export default ModuleRegistration;