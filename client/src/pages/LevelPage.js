import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { getApiUrl } from '../utils/api';
import './LevelPage.css';

const LevelPage = () => {
    const { levelId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth0();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completedProblems, setCompletedProblems] = useState(new Set());

    // Fetch problems and check completion status
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch problems for the level
                const problemsData = await fetchProblems(levelId);
                
                const formattedProblems = problemsData.map(p => ({
                    id: parseInt(p.problemId),
                    title: `Problem ${p.problemId}`,
                    difficulty: p.difficulty,
                    description: p.description
                }));
                
                setProblems(formattedProblems);

                // Check completion status for each problem if user is authenticated
                if (isAuthenticated && user?.email) {
                    const completed = new Set();
                    
                    for (const problem of formattedProblems) {
                        const completionResponse = await fetch(
                            getApiUrl(`/api/problem/completed/${encodeURIComponent(user.email)}/${problem.id}`)
                        );
                        if (completionResponse.ok) {
                            const completionData = await completionResponse.json();
                            if (completionData.completed) {
                                completed.add(problem.id);
                            }
                        }
                    }
                    
                    console.log('Completed problems:', completed);
                    setCompletedProblems(completed);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [levelId, user, isAuthenticated]);

    const handleChallengeClick = (challengeId) => {
        console.log('Navigating to problem:', challengeId);
        if (challengeId) {
            navigate(`/level/${levelId}/problem/${challengeId}`);
        }
    };

    if (loading) return <div className="level-page">Loading...</div>;
    if (error) return <div className="level-page">Error: {error}</div>;

    return (
        <div className="level-page">
            <h1>Level {levelId} - {problems[0].difficulty}</h1>
            {!isAuthenticated && (
                <div className="auth-notice">
                    Sign in to track your progress!
                </div>
            )}
            <div className="challenges-line">
                {problems.map((challenge) => (
                    <div 
                        key={challenge.id} 
                        className={`challenge-card ${completedProblems.has(challenge.id) ? 'completed' : ''}`}
                    >
                        <div className="challenge-header">
                            <h3>{challenge.title}</h3>
                            {completedProblems.has(challenge.id) && (
                                <div className="completion-badge">
                                    <span className="checkmark">✓</span> Completed
                                </div>
                            )}
                        </div>
                        <p>{challenge.description}</p>
                        <button 
                            className="start-challenge-btn"
                            onClick={() => handleChallengeClick(challenge.id)}
                        >
                            {completedProblems.has(challenge.id) ? "Review" : "Start Challenge"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const fetchProblems = async (levelId) => {
    try {
        const response = await fetch(getApiUrl(`/api/level/${levelId}/problems`));
        if (!response.ok) {
            throw new Error('Failed to fetch problems');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching problems:', error);
        throw error;
    }
};

export default LevelPage; 