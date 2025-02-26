-- Insert sample users
INSERT INTO users (username, email, password_hash) VALUES
    ('JohnDoe', 'john@example.com', 'hashed_password_1'),
    ('JaneSmith', 'jane@example.com', 'hashed_password_2'),
    ('AliceJohnson', 'alice@example.com', 'hashed_password_3');

-- Insert sample challenges
INSERT INTO challenges (title, description, difficulty_level, points) VALUES
    ('Debug Challenge 1', 'Find and fix the syntax error', 'Easy', 100),
    ('Debug Challenge 2', 'Fix the infinite loop', 'Medium', 200),
    ('Debug Challenge 3', 'Resolve the memory leak', 'Hard', 300);

-- Insert sample user progress
INSERT INTO user_progress (user_id, challenge_id, completed, streak_days, total_score) VALUES
    (1, 1, TRUE, 5, 1250),
    (2, 1, TRUE, 3, 1100),
    (3, 1, TRUE, 4, 1050);

-- Insert sample leaderboard data
INSERT INTO leaderboard (user_id, total_score, challenges_completed, current_streak) VALUES
    (1, 1250, 25, 5),
    (2, 1100, 15, 3),
    (3, 1050, 20, 4); 