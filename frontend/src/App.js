import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SemesterList from './components/SemesterList';
import SemesterDetail from './components/SemesterDetail';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';

function App() {
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);

    const handleAddSemester = (sem) => {
        if (!semesters.includes(sem)) {
            setSemesters([...semesters, sem]);
        }
    };

    const handleSelectSemester = (sem) => {
        setSelectedSemester(sem);
    };

    const handleBack = () => {
        setSelectedSemester(null);
    };

    return (
        <Router>
            <div className="App">

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/tracker" element={
                        selectedSemester === null ? (
                            <SemesterList semesters={semesters} onSelect={handleSelectSemester} />
                        ) : (
                            <SemesterDetail semester={selectedSemester} onBack={handleBack} />
                        )
                    } />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/landing" element={<LandingPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;