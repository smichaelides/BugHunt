import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import './DailyPuzzle.css';

const DailyPuzzle = () => {
    const { user, isAuthenticated } = useAuth0();
    const navigate = useNavigate();
    
    const [puzzle, setPuzzle] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [stats, setStats] = useState(null);
    const [timeUntilReset, setTimeUntilReset] = useState('');

    // Calculate time until midnight
    useEffect(() => {
        const updateTimeRemaining = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight - now;
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);
        };
        
        updateTimeRemaining();
        const timer = setInterval(updateTimeRemaining, 1000);
        
        return () => clearInterval(timer);
    }, []);

    // Check if user has already completed today's puzzle
    useEffect(() => {
        const checkCompletion = async () => {
            if (!isAuthenticated || !user?.email) return;
            
            try {
                const response = await fetch(`http://localhost:5001/api/daily-puzzle/completed/${encodeURIComponent(user.email)}`);
                if (!response.ok) throw new Error('Failed to check puzzle completion');
                
                const data = await response.json();
                setIsCompleted(data.completed);
            } catch (err) {
                console.error('Error checking puzzle completion:', err);
            }
        };
        
        checkCompletion();
    }, [user, isAuthenticated]);

    // Fetch the daily puzzle
    useEffect(() => {
        const fetchDailyPuzzle = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5001/api/daily-puzzle');
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('No daily puzzle available today');
                    }
                    throw new Error('Failed to fetch daily puzzle');
                }
                
                const data = await response.json();
                setPuzzle(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching daily puzzle:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchDailyPuzzle();
    }, []);

    const handleSelectAnswer = async (answer, isCorrect) => {
        if (isCompleted) return;
        
        setSelectedAnswer(answer);
        
        if (isCorrect) {
            setFeedback({
                type: 'success',
                message: 'Correct! Well done!'
            });
            
            try {
                const response = await fetch('http://localhost:5001/api/daily-puzzle/complete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: user.email,
                        puzzleId: puzzle.puzzleId
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to record completion');
                }

                const data = await response.json();
                setStats(data.stats);
                setIsCompleted(true);
            } catch (err) {
                console.error('Error recording completion:', err);
            }
        } else {
            setFeedback({
                type: 'error',
                message: 'Incorrect, try again.'
            });
        }
    };
    
    const handleBackToHome = () => {
        navigate('/home');
    };

    if (loading) {
        return (
            <div className="daily-puzzle-page loading">
                <h1>Daily Puzzle</h1>
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="daily-puzzle-page error">
                <h1>Daily Puzzle</h1>
                <div className="error-message">{error}</div>
                <button className="back-button" onClick={handleBackToHome}>
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="daily-puzzle-page">
            <div className="daily-puzzle-header">
                <button className="back-button" onClick={handleBackToHome}>
                    ← Back to Home
                </button>
                <h1>Daily Puzzle</h1>
                <div className="reset-counter">
                    <span>New puzzle in: </span>
                    <span className="time-remaining">{timeUntilReset}</span>
                </div>
            </div>
            
            {isCompleted && !selectedAnswer ? (
                <div className="completed-message">
                    <h2>You've already completed today's puzzle!</h2>
                    <p>Come back tomorrow for a new challenge.</p>
                    <button className="back-button" onClick={handleBackToHome}>
                        Back to Home
                    </button>
                </div>
            ) : (
                <>
                    <div className="puzzle-difficulty">{puzzle.difficulty}</div>
                    
                    <div className="puzzle-description">
                        <p>{puzzle.description}</p>
                    </div>
                    
                    <div className="code-display">
                        <h3>Buggy Code:</h3>
                        <pre>
                            <code>{puzzle.code}</code>
                        </pre>
                    </div>
                    
                    <div className="answer-section">
                        <h3>Select the correct solution:</h3>
                        <div className="answer-bubbles">
                            {puzzle.options.map((option, index) => (
                                <div 
                                    key={index}
                                    className={`answer-bubble ${selectedAnswer === option.text ? 
                                        (option.isCorrect ? 'correct' : 'incorrect') : ''}`}
                                    onClick={() => handleSelectAnswer(option.text, option.isCorrect)}
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
                                {feedback.type === 'success' && stats && (
                                    <div className="stats-update">
                                        <h4>Stats Updated</h4>
                                        <p>Points: {stats.points}</p>
                                        <p>Challenges Completed: {stats.challengescompleted}</p>
                                        <p>Streak: {stats.streakcounter} days</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default DailyPuzzle; 