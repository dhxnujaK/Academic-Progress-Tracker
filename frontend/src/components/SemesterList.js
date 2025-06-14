import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SemesterBox from './SemesterBox';

/**
 * Normalizes a semester name for comparison.
 * "Semester 1", "sem 1", and "1" all become "1".
 * @param {string} name The semester name.
 * @returns {string} The normalized name.
 */
const normalizeName = (name) => {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/semester|sem/g, '') // Remove "semester" or "sem"
        .replace(/\s+/g, '')          // Remove all whitespace
        .trim();
};


function SemesterList({ onSelect }) {
    const [semesters, setSemesters] = useState([]);
    const [adding, setAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
    const userId = 1; // Example user ID

    // --- Data Fetching ---
    useEffect(() => {
        axios.get(`http://localhost:8080/semesters?userId=${userId}`)
            .then(response => {
                const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name));
                setSemesters(sorted);
            })
            .catch(error => {
                console.error('Error fetching semesters:', error);
                setError('Could not fetch semesters.');
            });
    }, [userId]);

    // --- Adding New Semester Logic ---
    const inputRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (inputRef.current && !inputRef.current.contains(e.target)) {
                setAdding(false);
                setNewName('');
                setError('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAddSemester = () => {
        const trimmedName = newName.trim();
        if (trimmedName === '') return;

        // --- Client-side duplicate check with normalization ---
        const normalizedNewName = normalizeName(trimmedName);
        const isDuplicate = semesters.some(
            semester => normalizeName(semester.name) === normalizedNewName
        );

        if (isDuplicate) {
            setError('A semester with a similar name already exists.');
            return;
        }

        const newSemester = { name: trimmedName, user: { id: userId } };

        axios.post('http://localhost:8080/semesters', newSemester)
            .then(response => {
                setSemesters(prev => [...prev, response.data].sort((a, b) => a.name.localeCompare(b.name)));
                setNewName('');
                setAdding(false);
                setError('');
            })
            .catch(error => {
                console.error('Error adding semester:', error);
                if (error.response?.status === 400 || error.response?.status === 500) {
                    setError('Semester already exists.');
                } else {
                    setError('An error occurred while adding the semester.');
                }
            });
    };

    // --- Deleting a Semester ---
    const handleDeleteSemester = (idToDelete) => {
        axios.delete(`http://localhost:8080/semesters/${idToDelete}`)
            .then(() => {
                setSemesters(prev => prev.filter(s => s.id !== idToDelete));
            })
            .catch(error => {
                console.error('Error deleting semester:', error);
                setError('Failed to delete semester.');
            });
    };

    // --- Updating a Semester Name ---
    const handleNameChange = (e, idToUpdate) => {
        const updatedSemesters = semesters.map(s =>
            s.id === idToUpdate ? { ...s, name: e.target.value } : s
        );
        setSemesters(updatedSemesters);
    };

    const handleSaveNameOnBlur = (semesterToUpdate) => {
        const trimmedName = semesterToUpdate.name.trim();
        if (trimmedName === '') {
            setError("Semester name cannot be empty.");
            return;
        }

        // --- Client-side duplicate check on edit with normalization ---
        const normalizedUpdatedName = normalizeName(trimmedName);
        const isDuplicate = semesters.some(
            s =>
                s.id !== semesterToUpdate.id && // Exclude the semester being edited
                normalizeName(s.name) === normalizedUpdatedName
        );

        if (isDuplicate) {
            setError('A semester with a similar name already exists.');
            return;
        }


        axios.put(`http://localhost:8080/semesters/${semesterToUpdate.id}`, semesterToUpdate)
            .then(() => {
                setError(''); // Clear error on successful update
            })
            .catch(error => {
                console.error('Error updating semester name:', error);
                setError('Failed to update name. It might already exist.');
            });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddSemester();
        }
    };

    return (
        <div style={{ padding: '1rem' }}>
            {/* --- Edit/Done Button Row --- */}
            <div style={editButtonRowStyle}>
                <button onClick={() => setIsEditing(!isEditing)} style={editButtonStyle}>
                    {isEditing ? 'Done' : 'Edit'}
                </button>
            </div>

            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <div style={gridContainerStyle}>
                {semesters.map((semester) => (
                    <div key={semester.id} style={boxStyle}>
                        {/* --- Delete (Minus) Button --- */}
                        {isEditing && (
                            <div
                                onClick={() => handleDeleteSemester(semester.id)}
                                style={deleteIconStyle}
                                title="Delete semester"
                            >
                                -
                            </div>
                        )}

                        <div
                            style={boxContentStyle}
                            onClick={() => !isEditing && onSelect(semester.name)}
                            onMouseEnter={(e) => { if (!isEditing) e.currentTarget.style.transform = 'scale(1.05)'; }}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={semester.name}
                                    onChange={(e) => handleNameChange(e, semester.id)}
                                    onBlur={() => handleSaveNameOnBlur(semester)}
                                    style={inputStyle}
                                    className="semester-name-input"
                                />
                            ) : (
                                <SemesterBox semester={semester.name} />
                            )}
                        </div>
                    </div>
                ))}

                {/* --- Add New Semester Tile (only shows when not editing) --- */}
                {!isEditing && (
                    <div style={boxStyle}>
                        {adding ? (
                            <div style={boxContentStyle}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter name"
                                    autoFocus
                                    style={inputStyle}
                                />
                            </div>
                        ) : (
                            <div
                                onClick={() => { setAdding(true); setError(''); }}
                                style={addBoxContentStyle}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <span style={addSymbolStyle}>+</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Styles ---

const editButtonRowStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '1rem',
};

const editButtonStyle = {
    padding: '8px 20px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
};

const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)', // Creates 3 equal-width columns
    gap: '1rem',
};

const boxStyle = {
    display: 'flex',
    aspectRatio: '16 / 9', // Makes the box maintain a widescreen aspect ratio
    position: 'relative', // Needed for the delete icon
};

const boxContentStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: '#d0e6ff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease-in-out',
    padding: '1rem',
    boxSizing: 'border-box'
};

const addBoxContentStyle = {
    ...boxContentStyle,
    backgroundColor: 'transparent',
    border: '2px dashed #a9c5e8',
    boxShadow: 'none',
    cursor: 'pointer'
};

const addSymbolStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#8494a8'
};

const deleteIconStyle = {
    position: 'absolute',
    top: '-10px',
    left: '-10px',
    width: '24px',
    height: '24px',
    backgroundColor: 'hsl(0, 84%, 60%)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    zIndex: 10,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
};

const inputStyle = {
    border: 'none',
    borderBottom: '2px solid #007bff',
    backgroundColor: 'transparent',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#003366',
    padding: '0.5rem',
    textAlign: 'center',
    width: '90%',
    outline: 'none',
};

export default SemesterList;
