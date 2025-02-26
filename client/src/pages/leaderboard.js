import React from 'react';
import './leaderboard.css';

const Leaderboard = () => {
    // HARDCODED DATA FOR NOW
    const leaderboardData = [
        {
            username: 'John Doe',
            score: 1000,
            streak: 5,
            completedChallenges: 25,
            totalScore: 1250
        },
        {
            username: 'Jane Smith',
            score: 950,
            streak: 3,
            completedChallenges: 15,
            totalScore: 1100
        },
        {
            username: 'Alice Johnson',
            score: 900,
            streak: 4,
            completedChallenges: 20,
            totalScore: 1050
        }
    ];

    return (
        <div className="leaderboard-container">
            <h2>Leaderboard</h2>
            {leaderboardData.length === 0 ? (
                <div className="no-data">
                    <p>No data available</p>
                </div>
            ) : (
                leaderboardData.map((user, index) => (
                    <div key={index} className="leaderboard-item">
                        <div className="rank-badge">{index + 1}</div>
                        <div className="user-info">
                            <span className="username">{user.username}</span>
                            <div className="user-stats">
                                <div className="stat">
                                    <span className="stat-label">🏆 Score:</span>
                                    <span className="stat-value">{user.totalScore}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">🔥 Streak:</span>
                                    <span className="stat-value">{user.streak} days</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">✅ Completed:</span>
                                    <span className="stat-value">{user.completedChallenges} challenges</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Leaderboard;