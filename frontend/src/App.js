import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import ModuleRegistration from './components/ModuleRegistration';
import SemesterRegistration from './components/SemesterRegistration';
import UserProfilePage from "./components/UserProfilePage";


function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/landing" element={<LandingPage />} />
                    <Route path="/register-module" element={<ModuleRegistration />} />
                    <Route path= "/register-semester" element={<SemesterRegistration />} />
                    <Route path="/profile" element={<UserProfilePage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;