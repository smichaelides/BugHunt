export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000/api';

// User related functions
export const fetchUserProfile = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
};

export const fetchUserProgress = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/progress`);
    if (!response.ok) throw new Error('Failed to fetch user progress');
    return response.json();
};

// Level related functions
export const fetchLevels = async () => {
    const response = await fetch(`${API_BASE_URL}/levels`);
    if (!response.ok) throw new Error('Failed to fetch levels');
    return response.json();
};

export const fetchLevelChallenges = async (levelId) => {
    const response = await fetch(`${API_BASE_URL}/level/${levelId}/challenges`);
    if (!response.ok) throw new Error('Failed to fetch level challenges');
    return response.json();
};

// Leaderboard function
export const fetchLeaderboard = async () => {
    const response = await fetch(`${API_BASE_URL}/leaderboard`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
};

// Daily Puzzle functions
export const fetchDailyPuzzle = async (userId = null) => {
    const url = userId 
        ? `${API_BASE_URL}/daily-puzzle/completed/${userId}`
        : `${API_BASE_URL}/daily-puzzle`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch daily puzzle');
    return response.json();
}; 