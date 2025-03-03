import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    const navigate = useNavigate();
    // HARDCODED DATA - will get from backend later !!!!
    const levels = [
        { id: 1, name: "Level 1", unlocked: true, completed: true },
        { id: 2, name: "Level 2", unlocked: true, completed: false },
        { id: 3, name: "Level 3", unlocked: false, completed: false },
        { id: 4, name: "Level 4", unlocked: false, completed: false },
        { id: 5, name: "Level 5", unlocked: false, completed: false },
        { id: 6, name: "Level 6", unlocked: false, completed: false },
        { id: 7, name: "Level 7", unlocked: false, completed: false },
        { id: 8, name: "Level 8", unlocked: false, completed: false },
        { id: 9, name: "Level 9", unlocked: false, completed: false },
        { id: 10, name: "Level 10", unlocked: false, completed: false },
    ];
    const userStats = {
        streak: 5,
        completedChallenges: 25,
        totalScore: 1250
    };

    const handleLevelClick = (level) => {
        if (level.unlocked) {
            navigate(`/level/${level.id}`);
        }
    };

    return (
        <div className="hero-container">
            {/* Left sidebar with debug units */}
            <div className="debug-units-section">
                <h2>Debug Levels</h2>
                <div className="units-list">
                    {levels.map((level) => (
                        <div 
                            key={level.id} 
                            className={`unit-item ${level.unlocked ? 'unlocked' : 'locked'} ${level.completed ? 'completed' : ''}`}
                            onClick={() => handleLevelClick(level)}
                            style={{ cursor: level.unlocked ? 'pointer' : 'not-allowed' }}
                        >
                            {level.name}
                            {level.completed && ' ✓'}
                            {!level.unlocked && ' 🔒'}
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