// Quick script to migrate Render database
// Run: node migrate-render.js "YOUR_RENDER_DATABASE_URL"

const { execSync } = require('child_process');

const dbUrl = process.argv[2];

if (!dbUrl) {
  console.error('❌ Please provide your Render database URL');
  console.log('Usage: node migrate-render.js "postgresql://user:pass@host/db"');
  process.exit(1);
}

console.log('🔄 Running migration on Render database...');

try {
  // Set the database URL and run migration
  process.env.DATABASE_URL = dbUrl;
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl }
  });
  
  console.log('\n✅ Migration completed successfully!');
  console.log('🎉 Your app should work now!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
