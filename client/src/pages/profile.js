import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { getApiUrl, fetchLeaderboard } from '../utils/api';
import './profile.css';

const Profile = () => {
    const { user, isAuthenticated } = useAuth0();
    const navigate = useNavigate();
    const [userStats, setUserStats] = useState(null);
    const [isOnLeaderboard, setIsOnLeaderboard] = useState(false);
    const [loading, setLoading] = useState(true);
    const [earnedBadges, setEarnedBadges] = useState({
        firstBlood: false,
        hotStreak: false,
        problemSolver: false,
        champion: false
    });
    const [leaderboardPosition, setLeaderboardPosition] = useState(null);

    useEffect(() => {
        const loadUserData = async () => {
            if (!isAuthenticated || !user?.email) return;
            
            try {
                // Fetch user stats
                const response = await fetch(getApiUrl(`/api/auth/user/${encodeURIComponent(user.email)}`));
                const userData = await response.json();
                setUserStats(userData);

                // Check if user is on leaderboard
                const leaderboard = await fetchLeaderboard();
                const isOnBoard = leaderboard.some(entry => entry.email === user.email);
                setIsOnLeaderboard(isOnBoard);
                
                // Set position if needed for badges
                const userIndex = leaderboard.findIndex(entry => entry.email === user.email);
                setLeaderboardPosition(userIndex >= 0 ? userIndex + 1 : null);
                
            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [isAuthenticated, user]);

    // Update badge checking logic with more debug logs
    useEffect(() => {
        if (!userStats) {
            console.log('No user stats available yet'); // Debug log
            return;
        }

        console.log('Checking badges with stats:', userStats); // Debug log
        const newEarnedBadges = {
            firstBlood: (userStats.challengescompleted || 0) >= 1,
            hotStreak: (userStats.streakcounter || 0) >= 7,
            problemSolver: (userStats.challengescompleted || 0) >= 10,
            champion: leaderboardPosition !== null && leaderboardPosition <= 10
        };
        console.log('New badge status:', newEarnedBadges); // Debug log

        setEarnedBadges(newEarnedBadges);
    }, [userStats, leaderboardPosition]);

    if (!isAuthenticated || loading) {
        return <div className="profile-loading">Loading profile...</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <button className="back-button" onClick={() => navigate('/home')}>← Back</button>
                <h1>Profile</h1>
            </div>

            <div className="profile-content">
                <div className="profile-info">
                    <div className="profile-avatar">
                        <img src={user.picture} alt="Profile" />
                    </div>
                    <h2>{userStats?.username || user.name}</h2>
                    <p className="email">{user.email}</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Points</h3>
                        <p>{userStats?.points || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Day Streak</h3>
                        <p>{userStats?.streakcounter || 0} days</p>
                    </div>
                    <div className="stat-card">
                        <h3>Challenges Completed</h3>
                        <p>{userStats?.challengescompleted || 0}</p>
                    </div>
                </div>

                <h2 className="badges-title">Badges & Awards</h2>
                <div className="stats-grid">
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

                {isOnLeaderboard ? (
                    <div className="leaderboard-banner success">
                        <span>🏆</span>
                        <p>Congratulations! You're on the leaderboard!</p>
                    </div>
                ) : (
                    <div className="leaderboard-banner info">
                        <span>💪</span>
                        <p>Complete more challenges to get on the leaderboard!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;