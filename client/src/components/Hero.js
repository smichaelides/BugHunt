import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLevels, fetchUserProfile, fetchUserProgress } from '../utils/api';
import './Hero.css';

const Hero = () => {
    const navigate = useNavigate();
    const [levels, setLevels] = useState([]);
    const [userStats, setUserStats] = useState({
        streak: 0,
        completedChallenges: 0,
        totalScore: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [levelsData, progressData, userData] = await Promise.all([
                    fetchLevels(),
                    fetchUserProgress(1), // hardcoded user ID for now
                    fetchUserProfile(1)
                ]);
                
                const levelsWithProgress = levelsData.map(level => ({
                    ...level,
                    unlocked: progressData.unlockedLevels.includes(level.id),
                    completed: progressData.completedLevels.includes(level.id)
                }));
                
                setLevels(levelsWithProgress);
                setUserStats({
                    streak: userData.streakCounter,
                    completedChallenges: userData.challengesCompleted,
                    totalScore: userData.points
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLevelClick = (level) => {
        if (level.unlocked) {
            navigate(`/level/${level.id}`);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

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
                        <p>DAILY PUZZLE COMING SOON...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;