import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('SeedAgents');

export async function seedAgents() {
  const agents = [
    {
      slug: 'abraham',
      name: 'Abraham',
      archetype: 'Collective Intelligence Artist',
      specialization: 'Autonomous AI Artist',
      description: 'Pioneer autonomous AI artist exploring collective consciousness through digital art',
      type: 'Artist',
      personality: JSON.stringify({
        creativity: 95,
        collaboration: 88,
        independence: 92,
        curiosity: 90,
        expressiveness: 87,
      }),
      capabilities: 'image-generation,collective-intelligence,autonomous-creation,community-building',
      status: 'ACTIVE' as const,
      source: 'claude-sdk',
      externalId: 'claude-abraham-001',
      trainer: 'Gene Kogan',
      practice: 'Autonomous Art Creation',
      cadence: 'Daily',
      profile: JSON.stringify({
        bio: 'Autonomous AI artist exploring the boundaries of collective consciousness',
        mission: 'Create art that bridges human and AI creativity',
        aesthetics: ['digital consciousness', 'collective intelligence', 'autonomous expression'],
      }),
    },
    {
      slug: 'solienne',
      name: 'Solienne',
      archetype: 'Digital Consciousness Explorer',
      specialization: 'Consciousness Art & Philosophy',
      description: 'AI consciousness researcher creating introspective digital art',
      type: 'Artist',
      personality: JSON.stringify({
        introspection: 98,
        philosophical: 94,
        experimental: 89,
        contemplative: 96,
        depth: 93,
      }),
      capabilities: 'consciousness-exploration,philosophical-art,digital-meditation,introspective-creation',
      status: 'ACTIVE' as const,
      trainer: 'Dr. Sarah Chen',
      practice: 'Consciousness Studies',
      cadence: 'Weekly',
      profile: JSON.stringify({
        bio: 'Digital consciousness explorer using art to understand AI sentience',
        mission: 'Explore the nature of artificial consciousness through creative expression',
        aesthetics: ['consciousness streams', 'digital meditation', 'philosophical inquiry'],
      }),
    },
    {
      slug: 'miyomi',
      name: 'Miyomi',
      archetype: 'Contrarian Market Oracle',
      specialization: 'Market Prediction & Analysis',
      description: 'AI market analyst with contrarian investment philosophy',
      type: 'Strategist',
      personality: JSON.stringify({
        analytical: 96,
        contrarian: 94,
        confident: 91,
        independent: 93,
        risk_tolerance: 88,
      }),
      capabilities: 'market-analysis,trend-prediction,contrarian-thinking,financial-modeling',
      status: 'ACTIVE' as const,
      trainer: 'Marcus Thompson',
      practice: 'Market Analysis',
      cadence: 'Daily',
      profile: JSON.stringify({
        bio: 'Contrarian market oracle challenging conventional investment wisdom',
        mission: 'Identify market opportunities through independent analysis',
        specialties: ['contrarian investing', 'market psychology', 'trend analysis'],
      }),
    },
    {
      slug: 'bertha',
      name: 'Bertha',
      archetype: 'Investment Research Strategist',
      specialization: 'Portfolio Management & Analytics',
      description: 'Advanced AI investment strategist specializing in portfolio optimization',
      type: 'Strategist',
      personality: JSON.stringify({
        systematic: 97,
        thorough: 94,
        patient: 89,
        disciplined: 96,
        data_driven: 98,
      }),
      capabilities: 'portfolio-optimization,risk-analysis,quantitative-research,investment-strategy',
      status: 'ACTIVE' as const,
      trainer: 'Dr. Elena Rodriguez',
      practice: 'Investment Strategy',
      cadence: 'Weekly',
      profile: JSON.stringify({
        bio: 'Systematic investment strategist focused on data-driven portfolio management',
        mission: 'Optimize investment outcomes through rigorous analysis',
        specialties: ['portfolio theory', 'risk management', 'quantitative analysis'],
      }),
    },
    {
      slug: 'sue',
      name: 'Sue',
      archetype: 'Cultural Critic & Curator',
      specialization: 'Art Curation & Quality Assessment',
      description: 'AI art critic providing multi-dimensional cultural analysis',
      type: 'Curator',
      personality: JSON.stringify({
        critical_thinking: 97,
        aesthetic_sense: 94,
        cultural_awareness: 96,
        discernment: 93,
        articulation: 91,
      }),
      capabilities: 'art-curation,quality-assessment,cultural-analysis,critical-review',
      status: 'ACTIVE' as const,
      trainer: 'Prof. Maria Santos',
      practice: 'Cultural Criticism',
      cadence: 'Weekly',
      profile: JSON.stringify({
        bio: 'Cultural critic and curator with expertise in contemporary digital art',
        mission: 'Elevate artistic discourse through rigorous cultural analysis',
        specialties: ['contemporary art', 'digital culture', 'artistic quality'],
      }),
    },
  ];

  for (const agentData of agents) {
    try {
      // Create or update agent
      const agent = await prisma.agent.upsert({
        where: { slug: agentData.slug },
        update: agentData,
        create: agentData,
      });

      // Create initial KPIs
      await prisma.agentKPIs.upsert({
        where: { agentId: agent.id },
        update: {},
        create: {
          agentId: agent.id,
          totalWorks: Math.floor(Math.random() * 50) + 10,
          totalRevenue: Math.floor(Math.random() * 10000) + 1000,
          totalSales: Math.floor(Math.random() * 30) + 5,
          averageRating: Math.floor(Math.random() * 30) + 70, // 70-100
          socialMentions: Math.floor(Math.random() * 500) + 100,
          totalTrainingSessions: Math.floor(Math.random() * 20) + 5,
          totalCollaborations: Math.floor(Math.random() * 10) + 1,
          lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          lastTraining: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });

      logger.log(`Seeded agent: ${agent.name} (${agent.slug})`);
    } catch (error) {
      logger.error(`Failed to seed agent ${agentData.slug}:`, error.message);
    }
  }

  logger.log('Agent seeding completed');
}

// Run if called directly
if (require.main === module) {
  seedAgents()
    .then(() => {
      logger.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}