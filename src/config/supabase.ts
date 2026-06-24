import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.vzrmgorgkslusbkoequm',  
  password: process.env.DB_PASSWORD,
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to DB");
  } catch (err) {
    console.error("Not connected to DB");

    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error("Unknown error", err);
    }
  }
}

connectDB();

export default client;
