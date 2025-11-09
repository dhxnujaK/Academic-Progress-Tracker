import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { resolveApiPath } from '../services/api';

const UserProfilePage = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '', username: '', email: '',
    dob: '', telephone: '', university: '', degree: '',
    academicYear: '', graduationYear: '', batch: '', universityRegNumber: '', alYear: '',
    profilePictureUrl: ''
  });
  const [message, setMessage] = useState({ text: '', tone: '' });
  const [uploading, setUploading] = useState(false);

  const normalizeImageUrl = (url) => {
    return resolveApiPath(url);
  };

  const broadcastProfilePicture = (url) => {
    if (typeof window === 'undefined') return;
    if (url) {
      localStorage.setItem('profilePictureUrl', url);
    } else {
      localStorage.removeItem('profilePictureUrl');
    }
    window.dispatchEvent(new CustomEvent('profile-picture-updated', { detail: url || '' }));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      const p = res.data || {};
      const normalizedPicture = normalizeImageUrl(p.profilePictureUrl);
      setProfile({
        name: p.name || '', username: p.username || '', email: p.email || '',
        dob: p.dob || '', telephone: p.telephone || '', university: p.university || '', degree: p.degree || '',
        academicYear: p.academicYear ?? '', graduationYear: p.graduationYear ?? '', batch: p.batch || '', universityRegNumber: p.universityRegNumber || '', alYear: p.alYear || '',
        profilePictureUrl: normalizedPicture
      });
      broadcastProfilePicture(normalizedPicture);
    } catch (e) { console.error(e); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((s) => ({ ...s, [name]: value }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    setUploading(true);
    try {
      const res = await api.post('/users/profile/picture', form, { withCredentials: false });
      const updatedUrl = normalizeImageUrl(res.data?.profilePictureUrl);
      if (updatedUrl) {
        setProfile((p) => ({ ...p, profilePictureUrl: updatedUrl }));
        broadcastProfilePicture(updatedUrl);
        setMessage({ text: 'Profile picture updated.', tone: 'success' });
      }
    } catch (e) {
      console.error('Upload failed', e);
      setMessage({ text: 'Failed to upload profile picture.', tone: 'error' });
    } finally { setUploading(false); }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile.name || !profile.email || !profile.username) {
      setMessage({ text: 'Name, Email and Username are required.', tone: 'error' });
      return;
    }
    try {
      await api.put('/users/profile', {
        name: profile.name,
        email: profile.email,
        username: profile.username,
        university: profile.university,
        degree: profile.degree,
        academicYear: profile.academicYear ? Number(profile.academicYear) : null,
        graduationYear: profile.graduationYear ? Number(profile.graduationYear) : null,
        batch: profile.batch,
        universityRegNumber: profile.universityRegNumber,
        alYear: profile.alYear,
        telephone: profile.telephone,
        dob: profile.dob || null
      });
      setMessage({ text: 'Profile updated successfully.', tone: 'success' });
    } catch (e) {
      console.error(e);
      const apiMessage = e.response?.data?.message || e.response?.data?.error;
      setMessage({ text: apiMessage || 'Failed to update profile.', tone: 'error' });
    }
  };

  const handleCancel = () => { fetchProfile(); setMessage({ text: '', tone: '' }); };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const fieldDefinitions = [
    { name: 'name', label: 'Full Name', placeholder: 'Full Name', type: 'text', required: true },
    { name: 'username', label: 'Username', placeholder: 'Username', type: 'text', required: true },
    { name: 'email', label: 'Email', placeholder: 'Email', type: 'email', required: true },
    { name: 'dob', label: 'Date of Birth', placeholder: 'Date of Birth', type: 'date', required: false },
    { name: 'telephone', label: 'Contact Number', placeholder: 'Contact Number', type: 'tel', required: false },
    { name: 'university', label: 'University', placeholder: 'University', type: 'text', required: true },
    { name: 'degree', label: 'Degree', placeholder: 'Degree', type: 'text', required: true },
    { name: 'academicYear', label: 'Academic Year', placeholder: 'Academic Year', type: 'number', required: true },
    { name: 'graduationYear', label: 'Graduation Year', placeholder: 'Graduation Year', type: 'number', required: true },
    { name: 'batch', label: 'Batch', placeholder: 'Batch', type: 'text', required: true },
    { name: 'universityRegNumber', label: 'University Reg. Number', placeholder: 'University Reg. Number', type: 'text', required: true },
    { name: 'alYear', label: 'A/L Year', placeholder: 'A/L Year', type: 'text', required: true }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(40%_30%_at_10%_10%,rgba(59,130,246,0.10),transparent),radial-gradient(30%_30%_at_90%_0%,rgba(16,185,129,0.10),transparent),linear-gradient(to_bottom,rgba(241,245,249,1),rgba(248,250,252,1))]" />
        <div className="absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.35]" />
      </div>
      <div className="flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl p-10 space-y-8 border border-slate-100">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="text-3xl font-bold text-blue-700 tracking-tight">Your Profile</h2>
            <button
              type="button"
              onClick={() => navigate('/landing')}
              className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition"
            >
              Go to Main Page
            </button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="w-24 h-24 rounded-full bg-blue-200 text-white flex items-center justify-center text-2xl font-bold overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              aria-label="Change profile picture"
            >
              {profile.profilePictureUrl ? (
                <img src={profile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
            <p className="text-xs text-slate-500">Click the avatar to upload a new picture.</p>
            {uploading && <div className="text-xs text-slate-500">Uploading…</div>}
          </div>

          {message.text && (
            <p className={`text-center font-medium ${message.tone === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fieldDefinitions.map((field) => (
              <div key={field.name} className="flex flex-col gap-1">
                <label htmlFor={field.name} className="text-sm font-medium text-slate-600">
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={profile[field.name] ?? ''}
                  onChange={handleChange}
                  required={field.required}
                  placeholder={field.type === 'date' ? undefined : field.placeholder}
                  className="border border-slate-200 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/60 hover:bg-white transition"
                />
              </div>
            ))}

            <div className="col-span-1 sm:col-span-2 flex justify-center gap-4 mt-6">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Save</button>
              <button type="button" onClick={handleCancel} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
