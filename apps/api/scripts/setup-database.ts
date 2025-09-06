#!/usr/bin/env npx ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🗄️  EDEN3 Database Setup');
  console.log('========================\n');

  try {
    // Test connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Check if tables exist
    console.log('2. Checking database schema...');
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public';
    `;
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found. Please run migrations first.');
      console.log('   Run: npm run prisma:migrate\n');
    } else {
      console.log(`✅ Found ${tables.length} tables:`, tables.map(t => t.tablename).join(', '));
    }

    // Check if agents exist
    console.log('\n3. Checking for agent data...');
    const agentCount = await prisma.agent.count();
    
    if (agentCount === 0) {
      console.log('⚠️  No agents found. Please run the seed script.');
      console.log('   Run: npm run prisma:seed\n');
    } else {
      console.log(`✅ Found ${agentCount} agents in database`);
      
      // Show a few examples
      const sampleAgents = await prisma.agent.findMany({
        take: 3,
        select: {
          slug: true,
          name: true,
          archetype: true,
          status: true
        }
      });
      
      console.log('   Sample agents:');
      sampleAgents.forEach(agent => {
        console.log(`   - ${agent.name} (${agent.slug}): ${agent.archetype} [${agent.status}]`);
      });
    }

    console.log('\n🎉 Database setup check complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase();
}

export default setupDatabase;