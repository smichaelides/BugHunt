-- Drop tables if they exist
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Problems Table
CREATE TABLE problems (
    problemid SERIAL PRIMARY KEY,
    level INT NOT NULL,
    difficulty VARCHAR(50),
    description TEXT,
    code TEXT,
    correctsolution TEXT,
    wrongoption1 TEXT,
    wrongoption2 TEXT,
    wrongoption3 TEXT
);

-- Create Users Table (renamed from 'user' to avoid reserved keyword conflicts)
CREATE TABLE users (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    streakcounter INT DEFAULT 0,
    points INT DEFAULT 0,
    challengescompleted INT DEFAULT 0,
    lastactivitydate DATE
);

-- Table for storing all potential daily puzzles
CREATE TABLE IF NOT EXISTS public.daily_puzzles (
    puzzleid SERIAL PRIMARY KEY,
    difficulty VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    code TEXT NOT NULL,
    correctsolution TEXT NOT NULL,
    wrongoption1 TEXT NOT NULL,
    wrongoption2 TEXT NOT NULL,
    wrongoption3 TEXT NOT NULL,
    lastuseddate DATE,
    isused BOOLEAN DEFAULT FALSE
);

-- Table for the currently active daily puzzle
CREATE TABLE IF NOT EXISTS public.active_daily_puzzle (
    id SERIAL PRIMARY KEY,
    puzzleid INT NOT NULL REFERENCES public.daily_puzzles(puzzleid),
    activationdate DATE NOT NULL DEFAULT CURRENT_DATE,
    expirationdate DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 day'),
    CONSTRAINT unique_active_puzzle UNIQUE (activationdate)
);

-- Table to track which users have completed today's puzzle
CREATE TABLE IF NOT EXISTS public.daily_puzzle_completions (
    id SERIAL PRIMARY KEY,
    userid INT NOT NULL REFERENCES public.users(userid),
    puzzleid INT NOT NULL REFERENCES public.daily_puzzles(puzzleid),
    completiondate DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT unique_daily_completion UNIQUE (userid, puzzleid)
);

-- Table to track which users have completed which problems
CREATE TABLE IF NOT EXISTS public.problem_completions (
    id SERIAL PRIMARY KEY,
    userid INT NOT NULL REFERENCES public.users(userid),
    problemid INT NOT NULL REFERENCES public.problems(problemid),
    level INT NOT NULL,
    completiondate DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT unique_problem_completion UNIQUE (userid, problemid)
);

-- Table to track user progress including completed levels
CREATE TABLE IF NOT EXISTS public.user_progress (
    userid INTEGER PRIMARY KEY REFERENCES public.users(userid),
    completedlevels INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    unlockedlevels INTEGER[] DEFAULT ARRAY[1]::INTEGER[]
);


