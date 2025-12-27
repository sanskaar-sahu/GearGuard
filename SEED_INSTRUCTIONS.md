# Database Seeding Instructions

This document explains how to populate the GearGuard database with dummy data for testing and development.

## What Gets Created

The seed script creates:
- **8 Users** (managers, technicians, and regular users)
- **8 Equipment Categories** (Vehicles, Machinery, IT Equipment, HVAC, Electrical, Plumbing, Servers, Databases)
- **5 Teams** (Mechanics, IT Support, Electrical, HVAC, General Maintenance)
- **3 Work Centers** (Assembly 1, Drill 1, IT Lab)
- **8 Equipment Items** (various types of equipment)
- **12 Maintenance Requests** (mix of New, In Progress, Repaired, and Overdue)

## How to Run

### Prerequisites
1. Make sure PostgreSQL is running
2. Database `gearguard` exists
3. Environment variables are configured in `server/.env`

### Run the Seed Script

From the `server` directory:

```bash
cd server
npm run seed
```

Or from the project root:

```bash
node server/seed.js
```

## Default Login Credentials

After seeding, you can login with any of these accounts (all have password: `password123`):

**Manager:**
- Email: `john.doe@gearguard.com`
- Password: `password123`

**Technicians:**
- `jane.smith@gearguard.com`
- `mike.johnson@gearguard.com`
- `sarah.williams@gearguard.com`
- `david.brown@gearguard.com`
- `robert.wilson@gearguard.com`
- `lisa.anderson@gearguard.com`

**Regular User:**
- `emily.davis@gearguard.com`

## Sample Data Overview

### Teams Created:
1. **Mechanics Team** - 2 members
2. **IT Support Team** - 2 members
3. **Electrical Team** - 2 members
4. **HVAC Team** - 2 members
5. **General Maintenance** - 3 members

### Equipment Created:
1. CNC Machine 01 (Production)
2. Forklift 02 (Warehouse)
3. Server Rack 01 (IT)
4. Laptop - John Doe (Sales)
5. AC Unit - Main Office (Administration)
6. Electrical Panel A (Production)
7. Database Server (IT)
8. Water Pump System (Maintenance)

### Maintenance Requests:
- **New Requests**: 5 requests (including 2 overdue)
- **In Progress**: 3 requests
- **Repaired**: 2 requests
- **Upcoming**: 2 preventive maintenance requests

## Important Notes

⚠️ **Warning**: The seed script will DELETE existing data before inserting new data. This is intentional for development/testing purposes.

⚠️ **Do NOT run this in production** without modifying the script to preserve existing data.

## Customizing the Seed Data

You can modify `server/seed.js` to:
- Add more users, teams, or equipment
- Change the data values
- Add more maintenance requests
- Modify relationships between entities

## Troubleshooting

If you encounter errors:
1. Ensure the database is running and accessible
2. Check that all tables exist (run the server once to create schema)
3. Verify your `.env` file has correct database credentials
4. Make sure you're in the correct directory when running the script

