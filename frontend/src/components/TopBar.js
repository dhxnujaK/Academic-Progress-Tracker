import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const showUser = !path.startsWith('/login') && !path.startsWith('/register');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null;
  const showUserInfo = token && username && showUser;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className="w-full fixed top-0 left-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1
          className="text-3xl font-bold text-blue-700 tracking-tight cursor-pointer"
          onClick={() => {
            const token = localStorage.getItem('token');
            if (token) {
              navigate('/landing');
            } else {
              navigate('/login'); // end to login if not logged in
            }
          }}
        >
          TrackMate
        </h1>
        <div className="text-sm text-gray-500">Your Study Partner</div>
        {showUserInfo && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">Hi, {username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;