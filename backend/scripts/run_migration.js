const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
    console.log('Starting execution of migration script...');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log('Connected to MySQL server.');

        // Read the SQL file
        const sqlPath = path.join(__dirname, '../database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL file: database.sql');

        // Split and execute or execute all at once
        await connection.query(sql);

        console.log('Migration completed successfully.');
        await connection.end();
    } catch (err) {
        console.error('Error running migration:', err);
        process.exit(1);
    }
}

runMigration();
