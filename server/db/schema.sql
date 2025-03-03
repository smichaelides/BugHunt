-- Drop tables if they exist
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Problems Table
CREATE TABLE problems (
    ProblemID SERIAL PRIMARY KEY,
    Difficulty VARCHAR(50),
    Description TEXT,
    Code TEXT,
    CorrectSolution TEXT,
    WrongOption1 TEXT,
    WrongOption2 TEXT,
    WrongOption3 TEXT
);

-- Create Users Table (renamed from 'user' to avoid reserved keyword conflicts)
CREATE TABLE users (
    UserID SERIAL PRIMARY KEY,
    Username VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    StreakCounter INT DEFAULT 0,
    Points INT DEFAULT 0,
    ChallengesCompleted INT DEFAULT 0
);

CREATE TABLE challenges (
    ChallengeID SERIAL PRIMARY KEY,
    Level INT NOT NULL, -- Level number
    ProblemID INT NOT NULL, -- References a problem
    FOREIGN KEY (ProblemID) REFERENCES problems(ProblemID) ON DELETE CASCADE
);


