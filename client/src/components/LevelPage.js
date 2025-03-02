import React from 'react';
import { useParams } from 'react-router-dom';
import './LevelPage.css';

const LevelPage = () => {
    const { levelId } = useParams();
    
    // HARDCODED CHALLENGES - will get from backend later
    const challenges = [
        {
            id: 1,
            title: "Fix the Loop",
            difficulty: "Easy",
            description: "Debug an infinite loop in JavaScript",
            completed: false
        },
        {
            id: 2,
            title: "Array Index Error",
            difficulty: "Easy",
            description: "Find and fix array index out of bounds",
            completed: false
        },
        {
            id: 3,
            title: "Null Reference",
            difficulty: "Medium",
            description: "Debug null reference exceptions",
            completed: false
        },
        {
            id: 4,
            title: "Async Bug",
            difficulty: "Hard",
            description: "Fix asynchronous code execution",
            completed: false
        },
        {
            id: 5,
            title: "Memory Leak",
            difficulty: "Hard",
            description: "Identify and fix a memory leak",
            completed: false
        }
    ];

    return (
        <div className="level-page">
            <h1>Level {levelId}</h1>
            <div className="challenges-grid">
                {challenges.map((challenge) => (
                    <div key={challenge.id} className="challenge-card">
                        <h3>{challenge.title}</h3>
                        <span className={`difficulty ${challenge.difficulty.toLowerCase()}`}>
                            {challenge.difficulty}
                        </span>
                        <p>{challenge.description}</p>
                        <button className="start-challenge-btn">
                            {challenge.completed ? "Review" : "Start Challenge"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LevelPage; 