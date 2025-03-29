import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import './LevelPage.css';

const LevelPage = () => {
    const { levelId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth0();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completedProblems, setCompletedProblems] = useState(new Set());

    // Check completed problems
    useEffect(() => {
        const fetchCompletedProblems = async () => {
            if (!isAuthenticated || !user?.email) return;
            
            try {
                const progressResponse = await fetch(`http://localhost:5001/api/user/progress/${user.email}`);
                if (progressResponse.ok) {
                    const progressData = await progressResponse.json();
                    console.log('Progress data:', progressData);
                    
                    // Filter completions for current level and create a Set of completed problem IDs
                    const completed = new Set(
                        progressData.completions
                            ?.filter(p => p.level === parseInt(levelId))
                            ?.map(p => parseInt(p.problemId)) // Make sure to parse as integer
                    );
                    console.log('Completed problems set:', completed);
                    setCompletedProblems(completed);
                }
            } catch (err) {
                console.error('Error fetching completed problems:', err);
            }
        };

        fetchCompletedProblems();
    }, [isAuthenticated, user, levelId]);

    // Fetch problems
    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const problemsResponse = await fetch(`http://localhost:5001/api/level/${levelId}/problems`);
                if (!problemsResponse.ok) {
                    throw new Error('Problems not found');
                }
                const problemsData = await problemsResponse.json();
                console.log('Raw data from server:', problemsData);
                
                const formattedProblems = problemsData.map(p => ({
                    id: parseInt(p.problemId), // Make sure to parse as integer
                    title: `Problem ${p.problemId}`,
                    difficulty: p.difficulty,
                    description: p.description
                }));
                
                console.log('Formatted problems:', formattedProblems);
                setProblems(formattedProblems);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProblems();
    }, [levelId]);

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
            <h1>Level {levelId}</h1>
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
                        <h3>{challenge.title}</h3>
                        <span className={`difficulty ${challenge.difficulty.toLowerCase()}`}>
                            {challenge.difficulty}
                        </span>
                        <p>{challenge.description}</p>
                        {completedProblems.has(challenge.id) && (
                            <div className="completion-badge">
                                <span className="checkmark">✓</span> Completed
                            </div>
                        )}
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

export default LevelPage; 