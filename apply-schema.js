const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected directly via pg!');
    
    const sql = fs.readFileSync('setup.sql', 'utf8');
    console.log('Executing schema...');
    
    await client.query(sql);
    console.log('Schema created successfully!');
    
  } catch (err) {
    console.error('Connection error', err.stack);
  } finally {
    await client.end();
  }
}

run();
