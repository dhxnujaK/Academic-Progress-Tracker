import React, { useState } from 'react';
import axios from 'axios';

const SemesterRegistration = () => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('User not authenticated. Please log in.');
                return;
            }

            const response = await axios.post(
                'http://localhost:8080/api/semesters',
                { name, startDate, endDate },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage(`✅ Semester "${response.data.name}" registered successfully.`);
            setName('');
            setStartDate('');
            setEndDate('');
        } catch (err) {
            const msg = err.response?.data || 'Something went wrong. Try again.';
            setError(`❌ ${msg}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center px-4 py-10">
            <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full">
                <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center mb-6">
                    Register a New Semester
                </h2>

                {message && <div className="text-green-700 font-medium mb-4 text-center">{message}</div>}
                {error && <div className="text-red-600 font-medium mb-4 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Semester 4"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        Register Semester
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SemesterRegistration;