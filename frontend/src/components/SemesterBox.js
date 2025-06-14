
import React from 'react';

function SemesterBox({ semester }) {
    return (
        <div style={boxStyle}>
            <h2 style={boxTextStyle}>{semester}</h2>
        </div>
    );
}

const boxStyle = {

};

const boxTextStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
};

export default SemesterBox;
