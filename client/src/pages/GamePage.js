import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GamePage.css';

const GamePage = () => {
    const { levelId } = useParams();
    const navigate = useNavigate();
    
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback] = useState(null);

    // Hardcoded problem details
    const problem = {
        title: "Problem 1",
        difficulty: "Easy",
        description: "This is a hardcoded problem description for Problem 1.",
        code: "console.log('Hello, World!');",
        choices: ["a", "b", "c", "d"],
        correctAnswer: "a" // Hardcoded correct answer
    };

    const handleSelectAnswer = (answer) => {
        setSelectedAnswer(answer);
        
        // Check if answer is correct
        if (answer === problem.correctAnswer) {
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
    
    return (
        <div className="game-page">
            <div className="game-header">
                <button className="back-button" onClick={handleBackToLevel}>
                    ← Back to Level {levelId}
                </button>
                <h1>{problem.title}</h1>
                <div className="problem-difficulty">{problem.difficulty}</div>
            </div>
            
            <div className="problem-description">
                <p>{problem.description}</p>
            </div>
            
            <div className="code-display">
                <pre>
                    <code>{problem.code}</code>
                </pre>
            </div>
            
            <div className="answer-section">
                <h3>Select the correct solution:</h3>
                <div className="answer-bubbles">
                    {problem.choices.map((choice, index) => (
                        <div 
                            key={index}
                            className={`answer-bubble ${selectedAnswer === choice ? 
                                (choice === problem.correctAnswer ? 'correct' : 'incorrect') : ''}`}
                            onClick={() => handleSelectAnswer(choice)}
                        >
                            {choice}
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