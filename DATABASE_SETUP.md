# Database Setup Instructions

Follow these steps to set up the database on your local machine:

1. Make sure PostgreSQL is installed on your computer
2. Create the database:
```bash
createdb bughunt_db
```

3. Import the database backup:
```bash
psql bughunt_db < database_backup.sql
```

4. Verify the setup by checking the tables:
```bash
psql bughunt_db
\dt
```

You should see the following tables:
- problems
- users
- user_progress

5. Update your .env file with your local PostgreSQL credentials:
```
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bughunt_db
```

If you encounter any issues:
1. Make sure PostgreSQL is running
2. Check that your database credentials in .env are correct
3. Ensure you have necessary permissions to create databases 