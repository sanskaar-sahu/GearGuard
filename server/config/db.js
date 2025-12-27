const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'gearguard',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database schema
const init = async () => {
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipment_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        responsible_user_id INTEGER REFERENCES users(id),
        company_id INTEGER REFERENCES companies(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company_id INTEGER REFERENCES companies(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(team_id, user_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS work_centers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cost DECIMAL(10, 2),
        tag VARCHAR(100),
        cost_per_hour DECIMAL(10, 2),
        capacity_task_per_hour DECIMAL(10, 2),
        daily_target INTEGER,
        alternative_work_center_id INTEGER REFERENCES work_centers(id),
        company_id INTEGER REFERENCES companies(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        serial_number VARCHAR(255),
        type_model VARCHAR(255),
        category_id INTEGER REFERENCES equipment_categories(id),
        company_id INTEGER REFERENCES companies(id),
        employee_id INTEGER REFERENCES users(id),
        department VARCHAR(255),
        location VARCHAR(255),
        shop_detail VARCHAR(255),
        maintenance_type VARCHAR(100),
        assigned_date DATE,
        purchase_date DATE,
        warranty_info TEXT,
        description TEXT,
        default_team_id INTEGER REFERENCES teams(id),
        default_technician_id INTEGER REFERENCES users(id),
        is_scrapped BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS maintenance_requests (
        id SERIAL PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        equipment_id INTEGER REFERENCES equipment(id),
        type VARCHAR(50) NOT NULL CHECK (type IN ('Corrective', 'Preventive')),
        status VARCHAR(50) DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Repaired', 'Scrap')),
        priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
        assigned_by INTEGER REFERENCES users(id),
        assigned_to INTEGER REFERENCES users(id),
        team_id INTEGER REFERENCES teams(id),
        scheduled_date DATE,
        due_date DATE,
        duration_hours DECIMAL(10, 2),
        location VARCHAR(255),
        frequency VARCHAR(100),
        recurrence_pattern VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_equipment_company ON equipment(company_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_requests_equipment ON maintenance_requests(equipment_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_requests_status ON maintenance_requests(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_requests_scheduled_date ON maintenance_requests(scheduled_date);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_requests_due_date ON maintenance_requests(due_date);`);

    // Insert default company if not exists
    const companyResult = await pool.query('SELECT id FROM companies WHERE name = $1', ['My Company (Main Office)']);
    if (companyResult.rows.length === 0) {
      await pool.query('INSERT INTO companies (name) VALUES ($1) RETURNING id', ['My Company (Main Office)']);
    }

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = {
  pool,
  init,
};

