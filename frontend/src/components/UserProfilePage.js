import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserProfilePage = () => {
    const [user, setUser] = useState({
        fullName: '',
        username: '',
        email: '',
        dob: '',
        contact: '',
        university: '',
        graduationYear: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser({
                fullName: res.data.name,
                username: res.data.username,
                email: res.data.email,
                dob: res.data.dob || '',
                contact: res.data.telephone || '',
                university: res.data.university || '',
                graduationYear: res.data.graduationYear || ''
            });
        } catch (err) {
            console.error('Profile fetch failed:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:8080/api/users/profile', user, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('✅ Profile updated successfully.');
        } catch (err) {
            console.error('Update failed:', err);
            setMessage('❌ Failed to update profile.');
        }
    };

    const handleCancel = () => {
        fetchUserProfile();
        setMessage('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center px-4 py-10">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 space-y-6">
                <h2 className="text-3xl font-bold text-center text-blue-700">Your Profile</h2>

                {/* Profile Image Placeholder */}
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-blue-200 text-white flex items-center justify-center text-2xl font-bold">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                </div>

                {message && (
                    <p
                        className={`text-center font-medium ${
                            message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        name="fullName"
                        value={user.fullName}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="border px-4 py-2 rounded-lg"
                    />
                    <input
                        name="username"
                        value={user.username}
                        onChange={handleChange}
                        placeholder="Username"
                        className="border px-4 py-2 rounded-lg"
                    />
                    <input
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        placeholder="Email"
                        type="email"
                        className="border px-4 py-2 rounded-lg"
                    />
                    <input
                        name="dob"
                        value={user.dob}
                        onChange={handleChange}
                        placeholder="Date of Birth"
                        type="date"
                        className="border px-4 py-2 rounded-lg"
                    />
                    <input
                        name="contact"
                        value={user.contact}
                        onChange={handleChange}
                        placeholder="Contact Number"
                        className="border px-4 py-2 rounded-lg"
                    />
                    <input
                        name="university"
                        value={user.university}
                        onChange={handleChange}
                        placeholder="University"
                        className="border px-4 py-2 rounded-lg"
                    />
                    <input
                        name="graduationYear"
                        value={user.graduationYear}
                        onChange={handleChange}
                        placeholder="Graduation Year"
                        type="number"
                        className="border px-4 py-2 rounded-lg"
                    />

                    <div className="col-span-1 sm:col-span-2 flex justify-center gap-4 mt-4">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserProfilePage;