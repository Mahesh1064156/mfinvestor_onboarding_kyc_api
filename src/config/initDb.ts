import client from "./supabase";

async function initializeDatabase() {
  console.log("Connecting to database to verify tables...");
  try {
    // Create kyc_details table
    await client.query(`
      CREATE TABLE IF NOT EXISTS kyc_details (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        pan_number VARCHAR(10) NOT NULL,
        pan_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        kyc_status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        verified_at TIMESTAMP WITH TIME ZONE
      );
    `);
    console.log("✓ 'kyc_details' table is ready.");

    // Create audit_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        action VARCHAR(50) NOT NULL,
        entity VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("✓ 'audit_logs' table is ready.");
    
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  } finally {
    // Note: Do not close the client if it's reused, but since we run this as a standalone script it is fine
    // We will run this script once and exit.
  }
}

// Execute migration
initializeDatabase().then(() => {
  console.log("Migration script completed.");
  process.exit(0);
}).catch((err) => {
  console.error("Migration execution error:", err);
  process.exit(1);
});
