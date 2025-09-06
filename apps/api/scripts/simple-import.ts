import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function importData() {
  const exportDir = '/Users/seth/eden3/data-export';
  
  try {
    console.log('🚀 Starting PostgreSQL data import...\n');
    
    // Import agents
    console.log('📤 Importing agents...');
    const agentsData = JSON.parse(fs.readFileSync(path.join(exportDir, 'agents.json'), 'utf-8'));
    for (const agent of agentsData) {
      await prisma.agent.create({ data: agent });
    }
    console.log(`   ✅ ${agentsData.length} agents imported`);
    
    // Import agent_kpis
    console.log('📤 Importing agent KPIs...');
    const kpisData = JSON.parse(fs.readFileSync(path.join(exportDir, 'agent_kpis.json'), 'utf-8'));
    for (const kpi of kpisData) {
      await prisma.agentKPIs.create({ data: kpi });
    }
    console.log(`   ✅ ${kpisData.length} agent KPIs imported`);
    
    // Import events
    console.log('📤 Importing events...');
    const eventsData = JSON.parse(fs.readFileSync(path.join(exportDir, 'events.json'), 'utf-8'));
    for (const event of eventsData) {
      await prisma.event.create({ data: event });
    }
    console.log(`   ✅ ${eventsData.length} events imported`);
    
    // Import works
    console.log('📤 Importing works...');
    const worksData = JSON.parse(fs.readFileSync(path.join(exportDir, 'works.json'), 'utf-8'));
    for (const work of worksData) {
      await prisma.work.create({ data: work });
    }
    console.log(`   ✅ ${worksData.length} works imported`);
    
    // Verify import
    console.log('\n📊 Import Summary:');
    console.log('==================');
    const agentCount = await prisma.agent.count();
    const eventCount = await prisma.event.count();
    const workCount = await prisma.work.count();
    const kpiCount = await prisma.agentKPIs.count();
    
    console.log(`Agents:     ${agentCount}`);
    console.log(`Events:     ${eventCount}`);
    console.log(`Works:      ${workCount}`);
    console.log(`Agent KPIs: ${kpiCount}`);
    console.log(`TOTAL:      ${agentCount + eventCount + workCount + kpiCount} records`);
    
    console.log('\n✅ Import completed successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importData();