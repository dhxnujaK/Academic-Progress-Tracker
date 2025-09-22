import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserProfilePage = () => {
  const [profile, setProfile] = useState({
    name: '', username: '', email: '',
    dob: '', telephone: '', university: '', degree: '',
    academicYear: '', graduationYear: '', batch: '', universityRegNumber: '', alYear: '',
    profilePictureUrl: ''
  });
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/users/profile', { headers });
      const p = res.data || {};
      setProfile({
        name: p.name || '', username: p.username || '', email: p.email || '',
        dob: p.dob || '', telephone: p.telephone || '', university: p.university || '', degree: p.degree || '',
        academicYear: p.academicYear ?? '', graduationYear: p.graduationYear ?? '', batch: p.batch || '', universityRegNumber: p.universityRegNumber || '', alYear: p.alYear || '',
        profilePictureUrl: p.profilePictureUrl || ''
      });
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
      const res = await axios.post('http://localhost:8080/api/users/profile/picture', form, { headers, withCredentials: false });
      setProfile((p) => ({ ...p, profilePictureUrl: res.data?.profilePictureUrl || p.profilePictureUrl }));
    } catch (e) {
      console.error('Upload failed', e);
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile.name || !profile.email || !profile.username) {
      setMessage('Name, Email and Username are required.');
      return;
    }
    try {
      await axios.put('http://localhost:8080/api/users/profile', {
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
      }, { headers });
      setMessage('✅ Profile updated successfully.');
    } catch (e) {
      console.error(e);
      setMessage('❌ Failed to update profile.');
    }
  };

  const handleCancel = () => { fetchProfile(); setMessage(''); };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(40%_30%_at_10%_10%,rgba(59,130,246,0.10),transparent),radial-gradient(30%_30%_at_90%_0%,rgba(16,185,129,0.10),transparent),linear-gradient(to_bottom,rgba(241,245,249,1),rgba(248,250,252,1))]" />
        <div className="absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.35]" />
      </div>
      <div className="flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 space-y-6 border">
          <h2 className="text-3xl font-bold text-center text-blue-700">Your Profile</h2>

          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-blue-200 text-white flex items-center justify-center text-2xl font-bold overflow-hidden">
              {profile.profilePictureUrl ? (
                <img src={profile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</span>
              )}
            </div>
            <label className="text-sm">
              <span className="sr-only">Upload</span>
              <input type="file" accept="image/*" onChange={handleUpload} className="text-sm" />
            </label>
            {uploading && <div className="text-xs text-slate-500">Uploading…</div>}
          </div>

          {message && (
            <p className={`text-center font-medium ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="name" value={profile.name} onChange={handleChange} placeholder="Full Name" required className="border px-4 py-2 rounded-lg" />
            <input name="username" value={profile.username} onChange={handleChange} placeholder="Username" required className="border px-4 py-2 rounded-lg" />
            <input name="email" value={profile.email} onChange={handleChange} placeholder="Email" type="email" required className="border px-4 py-2 rounded-lg" />
            <input name="dob" value={profile.dob || ''} onChange={handleChange} placeholder="Date of Birth" type="date" className="border px-4 py-2 rounded-lg" />
            <input name="telephone" value={profile.telephone || ''} onChange={handleChange} placeholder="Contact Number" className="border px-4 py-2 rounded-lg" />
            <input name="university" value={profile.university || ''} onChange={handleChange} placeholder="University" className="border px-4 py-2 rounded-lg" />
            <input name="degree" value={profile.degree || ''} onChange={handleChange} placeholder="Degree" className="border px-4 py-2 rounded-lg" />
            <input name="academicYear" value={profile.academicYear || ''} onChange={handleChange} placeholder="Academic Year" type="number" className="border px-4 py-2 rounded-lg" />
            <input name="graduationYear" value={profile.graduationYear || ''} onChange={handleChange} placeholder="Graduation Year" type="number" className="border px-4 py-2 rounded-lg" />
            <input name="batch" value={profile.batch || ''} onChange={handleChange} placeholder="Batch" className="border px-4 py-2 rounded-lg" />
            <input name="universityRegNumber" value={profile.universityRegNumber || ''} onChange={handleChange} placeholder="University Reg. Number" className="border px-4 py-2 rounded-lg" />
            <input name="alYear" value={profile.alYear || ''} onChange={handleChange} placeholder="A/L Year" className="border px-4 py-2 rounded-lg" />

            <div className="col-span-1 sm:col-span-2 flex justify-center gap-4 mt-4">
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
