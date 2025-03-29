import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { getApiUrl } from '../utils/api';
import './GamePage.css';

const GamePage = () => {
    const { levelId, problemId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth0();
    
    const [problem, setProblem] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shuffledAnswers, setShuffledAnswers] = useState([]);

    useEffect(() => {
        const loadProblem = async () => {
            try {
                console.log('Fetching problem with ID:', problemId);
                const data = await fetchProblem(problemId);
                console.log('Fetched problem data:', data);
                setProblem(data);
                
                // Shuffle answers once when problem is loaded
                const answers = [
                    { text: data.fixedCode, isCorrect: true },
                    { text: data.wrongOption1, isCorrect: false },
                    { text: data.wrongOption2, isCorrect: false },
                    { text: data.wrongOption3, isCorrect: false }
                ].sort(() => Math.random() - 0.5);
                setShuffledAnswers(answers);
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching problem:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        loadProblem();
    }, [problemId]);

    const handleSelectAnswer = async (answer) => {
        setSelectedAnswer(answer);
        
        // Check if answer is correct
        if (answer === problem.fixedCode) {
            setFeedback({
                type: 'success',
                message: 'Correct! Well done!'
            });
            // Update user progress when answer is correct
            if (user?.email) {
                try {
                    const data = await submitCompletion(user, parseInt(problemId), parseInt(levelId));
                    console.log('Progress updated:', data);
                    
                    // Show stats update in the UI
                    if (data.stats) {
                        setFeedback(prev => ({
                            ...prev,
                            message: `Correct! Well done! +10 points!`,
                            stats: data.stats
                        }));
                    }
                } catch (err) {
                    console.error('Error updating progress:', err);
                    setFeedback({
                        type: 'error',
                        message: 'Error updating progress. Please try again.'
                    });
                }
            }
        } else {
            setFeedback({
                type: 'error',
                message: 'Incorrect, try again.'
            });
        }
    };
    
    const handleBackToLevel = () => {
        navigate(`/level/${levelId}`);
    };

    if (loading) {
        return <div className="game-page">Loading...</div>;
    }

    if (error) {
        return <div className="game-page">Error: {error}</div>;
    }

    return (
        <div className="game-page">
            <div className="game-header">
                <button className="back-button" onClick={handleBackToLevel}>
                    ← Back to Level {levelId}
                </button>
                <h1>Problem {problemId}</h1>
                <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
            </div>
            
            <div className="problem-description">
                <p>{problem.description}</p>
            </div>
            
            <div className="code-display">
                <h3>Buggy Code:</h3>
                <pre>
                    <code>{problem.code}</code>
                </pre>
            </div>
            
            <div className="answer-section">
                <h3>Select the correct solution:</h3>
                <div className="answer-bubbles">
                    {shuffledAnswers.map((option, index) => (
                        <div 
                            key={index}
                            className={`answer-bubble ${selectedAnswer === option.text ? 
                                (option.isCorrect ? 'correct' : 'incorrect') : ''}`}
                            onClick={() => handleSelectAnswer(option.text)}
                        >
                            <pre>
                                <code>{option.text}</code>
                            </pre>
                        </div>
                    ))}
                </div>
                
                {feedback && (
                    <div className={`feedback ${feedback.type}`}>
                        <p>{feedback.message}</p>
                        {feedback.type === 'success' && feedback.stats && (
                            <div className="stats-update">
                                <h4>Stats Updated:</h4>
                                <p>Points: {feedback.stats.points}</p>
                                <p>Challenges Completed: {feedback.stats.challengescompleted}</p>
                                <p>Streak: {feedback.stats.streakcounter}</p>
                            </div>
                        )}
                        {feedback.type === 'success' && (
                            <button className="next-button" onClick={handleBackToLevel}>
                                Back to Level
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const fetchProblem = async (problemId) => {
    try {
        const response = await fetch(getApiUrl(`/api/problems/${problemId}`));
        if (!response.ok) {
            throw new Error('Failed to fetch problem');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching problem:', error);
        throw error;
    }
};

const submitCompletion = async (user, problemId, level) => {
    try {
        const response = await fetch(getApiUrl('/api/user/complete-challenge'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: user.email,
                problemId,
                level
            }),
        });
        return await response.json();
    } catch (error) {
        console.error('Error submitting completion:', error);
        throw error;
    }
};

export default GamePage;