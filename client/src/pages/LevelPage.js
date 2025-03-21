import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './LevelPage.css';

const LevelPage = () => {
    const { levelId } = useParams();
    const navigate = useNavigate();
    const [currentProblem, setCurrentProblem] = useState(1);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/level/${levelId}/problems`);
                if (!response.ok) {
                    throw new Error('Problems not found');
                }
                const data = await response.json();
                setProblems(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProblems();
    }, [levelId]);

    const handleStartChallenge = () => {
        navigate(`/level/${levelId}/problem/${currentProblem}`);
    };

    const handleNextProblem = () => {
        if (currentProblem < problems.length) {
            setCurrentProblem(prev => prev + 1);
        }
    };

    const handlePreviousProblem = () => {
        if (currentProblem > 1) {
            setCurrentProblem(prev => prev - 1);
        }
    };

    if (loading) {
        return <div className="level-page">Loading...</div>;
    }

    if (error) {
        return <div className="level-page">Error: {error}</div>;
    }

    return (
        <div className="level-page">
            <div className="level-header">
                <h1>Level {levelId}</h1>
                <div className="problem-navigation">
                    <button 
                        onClick={handlePreviousProblem}
                        disabled={currentProblem === 1}
                    >
                        Previous Problem
                    </button>
                    <span>Problem {currentProblem} of {problems.length}</span>
                    <button 
                        onClick={handleNextProblem}
                        disabled={currentProblem === problems.length}
                    >
                        Next Problem
                    </button>
                </div>
            </div>

            <div className="problem-preview">
                <h2>Problem {currentProblem}</h2>
                <p className="difficulty">{problems[currentProblem - 1]?.Difficulty}</p>
                <p className="description">{problems[currentProblem - 1]?.Description}</p>
            </div>

            <button 
                className="start-challenge-button"
                onClick={handleStartChallenge}
            >
                Start Challenge
            </button>
        </div>
    );
};

export default LevelPage; 