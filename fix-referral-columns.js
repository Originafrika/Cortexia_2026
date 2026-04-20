import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addReferralColumns() {
  console.log('🔧 Adding referral columns to users table...');
  
  try {
    // Add referral_code column
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
    `;
    console.log('✅ Added referral_code column');
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log('ℹ️ referral_code already exists');
    } else {
      console.error('❌ Error adding referral_code:', e.message);
    }
  }
  
  try {
    // Add referred_by column
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT;
    `;
    console.log('✅ Added referred_by column');
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log('ℹ️ referred_by already exists');
    } else {
      console.error('❌ Error adding referred_by:', e.message);
    }
  }
  
  // Verify columns exist
  const columns = await sql`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name IN ('referral_code', 'referred_by')
  `;
  
  console.log('📋 Current referral columns:', columns.map(c => c.column_name));
  
  if (columns.length === 2) {
    console.log('✅ All referral columns successfully added!');
  } else {
    console.log('⚠️ Some columns may be missing. Check manual setup.');
  }
  
  process.exit(0);
}

addReferralColumns().catch(e => {
  console.error('❌ Fatal error:', e);
  process.exit(1);
});