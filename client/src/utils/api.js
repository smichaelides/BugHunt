const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const getApiUrl = (endpoint) => {
    // Ensure endpoint starts with /api
    const formattedEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    return `${BASE_URL}${formattedEndpoint}`;
};

const api = {
    BASE_URL,
    getApiUrl
};

export default api;

// User related functions
export const fetchUserProfile = async (userId) => {
    const response = await fetch(getApiUrl(`/api/user/${userId}`));
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
};

export const fetchUserProgress = async (userId) => {
    try {
        const response = await fetch(getApiUrl(`/api/user/${userId}/progress`));
        if (!response.ok) {
            throw new Error('Failed to fetch user progress');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user progress:', error);
        throw error;
    }
};

// Level related functions
export const fetchLevels = async () => {
    try {
        const response = await fetch(getApiUrl('/api/levels'));
        if (!response.ok) {
            throw new Error('Failed to fetch levels');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching levels:', error);
        throw error;
    }
};

export const fetchLevelChallenges = async (levelId) => {
    const response = await fetch(getApiUrl(`/api/level/${levelId}/challenges`));
    if (!response.ok) throw new Error('Failed to fetch level challenges');
    return response.json();
};

// Leaderboard function
export const fetchLeaderboard = async () => {
    const response = await fetch(getApiUrl('/api/leaderboard'));
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
};

// Daily Puzzle functions
export const fetchDailyPuzzle = async (userId = null) => {
    const endpoint = userId 
        ? `/api/daily-puzzle/completed/${userId}`
        : '/api/daily-puzzle';
    
    const response = await fetch(getApiUrl(endpoint));
    if (!response.ok) throw new Error('Failed to fetch daily puzzle');
    return response.json();
}; 