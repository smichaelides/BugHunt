import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    const navigate = useNavigate();
    // HARDCODED DATA - will get from backend later !!!!
    const debugUnits = ['Level 1', 'Level 2', 'Level 3'];
    const userStats = {
        streak: 5,
        completedChallenges: 25,
        totalScore: 1250
    };

    // Navigate to the level page when a debug unit is clicked (index + 1 because index starts at 0)
    const handleLevelClick = (index) => {
        navigate(`/level/${index + 1}`);
    };

    return (
        <div className="hero-container">
            {/* Left sidebar with debug units */}
            <div className="debug-units-section">
                <h2>Debug Levels</h2>
                <div className="units-list">
                    {debugUnits.map((unit, index) => (
                        <div 
                            key={index} 
                            className="unit-item"
                            onClick={() => handleLevelClick(index)}
                            style={{ cursor: 'pointer' }}
                        >
                            {unit}
                        </div>
                    ))}
                </div>
            </div>
            <div className="right-sections">
                {/* welcome and stats section */}
                <div className="welcome-section">
                    <h2>Welcome Back!</h2>
                    <div className="stats-container">
                        <div className="stat-item">
                            <h3>🔥 Day Streak</h3>
                            <p>{userStats.streak} days</p>
                        </div>
                        <div className="stat-item">
                            <h3>✅ Completed</h3>
                            <p>{userStats.completedChallenges} challenges</p>
                        </div>
                        <div className="stat-item">
                            <h3>🏆 Total Score</h3>
                            <p>{userStats.totalScore} points</p>
                        </div>
                    </div>
                </div>

                {/* Daily Pu Section */}
                <div className="daily-puzzle-section">
                    <h2>Daily Puzzle</h2>
                    <div className="daily-puzzle-container">
                        <p>DAILY PUZZLE COMING SOON... backend</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;