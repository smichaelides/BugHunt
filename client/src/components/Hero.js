import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import './Hero.css';

const Hero = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth0();
    const [levels, setLevels] = useState([]);
    const [userStats, setUserStats] = useState({
        streak: 0,
        completedChallenges: 0,
        totalScore: 0
    });
    const [dailyPuzzleInfo, setDailyPuzzleInfo] = useState(null);
    const [dailyPuzzleCompleted, setDailyPuzzleCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // Calculate time until midnight (next puzzle)
    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            
            const diff = midnight - now;
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            setTimeRemaining({ hours, minutes, seconds });
        };
        
        calculateTimeRemaining();
        const timer = setInterval(calculateTimeRemaining, 1000);
        
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!isAuthenticated || !user?.email) {
                    return;
                }

                // Fetch user data
                const userResponse = await fetch(`http://localhost:5001/api/auth/user/${encodeURIComponent(user.email)}`);
                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const userData = await userResponse.json();

                // Fetch levels
                const levelsResponse = await fetch('http://localhost:5001/api/levels');
                if (!levelsResponse.ok) {
                    throw new Error('Failed to fetch levels');
                }
                const levelsData = await levelsResponse.json();
                
                // Check if user completed today's daily puzzle
                const completionResponse = await fetch(`http://localhost:5001/api/daily-puzzle/completed/${user.email}`);
                const completionData = await completionResponse.json();
                setDailyPuzzleCompleted(completionData.completed);

                // Get basic daily puzzle info (without the full details)
                try {
                    const puzzleResponse = await fetch('http://localhost:5001/api/daily-puzzle');
                    if (puzzleResponse.ok) {
                        const puzzleData = await puzzleResponse.json();
                        setDailyPuzzleInfo({
                            difficulty: puzzleData.difficulty,
                            puzzleId: puzzleData.puzzleId
                        });
                    }
                } catch (puzzleErr) {
                    console.error('Error fetching daily puzzle:', puzzleErr);
                    // Don't set an error state for this as it's not critical
                }
                
                setLevels(levelsData);
                setUserStats({
                    streak: userData.streakcounter || 0,
                    completedChallenges: userData.challengescompleted || 0,
                    totalScore: userData.points || 0
                });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [user, isAuthenticated]);

    const handleLevelClick = (level) => {
        navigate(`/level/${level.id}`);
    };

    const handleDailyPuzzleClick = () => {
        navigate('/daily-puzzle');
    };

    if (!isAuthenticated) {
        return <div>Please log in to view your progress</div>;
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="hero-container">
            <div className="left-section">
                <h1>Debug Quest</h1>
                <h4>Master debugging through interactive challenges!!!</h4>
                <div className="levels-grid">
                    {levels.map((level) => (
                        <div
                            key={level.id}
                            className="level-card"
                            onClick={() => handleLevelClick(level)}
                        >
                            <h3>Level {level.id}</h3>
                            <p>{level.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="right-sections">
                <div className="welcome-section">
                    <h2>Welcome Back{user?.name ? `, ${user.name}` : ''}!</h2>
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

                    {/* New Badges Section */}
                    <div className="section-title">Badges & Awards</div>
                    <div className="badges-container">
                        <div className="badge-item">
                            <span className="badge-icon">🌟</span>
                            <span className="badge-name">First Blood</span>
                            <span className="badge-description">Completed first challenge</span>
                        </div>
                        <div className="badge-item">
                            <span className="badge-icon">⚡</span>
                            <span className="badge-name">Speed Demon</span>
                            <span className="badge-description">Solved under 1 minute</span>
                        </div>
                        <div className="badge-item">
                            <span className="badge-icon">🎯</span>
                            <span className="badge-name">Sharpshooter</span>
                            <span className="badge-description">Perfect score streak</span>
                        </div>
                        <div className="badge-item">
                            <span className="badge-icon">🔥</span>
                            <span className="badge-name">Hot Streak</span>
                            <span className="badge-description">7 day streak</span>
                        </div>
                        <div className="badge-item">
                            <span className="badge-icon">🧠</span>
                            <span className="badge-name">Problem Solver</span>
                            <span className="badge-description">Solved 10 challenges</span>
                        </div>
                        <div className="badge-item">
                            <span className="badge-icon">👑</span>
                            <span className="badge-name">Champion</span>
                            <span className="badge-description">Top 10 leaderboard</span>
                        </div>
                    </div>
                </div>

                <div className="daily-puzzle-section">
                    <h2>Daily Puzzle</h2>
                    <div className="daily-puzzle-container">
                        {dailyPuzzleInfo ? (
                            <>
                                <div className="daily-puzzle-info">
                                    <div className="puzzle-difficulty-badge">
                                        {dailyPuzzleInfo.difficulty}
                                    </div>
                                    <div className="puzzle-timer">
                                        <span>Next puzzle in: </span>
                                        <span className="time-value">
                                            {timeRemaining.hours.toString().padStart(2, '0')}:
                                            {timeRemaining.minutes.toString().padStart(2, '0')}:
                                            {timeRemaining.seconds.toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                </div>
                                <div className="daily-puzzle-status">
                                    {dailyPuzzleCompleted ? (
                                        <div className="completed-status">
                                            <span className="checkmark">✓</span> Completed today!
                                        </div>
                                    ) : (
                                        <div className="pending-status">
                                            Not completed yet - solve for bonus points!
                                        </div>
                                    )}
                                </div>
                                <button 
                                    className="daily-puzzle-button" 
                                    onClick={handleDailyPuzzleClick}
                                >
                                    {dailyPuzzleCompleted ? 'View Completed Puzzle' : 'Solve Daily Puzzle!'}
                                </button>
                            </>
                        ) : (
                            <h3>No daily puzzle available right now.</h3>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;