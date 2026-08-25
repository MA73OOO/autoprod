import postgres from '@prisma/orm-postgres/runtime';
import 'dotenv/config';

async function test() {
  const sql = postgres({
    url: process.env.DATABASE_URL
  });
  try {
    console.log("Fetching tables...");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("Tables in public schema:", tables.map(t => t.table_name));
    
    // Check if user table exists and its column types
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user' OR table_name = 'User'
    `;
    console.log("Columns:", columns);
  } catch (err) {
    console.error("Query failed:", err);
  }
}
test();
