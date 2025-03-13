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
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadLeaderboard();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    // Helper function to get medal emoji based on rank
    const getMedal = (rank) => {
        switch(rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '';
        }
    };

    return (
        <div className="leaderboard-container">
            <h1>Leaderboard</h1>
            <div className="leaderboard-table">
                <div className="leaderboard-header">
                    <div className="rank">Position</div>
                    <div className="username">Username</div>
                    <div className="points">Points</div>
                </div>
                {leaderboardData.map((entry) => (
                    <div key={entry.userId} className="leaderboard-row">
                        <div className="rank">{getMedal(entry.rank)}</div>
                        <div className="username">{entry.username}</div>
                        <div className="points">{entry.points}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;