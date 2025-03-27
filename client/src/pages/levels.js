import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLevels, fetchUserProgress } from '../utils/api';
import './levels.css';

const Levels = () => {
    const navigate = useNavigate();
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [levelsData, progressData] = await Promise.all([
                    fetchLevels(),
                    fetchUserProgress(1) // hardcoded user ID for now
                ]);
                
                // Add unlocked and completed status to each level
                const levelsWithProgress = levelsData.map((level) => ({
                    ...level,
                    // All levels are now unlocked by default
                    unlocked: true,
                    completed: progressData.completedLevels.includes(level.id)
                }));
                
                setLevels(levelsWithProgress);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLevelClick = (level) => {
        // Since all levels are unlocked, we can remove the check
        navigate(`/level/${level.id}`);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="level-home-page">
            <h1>Debug Journey</h1>
            <div className="level-path">
                {levels.map((level, index) => (
                    <React.Fragment key={level.id}>
                        <div 
                            className={`level-node unlocked ${level.completed ? 'completed' : ''}`}
                            onClick={() => handleLevelClick(level)}
                        >
                            <div className="level-circle">
                                {level.completed ? '✓' : level.id}
                            </div>
                            <div className="level-label">{level.name}</div>
                            <div className="level-description">{level.description}</div>
                            <div className="level-status">
                                {level.completed ? 'Completed' : 'Ready'}
                            </div>
                        </div>
                        {index < levels.length - 1 && (
                            <div className="path-connector unlocked" />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default Levels;