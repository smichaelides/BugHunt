// Load environment variables from .env file
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5001;

// For debugging
console.log('Environment variables loaded:');
console.log('DB_USER:', process.env.DB_USER ? 'Found' : 'Not found');
console.log('DB_HOST:', process.env.DB_HOST ? 'Found' : 'Not found');
console.log('DB_NAME:', process.env.DB_NAME ? 'Found' : 'Not found');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'Found (not showing value)' : 'Not found');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found (not showing value)' : 'Not found');

app.use(cors()); // Enable CORS
app.use(express.json()); // Allow JSON body parsing

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'neondb_owner',
    host: process.env.DB_HOST || 'ep-still-resonance-a5g96qo7-pooler.us-east-2.aws.neon.tech',
    database: process.env.DB_NAME || 'neonBugHunt',
    password: process.env.DB_PASSWORD || 'npg_j0NZc7wLfWzk',
    port: process.env.DB_PORT || 5432,
    ssl: {
        rejectUnauthorized: false // Required for Neon connection
    }
});

// Test database connection
pool.connect((err, client, done) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Successfully connected to database');
        done();
    }
});

// Mock Database Tables
const mockDB = {

    // INFO WE NEED TO GET FROM THE USERS WHEN THEY LOG IN
    users: [
        {
            id: 1,
            username: "testUser1",
            email: "test1@example.com",
            streakCounter: 5,
            points: 1250,
            challengesCompleted: 25
        },
        {
            id: 2,
            username: "debugMaster",
            email: "debug@example.com",
            streakCounter: 10,
            points: 10,
            challengesCompleted: 45
        },
        {
            id: 3,
            username: "smichaelides",
            email: "smich@gmail.com",
            streakCounter: 15,
            points: 150,
            challengesCompleted: 20
        },
        {
            id: 4,
            username: "lorenzocag",
            email: "lorengocag@gmail.com",
            streakCounter: 20,
            points: 180,
            challengesCompleted: 25
        }
    ],

    levels: [
        { id: 1, name: "Level 1", description: "Introduction to Debugging" },
        { id: 2, name: "Level 2", description: "Basic Syntax Errors" },
        { id: 3, name: "Level 3", description: "Logic Errors" },
        { id: 4, name: "Level 4", description: "Runtime Errors" },
        { id: 5, name: "Level 5", description: "Array and Object Debugging" },
        { id: 6, name: "Level 6", description: "Function Debugging" },
        { id: 7, name: "Level 7", description: "Async Code Debugging" },
        { id: 8, name: "Level 8", description: "Performance Issues" },
        { id: 9, name: "Level 9", description: "Memory Leaks" },
        { id: 10, name: "Level 10", description: "Advanced Debugging" }
    ],

    challenges: {
        // challenges for level 1
        1: [
            {
                id: 1,
                title: "Fix the Loop",
                difficulty: "Easy",
                description: "Debug an infinite loop in JavaScript",
                code: "for(let i = 0; i < 10; i--) {\n  console.log(i);\n}",
                points: 20,
                completed: false
            },
            // Add 4 more challenges for level 1...
        ],
        
        // challenges for level 2
        2: [
            {
                id: 6,
                title: "Array Index Error",
                difficulty: "Easy",
                description: "Find and fix array index out of bounds",
                code: "const arr = [1,2,3];\nconsole.log(arr[3]);",
                points: 30,
                completed: false
            },
            // Add 4 more challenges for level 2...
        ],
        // Continue for levels 3-10...
    },

    // NEED TO ADD REST OF USERS TO USER PROGRESS?
    userProgress: {
        1: {
            userId: 1,
            completedLevels: [1],
            unlockedLevels: [1, 2],
            completedChallenges: [1, 2, 3],
            currentStreak: 5,
            totalPoints: 1250
        }
    },
};

// API Endpoints

// Get User Profile
app.get('/api/user/:userId', (req, res) => {
    const user = mockDB.users.find(u => u.id === parseInt(req.params.userId));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
});

// Get User Progress
app.get('/api/user/:userId/progress', (req, res) => {
    const progress = mockDB.userProgress[req.params.userId];
    if (!progress) return res.status(404).json({ error: "Progress not found" });
    res.json(progress);
});

// Get All Levels
app.get('/api/levels', (req, res) => {
    res.json(mockDB.levels);
});

// Get Level Challenges
app.get('/api/level/:levelId/challenges', (req, res) => {
    const challenges = mockDB.challenges[req.params.levelId];
    if (!challenges) return res.status(404).json({ error: "Level not found" });
    res.json(challenges);
});

