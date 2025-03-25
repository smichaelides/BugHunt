import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import './DailyPuzzle.css';

const DailyPuzzle = () => {
    const { user, isAuthenticated } = useAuth0();
    const navigate = useNavigate();
    
    const [puzzle, setPuzzle] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasCompleted, setHasCompleted] = useState(false);
    const [stats, setStats] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [attemptCount, setAttemptCount] = useState(0);

    // Calculate time until midnight (next puzzle)
    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            
            const diff = midnight - now;
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            setTimeRemaining({ hours, minutes, seconds });
        };
        
        calculateTimeRemaining();
        const timer = setInterval(calculateTimeRemaining, 1000);
        
        return () => clearInterval(timer);
    }, []);

    // Check if user has already completed today's puzzle
    useEffect(() => {
        const checkCompletion = async () => {
            if (!isAuthenticated || !user?.email) return;
            
            try {
                const response = await fetch(`http://localhost:5001/api/daily-puzzle/completed/${user.email}`);
                const data = await response.json();
                
                if (data.completed) {
                    setHasCompleted(true);
                }
            } catch (err) {
                console.error('Error checking puzzle completion:', err);
            }
        };
        
        checkCompletion();
    }, [isAuthenticated, user]);

    // Fetch daily puzzle
    useEffect(() => {
        const fetchDailyPuzzle = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5001/api/daily-puzzle');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch daily puzzle');
                }
                
                const data = await response.json();
                setPuzzle(data);
            } catch (err) {
                console.error('Error fetching daily puzzle:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchDailyPuzzle();
    }, []);

    const handleSelectAnswer = async (selectedOption, index) => {
        if (selectedAnswer !== null) {
            // Allow trying another answer after a previous attempt
            setSelectedAnswer(null);
            setFeedback(null);
            setAttemptCount(prev => prev + 1);
            return;
        }
        
        setSelectedAnswer(index);
        
        if (selectedOption.isCorrect) {
            setFeedback({
                type: 'success',
                message: 'Great job! You found the correct solution.'
            });
            
            // Record completion if user is authenticated
            if (isAuthenticated && user?.email) {
                try {
                    const response = await fetch('http://localhost:5001/api/daily-puzzle/complete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: user.email,
                            puzzleId: puzzle.puzzleId
                        })
                    });
                    
                    const data = await response.json();
                    setStats(data.stats);
                    setHasCompleted(true);
                } catch (err) {
                    console.error('Error recording puzzle completion:', err);
                }
            }
        } else {
            setFeedback({
                type: 'error',
                message: 'Incorrect solution. Try again!'
            });
        }
    };

    const handleTryAgain = () => {
        setSelectedAnswer(null);
        setFeedback(null);
        setAttemptCount(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="daily-puzzle-page">
                <div className="daily-puzzle-header">
                    <button className="back-button" onClick={() => navigate('/home')}>← Back</button>
                    <h1>Daily Puzzle</h1>
                </div>
                <div className="loading-spinner">Loading today's puzzle...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="daily-puzzle-page">
                <div className="daily-puzzle-header">
                    <button className="back-button" onClick={() => navigate('/home')}>← Back</button>
                    <h1>Daily Puzzle</h1>
                </div>
                <div className="error-message">
                    <p>Sorry, we couldn't load today's puzzle.</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="daily-puzzle-page">
            <div className="daily-puzzle-header">
                <button className="back-button" onClick={() => navigate('/home')}>← Back</button>
                <h1>Daily Puzzle</h1>
                <div className="reset-counter">
                    <span>Next puzzle in: </span>
                    <span className="time-remaining">
                        {timeRemaining.hours.toString().padStart(2, '0')}:
                        {timeRemaining.minutes.toString().padStart(2, '0')}:
                        {timeRemaining.seconds.toString().padStart(2, '0')}
                    </span>
                </div>
            </div>

            {puzzle && (
                <>
                    <div className="puzzle-difficulty">{puzzle.difficulty}</div>
                    
                    {hasCompleted && (
                        <div className="completed-banner">
                            <span className="checkmark">✓</span> You've completed today's puzzle!
                        </div>
                    )}
                    
                    <div className="puzzle-description">
                        <p>{puzzle.description}</p>
                    </div>
                    
                    <div className="code-display">
                        <h3>Buggy Code:</h3>
                        <pre>{puzzle.code}</pre>
                    </div>
                    
                    <div className="answer-section">
                        <h3>Select the correct solution:</h3>
                        <div className="answer-bubbles">
                            {puzzle.options.map((option, index) => (
                                <div 
                                    key={`${index}-${attemptCount}`}
                                    className={`answer-bubble ${
                                        selectedAnswer === index 
                                            ? option.isCorrect ? 'correct' : 'incorrect' 
                                            : ''
                                    }`}
                                    onClick={() => handleSelectAnswer(option, index)}
                                >
                                    <pre>{option.text}</pre>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {feedback && (
                        <div className={`feedback ${feedback.type}`}>
                            <p>{feedback.message}</p>
                            {feedback.type === 'success' && stats && hasCompleted && (
                                <div className="stats-update">
                                    <h4>Stats Updated:</h4>
                                    <p>Points: {stats.points}</p>
                                    <p>Challenges Completed: {stats.challengescompleted}</p>
                                    <p>Streak: {stats.streakcounter}</p>
                                </div>
                            )}
                            {feedback.type === 'error' && (
                                <button 
                                    className="try-again-button"
                                    onClick={handleTryAgain}
                                >
                                    Try Another Solution
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DailyPuzzle; 