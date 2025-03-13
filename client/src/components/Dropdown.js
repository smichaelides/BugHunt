import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';

const Dropdown = ({ isOpen, toggleMenu }) => {
    const { isAuthenticated } = useAuth0();

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
            {isAuthenticated ? <LogoutButton /> : <LoginButton />}
        </div>
    );
};

export default Dropdown;