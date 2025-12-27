const { pool } = require('./config/db');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data (optional - be careful in production!)
    console.log('Clearing existing data...');
    await pool.query('DELETE FROM maintenance_requests');
    await pool.query('DELETE FROM equipment');
    await pool.query('DELETE FROM team_members');
    await pool.query('DELETE FROM teams');
    await pool.query('DELETE FROM equipment_categories');
    await pool.query('DELETE FROM work_centers');
    await pool.query('DELETE FROM users WHERE email != $1', ['admin@gearguard.com']);

    // Get or create default company
    let companyResult = await pool.query('SELECT id FROM companies WHERE name = $1', [
      'My Company (Main Office)',
    ]);
    let companyId;
    if (companyResult.rows.length === 0) {
      const newCompany = await pool.query('INSERT INTO companies (name) VALUES ($1) RETURNING id', [
        'My Company (Main Office)',
      ]);
      companyId = newCompany.rows[0].id;
    } else {
      companyId = companyResult.rows[0].id;
    }

    // Create dummy users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = [
      { name: 'John Doe', email: 'john.doe@gearguard.com', role: 'manager' },
      { name: 'Jane Smith', email: 'jane.smith@gearguard.com', role: 'technician' },
      { name: 'Mike Johnson', email: 'mike.johnson@gearguard.com', role: 'technician' },
      { name: 'Sarah Williams', email: 'sarah.williams@gearguard.com', role: 'technician' },
      { name: 'David Brown', email: 'david.brown@gearguard.com', role: 'technician' },
      { name: 'Emily Davis', email: 'emily.davis@gearguard.com', role: 'user' },
      { name: 'Robert Wilson', email: 'robert.wilson@gearguard.com', role: 'technician' },
      { name: 'Lisa Anderson', email: 'lisa.anderson@gearguard.com', role: 'technician' },
    ];

    const userIds = [];
    for (const user of users) {
      const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [user.name, user.email, hashedPassword, user.role]
      );
      userIds.push(result.rows[0].id);
    }

    // Create equipment categories
    console.log('Creating equipment categories...');
    const categories = [
      { name: 'Vehicles', responsible_user_id: userIds[0] },
      { name: 'Machinery', responsible_user_id: userIds[0] },
      { name: 'IT Equipment', responsible_user_id: userIds[0] },
      { name: 'HVAC Systems', responsible_user_id: userIds[0] },
      { name: 'Electrical', responsible_user_id: userIds[0] },
      { name: 'Plumbing', responsible_user_id: userIds[0] },
      { name: 'Servers', responsible_user_id: userIds[0] },
      { name: 'Databases', responsible_user_id: userIds[0] },
    ];

    const categoryIds = [];
    for (const category of categories) {
      const result = await pool.query(
        'INSERT INTO equipment_categories (name, responsible_user_id, company_id) VALUES ($1, $2, $3) RETURNING id',
        [category.name, category.responsible_user_id, companyId]
      );
      categoryIds.push(result.rows[0].id);
    }

    // Create teams
    console.log('Creating teams...');
    const teams = [
      { name: 'Mechanics Team', members: [userIds[1], userIds[2]] },
      { name: 'IT Support Team', members: [userIds[3], userIds[4]] },
      { name: 'Electrical Team', members: [userIds[5], userIds[6]] },
      { name: 'HVAC Team', members: [userIds[7], userIds[1]] },
      { name: 'General Maintenance', members: [userIds[2], userIds[3], userIds[4]] },
    ];

    const teamIds = [];
    for (const team of teams) {
      const teamResult = await pool.query(
        'INSERT INTO teams (name, company_id) VALUES ($1, $2) RETURNING id',
        [team.name, companyId]
      );
      const teamId = teamResult.rows[0].id;
      teamIds.push(teamId);

      // Add team members
      for (const memberId of team.members) {
        await pool.query('INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)', [
          teamId,
          memberId,
        ]);
      }
    }

    // Create work centers
    console.log('Creating work centers...');
    const workCenters = [
      {
        name: 'Assembly 1',
        cost: 1000.0,
        tag: 'ASM-001',
        cost_per_hour: 50.0,
        capacity_task_per_hour: 2.5,
        daily_target: 20,
      },
      {
        name: 'Drill 1',
        cost: 1500.0,
        tag: 'DRL-001',
        cost_per_hour: 75.0,
        capacity_task_per_hour: 3.0,
        daily_target: 24,
      },
      {
        name: 'IT Lab',
        cost: 2000.0,
        tag: 'IT-001',
        cost_per_hour: 100.0,
        capacity_task_per_hour: 4.0,
        daily_target: 32,
      },
    ];

    const workCenterIds = [];
    for (const wc of workCenters) {
      const result = await pool.query(
        `INSERT INTO work_centers (
          name, cost, tag, cost_per_hour, capacity_task_per_hour, 
          daily_target, company_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          wc.name,
          wc.cost,
          wc.tag,
          wc.cost_per_hour,
          wc.capacity_task_per_hour,
          wc.daily_target,
          companyId,
        ]
      );
      workCenterIds.push(result.rows[0].id);
    }

    // Set alternative work centers
    await pool.query('UPDATE work_centers SET alternative_work_center_id = $1 WHERE id = $2', [
      workCenterIds[1],
      workCenterIds[0],
    ]);

    // Create equipment
    console.log('Creating equipment...');
    const equipment = [
      {
        name: 'CNC Machine 01',
        serial_number: 'CNC-2024-001',
        type_model: 'CNC-5000',
        category_id: categoryIds[1],
        department: 'Production',
        location: 'Factory Floor A',
        maintenance_type: 'Preventive',
        default_team_id: teamIds[0],
        default_technician_id: userIds[1],
        purchase_date: '2023-01-15',
        warranty_info: '2 years warranty',
      },
      {
        name: 'Forklift 02',
        serial_number: 'FL-2024-002',
        type_model: 'FL-3000',
        category_id: categoryIds[0],
        department: 'Warehouse',
        location: 'Warehouse B',
        maintenance_type: 'Corrective',
        default_team_id: teamIds[0],
        default_technician_id: userIds[2],
        purchase_date: '2023-03-20',
      },
      {
        name: 'Server Rack 01',
        serial_number: 'SRV-2024-003',
        type_model: 'Dell PowerEdge',
        category_id: categoryIds[6],
        department: 'IT',
        location: 'Server Room',
        maintenance_type: 'Preventive',
        default_team_id: teamIds[1],
        default_technician_id: userIds[3],
        purchase_date: '2023-05-10',
      },
      {
        name: 'Laptop - John Doe',
        serial_number: 'LAP-2024-004',
        type_model: 'Dell Latitude',
        category_id: categoryIds[2],
        department: 'Sales',
        location: 'Office Floor 2',
        maintenance_type: 'Corrective',
        default_team_id: teamIds[1],
        default_technician_id: userIds[4],
        employee_id: userIds[0],
        purchase_date: '2023-06-01',
      },
      {
        name: 'AC Unit - Main Office',
        serial_number: 'AC-2024-005',
        type_model: 'Carrier 5-Ton',
        category_id: categoryIds[3],
        department: 'Administration',
        location: 'Main Office',
        maintenance_type: 'Preventive',
        default_team_id: teamIds[3],
        default_technician_id: userIds[7],
        purchase_date: '2023-02-15',
      },
      {
        name: 'Electrical Panel A',
        serial_number: 'ELEC-2024-006',
        type_model: 'Siemens Panel',
        category_id: categoryIds[4],
        department: 'Production',
        location: 'Factory Floor A',
        maintenance_type: 'Preventive',
        default_team_id: teamIds[2],
        default_technician_id: userIds[5],
        purchase_date: '2023-04-01',
      },
      {
        name: 'Database Server',
        serial_number: 'DB-2024-007',
        type_model: 'Oracle Server',
        category_id: categoryIds[7],
        department: 'IT',
        location: 'Server Room',
        maintenance_type: 'Preventive',
        default_team_id: teamIds[1],
        default_technician_id: userIds[3],
        purchase_date: '2023-01-20',
      },
      {
        name: 'Water Pump System',
        serial_number: 'WP-2024-008',
        type_model: 'Grundfos Pump',
        category_id: categoryIds[5],
        department: 'Maintenance',
        location: 'Basement',
        maintenance_type: 'Corrective',
        default_team_id: teamIds[4],
        default_technician_id: userIds[2],
        purchase_date: '2023-07-10',
      },
    ];

    const equipmentIds = [];
    for (const eq of equipment) {
      const result = await pool.query(
        `INSERT INTO equipment (
          name, serial_number, type_model, category_id, company_id,
          employee_id, department, location, maintenance_type,
          default_team_id, default_technician_id, purchase_date, warranty_info
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
        [
          eq.name,
          eq.serial_number,
          eq.type_model,
          eq.category_id,
          companyId,
          eq.employee_id || null,
          eq.department,
          eq.location,
          eq.maintenance_type,
          eq.default_team_id,
          eq.default_technician_id,
          eq.purchase_date,
          eq.warranty_info || null,
        ]
      );
      equipmentIds.push(result.rows[0].id);
    }

    // Create maintenance requests
    console.log('Creating maintenance requests...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const requests = [
      // New requests
      {
        subject: 'CNC Machine making unusual noise',
        equipment_id: equipmentIds[0],
        type: 'Corrective',
        status: 'New',
        priority: 'High',
        assigned_by: userIds[0],
        assigned_to: null,
        team_id: teamIds[0],
        due_date: tomorrow.toISOString().split('T')[0],
        location: 'Factory Floor A',
        description: 'CNC machine started making grinding noise during operation',
      },
      {
        subject: 'Forklift hydraulic leak',
        equipment_id: equipmentIds[1],
        type: 'Corrective',
        status: 'New',
        priority: 'Urgent',
        assigned_by: userIds[0],
        assigned_to: null,
        team_id: teamIds[0],
        due_date: today.toISOString().split('T')[0],
        location: 'Warehouse B',
        description: 'Hydraulic fluid leaking from fork mechanism',
      },
      {
        subject: 'Laptop screen not working',
        equipment_id: equipmentIds[3],
        type: 'Corrective',
        status: 'New',
        priority: 'Medium',
        assigned_by: userIds[0],
        assigned_to: null,
        team_id: teamIds[1],
        due_date: nextWeek.toISOString().split('T')[0],
        location: 'Office Floor 2',
        description: 'Screen goes black after 10 minutes of use',
      },
      // In Progress requests
      {
        subject: 'Monthly server maintenance',
        equipment_id: equipmentIds[2],
        type: 'Preventive',
        status: 'In Progress',
        priority: 'Medium',
        assigned_by: userIds[0],
        assigned_to: userIds[3],
        team_id: teamIds[1],
        scheduled_date: today.toISOString().split('T')[0],
        due_date: tomorrow.toISOString().split('T')[0],
        location: 'Server Room',
        description: 'Routine monthly server checkup and cleaning',
      },
      {
        subject: 'AC filter replacement',
        equipment_id: equipmentIds[4],
        type: 'Preventive',
        status: 'In Progress',
        priority: 'Low',
        assigned_by: userIds[0],
        assigned_to: userIds[7],
        team_id: teamIds[3],
        scheduled_date: today.toISOString().split('T')[0],
        due_date: tomorrow.toISOString().split('T')[0],
        location: 'Main Office',
        frequency: 'Monthly',
        description: 'Replace AC filters and check refrigerant levels',
      },
      {
        subject: 'Electrical panel inspection',
        equipment_id: equipmentIds[5],
        type: 'Preventive',
        status: 'In Progress',
        priority: 'High',
        assigned_by: userIds[0],
        assigned_to: userIds[5],
        team_id: teamIds[2],
        scheduled_date: today.toISOString().split('T')[0],
        due_date: tomorrow.toISOString().split('T')[0],
        location: 'Factory Floor A',
        frequency: 'Quarterly',
        description: 'Quarterly electrical panel safety inspection',
      },
      // Repaired requests
      {
        subject: 'Database backup verification',
        equipment_id: equipmentIds[6],
        type: 'Preventive',
        status: 'Repaired',
        priority: 'Medium',
        assigned_by: userIds[0],
        assigned_to: userIds[3],
        team_id: teamIds[1],
        scheduled_date: lastWeek.toISOString().split('T')[0],
        due_date: lastWeek.toISOString().split('T')[0],
        duration_hours: 2.5,
        location: 'Server Room',
        description: 'Verified database backups and tested restore procedure',
      },
      {
        subject: 'Water pump motor replacement',
        equipment_id: equipmentIds[7],
        type: 'Corrective',
        status: 'Repaired',
        priority: 'High',
        assigned_by: userIds[0],
        assigned_to: userIds[2],
        team_id: teamIds[4],
        due_date: lastWeek.toISOString().split('T')[0],
        duration_hours: 4.0,
        location: 'Basement',
        description: 'Replaced faulty water pump motor',
      },
      // Overdue requests
      {
        subject: 'CNC calibration overdue',
        equipment_id: equipmentIds[0],
        type: 'Preventive',
        status: 'New',
        priority: 'High',
        assigned_by: userIds[0],
        assigned_to: null,
        team_id: teamIds[0],
        scheduled_date: yesterday.toISOString().split('T')[0],
        due_date: yesterday.toISOString().split('T')[0],
        location: 'Factory Floor A',
        frequency: 'Monthly',
        description: 'Monthly CNC machine calibration',
      },
      {
        subject: 'Server room temperature check',
        equipment_id: equipmentIds[2],
        type: 'Preventive',
        status: 'New',
        priority: 'Medium',
        assigned_by: userIds[0],
        assigned_to: null,
        team_id: teamIds[1],
        scheduled_date: yesterday.toISOString().split('T')[0],
        due_date: yesterday.toISOString().split('T')[0],
        location: 'Server Room',
        frequency: 'Weekly',
        description: 'Weekly temperature and humidity check',
      },
      // Upcoming preventive maintenance
      {
        subject: 'Quarterly AC system service',
        equipment_id: equipmentIds[4],
        type: 'Preventive',
        status: 'New',
        priority: 'Medium',
        assigned_by: userIds[0],
        assigned_to: null,
        team_id: teamIds[3],
        scheduled_date: nextWeek.toISOString().split('T')[0],
        due_date: nextWeek.toISOString().split('T')[0],
        location: 'Main Office',
        frequency: 'Quarterly',
        recurrence_pattern: 'Every 3 months',
        description: 'Full AC system service including coil cleaning',
      },
      {
        subject: 'Monthly database optimization',
        equipment_id: equipmentIds[6],
        type: 'Preventive',
        status: 'New',
        priority: 'Low',
        assigned_by: userIds[0],
        assigned_to: null,
        team_id: teamIds[1],
        scheduled_date: nextWeek.toISOString().split('T')[0],
        due_date: nextWeek.toISOString().split('T')[0],
        location: 'Server Room',
        frequency: 'Monthly',
        description: 'Monthly database optimization and index maintenance',
      },
    ];

    for (const req of requests) {
      await pool.query(
        `INSERT INTO maintenance_requests (
          subject, equipment_id, type, status, priority, assigned_by, assigned_to,
          team_id, scheduled_date, due_date, duration_hours, location,
          frequency, recurrence_pattern, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          req.subject,
          req.equipment_id,
          req.type,
          req.status,
          req.priority,
          req.assigned_by,
          req.assigned_to || null,
          req.team_id,
          req.scheduled_date || null,
          req.due_date || null,
          req.duration_hours || null,
          req.location,
          req.frequency || null,
          req.recurrence_pattern || null,
          req.description,
        ]
      );
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`   - Created ${users.length} users`);
    console.log(`   - Created ${categories.length} equipment categories`);
    console.log(`   - Created ${teams.length} teams`);
    console.log(`   - Created ${workCenters.length} work centers`);
    console.log(`   - Created ${equipment.length} equipment items`);
    console.log(`   - Created ${requests.length} maintenance requests`);
    console.log('\nDefault login credentials:');
    console.log('   Email: john.doe@gearguard.com');
    console.log('   Password: password123');
    console.log('\n(All users have the same password: password123)');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();

