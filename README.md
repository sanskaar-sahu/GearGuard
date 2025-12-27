# GearGuard: The Ultimate Maintenance Tracker

A comprehensive maintenance management system built with the PERN stack (PostgreSQL, Express, React, Node.js) that allows companies to track assets and manage maintenance requests.

## Features

### Core Functionality
- **Equipment Management**: Track all company assets with detailed information
- **Maintenance Teams**: Organize technicians into specialized teams
- **Maintenance Requests**: Handle both corrective and preventive maintenance
- **Kanban Board**: Visual task management with drag-and-drop functionality
- **Calendar View**: Schedule and view preventive maintenance tasks
- **Dashboard**: Overview of tasks, equipment status, and key metrics
- **Reports**: Analytics on requests per team, category, and status

### Smart Features
- **Auto-fill Logic**: When selecting equipment, automatically fetch team and category
- **Smart Buttons**: Equipment form shows maintenance request count
- **Scrap Logic**: Automatically mark equipment as scrapped when request moves to Scrap stage
- **Overdue Indicators**: Visual indicators for overdue tasks

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- bcryptjs for password hashing

### Frontend
- React 18
- React Router for navigation
- React Beautiful DnD for drag-and-drop
- React Calendar for schedule view
- Axios for API calls

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   cd gearguard
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up PostgreSQL database**
   - Create a PostgreSQL database named `gearguard`
   - Update the database credentials in `server/.env` (create from `.env.example`)

4. **Configure environment variables**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the application**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend (port 3000).

## Project Structure

```
gearguard/
├── server/                 # Backend API
│   ├── config/            # Database configuration
│   ├── middleware/        # Authentication middleware
│   ├── routes/            # API routes
│   └── index.js          # Server entry point
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context (Auth)
│   │   ├── pages/        # Page components
│   │   └── App.js        # Main app component
│   └── public/           # Static files
└── package.json          # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Equipment
- `GET /api/equipment` - Get all equipment (with filters)
- `GET /api/equipment/:id` - Get equipment by ID
- `GET /api/equipment/:id/requests` - Get requests for equipment
- `POST /api/equipment` - Create equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment

### Maintenance Requests
- `GET /api/requests` - Get all requests (with filters)
- `GET /api/requests/:id` - Get request by ID
- `POST /api/requests` - Create request
- `PUT /api/requests/:id` - Update request
- `PATCH /api/requests/:id/status` - Update request status
- `DELETE /api/requests/:id` - Delete request

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Other Endpoints
- Work Centers, Categories, Dashboard, Reports

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Add Equipment**: Navigate to Equipment tab and add company assets
3. **Create Teams**: Set up maintenance teams in the Teams section
4. **Create Requests**: Add maintenance requests from the Kanban board or Request form
5. **Manage Tasks**: Use the Kanban board to drag and drop tasks between stages
6. **View Schedule**: Check the Calendar view for preventive maintenance
7. **View Reports**: Analyze maintenance data in the Reports section

## Key Workflows

### Breakdown Flow
1. User creates a request
2. System auto-fills team and category from equipment
3. Request starts in "New" stage
4. Technician assigns themselves
5. Status moves to "In Progress"
6. Technician records duration and moves to "Repaired"

### Preventive Maintenance Flow
1. Manager creates preventive request
2. Sets scheduled date
3. Request appears on Calendar view
4. Technician can view and complete the task

## Database Schema

The application uses the following main tables:
- `users` - User accounts
- `equipment` - Company assets
- `equipment_categories` - Equipment categories
- `teams` - Maintenance teams
- `team_members` - Team membership
- `maintenance_requests` - Maintenance tasks
- `work_centers` - Work center configuration
- `companies` - Company information

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Backend Only
```bash
npm run server
```

### Running Frontend Only
```bash
npm run client
```

## License

ISC

## Contributing

**Ayush Sahu**
**Shreyansh Sahu**
**Sanskar Sahu**


