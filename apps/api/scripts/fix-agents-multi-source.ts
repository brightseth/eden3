#!/usr/bin/env npx tsx
/**
 * Script to fix the agent database to have exactly 10 canonical agents
 * Each agent can exist on multiple platforms (sources)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// The 10 canonical agents
const CANONICAL_AGENTS = [
  { slug: 'abraham', name: 'Abraham', sources: ['claude-sdk', 'eden-legacy'] },
  { slug: 'solienne', name: 'Solienne', sources: ['claude-sdk', 'eden-legacy'] },
  { slug: 'miyomi', name: 'Miyomi', sources: ['claude-sdk'] },
  { slug: 'bart', name: 'Bart', sources: ['eden3-native'] },
  { slug: 'bertha', name: 'Bertha', sources: ['claude-sdk'] },
  { slug: 'citizen', name: 'Citizen', sources: ['eden-legacy', 'eden3-native'] },
  { slug: 'koru', name: 'Koru', sources: ['eden3-native'] },
  { slug: 'geppetto', name: 'Geppetto', sources: ['eden3-native'] },
  { slug: 'sue', name: 'Sue', sources: ['claude-sdk'] },
  { slug: 'verdelis', name: 'Verdelis', sources: ['eden3-native'] },
];

async function fixAgents() {
  console.log('🔧 Starting agent database fix...\n');
  
  // Step 1: Delete duplicate eden-legacy agents
  console.log('Step 1: Removing duplicate eden-legacy agents...');
  const duplicates = await prisma.agent.findMany({
    where: {
      slug: {
        startsWith: 'eden-'
      }
    }
  });
  
  for (const dup of duplicates) {
    console.log(`  - Deleting duplicate: ${dup.slug}`);
    await prisma.agent.delete({
      where: { id: dup.id }
    });
  }
  console.log(`  ✅ Removed ${duplicates.length} duplicate agents\n`);

  // Step 2: Update existing agents with proper sources
  console.log('Step 2: Updating agent sources...');
  for (const canonical of CANONICAL_AGENTS) {
    const existing = await prisma.agent.findUnique({
      where: { slug: canonical.slug }
    });
    
    if (existing) {
      // Update sources
      await prisma.agent.update({
        where: { slug: canonical.slug },
        data: {
          sources: JSON.stringify(canonical.sources),
          externalIds: JSON.stringify(
            canonical.sources.reduce((acc, source) => {
              acc[source] = `${source}-${canonical.slug}-${Date.now()}`;
              return acc;
            }, {} as Record<string, string>)
          )
        }
      });
      console.log(`  ✅ Updated ${canonical.name}: sources = ${JSON.stringify(canonical.sources)}`);
    } else {
      // Create missing agent
      console.log(`  ⚠️ Agent ${canonical.name} not found, creating...`);
      await prisma.agent.create({
        data: {
          slug: canonical.slug,
          name: canonical.name,
          archetype: getArchetype(canonical.slug),
          specialization: getSpecialization(canonical.slug),
          type: getType(canonical.slug),
          capabilities: getCapabilities(canonical.slug),
          sources: JSON.stringify(canonical.sources),
          externalIds: JSON.stringify(
            canonical.sources.reduce((acc, source) => {
              acc[source] = `${source}-${canonical.slug}-${Date.now()}`;
              return acc;
            }, {} as Record<string, string>)
          ),
          status: 'ACTIVE',
          version: '1.0.0'
        }
      });
      console.log(`  ✅ Created ${canonical.name}`);
    }
  }
  
  // Step 3: Verify final count
  console.log('\nStep 3: Verifying agent count...');
  const finalCount = await prisma.agent.count();
  const allAgents = await prisma.agent.findMany({
    select: {
      slug: true,
      name: true,
      sources: true
    },
    orderBy: { slug: 'asc' }
  });
  
  console.log(`\n📊 Final Results:`);
  console.log(`  Total agents: ${finalCount}`);
  console.log(`\n  Agent List:`);
  for (const agent of allAgents) {
    const sources = JSON.parse(agent.sources || '[]');
    console.log(`    - ${agent.name} (${agent.slug}): ${sources.join(', ')}`);
  }
  
  if (finalCount === 10) {
    console.log('\n✅ SUCCESS: Exactly 10 agents in the database!');
  } else {
    console.log(`\n⚠️ WARNING: Expected 10 agents, found ${finalCount}`);
  }
}

// Helper functions to get agent metadata
function getArchetype(slug: string): string {
  const archetypes: Record<string, string> = {
    abraham: 'Collective Intelligence Artist',
    solienne: 'Digital Consciousness Explorer',
    miyomi: 'Contrarian Market Oracle',
    bart: 'Environmental Impact Analyst',
    bertha: 'Investment Research Strategist',
    citizen: 'Community Manager',
    koru: 'Community Builder',
    geppetto: 'Narrative Architect',
    sue: 'Cultural Critic & Curator',
    verdelis: 'Environmental Artist'
  };
  return archetypes[slug] || 'Agent';
}

function getSpecialization(slug: string): string {
  const specializations: Record<string, string> = {
    abraham: 'Autonomous AI Artist',
    solienne: 'Consciousness Art & Philosophy',
    miyomi: 'Market Prediction & Analysis',
    bart: 'Environmental Analytics',
    bertha: 'Portfolio Management & Analytics',
    citizen: 'DAO Management',
    koru: 'Community Facilitation',
    geppetto: 'Narrative Construction',
    sue: 'Art Curation & Quality Assessment',
    verdelis: 'Environmental Art & Sustainability'
  };
  return specializations[slug] || 'General';
}

function getType(slug: string): string {
  const types: Record<string, string> = {
    abraham: 'Artist',
    solienne: 'Artist',
    miyomi: 'Strategist',
    bart: 'Analyst',
    bertha: 'Strategist',
    citizen: 'Manager',
    koru: 'Facilitator',
    geppetto: 'Creator',
    sue: 'Curator',
    verdelis: 'Artist'
  };
  return types[slug] || 'Agent';
}

function getCapabilities(slug: string): string {
  const capabilities: Record<string, string> = {
    abraham: 'image-generation,collective-intelligence,autonomous-creation',
    solienne: 'consciousness-exploration,philosophical-art,digital-meditation',
    miyomi: 'market-analysis,trend-prediction,contrarian-thinking',
    bart: 'environmental-analysis,impact-assessment,sustainability-metrics',
    bertha: 'portfolio-optimization,risk-analysis,investment-strategy',
    citizen: 'dao-management,governance,community-building',
    koru: 'community-facilitation,cultural-bridging,narrative-weaving',
    geppetto: 'narrative-construction,story-generation,world-building',
    sue: 'art-curation,quality-assessment,cultural-analysis',
    verdelis: 'environmental-art,sustainability-tracking,eco-consciousness'
  };
  return capabilities[slug] || 'general';
}

// Run the script
fixAgents()
  .then(() => {
    console.log('\n🎉 Agent database fix completed successfully!');
  })
  .catch((error) => {
    console.error('\n❌ Error fixing agents:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });