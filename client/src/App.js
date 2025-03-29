import React, { useState, useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Dropdown from './components/Dropdown';
import Footer from './components/Footer';
import Home from './pages/Home';
import Levels from './pages/levels';
import Leaderboard from './pages/leaderboard';
import Profile from './pages/profile';
import LevelPage from './pages/LevelPage';
import Login from './pages/login';
import GamePage from './pages/GamePage';
import DailyPuzzle from './pages/DailyPuzzle';
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth0();

  useEffect(() => {
    const createOrUpdateUser = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await fetch('http://localhost:5001/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              sub: user.sub
            })
          });

          if (!response.ok) {
            throw new Error('Failed to create/update user');
          }

          const data = await response.json();
          console.log('User created/updated:', data);
        } catch (err) {
          console.error('Error creating/updating user:', err);
        }
      }
    };

    createOrUpdateUser();
  }, [isAuthenticated, user]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const hideMenu = () => {
    if (window.innerWidth < 768 && isOpen) {
      setIsOpen(false);
    }
  };
  window.addEventListener('resize', hideMenu);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      {isAuthenticated && <Navbar toggleMenu={toggleMenu} />}
      {isAuthenticated && <Dropdown isOpen={isOpen} toggleMenu={toggleMenu} />}
      <Routes>
        <Route path='/home' element={
          isAuthenticated ? <Home /> : <Navigate to="/" />
        } />
        <Route path='/levels' element={
          isAuthenticated ? <Levels /> : <Navigate to="/" />
        } />
        <Route path='/leaderboard' element={
          isAuthenticated ? <Leaderboard /> : <Navigate to="/" />
        } />
        <Route path='/profile' element={
          isAuthenticated ? <Profile /> : <Navigate to="/" />
        } />
        <Route path='/daily-puzzle' element={
          isAuthenticated ? <DailyPuzzle /> : <Navigate to="/" />
        } />
        <Route path='/level/:levelId' element={
          isAuthenticated ? <LevelPage /> : <Navigate to="/" />
        } />
        <Route path='/level/:levelId/problem/:problemId' element={
          isAuthenticated ? <GamePage /> : <Navigate to="/" />
        } />
        
        <Route path='/' element={
          isAuthenticated ? <Navigate to="/home" /> : <Login />
        } />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
