import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SemesterList from './components/SemesterList';
import SemesterDetail from './components/SemesterDetail';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';

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
                    <Route path="/" element={<RegisterPage />} />
                    <Route path="/tracker" element={
                        selectedSemester === null ? (
                            <SemesterList semesters={semesters} onSelect={handleSelectSemester} />
                        ) : (
                            <SemesterDetail semester={selectedSemester} onBack={handleBack} />
                        )
                    } />
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;