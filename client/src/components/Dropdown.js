import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import './Dropdown.css';

const Dropdown = ({ isOpen, toggleMenu }) => {
    const { isAuthenticated } = useAuth0();

    return (
        <div className={`dropdown-menu ${isOpen ? '' : 'hidden'}`} onClick={toggleMenu}>
            <Link className='dropdown-item' to='/home'>
                Home
            </Link>
            <Link className='dropdown-item' to='/levels'>
                Levels
            </Link>
            <Link className='dropdown-item' to='/daily-puzzle'>
                Daily Puzzle
            </Link>
            <Link className='dropdown-item' to='/leaderboard'>
                Leaderboard
            </Link>
            <Link className='dropdown-item' to='/profile'>
                Profile
            </Link>
            {isAuthenticated ? <LogoutButton /> : <LoginButton />}
        </div>
    );
};

export default Dropdown;