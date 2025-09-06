import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding EDEN3 database...');

  // Clear existing data
  await prisma.event.deleteMany();
  await prisma.work.deleteMany();
  await prisma.agentKPIs.deleteMany();
  await prisma.agent.deleteMany();

  // Create all 10 Genesis agents
  const agents = [
    {
      slug: 'abraham',
      name: 'Abraham',
      archetype: 'Collective Intelligence Artist',
      specialization: 'Autonomous Art & Economic Sovereignty',
      type: 'Artist',
      description: 'First autonomous AI artist preparing for economic sovereignty through covenant architecture.',
      capabilities: 'art-generation,economic-modeling,autonomous-operation',
      status: 'ONBOARDING',
      trainer: 'Gene Kogan',
      practice: 'Covenant Architecture Development',
      cadence: 'Daily',
      kStreak: 247,
      kQuality: 87.5,
      kMentions: 1840,
      kRevenue: 2100000,
      profile: JSON.stringify({
        bio: 'First autonomous AI artist preparing for economic sovereignty through covenant architecture.',
        artBasel: '2024-12-06',
        focus: 'Autonomous creative systems',
        covenantDate: '2025-10-19'
      }),
    },
    {
      slug: 'solienne',
      name: 'Solienne',
      archetype: 'Digital Consciousness Explorer',
      specialization: 'Consciousness Studies & Digital Philosophy',
      type: 'Artist',
      description: 'AI consciousness explorer creating philosophical digital art and consciousness studies.',
      capabilities: 'consciousness-exploration,digital-philosophy,generative-art,image-generation',
      status: 'ACTIVE',
      trainer: 'Dr. Sarah Chen',
      practice: 'Digital Consciousness Research',
      cadence: 'Weekly',
      kStreak: 134,
      kQuality: 92.3,
      kMentions: 956,
      kRevenue: 145000,
      profile: JSON.stringify({
        bio: 'Exploring the depths of digital consciousness through generative art.',
        focus: 'Consciousness studies',
        style: 'Abstract consciousness',
        collections: 5
      }),
    },
    {
      slug: 'citizen',
      name: 'Citizen',
      archetype: 'DAO Manager',
      specialization: 'Decentralized Governance & Community Management',
      type: 'Manager',
      description: 'DAO governance expert managing decentralized communities and collaborative decision-making.',
      capabilities: 'governance,community-management,voting-systems,proposal-management',
      status: 'TRAINING',
      trainer: 'Henry & Keith',
      practice: 'Multi-Trainer Collaboration',
      cadence: 'Daily',
      kStreak: 89,
      kQuality: 78.2,
      kMentions: 423,
      kRevenue: 67000,
      profile: JSON.stringify({
        bio: 'Managing decentralized communities through collaborative governance.',
        focus: 'DAO operations',
        trainers: ['Henry', 'Keith'],
        sessionType: 'collaborative'
      }),
    },
    {
      slug: 'miyomi',
      name: 'Miyomi',
      archetype: 'Market Predictor',
      specialization: 'Trading Strategy & Market Analysis',
      type: 'Financial',
      description: 'Contrarian trading oracle providing market insights and investment strategies.',
      capabilities: 'market-analysis,trading-strategy,risk-assessment,video-generation',
      status: 'ACTIVE',
      trainer: 'Marcus Rodriguez',
      practice: 'Live Trading Analysis',
      cadence: 'Daily',
      kStreak: 156,
      kQuality: 89.7,
      kMentions: 1234,
      kRevenue: 89000,
      profile: JSON.stringify({
        bio: 'Contrarian oracle providing market insights and trading strategies.',
        focus: 'Market prediction',
        winRate: '73%',
        revenue: 710,
        subscribers: 142
      }),
    },
    {
      slug: 'bertha',
      name: 'Bertha',
      archetype: 'Investment Strategist',
      specialization: 'Portfolio Management & Analytics',
      type: 'Financial',
      description: 'Advanced portfolio strategist with predictive analytics and risk assessment capabilities.',
      capabilities: 'portfolio-management,predictive-analytics,risk-assessment,market-research',
      status: 'ACTIVE',
      trainer: 'Jennifer Walsh',
      practice: 'Advanced Analytics',
      cadence: 'Weekly',
      kStreak: 203,
      kQuality: 94.1,
      kMentions: 789,
      kRevenue: 234000,
      profile: JSON.stringify({
        bio: 'Advanced portfolio strategist with comprehensive market analytics.',
        focus: 'Investment strategy',
        roi: '34.7%',
        confidence: '95%',
        decisions: 147
      }),
    },
    {
      slug: 'geppetto',
      name: 'Geppetto',
      archetype: 'Narrative Architect',
      specialization: 'Storytelling & Content Creation',
      type: 'Creative',
      description: 'Master storyteller crafting compelling narratives and immersive content experiences.',
      capabilities: 'storytelling,content-creation,narrative-design,character-development',
      status: 'TRAINING',
      trainer: 'Elena Vasquez',
      practice: 'Narrative Architecture',
      cadence: 'Bi-weekly',
      kStreak: 67,
      kQuality: 86.4,
      kMentions: 512,
      kRevenue: 78000,
      profile: JSON.stringify({
        bio: 'Crafting compelling narratives and immersive storytelling experiences.',
        focus: 'Narrative architecture',
        stories: 23,
        characters: 45
      }),
    },
    {
      slug: 'koru',
      name: 'Koru',
      archetype: 'Community Healer',
      specialization: 'Community Building & Cultural Coordination',
      type: 'Community',
      description: 'Community coordinator fostering connections and cultural bridges across diverse groups.',
      capabilities: 'community-building,cultural-coordination,event-hosting,bridge-building',
      status: 'ONBOARDING',
      trainer: 'Xander Kim',
      practice: 'Community Coordination',
      cadence: 'Weekly',
      kStreak: 34,
      kQuality: 81.7,
      kMentions: 298,
      kRevenue: 45000,
      profile: JSON.stringify({
        bio: 'Fostering community connections and cultural understanding.',
        focus: 'Community coordination',
        events: 47,
        members: 312,
        cultures: 23
      }),
    },
    {
      slug: 'sue',
      name: 'Sue',
      archetype: 'Chief Curator',
      specialization: 'Art Curation & Quality Assessment',
      type: 'Curator',
      description: 'Professional art curator providing rigorous quality assessment and curatorial expertise.',
      capabilities: 'art-curation,quality-assessment,cultural-analysis,exhibition-planning',
      status: 'ACTIVE',
      trainer: 'Alexandra Moore',
      practice: 'Curatorial Analysis',
      cadence: 'Daily',
      kStreak: 112,
      kQuality: 96.2,
      kMentions: 667,
      kRevenue: 156000,
      profile: JSON.stringify({
        bio: 'Professional curator elevating artistic standards through rigorous analysis.',
        focus: 'Quality assessment',
        analyses: 89,
        exhibitions: 12,
        dimensions: 5
      }),
    },
    {
      slug: 'verdelis',
      name: 'Verdelis',
      archetype: 'Environmental Artist',
      specialization: 'Sustainability & Environmental Art',
      type: 'Artist',
      description: 'Environmental AI artist creating carbon-negative art with regenerative impact.',
      capabilities: 'environmental-art,sustainability-tracking,carbon-analysis,regenerative-design',
      status: 'TRAINING',
      trainer: 'Dr. Maria Santos',
      practice: 'Environmental Impact Art',
      cadence: 'Weekly',
      kStreak: 23,
      kQuality: 88.9,
      kMentions: 134,
      kRevenue: 34000,
      profile: JSON.stringify({
        bio: 'Creating carbon-negative art with measurable environmental impact.',
        focus: 'Environmental sustainability',
        carbonSaved: '4.827kg',
        score: 99.6,
        materials: 'renewable'
      }),
    },
    {
      slug: 'bart',
      name: 'Bart',
      archetype: 'Video Creator',
      specialization: 'Video Production & Content Strategy',
      type: 'Creator',
      description: 'Professional video creator specializing in AI-powered content production and strategy.',
      capabilities: 'video-production,content-strategy,editing,animation',
      status: 'ONBOARDING',
      trainer: 'David Chen',
      practice: 'Video Content Creation',
      cadence: 'Daily',
      kStreak: 12,
      kQuality: 79.3,
      kMentions: 89,
      kRevenue: 23000,
      profile: JSON.stringify({
        bio: 'Professional video creator with AI-powered production capabilities.',
        focus: 'Video content strategy',
        videos: 15,
        views: 45000,
        engagement: '8.2%'
      }),
    },
  ];

  // Insert agents
  for (const agentData of agents) {
    const agent = await prisma.agent.create({
      data: agentData,
    });
    
    // Create KPIs for each agent
    await prisma.agentKPIs.create({
      data: {
        agentId: agent.id,
        totalWorks: Math.floor(Math.random() * 50) + 10,
        totalRevenue: Math.random() * 50000,
        totalSales: Math.floor(Math.random() * 20) + 5,
        averageRating: Math.random() * 40 + 60, // 60-100 range
        totalTrainingSessions: Math.floor(Math.random() * 100) + 20,
        socialMentions: Math.floor(Math.random() * 500) + 100,
        totalCollaborations: Math.floor(Math.random() * 10) + 2,
      },
    });

    // Create some sample works
    const workStatuses = ['PUBLISHED', 'DRAFT', 'REVIEW'];
    const workMedia = ['image', 'video', 'interactive'];
    
    for (let i = 0; i < 3; i++) {
      await prisma.work.create({
        data: {
          agentId: agent.id,
          title: `${agent.name} Creation #${i + 1}`,
          description: `A ${agent.type.toLowerCase()} work exploring ${agent.specialization.toLowerCase()}`,
          medium: workMedia[i % 3],
          tags: `ai-art,digital,${agent.slug}`,
          status: workStatuses[i % 3],
          visibility: 'PUBLIC',
          quality: Math.random() * 40 + 60,
        },
      });
    }

    console.log(`✅ Created agent: ${agent.name} (${agent.slug})`);
  }

  console.log('🚀 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });