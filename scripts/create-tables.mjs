// Run this to create all missing tables
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function createTables() {
  console.log('🔧 Creating missing tables...');
  
  // 1. Creations table (for feed)
  await sql`
    CREATE TABLE IF NOT EXISTS creations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      username TEXT,
      user_avatar TEXT,
      type TEXT DEFAULT 'image',
      asset_url TEXT NOT NULL,
      caption TEXT,
      model TEXT,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      remixes INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✅ Table: creations');

  // 2. Likes table
  await sql`
    CREATE TABLE IF NOT EXISTS likes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creation_id UUID NOT NULL,
      user_id UUID NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(creation_id, user_id)
    )
  `;
  console.log('✅ Table: likes');

  // 3. Comments table
  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creation_id UUID NOT NULL,
      user_id UUID NOT NULL,
      username TEXT,
      user_avatar TEXT,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✅ Table: comments');

  // 4. Reference images for generation
  await sql`
    CREATE TABLE IF NOT EXISTS reference_images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      generation_id UUID,
      image_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✅ Table: reference_images');

  // 5. User storage
  await sql`
    CREATE TABLE IF NOT EXISTS user_uploads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT,
      mime_type TEXT,
      size INTEGER,
      storage_key TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✅ Table: user_uploads');

  // 6. Generation history
  await sql`
    CREATE TABLE IF NOT EXISTS generation_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      type TEXT NOT NULL,
      model TEXT,
      prompt TEXT,
      result_url TEXT,
      credits_used INTEGER DEFAULT 0,
      status TEXT DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✅ Table: generation_history');

  // 7. User preferences/settings
  await sql`
    CREATE TABLE IF NOT EXISTS user_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE,
      preferences JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✅ Table: user_settings');

  // 8. Feed reactions (additional)
  await sql`
    CREATE TABLE IF NOT EXISTS feed_reactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creation_id UUID NOT NULL,
      user_id UUID NOT NULL,
      reaction_type TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(creation_id, user_id, reaction_type)
    )
  `;
  console.log('✅ Table: feed_reactions');

  // Create indexes for better performance
  await sql`CREATE INDEX IF NOT EXISTS idx_creations_user_id ON creations(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_creations_created_at ON creations(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_likes_creation_id ON likes(creation_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_comments_creation_id ON comments(creation_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_uploads_user_id ON user_uploads(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_generation_history_user_id ON generation_history(user_id)`;
  
  console.log('✅ Indexes created');
  
  console.log('\n🎉 All tables created successfully!');
}

createTables().catch(console.error);