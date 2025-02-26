import React from 'react';
import { Link } from 'react-router-dom';

const Dropdown = ({ isOpen, toggleMenu }) => {
    return (
        <div className={`${
        isOpen ? 'grid' : 'hidden'
        } grid-rows-4 text-center items-center bg-green-500 font-mono transition-all duration-300 ease-in-out rounded-lg shadow-lg p-4`}
        onClick={toggleMenu}>
            <Link className='p-4 mb-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 ease-in-out' to='/home'>
                Home
            </Link>
            <Link className='p-4 mb-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 ease-in-out' to='/levels'>
                Levels
            </Link>
            <Link className='p-4 mb-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 ease-in-out' to='/leaderboard'>
                Leaderboard
            </Link>
            <Link className='p-4 mb-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 ease-in-out' to='/profile'>
                Profile
            </Link>
        </div>
    );
};

export default Dropdown;