-- Drop tables if they exist
CREATE DATABASE bughunt_db; 

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS Problem;
DROP TABLE IF EXISTS User;

-- Create Problem Table
CREATE TABLE Problem (
    ProblemID INT PRIMARY KEY AUTO_INCREMENT,
    Difficulty VARCHAR(50),
    Description TEXT,
    Code TEXT,
    CorrectSolution TEXT,
    WrongOption1 TEXT,
    WrongOption2 TEXT,
    WrongOption3 TEXT
);

-- Create User Table
CREATE TABLE User (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    StreakCounter INT DEFAULT 0,
    Points INT DEFAULT 0,
    ChallengesCompleted INT DEFAULT 0
);

