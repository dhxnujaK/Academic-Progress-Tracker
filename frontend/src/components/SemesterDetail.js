import React, { useState, useEffect } from 'react';
import AddModuleForm from './AddModuleForm';
import axios from 'axios';

function SemesterDetail({ semester, onBack }) {
    const [modules, setModules] = useState([]);

    const fetchModules = () => {
        axios.get(`http://localhost:8080/modules?userId=1&semester=${semester}`)
            .then(response => setModules(response.data))
            .catch(error => console.error("Error fetching modules:", error));
    };

    useEffect(() => {
        fetchModules();
    }, [semester]);

    const handleModuleAdded = () => {
        fetchModules();
    };

    return (
        <div>
            <h2>Semester {semester} Details</h2>

            <AddModuleForm userId={1} semester={semester} onModuleAdded={handleModuleAdded} />

            <div>
                <h3>Modules</h3>
                {modules.length === 0 ? (
                    <p>No modules added yet.</p>
                ) : (
                    <ul>
                        {modules.map((mod) => (
                            <li key={mod.id}>
                                {mod.moduleCode} - {mod.moduleName} ({mod.moduleCredits} credits): Grade {mod.moduleGrade}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button onClick={onBack}>Back</button>
            {/* Module form + module list will go here later */}
        </div>
    );
}

export default SemesterDetail;