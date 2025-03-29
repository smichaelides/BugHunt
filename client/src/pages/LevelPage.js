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

    // Fetch problems and check completion status
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch problems for the level
                const problemsResponse = await fetch(`http://localhost:5001/api/level/${levelId}/problems`);
                if (!problemsResponse.ok) {
                    throw new Error('Problems not found');
                }
                const problemsData = await problemsResponse.json();
                
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
                            `http://localhost:5001/api/problem/completed/${encodeURIComponent(user.email)}/${problem.id}`
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