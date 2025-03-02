import React, { useState, useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Dropdown from './components/Dropdown';
import Footer from './components/Footer';
import Home from './pages/home';
import Levels from './pages/levels';
import Leaderboard from './pages/leaderboard';
import Profile from './pages/profile';
import Hero from './components/Hero';
import LevelPage from './components/LevelPage';

function App() {
  const [isOpen, setIsOpen] = useState(false); // tracks if navbar is open

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const hideMenu = () => {
    if (window.innerWidth < 768 && isOpen) {
      setIsOpen(false);
      console.log('Resized');
    }
  };
  window.addEventListener('resize', hideMenu);

  return (
    <Router>
      <Navbar toggleMenu={toggleMenu} />
      <Dropdown isOpen={isOpen} toggleMenu={toggleMenu} />
      <Routes>
        <Route path='/home' element={<Home />} />
        <Route path='/levels' element={<Levels />} />
        <Route path='/leaderboard' element={<Leaderboard />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/' element={<Hero />} />
        <Route path='/level/:levelId' element={<LevelPage />} />
        <Route path='/' element={<Navigate to='/home' />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
