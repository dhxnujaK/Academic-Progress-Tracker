import React, { useEffect, useState } from 'react';
import axios from 'axios';

function GpaCalculator({ userId }) {
    const [cgpa, setCgpa] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:8080/modules/cgpa?userId=${userId}`)
            .then(response => {
                setCgpa(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching CGPA:', error);
                setLoading(false);
            });
    }, [userId]);

    return (
        <div>
            <h2>Your CGPA</h2>
            {loading ? <p>Loading...</p> : <p><strong>{cgpa?.toFixed(2)}</strong></p>}
        </div>
    );
}

export default GpaCalculator;