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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (!isAuthenticated) {
        return <div>Please log in to view your progress</div>;
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="hero-container">
            <div className="left-section">
                <h1>Debug Quest</h1>
                <p>Master debugging through interactive challenges</p>
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
                </div>

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