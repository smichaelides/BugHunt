import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import './Navbar.css';

const Navbar = ({ toggleMenu }) => {
    const { isAuthenticated } = useAuth0();

    return (
        <nav className='navbar' role='navigation'>
            <div className='navbar-brand'>BugHunt</div>
            <div className='menu-icon' onClick={toggleMenu}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </div>
            <div className='nav-links'>
                <Link className='nav-link' to='/home'>Home</Link>
                <Link className='nav-link' to='/levels'>Levels</Link>
                <Link className='nav-link' to='/daily-puzzle'>Daily Puzzle</Link>
                <Link className='nav-link' to='/leaderboard'>Leaderboard</Link>
                <Link className='nav-link' to='/profile'>Profile</Link>
                {isAuthenticated ? <LogoutButton /> : <LoginButton />}
            </div>
        </nav>
    );
};

export default Navbar;