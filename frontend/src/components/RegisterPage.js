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
    degree: '',
    academicYear: '',
    graduationYear: '',
    isActive: true,
    role: 'STUDENT'
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
      const res = await axios.post('http://localhost:8080/api/users/register', formData);
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
        <TopBar />
        <div className="min-h-screen bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center px-4 py-10">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 w-full max-w-5xl">
            {/* Left: Welcome message */}
            <div className="bg-blue-600 text-white p-10 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4">Join TrackMate 🎓</h2>
              <p className="text-sm leading-relaxed">
                Track your academic modules, study sessions, and GPA with confidence.
                Your journey to better learning starts here.
              </p>
            </div>

            {/* Right: Registration form */}
            <div className="p-10 space-y-4 bg-white">
              <h3 className="text-2xl font-semibold text-blue-700 text-center mb-4">Create Your Account</h3>

              {success && <p className="text-green-600 text-center">{success}</p>}
              {error && <p className="text-red-600 text-center">{error}</p>}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ['name', 'Full Name'],
                  ['username', 'Username'],
                  ['email', 'Email'],
                  ['password', 'Password', 'password'],
                  ['university', 'University'],
                  ['universityRegNumber', 'University Reg. Number'],
                  ['batch', 'Batch'],
                  ['alYear', 'A/L Year'],
                  ['degree', 'Degree'],
                  ['academicYear', 'Academic Year'],
                  ['graduationYear', 'Graduation Year'],
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
                    className="col-span-1 sm:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Register
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-2">
                Already have an account?{' '}
                <span
                    className="text-blue-600 hover:underline cursor-pointer"
                    onClick={() => navigate('/login')}
                >
                Login here
              </span>
              </p>
            </div>
          </div>
        </div>
      </>
  );
};

export default RegisterPage;
