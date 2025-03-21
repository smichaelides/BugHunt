import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GamePage.css';

const GamePage = () => {
    const { levelId, problemId } = useParams();
    const navigate = useNavigate();
    
    const [problem, setProblem] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/problems/${problemId}`);
                if (!response.ok) {
                    throw new Error('Problem not found');
                }
                const data = await response.json();
                console.log('Fetched problem data:', data); // Debug log
                setProblem(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching problem:', err); // Debug log
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProblem();
    }, [problemId]);

    const handleSelectAnswer = (answer) => {
        setSelectedAnswer(answer);
        
        // Check if answer is correct
        if (answer === problem.fixedCode) {
            setFeedback({
                type: 'success',
                message: 'Correct! Well done!'
            });
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

    // Shuffle the answer options
    const answerOptions = [
        { text: problem.fixedCode, isCorrect: true },
        { text: problem.wrongOption1, isCorrect: false },
        { text: problem.wrongOption2, isCorrect: false },
        { text: problem.wrongOption3, isCorrect: false }
    ].sort(() => Math.random() - 0.5);
    
    return (
        <div className="game-page">
            <div className="game-header">
                <button className="back-button" onClick={handleBackToLevel}>
                    ← Back to Level {levelId}
                </button>
                <h1>Problem {problemId}</h1>
                <div className="problem-difficulty">{problem.difficulty}</div>
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
                    {answerOptions.map((option, index) => (
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
                        {feedback.message}
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

export default GamePage;