import React, { useState, useEffect } from 'react';
import { fetchLeaderboard } from '../utils/api';
import './leaderboard.css';

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                const data = await fetchLeaderboard();
                setLeaderboardData(data);
                console.log('Leaderboard data:', data);
            } catch (err) {
                console.error('Error loading leaderboard:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadLeaderboard();
    }, []);

    if (loading) return <div className="loading-container">Loading leaderboard data...</div>;
    if (error) return <div className="error-container">Error: {error}</div>;

    // Helper function to get medal emoji based on rank
    const getMedal = (rank) => {
        switch(rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return rank;
        }
    };

    return (
        <div className="leaderboard-container">
            <h1>Leaderboard</h1>
            <p className="leaderboard-subtitle">Top Bug Hunters</p>
            
            <div className="leaderboard-table">
                <div className="leaderboard-header">
                    <div className="rank">Position</div>
                    <div className="username">Username</div>
                    <div className="points">Points</div>
                    <div className="challenges">Challenges</div>
                    <div className="streak">Streak</div>
                </div>
                
                {leaderboardData.length === 0 ? (
                    <div className="no-data">No users found. Be the first to join the leaderboard!</div>
                ) : (
                    leaderboardData.map((entry) => (
                        <div 
                            key={entry.rank} 
                            className={`leaderboard-row ${entry.rank <= 3 ? 'top-rank rank-' + entry.rank : ''}`}
                        >
                            <div className="rank">
                                {entry.rank <= 3 ? getMedal(entry.rank) : entry.rank}
                            </div>
                            <div className="username" title={entry.username}>
                                {entry.username}
                            </div>
                            <div className="points">{entry.points}</div>
                            <div className="challenges">{entry.challengesCompleted || 0}</div>
                            <div className="streak">{entry.streak || 0} days</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Leaderboard;