// Get leaderboard data (users sorted by points)
app.get('/api/leaderboard', async (req, res) => {
    try {
        console.log('Fetching leaderboard data');
        
        const query = `
            SELECT username, email, points, challengescompleted, streakcounter 
            FROM public.users 
            ORDER BY points DESC 
            LIMIT 10
        `;
        
        console.log('Executing query:', query);
        
        const result = await pool.query(query);
        console.log(`Found ${result.rows.length} users for leaderboard`);
        
        // Transform the data to hide sensitive information and format for display
        const leaderboardData = result.rows.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            points: user.points,
            challengesCompleted: user.challengescompleted,
            streak: user.streakcounter
        }));
        
        res.json(leaderboardData);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Get problems for a specific level
app.get('/api/level/:levelId/problems', async (req, res) => {
    try {
        const { levelId } = req.params;
        console.log('Fetching problems for level:', levelId); // Debug log
        
        const result = await pool.query(
            'SELECT * FROM public.problems WHERE Level = $1 ORDER BY ProblemID',
            [levelId]
        );
        
        console.log('Query result:', result.rows); // Debug log
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No problems found for this level' });
        }
        
        const problems = result.rows.map(problem => ({
            problemId: problem.problemid,
            level: problem.level,
            difficulty: problem.difficulty,
            description: problem.description,
            code: problem.code,
            fixedCode: problem.correctsolution,
            wrongOption1: problem.wrongoption1,
            wrongOption2: problem.wrongoption2,
            wrongOption3: problem.wrongoption3
        }));
        
        res.json(problems);
    } catch (err) {
        console.error('Error fetching problems:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get a specific problem by ID
app.get('/api/problems/:problemId', async (req, res) => {
    try {
        const { problemId } = req.params;
        console.log('Attempting to fetch problem with ID:', problemId);
        console.log('Database connection info:', {
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT
        });

        const query = 'SELECT * FROM public.problems WHERE problemid = $1';
        console.log('Executing query:', query, 'with params:', [problemId]);
        
        const result = await pool.query(query, [problemId]);
        console.log('Raw query result:', result.rows);
        
        if (result.rows.length === 0) {
            console.log('No problem found with ID:', problemId);
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        const problem = result.rows[0];
        console.log('Found problem:', problem);
        
        const transformedProblem = {
            problemId: problem.problemid,
            level: problem.level,
            difficulty: problem.difficulty,
            description: problem.description,
            code: problem.code,
            fixedCode: problem.correctsolution,
            wrongOption1: problem.wrongoption1,
            wrongOption2: problem.wrongoption2,
            wrongOption3: problem.wrongoption3
        };
        console.log('Transformed problem:', transformedProblem);
        
        res.json(transformedProblem);
    } catch (err) {
        console.error('Detailed error:', {
            message: err.message,
            stack: err.stack,
            code: err.code,
            detail: err.detail
        });
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// Add user endpoint - handles both new and existing users
app.post('/api/auth/user', async (req, res) => {
    console.log('POST request received at /api/auth/user');
    console.log('Request body:', req.body);
    
    const { email, name, nickname } = req.body;
    console.log('Extracted data:', { email, name, nickname });
    
    try {
        // First check if user exists
        console.log('Checking if user exists...');
        let result = await pool.query(
            'SELECT * FROM public.users WHERE email = $1',
            [email]
        );
        console.log('User exists check result:', result.rows);

        // If user doesn't exist, create new user
        if (result.rows.length === 0) {
            console.log('Creating new user...');
            result = await pool.query(
                `INSERT INTO public.users (username, email, name, streakcounter, points, challengescompleted) 
                 VALUES ($1, $2, $3, 0, 0, 0) 
                 RETURNING *`,
                [nickname || name, email, name]
            );
            console.log('New user created:', result.rows[0]);
            
            // Initialize user_progress for new user
            console.log('Initializing user progress...');
            await pool.query(
                `INSERT INTO public.user_progress (userid, completedlevels, unlockedlevels) 
                 VALUES ($1, ARRAY[]::integer[], ARRAY[1]::integer[])`,
                [result.rows[0].id]
            );
            console.log('User progress initialized');
        } else {
            console.log('User already exists');
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Detailed error in user creation:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail
        });
        res.status(500).json({ error: 'Failed to manage user', details: error.message });
    }
});

// Get user by email endpoint
app.get('/api/auth/user/:email', async (req, res) => {
    const email = req.params.email;
    
    try {
        console.log('Attempting to fetch user with email:', email);
        
        // Log database connection info (without sensitive details)
        console.log('Database connection check:', {
            database: pool.options.database,
            host: pool.options.host,
            port: pool.options.port
        });

        const query = 'SELECT * FROM public.users WHERE email = $1';
        console.log('Executing query:', query);
        
        const result = await pool.query(query, [email]);
        console.log('Query result:', result.rows);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail
        });
        res.status(500).json({ error: 'Failed to fetch user', details: error.message });
    }
});

// Update user progress when challenge is completed
app.post('/api/user/complete-challenge', async (req, res) => {
    try {
        const { email, problemId } = req.body;
        console.log('Updating progress for user:', email, 'problem:', problemId);

        // First get the user
        const userResult = await pool.query(
            'SELECT * FROM public.users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

        // Calculate streak
        let newStreak = user.streakcounter;
        if (user.last_activity_date) {
            const lastActivity = new Date(user.last_activity_date);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            // If last activity was yesterday, increment streak
            if (lastActivity.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
                newStreak += 1;
            } 
            // If last activity was before yesterday, reset streak to 1
            else if (lastActivity.toISOString().split('T')[0] !== today) {
                newStreak = 1;
            }
            // If last activity was today, keep current streak
        } else {
            // First ever activity
            newStreak = 1;
        }

        // Update user's challenges completed, points, streak, and last activity date
        const updateResult = await pool.query(
            `UPDATE public.users 
             SET challengescompleted = challengescompleted + 1,
                 points = points + 10,
                 streakcounter = $1,
                 last_activity_date = $2
             WHERE email = $3
             RETURNING *`,
            [newStreak, today, email]
        );

        console.log('Updated user:', updateResult.rows[0]);
        res.json(updateResult.rows[0]);
    } catch (err) {
        console.error('Error updating user progress:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// User management endpoints
app.post('/api/users', async (req, res) => {
    try {
        const { email, name, sub } = req.body;
        console.log('Creating/updating user:', { email, name, sub });

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT * FROM public.users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            // User exists, return existing user
            console.log('User already exists:', existingUser.rows[0]);
            return res.json(existingUser.rows[0]);
        }

        // Create new user with initial values
        const result = await pool.query(
            `INSERT INTO public.users (email, username, streakcounter, points, challengescompleted) 
             VALUES ($1, $2, 0, 0, 0) 
             RETURNING *`,
            [email, name]
        );

        console.log('Created new user:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error managing user:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// Get today's daily puzzle
app.get('/api/daily-puzzle', async (req, res) => {
    try {
        console.log('Fetching today\'s daily puzzle');
        
        // Get the current date
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for comparison
        console.log('Current date for puzzle lookup:', today.toISOString());
        
        // Get the active puzzle for today using date-based comparison
        const activeQuery = `
            SELECT adp.PuzzleID, adp.ActivationDate, adp.ExpirationDate, 
                   dp.Difficulty, dp.Description, dp.Code, dp.CorrectSolution, 
                   dp.WrongOption1, dp.WrongOption2, dp.WrongOption3
            FROM public.active_daily_puzzle adp
            JOIN public.daily_puzzles dp ON adp.PuzzleID = dp.PuzzleID
            WHERE adp.ActivationDate::date <= CURRENT_DATE
            AND adp.ExpirationDate::date > CURRENT_DATE
            ORDER BY adp.ActivationDate DESC
            LIMIT 1
        `;
        
        console.log('Executing query:', activeQuery);
        let activeResult = await pool.query(activeQuery);
        
        if (activeResult.rows.length === 0) {
            console.log('No active daily puzzle found for today, attempting to generate one');
            
            // Try running the update script
            try {
                const path = require('path');
                const { promisify } = require('util');
                const exec = promisify(require('child_process').exec);
                const scriptPath = path.resolve(__dirname, './scripts/update_daily_puzzle.js');
                console.log('Attempting to run script at path:', scriptPath);
                
                // Execute the script and wait for it to complete
                const { stdout, stderr } = await exec(`node "${scriptPath}"`);
                console.log('Update script output:', stdout);
                if (stderr) {
                    console.error('Update script errors:', stderr);
                }
                
                // Check again for the puzzle after script execution
                activeResult = await pool.query(activeQuery);
                
                if (activeResult.rows.length === 0) {
                    console.error('No puzzle available after running update script');
                    return res.status(404).json({ error: 'No daily puzzle available today' });
                }
            } catch (execError) {
                console.error('Failed to execute update script:', execError);
                return res.status(404).json({ error: 'No daily puzzle available today' });
            }
        }
        
        const puzzle = activeResult.rows[0];
        console.log(`Found active puzzle ${puzzle.puzzleid} for today`);
        
        // Format the response
        const response = {
            puzzleId: puzzle.puzzleid,
            activationDate: puzzle.activationdate,
            expirationDate: puzzle.expirationdate,
            difficulty: puzzle.difficulty,
            description: puzzle.description,
            code: puzzle.code,
            options: [
                { text: puzzle.correctsolution, isCorrect: true },
                { text: puzzle.wrongoption1, isCorrect: false },
                { text: puzzle.wrongoption2, isCorrect: false },
                { text: puzzle.wrongoption3, isCorrect: false }
            ].sort(() => Math.random() - 0.5) // Shuffle the options
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error fetching daily puzzle:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Check if user has completed today's puzzle
app.get('/api/daily-puzzle/completed/:email', async (req, res) => {
    try {
        const { email } = req.params;
        console.log(`Checking if user ${email} has completed today's puzzle`);
        
        // Get user ID
        const userQuery = await pool.query(
            'SELECT UserID FROM public.users WHERE Email = $1',
            [email]
        );
        
        if (userQuery.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userId = userQuery.rows[0].userid;
        
        // Get today's puzzle ID
        const puzzleQuery = await pool.query(`
            SELECT PuzzleID FROM public.active_daily_puzzle
            WHERE ActivationDate::date <= CURRENT_DATE
            AND ExpirationDate::date > CURRENT_DATE
            ORDER BY ActivationDate DESC
            LIMIT 1
        `);
        
        if (puzzleQuery.rows.length === 0) {
            return res.status(404).json({ error: 'No active puzzle today' });
        }
        
        const puzzleId = puzzleQuery.rows[0].puzzleid;
        
        // Check if user has completed this puzzle
        const completionQuery = await pool.query(`
            SELECT * FROM public.daily_puzzle_completions
            WHERE UserID = $1 AND PuzzleID = $2
            AND CompletionDate::date = CURRENT_DATE
        `, [userId, puzzleId]);
        
        const hasCompleted = completionQuery.rows.length > 0;
        
        res.json({ completed: hasCompleted });
    } catch (error) {
        console.error('Error checking puzzle completion:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Record daily puzzle completion
app.post('/api/daily-puzzle/complete', async (req, res) => {
    try {
        const { email, puzzleId } = req.body;
        console.log(`Recording completion of puzzle ${puzzleId} for user ${email}`);
        
        // Verify this is today's puzzle
        const todayQuery = await pool.query(`
            SELECT PuzzleID FROM public.active_daily_puzzle
            WHERE PuzzleID = $1
            AND ActivationDate <= CURRENT_DATE
            AND ExpirationDate >= CURRENT_DATE
        `, [puzzleId]);
        
        if (todayQuery.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid puzzle ID or expired puzzle' });
        }
        
        // Get user ID
        const userQuery = await pool.query(
            'SELECT UserID, Points, ChallengesCompleted, StreakCounter, last_activity_date FROM public.users WHERE Email = $1',
            [email]
        );
        
        if (userQuery.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userId = userQuery.rows[0].userid;
        
        // Start transaction
        await pool.query('BEGIN');
        
        // Check if already completed to avoid giving points again
        const checkQuery = await pool.query(`
            SELECT * FROM public.daily_puzzle_completions
            WHERE UserID = $1 AND PuzzleID = $2
        `, [userId, puzzleId]);
        
        let stats;
        
        if (checkQuery.rows.length === 0) {
            // First completion - record it and award points
            await pool.query(`
                INSERT INTO public.daily_puzzle_completions (UserID, PuzzleID, CompletionDate)
                VALUES ($1, $2, CURRENT_DATE)
            `, [userId, puzzleId]);
            
            // Award points and update user stats
            const updateQuery = await pool.query(`
                UPDATE public.users
                SET Points = Points + 25,  -- More points for daily puzzles
                    ChallengesCompleted = ChallengesCompleted + 1,
                    StreakCounter = 
                        CASE 
                            WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN StreakCounter + 1
                            WHEN last_activity_date = CURRENT_DATE THEN StreakCounter
                            ELSE 1
                        END,
                    last_activity_date = CURRENT_DATE
                WHERE UserID = $1
                RETURNING Points, ChallengesCompleted, StreakCounter
            `, [userId]);
            
            stats = updateQuery.rows[0];
        } else {
            // Already completed - just return current stats without modifying them
            stats = {
                points: userQuery.rows[0].points,
                challengescompleted: userQuery.rows[0].challengescompleted,
                streakcounter: userQuery.rows[0].streakcounter
            };
        }
        
        await pool.query('COMMIT');
        
        res.json({
            message: checkQuery.rows.length === 0 ? 'Daily puzzle completed successfully' : 'Correct solution! (Already completed today)',
            stats: stats,
            firstCompletion: checkQuery.rows.length === 0
        });
    } catch (error) {
        await pool.query('ROLLBACK').catch(console.error);
        console.error('Error handling puzzle completion:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});