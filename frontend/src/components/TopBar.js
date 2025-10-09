import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { apiOrigin, resolveApiPath } from '../services/api';

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const showUser = !path.startsWith('/login') && !path.startsWith('/register');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null;
  const showUserInfo = token && username && showUser;
  const apiBase = apiOrigin;
  const [avatarUrl, setAvatarUrl] = useState(() =>
    (typeof window !== 'undefined' && localStorage.getItem('profilePictureUrl')) || ''
  );

  const normalizeImageUrl = (url) => {
    return resolveApiPath(url);
  };

  useEffect(() => {
    if (!showUserInfo) {
      setAvatarUrl('');
      return;
    }

    const handleAvatarEvent = (event) => {
      setAvatarUrl(event.detail || '');
    };
    window.addEventListener('profile-picture-updated', handleAvatarEvent);
    return () => window.removeEventListener('profile-picture-updated', handleAvatarEvent);
  }, [showUserInfo]);

  useEffect(() => {
    if (!showUserInfo) return;
    if (avatarUrl) return;

    api
      .get('/users/profile')
      .then((res) => {
        const url = normalizeImageUrl(res.data?.profilePictureUrl);
        if (typeof window !== 'undefined') {
          if (url) {
            localStorage.setItem('profilePictureUrl', url);
          } else {
            localStorage.removeItem('profilePictureUrl');
          }
          window.dispatchEvent(new CustomEvent('profile-picture-updated', { detail: url || '' }));
        }
        setAvatarUrl(url);
      })
      .catch(() => {});
  }, [showUserInfo, avatarUrl, apiBase, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('profilePictureUrl');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('profile-picture-updated', { detail: '' }));
    }
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
            <div
              onClick={() => navigate('/profile')}
              className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-full font-semibold cursor-pointer hover:ring-2 hover:ring-blue-400 overflow-hidden"
              title="Profile"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                username?.charAt(0).toUpperCase()
              )}
            </div>
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
