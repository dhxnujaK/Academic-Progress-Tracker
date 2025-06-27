import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:8080/api/users/login', formData);
      const token = res.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('username', formData.identifier);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigate('/landing');
    } catch (err) {
      setError(err.response?.data || 'Login failed');
    }
  };

  return (
      <>
        <TopBar />
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center px-4 py-10">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 w-full max-w-4xl">
            {/* Left: Branding / Info */}
            <div className="bg-blue-600 text-white p-10 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
              <p className="text-sm leading-relaxed">
                TrackMate helps you stay focused on your academic goals. Let’s continue your journey.
              </p>
            </div>

            {/* Right: Login form */}
            <div className="p-10 space-y-6 bg-white">
              <h3 className="text-2xl font-semibold text-blue-700 text-center">Login to Your Account</h3>

              {error && <p className="text-red-600 text-center">{error}</p>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="identifier"
                    type="text"
                    placeholder="Username or Email"
                    value={formData.identifier}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Login
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-2">
                Don’t have an account?{' '}
                <span
                    className="text-blue-600 hover:underline cursor-pointer"
                    onClick={() => navigate('/register')}
                >
                Register now
              </span>
              </p>
            </div>
          </div>
        </div>
      </>
  );
};

export default LoginPage;