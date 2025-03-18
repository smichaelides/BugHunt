-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    streakcounter INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    challengescompleted INTEGER DEFAULT 0
);

-- Create user_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_progress (
    userid INTEGER PRIMARY KEY REFERENCES users(id),
    completedlevels INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    unlockedlevels INTEGER[] DEFAULT ARRAY[1]::INTEGER[]
); 