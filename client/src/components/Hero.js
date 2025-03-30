import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { getApiUrl } from '../utils/api';
import { fetchDailyPuzzle, checkDailyPuzzleCompleted } from '../utils/api';
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
    const [leaderboardPosition, setLeaderboardPosition] = useState(null);

    // Track earned badges
    const [earnedBadges, setEarnedBadges] = useState({
        firstBlood: false,
        hotStreak: false,
        problemSolver: false,
        champion: false
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
                const userResponse = await fetchUserData(user.email);
                
                // Fetch levels
                const levelsResponse = await fetchLevels();
                
                // Fetch leaderboard data
                const leaderboardResponse = await fetchLeaderboard();
                if (leaderboardResponse.ok) {
                    const leaderboardData = await leaderboardResponse.json();
                    // Find user's position in leaderboard
                    const userIndex = leaderboardData.findIndex(entry => entry.email === user.email);
                    // If user is found in the leaderboard (userIndex >= 0), set position to userIndex + 1
                    // Otherwise, set to null or a value greater than 10
                    const userPosition = userIndex >= 0 ? userIndex + 1 : 11; // 11 means not in top 10
                    setLeaderboardPosition(userPosition);
                    console.log('User leaderboard position:', userPosition);
                }
                
                // Check if user completed today's daily puzzle
                try {
                    const completionStatus = await checkDailyPuzzleCompleted(user.email);
                    setDailyPuzzleCompleted(completionStatus.completed);
                } catch (err) {
                    console.error('Error checking daily puzzle completion:', err);
                    setDailyPuzzleCompleted(false);
                }

                // Get basic daily puzzle info
                try {
                    const puzzleResponse = await fetchDailyPuzzle();
                    setDailyPuzzleInfo({
                        difficulty: puzzleResponse.difficulty,
                        puzzleId: puzzleResponse.puzzleId
                    });
                } catch (err) {
                    console.error('Error fetching daily puzzle:', err);
                    setDailyPuzzleInfo(null);
                }
                
                setLevels(levelsResponse);
                setUserStats({
                    streak: userResponse.streakcounter || 0,
                    completedChallenges: userResponse.challengescompleted || 0,
                    totalScore: userResponse.points || 0
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

    useEffect(() => {
        const checkEarnedBadges = () => {
            const newEarnedBadges = {
                firstBlood: userStats.completedChallenges >= 1,
                hotStreak: userStats.streak >= 7,
                problemSolver: userStats.completedChallenges >= 10,
                champion: leaderboardPosition !== null && leaderboardPosition <= 10
            };
            console.log('Checking badges:', { 
                stats: userStats, 
                leaderboardPosition, 
                badges: newEarnedBadges 
            });
            setEarnedBadges(newEarnedBadges);
        };

        checkEarnedBadges();
    }, [userStats, leaderboardPosition]);

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
                        <div className={`badge-item ${earnedBadges.firstBlood ? 'earned' : ''}`}>
                            <span className="badge-icon">🌟</span>
                            <span className="badge-name">First Blood</span>
                            <span className="badge-description">Completed first challenge</span>
                        </div>
                        <div className={`badge-item ${earnedBadges.hotStreak ? 'earned' : ''}`}>
                            <span className="badge-icon">🔥</span>
                            <span className="badge-name">Hot Streak</span>
                            <span className="badge-description">7 day streak</span>
                        </div>
                        <div className={`badge-item ${earnedBadges.problemSolver ? 'earned' : ''}`}>
                            <span className="badge-icon">🧠</span>
                            <span className="badge-name">Problem Solver</span>
                            <span className="badge-description">Solved 10 challenges</span>
                        </div>
                        <div className={`badge-item ${earnedBadges.champion ? 'earned' : ''}`}>
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

const fetchUserData = async (email) => {
    try {
        const response = await fetch(getApiUrl(`/api/auth/user/${encodeURIComponent(email)}`));
        if (!response.ok) throw new Error('Failed to fetch user data');
        return await response.json();
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

const fetchLevels = async () => {
    try {
        const response = await fetch(getApiUrl('/api/levels'));
        if (!response.ok) throw new Error('Failed to fetch levels');
        return await response.json();
    } catch (error) {
        console.error('Error fetching levels:', error);
        throw error;
    }
};

const fetchLeaderboard = async () => {
    try {
        const response = await fetch(getApiUrl('/api/leaderboard'));
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        return { ok: true, json: async () => response.json() };
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return { ok: false, error };
    }
};

export default Hero;