import React, { useState } from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Dropdown from './components/Dropdown';
import Footer from './components/Footer';
import Home from './pages/home';
import Levels from './pages/levels';
import Leaderboard from './pages/leaderboard';
import Profile from './pages/profile';
import LevelPage from './components/LevelPage';
import Login from './pages/login';
import GamePage from './pages/GamePage';
import { useAuth0 } from "@auth0/auth0-react";


function App() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth0();

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
