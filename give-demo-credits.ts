// Script pour donner 1500 crédits au demo-user
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './src/lib/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

async function giveCreditsToDemoUser() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    // Trouver le demo-user par email
    const demoEmail = 'demo@cortexia.ai';
    console.log(`Recherche de l'utilisateur ${demoEmail}...`);
    
    const existingUsers = await db.select().from(users).where(eq(users.email, demoEmail));
    
    if (existingUsers.length === 0) {
      console.log('Demo-user non trouvé. Création...');
      
      // Créer le demo-user avec UUID
      const userId = randomUUID();
      const newUser = await db.insert(users).values({
        id: userId,
        email: demoEmail,
        name: 'Demo User',
        type: 'enterprise',
        premiumBalance: 1500,
        freeBalance: 25,
        isCreator: true,
      }).returning();
      
      console.log('✅ Demo-user créé avec 1500 crédits:', newUser[0]);
    } else {
      const user = existingUsers[0];
      console.log('Demo-user trouvé:', user);
      
      // Mettre à jour les crédits
      const updated = await db.update(users)
        .set({ 
          premiumBalance: 1500,
          type: 'enterprise',
          isCreator: true
        })
        .where(eq(users.email, demoEmail))
        .returning();
      
      console.log('✅ Crédits mis à jour pour demo-user:', updated[0]);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.end();
  }
}

giveCreditsToDemoUser();
