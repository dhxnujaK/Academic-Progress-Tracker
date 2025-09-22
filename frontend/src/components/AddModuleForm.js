import React, { useState } from 'react';
import axios from 'axios';

function AddModuleForm({ userId, semester, onModuleAdded }) {
    const [module, setModule] = useState({
        ModuleCode: '',
        ModuleName: '',
        ModuleCredits: '',
        ModuleGrade: ''
    });

    const handleChange = (e) => {
        setModule({ ...module, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...module,
                moduleSemester: semester,
                user: { id: userId }
            };
            await axios.post('http://localhost:8080/modules', payload);
            setModule({ ModuleCode: '', ModuleName: '', ModuleCredits: '', ModuleGrade: '' });
            if (onModuleAdded) {
                onModuleAdded(); 
            }
        } catch (error) {
            console.error('Error adding module:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <div style={inputGroupStyle}>
                <input style={inputStyle} name="ModuleCode" placeholder="Module Code" value={module.ModuleCode} onChange={handleChange} required />
                <input style={inputStyle} name="ModuleName" placeholder="Module Name" value={module.ModuleName} onChange={handleChange} required />
            </div>
            <div style={inputGroupStyle}>
                <input style={inputStyle} name="ModuleCredits" type="number" placeholder="Credits" value={module.ModuleCredits} onChange={handleChange} required />
                <input style={inputStyle} name="ModuleGrade" placeholder="Expected Grade (e.g., A+, B)" value={module.ModuleGrade} onChange={handleChange} required />
            </div>
            <button type="submit" style={buttonStyle}>Add Module</button>
        </form>
    );
}


const formStyle = {
    padding: '2rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
};

const inputGroupStyle = {
    display: 'flex',
    gap: '1rem',
};

const inputStyle = {
    flex: 1, 
    padding: '0.8rem 1rem',
    fontSize: '1rem',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    backgroundColor: 'white',
    transition: 'border-color 0.2s, box-shadow 0.2s'
};

const buttonStyle = {
    padding: '0.8rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.2s',
    alignSelf: 'flex-end' 
};

export default AddModuleForm;
