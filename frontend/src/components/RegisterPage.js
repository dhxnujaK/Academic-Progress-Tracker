

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    university: '',
    universityRegNumber: '',
    batch: '',
    alYear: '',
    course: ''
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/auth/register', formData);
      setSuccess(res.data);
      setError('');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setSuccess('');
      setError(err.response?.data || 'Registration failed');
    }
  };

  return (
    <>
        <TopBar/>
      <div className="min-h-screen pt-24 bg-gradient-to-br from-cyan-100 to-blue-200 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Create Your Account</h2>

          {success && <p className="text-green-600 text-center mb-2">{success}</p>}
          {error && <p className="text-red-600 text-center mb-2">{error}</p>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            {[
              ['name', 'Full Name'],
              ['username', 'Username'],
              ['email', 'Email'],
              ['password', 'Password', 'password'],
              ['university', 'University'],
              ['universityRegNumber', 'University Reg. Number'],
              ['batch', 'Batch'],
              ['alYear', 'A/L Year'],
              ['course', 'Course'],
            ].map(([name, label, type = 'text']) => (
              <input
                key={name}
                name={name}
                type={type}
                placeholder={label}
                value={formData[name]}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            ))}

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Register
            </button>
            <p className="text-center text-sm text-gray-600 mt-2">
              Already have an account?{' '}
              <span
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => navigate('/login')}
              >
                Login here
              </span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;