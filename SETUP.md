# GearGuard Setup Instructions

## Quick Start Guide

### 1. Database Setup

1. **Install PostgreSQL** (if not already installed)
   - Download from: https://www.postgresql.org/download/
   - Default port: 5432

2. **Create Database**
   ```sql
   CREATE DATABASE gearguard;
   ```

3. **Configure Database Connection**
   - Copy `server/.env.example` to `server/.env`
   - Update the following variables:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=gearguard
     DB_USER=postgres
     DB_PASSWORD=your_postgres_password
     JWT_SECRET=your_random_secret_key_here
     ```

### 2. Install Dependencies

From the project root directory:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

Or use the convenience script:
```bash
npm run install-all
```

### 3. Start the Application

**Option 1: Run both server and client together**
```bash
npm run dev
```

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 5. First Login

1. Navigate to http://localhost:3000
2. Click "Sign up" to create a new account
3. After registration, you'll be automatically logged in
4. Start using the application!

## Troubleshooting

### Database Connection Issues

If you get database connection errors:
1. Verify PostgreSQL is running
2. Check your `.env` file has correct credentials
3. Ensure the database `gearguard` exists
4. Try connecting with psql to verify credentials

### Port Already in Use

If port 5000 or 3000 is already in use:
- Backend: Change `PORT` in `server/.env`
- Frontend: React will prompt to use a different port

### Module Not Found Errors

Make sure you've installed all dependencies:
```bash
npm run install-all
```

### CORS Issues

If you see CORS errors, ensure:
- Backend is running on port 5000
- Frontend is making requests to `http://localhost:5000`
- CORS is enabled in `server/index.js` (already configured)

## Development Notes

- The database schema is automatically created on first server start
- Default company "My Company (Main Office)" is created automatically
- All API endpoints require authentication except `/api/auth/login` and `/api/auth/register`

