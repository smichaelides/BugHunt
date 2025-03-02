import React from 'react';
import { useNavigate } from 'react-router-dom';
import './levels.css';

const Levels = () => {
    const navigate = useNavigate();
    
    // HARDCODED DATA - will get from backend later
    const levels = [
        { id: 1, name: "Level 1", unlocked: true, completed: true },
        { id: 2, name: "Level 2", unlocked: true, completed: false },
        { id: 3, name: "Level 3", unlocked: false, completed: false },
        { id: 4, name: "Level 4", unlocked: false, completed: false },
        { id: 5, name: "Level 5", unlocked: false, completed: false },
        { id: 6, name: "Level 6", unlocked: false, completed: false },
        { id: 7, name: "Level 7", unlocked: false, completed: false },
        { id: 8, name: "Level 8", unlocked: false, completed: false },
        { id: 9, name: "Level 9", unlocked: false, completed: false },
        { id: 10, name: "Level 10", unlocked: false, completed: false },
    ];

    const handleLevelClick = (level) => {
        if (level.unlocked) {
            navigate(`/level/${level.id}`);
        }
    };

    return (
        <div className="level-home-page">
            <h1>Debug Journey</h1>
            <div className="level-path">
                {levels.map((level, index) => (
                    <React.Fragment key={level.id}>
                        <div 
                            className={`level-node ${level.unlocked ? 'unlocked' : 'locked'} ${level.completed ? 'completed' : ''}`}
                            onClick={() => handleLevelClick(level)}
                        >
                            <div className="level-circle">
                                {level.completed ? '✓' : level.id}
                            </div>
                            <div className="level-label">{level.name}</div>
                            {level.unlocked ? 
                                <div className="level-status">
                                    {level.completed ? 'Completed' : 'Ready'}
                                </div> :
                                <div className="level-status locked">Locked</div>
                            }
                        </div>
                        {index < levels.length - 1 && (
                            <div className={`path-connector ${levels[index + 1].unlocked ? 'unlocked' : 'locked'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default Levels;