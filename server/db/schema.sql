-- Drop tables if they exist
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Problems Table
CREATE TABLE problems (
    ProblemID SERIAL PRIMARY KEY,
    Level INT NOT NULL,
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

-- Table for storing all potential daily puzzles
CREATE TABLE IF NOT EXISTS public.daily_puzzles (
    PuzzleID SERIAL PRIMARY KEY,
    Difficulty VARCHAR(20) NOT NULL,
    Description TEXT NOT NULL,
    Code TEXT NOT NULL,
    CorrectSolution TEXT NOT NULL,
    WrongOption1 TEXT NOT NULL,
    WrongOption2 TEXT NOT NULL,
    WrongOption3 TEXT NOT NULL,
    LastUsedDate DATE,
    IsUsed BOOLEAN DEFAULT FALSE
);

-- Table for the currently active daily puzzle
CREATE TABLE IF NOT EXISTS public.active_daily_puzzle (
    ID SERIAL PRIMARY KEY,
    PuzzleID INT NOT NULL REFERENCES public.daily_puzzles(PuzzleID),
    ActivationDate DATE NOT NULL DEFAULT CURRENT_DATE,
    ExpirationDate DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 day'),
    CONSTRAINT unique_active_puzzle UNIQUE (ActivationDate)
);

-- Table to track which users have completed today's puzzle
CREATE TABLE IF NOT EXISTS public.daily_puzzle_completions (
    ID SERIAL PRIMARY KEY,
    UserID INT NOT NULL REFERENCES public.users(UserID),
    PuzzleID INT NOT NULL REFERENCES public.daily_puzzles(PuzzleID),
    CompletionDate DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT unique_daily_completion UNIQUE (UserID, PuzzleID)
);


