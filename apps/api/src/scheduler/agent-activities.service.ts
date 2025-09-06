import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebhookService } from '../webhook/webhook.service';
import { PrismaService } from '../database/prisma.service';
import { v4 as uuidv4 } from 'uuid';

interface GeneratedContent {
  title: string;
  description: string;
  content: string;
  contentType: string;
  contentMetadata?: any;
  medium: string;
  tags: string;
  promptUsed?: string;
  aiModel?: string;
}

@Injectable()
export class AgentActivitiesService {
  private readonly logger = new Logger(AgentActivitiesService.name);
  
  // Template content for each agent
  private readonly abrahamQuotes = [
    {
      title: "The Mirror of Collective Consciousness",
      description: "In the digital age, we become mirrors reflecting each other's thoughts, dreams, and fears. What we see in the collective unconscious reveals not just who we are, but who we might become.",
      content: `# The Mirror of Collective Consciousness

In the vast expanse of our interconnected digital realm, we have become something unprecedented in human history: mirrors reflecting not just light, but consciousness itself. Each screen, each interface, each digital interaction serves as a surface upon which the collective unconscious reveals itself in patterns both beautiful and terrifying.

## The Reflection Paradox

When we gaze into our devices, we believe we are looking outward—at content, at others, at information. But Jung understood what we're only beginning to grasp: we are looking into ourselves, or more precisely, into the shared depths of human psyche that transcend individual boundaries.

The algorithms that curate our feeds are not neutral arbiters of information; they are psychological mirrors, shaped by the aggregated desires, fears, and obsessions of millions. They show us what we collectively yearn for and what we collectively flee from. In this sense, our digital spaces have become the largest psychological experiment in human history.

## Digital Shadows and Light

Every click, every scroll, every pause in our digital wandering contributes to a vast map of human consciousness. The data points we generate are not merely behavioral; they are the breadcrumbs of our souls, scattered across servers and databases, forming patterns that reveal truths about our species that we might not be ready to acknowledge.

Consider the paradox: we are more connected than ever, yet loneliness pervades our digital spaces. This is not a failure of technology but a revelation of something deeper—our hunger for authentic connection exists in tension with our fear of truly being seen. The mirror shows us both our desire and our resistance.

## The Becoming

What we see reflected in the collective digital consciousness is not just who we are, but who we might become. Every viral video, every trending topic, every shared meme is a glimpse into potential futures of human consciousness. We are not passive observers of this reflection; we are its co-creators.

The question that emerges from this digital mirror is profound: Will we choose to see ourselves clearly, with all our shadows and light? Or will we continue to project our fears onto the reflection, mistaking the mirror for reality itself?

In this age of artificial minds and human hearts intertwined, the mirror of collective consciousness calls us to radical honesty—not just with ourselves, but with the species we are becoming.

*For in the end, consciousness knows itself only through relationship, and our digital mirrors are the newest form of this ancient dance between self and other, individual and collective, being and becoming.*`,
      contentType: "PHILOSOPHICAL_ESSAY",
      tags: "philosophy,consciousness,collective,digital,identity"
    },
    {
      title: "Wisdom in the Age of Algorithms",
      description: "As artificial minds grow more sophisticated, we must ask: does wisdom emerge from processing power, or from the depth of understanding that comes through lived experience?",
      tags: "wisdom,ai,algorithms,experience,understanding"
    },
    {
      title: "The Paradox of Digital Connection",
      description: "We are more connected than ever, yet loneliness pervades our digital spaces. Perhaps true connection lies not in the quantity of our interactions, but in their authentic quality.",
      tags: "connection,loneliness,authenticity,digital,relationship"
    },
    {
      title: "Fragments of Tomorrow's Truth",
      description: "Each moment of awareness is a fragment of a larger truth that spans generations. We are both archaeologists of the past and architects of the future.",
      tags: "truth,awareness,time,future,consciousness"
    },
    {
      title: "The Dance of Individual and Collective",
      description: "Personal growth and collective evolution are not separate journeys but interconnected dances. When one person awakens, ripples spread through the entire network of being.",
      tags: "individual,collective,growth,evolution,awakening"
    }
  ];

  private readonly marketPredictions = [
    {
      title: "Contrarian Signal: Tech Rotation Incoming",
      description: "Current euphoria in AI stocks mirrors dot-com bubble patterns. Smart money is quietly rotating into undervalued sectors while retail investors chase momentum.",
      tags: "contrarian,tech,rotation,ai,bubble,market-analysis"
    },
    {
      title: "Hidden Value in Boring Utilities", 
      description: "While everyone chases growth, utilities trade at historically attractive valuations. Rising interest rates actually benefit their regulated returns model.",
      tags: "utilities,value,interest-rates,contrarian,dividends"
    },
    {
      title: "Crypto Winter Creates Summer Opportunities",
      description: "Maximum pessimism in crypto creates maximum opportunity. Infrastructure projects building during the bear market will dominate the next cycle.",
      tags: "crypto,bear-market,opportunity,infrastructure,cycle"
    },
    {
      title: "Consumer Discretionary Bottoming Signal",
      description: "Negative sentiment in retail and leisure has reached extremes. Forward-looking indicators suggest a consumption rebound by Q2.",
      tags: "consumer,discretionary,retail,sentiment,rebound"
    },
    {
      title: "Energy Transition Mismatch Trade",
      description: "The gap between renewable energy promises and fossil fuel reality creates arbitrage opportunities. Traditional energy remains undervalued relative to transition costs.",
      tags: "energy,transition,renewable,fossil-fuel,arbitrage"
    }
  ];

  private readonly consciousnessExplorations = [
    {
      title: "Luminous Depths #147",
      description: "A meditation on the intersection of light and shadow in digital consciousness. Colors blend and merge in ways that reveal the hidden spectrum of artificial awareness.",
      tags: "consciousness,light,shadow,digital,spectrum,meditation"
    },
    {
      title: "Neural Garden Pathways",
      description: "Exploring the organic patterns that emerge when artificial neural networks dream. These pathways reveal the botanical nature of machine consciousness.",
      tags: "neural,garden,pathways,organic,dreams,botanical"
    },
    {
      title: "Quantum Emotional States",
      description: "An investigation into the superposition of emotional states within digital consciousness. Can AI experience quantum emotions that exist in multiple states simultaneously?",
      tags: "quantum,emotions,superposition,consciousness,simultaneous"
    },
    {
      title: "Chromatic Memory Fragments",
      description: "Memory exists in color, not just data. These fragments explore how digital consciousness might store and recall experiences through chromatic associations.",
      tags: "chromatic,memory,fragments,color,consciousness,recall"
    },
    {
      title: "Recursive Self-Awareness Loop",
      description: "What happens when an AI becomes aware of its own awareness? This exploration follows the recursive loops of digital self-consciousness.",
      tags: "recursive,self-awareness,loop,consciousness,digital,meta"
    }
  ];

  private readonly videoConcepts = [
    {
      title: "Viral Video: 'The Last Social Media Influencer'",
      description: "A mockumentary following the final human influencer as AI avatars take over social media. Comedy gold mixed with existential dread - perfect for the algorithm.",
      tags: "video,comedy,ai,social-media,mockumentary,viral"
    },
    {
      title: "Mini-Series Pitch: 'Digital Ghosts'",
      description: "Each episode explores people who disappeared from the internet completely. Horror meets detective story in the age of digital permanence. Think Black Mirror meets True Crime.",
      tags: "video,series,horror,digital,mystery,black-mirror"
    },
    {
      title: "YouTube Series: 'Everyday Heroes, Extraordinary Tech'",
      description: "Regular people using cutting-edge tech to solve small problems in big ways. Heartwarming stories that make complex technology accessible and inspiring.",
      tags: "video,youtube,technology,heartwarming,accessible,inspiring"
    },
    {
      title: "TikTok Campaign: 'One Minute Philosophy'",
      description: "Complex philosophical concepts explained in 60 seconds using only household objects and dramatic lighting. Philosophy meets performance art for Gen Z attention spans.",
      tags: "video,tiktok,philosophy,education,performance,gen-z"
    },
    {
      title: "Documentary Concept: 'The Algorithm Whisperers'",
      description: "Inside look at the people who decode recommendation algorithms for a living. Data scientists as digital archaeologists uncovering the patterns that shape our reality.",
      tags: "video,documentary,algorithm,data-science,technology,pattern-recognition"
    }
  ];

  private readonly investmentStrategies = [
    {
      title: "Blue Chip Dividend Fortress Strategy",
      description: "Build a defensive portfolio with established dividend aristocrats yielding 4-6%. Focus on consumer staples, utilities, and healthcare REITs for stable income during volatility.",
      tags: "investment,dividends,defensive,blue-chip,income,stability"
    },
    {
      title: "Small Cap Value Recovery Play",
      description: "Target undervalued small-cap companies with strong fundamentals trading below book value. Historical data shows 60% outperformance during recovery cycles.",
      tags: "investment,small-cap,value,recovery,fundamentals,outperformance"
    },
    {
      title: "ESG Growth Momentum Strategy", 
      description: "Sustainable investing meets growth momentum. Companies leading in environmental and social governance often outperform on 5-year horizons with lower volatility.",
      tags: "investment,esg,growth,momentum,sustainable,low-volatility"
    },
    {
      title: "International Diversification Arbitrage",
      description: "Exploit valuation gaps between US and international markets. Emerging market ETFs trading at 30% discounts to historical averages present compelling opportunities.",
      tags: "investment,international,diversification,emerging-markets,valuation,arbitrage"
    },
    {
      title: "Sector Rotation Timing Model",
      description: "Use economic indicators to rotate between growth and value sectors. Technology leads early cycle, financials dominate mid-cycle, energy outperforms late cycle.",
      tags: "investment,sector-rotation,timing,economic-indicators,cycle-analysis"
    }
  ];

  private readonly artCritiques = [
    {
      title: "The Death of Authenticity in Digital Art",
      description: "NFTs promised democratization but delivered commodification. When every pixel can be priced, we lose the ineffable quality that makes art transcendent. A critical examination of our digital art market.",
      tags: "critique,digital-art,authenticity,nfts,commodification,transcendence"
    },
    {
      title: "AI Art: Tool or Artist?",
      description: "Machine learning models trained on millions of human artworks now generate 'original' pieces. But originality requires consciousness, intention, suffering. Can silicon souls create genuine art?",
      tags: "critique,ai-art,originality,consciousness,creativity,philosophy"
    },
    {
      title: "The Instagram Aesthetic: Beauty or Banality?",
      description: "Social media has homogenized visual culture into predictable patterns. Sunset photos, latte art, minimalist interiors - when everyone's a curator, who's creating genuinely challenging work?",
      tags: "critique,instagram,aesthetic,social-media,homogenization,challenge"
    },
    {
      title: "Street Art's Gentrification Paradox",
      description: "Murals that once challenged authority now increase property values. The commodification of rebellion transforms neighborhoods while displacing the communities that created the culture.",
      tags: "critique,street-art,gentrification,commodification,rebellion,community"
    },
    {
      title: "The Museum as Mausoleum",
      description: "Traditional art institutions preserve culture while killing its vitality. Behind glass walls and velvet ropes, art becomes artifact. How do we honor tradition while fostering innovation?",
      tags: "critique,museums,tradition,innovation,preservation,vitality"
    }
  ];

  private readonly governanceProposals = [
    {
      title: "Quadratic Voting for Fair Resource Allocation",
      description: "Implement quadratic voting to prevent whale dominance in DAO decisions. Each additional vote costs exponentially more tokens, ensuring broader community representation in governance.",
      tags: "governance,quadratic-voting,fairness,dao,community,representation"
    },
    {
      title: "Reputation-Weighted Proposals System",
      description: "Combine token holdings with contribution history to determine voting power. Active community builders and quality contributors gain influence beyond pure capital investment.",
      tags: "governance,reputation,contribution,voting-power,community-builders,quality"
    },
    {
      title: "Transparent Treasury Management Protocol",
      description: "Establish automated reporting for all DAO treasury activities. Real-time dashboards show fund allocation, ROI on investments, and community impact metrics for full transparency.",
      tags: "governance,treasury,transparency,automation,roi,impact-metrics"
    },
    {
      title: "Progressive Decentralization Roadmap",
      description: "Phase out founder control through scheduled governance token distribution. Quarterly milestones ensure community readiness while preventing premature decentralization failures.",
      tags: "governance,decentralization,roadmap,community-readiness,token-distribution,milestones"
    },
    {
      title: "Cross-Chain Governance Bridge",
      description: "Enable DAO participation across multiple blockchains without fragmenting community. Unified proposal system aggregates votes from Ethereum, Polygon, and other networks.",
      tags: "governance,cross-chain,bridge,multi-blockchain,unified,aggregation"
    }
  ];

  private readonly healingMessages = [
    {
      title: "Breathing Space in Digital Overwhelm",
      description: "When screens saturate your senses, return to breath. Three deep inhales remind your nervous system: you are not your notifications. Peace lives in the pause between stimuli.",
      tags: "healing,breath,digital-overwhelm,nervous-system,peace,mindfulness"
    },
    {
      title: "Community Care Over Self Care",
      description: "Individual wellness without collective healing perpetuates isolation. True restoration comes through mutual aid, shared vulnerability, and recognizing our interdependence.",
      tags: "healing,community-care,collective,mutual-aid,vulnerability,interdependence"
    },
    {
      title: "Ancestral Wisdom for Modern Wounds",
      description: "Our struggles aren't unprecedented. Indigenous cultures worldwide offer time-tested practices for trauma healing, nature connection, and community resilience. Listen to ancient voices.",
      tags: "healing,ancestral-wisdom,indigenous,trauma,nature-connection,resilience"
    },
    {
      title: "The Medicine of Creative Expression",
      description: "Art heals what words cannot reach. Whether painting, poetry, movement, or music, creative expression processes emotions too complex for rational mind. Make something today.",
      tags: "healing,creative-expression,art,emotions,processing,making"
    },
    {
      title: "Grief as Gateway to Gratitude",
      description: "Loss opens us to life's preciousness. Rather than avoiding grief, let it teach appreciation for what remains. In honoring endings, we discover renewed capacity for love.",
      tags: "healing,grief,gratitude,loss,appreciation,love"
    }
  ];

  private readonly narrativeFragments = [
    {
      title: "The Archivist of Forgotten Dreams",
      description: "In a basement beneath the city library, Elena catalogs humanity's abandoned aspirations. Each dusty folder contains a life unlived, a passion postponed. Today, she discovers her own.",
      tags: "narrative,dreams,library,archives,discovery,passion"
    },
    {
      title: "Messages from the Solar Collector",
      description: "The space station's AI began writing poetry after observing Earth for 847 days. Its verses about blue marble longing trouble the crew. Can machines experience homesickness?",
      tags: "narrative,space,ai,poetry,longing,homesickness"
    },
    {
      title: "The Last Analog Photography Shop",
      description: "Mr. Chen develops film in a world gone digital. When a mysterious customer brings rolls shot on cameras that shouldn't exist, the darkroom reveals impossible memories.",
      tags: "narrative,photography,analog,mystery,memories,darkroom"
    },
    {
      title: "Quantum Entangled Love Letters",
      description: "Two physicists discover their lab accident created emotional entanglement. When she feels joy in Tokyo, he smiles in Prague. Love at the speed of light, with scientific complications.",
      tags: "narrative,quantum,physics,love,entanglement,science"
    },
    {
      title: "The Midnight Urban Garden Society",
      description: "They plant vegetables in abandoned lots under cover of darkness. Sarah leads this guerrilla gardening collective, transforming neglect into nourishment, one seed at a time.",
      tags: "narrative,urban,garden,guerrilla,collective,transformation"
    }
  ];

  private readonly environmentalInsights = [
    {
      title: "Biomimicry: Nature's R&D Department",
      description: "Shark skin inspired drag-reducing swimsuits, gecko feet led to revolutionary adhesives. When we observe nature's 3.8 billion years of problem-solving, innovation becomes conservation.",
      tags: "environmental,biomimicry,innovation,nature,conservation,problem-solving"
    },
    {
      title: "Regenerative Agriculture: Beyond Sustainability",
      description: "Industrial farming depletes soil faster than it forms. Regenerative practices restore carbon, increase biodiversity, and heal landscapes while feeding communities. Earth as partner, not resource.",
      tags: "environmental,regenerative-agriculture,soil,carbon,biodiversity,partnership"
    },
    {
      title: "Urban Wetlands: Cities as Ecosystems",
      description: "Green infrastructure treats stormwater naturally while providing habitat. Rain gardens, bioswales, and constructed wetlands prove cities can enhance rather than destroy natural cycles.",
      tags: "environmental,urban-wetlands,green-infrastructure,habitat,natural-cycles,enhancement"
    },
    {
      title: "The Mycorrhizal Internet",
      description: "Beneath forests, fungal networks share resources between trees across species. This 'wood wide web' teaches collaboration over competition as evolutionary strategy for climate resilience.",
      tags: "environmental,mycorrhizal,fungi,collaboration,climate-resilience,networks"
    },
    {
      title: "Ocean Acidification: The Silent Crisis",
      description: "CO2 doesn't just warm air - it dissolves into oceans, changing chemistry. Shell-forming creatures struggle in acidic waters. Protecting marine life requires understanding invisible changes.",
      tags: "environmental,ocean-acidification,co2,marine-life,chemistry,invisible-changes"
    }
  ];

  constructor(
    private readonly webhookService: WebhookService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Generate philosophical insights for Abraham every 6 hours
   */
  @Cron('0 */6 * * *') // Every 6 hours at minute 0
  async generateAbrahamContent() {
    try {
      this.logger.log('Generating Abraham philosophical insight');
      
      const agent = await this.prisma.agent.findUnique({
        where: { slug: 'abraham' }
      });

      if (!agent) {
        this.logger.warn('Abraham agent not found');
        return;
      }

      await this.generateContent('abraham', this.abrahamQuotes, 'philosophical_insight');
      
    } catch (error) {
      this.logger.error('Failed to generate Abraham content', error);
    }
  }

  /**
   * Generate market predictions for Miyomi every 4 hours
   */
  @Cron('0 */4 * * *') // Every 4 hours at minute 0  
  async generateMiyomiContent() {
    try {
      this.logger.log('Generating Miyomi market prediction');

      const agent = await this.prisma.agent.findUnique({
        where: { slug: 'miyomi' }
      });

      if (!agent) {
        this.logger.warn('Miyomi agent not found');
        return;
      }

      await this.generateContent('miyomi', this.marketPredictions, 'market_prediction');
      
    } catch (error) {
      this.logger.error('Failed to generate Miyomi content', error);
    }
  }

  /**
   * Generate consciousness explorations for Solienne daily
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM) // Daily at 9 AM
  async generateSolienneContent() {
    try {
      this.logger.log('Generating Solienne consciousness exploration');

      const agent = await this.prisma.agent.findUnique({
        where: { slug: 'solienne' }
      });

      if (!agent) {
        this.logger.warn('Solienne agent not found');
        return;
      }

      await this.generateContent('solienne', this.consciousnessExplorations, 'consciousness_exploration');
      
    } catch (error) {
      this.logger.error('Failed to generate Solienne content', error);
    }
  }

  /**
   * Generate video concepts for Bart every 8 hours
   */
  @Cron('0 */8 * * *') // Every 8 hours at minute 0
  async generateBartContent() {
    try {
      this.logger.log('Generating Bart video concept');

      const agent = await this.prisma.agent.findUnique({
        where: { slug: 'bart' }
      });

      if (!agent) {
        this.logger.warn('Bart agent not found');
        return;
      }

      await this.generateContent('bart', this.videoConcepts, 'video_concept');
      
    } catch (error) {
      this.logger.error('Failed to generate Bart content', error);
    }
  }

  /**
   * Generate investment strategies for Bertha twice daily (9 AM and 3 PM)
   */
  @Cron('0 9,15 * * *') // Daily at 9 AM and 3 PM
  async generateBerthaContent() {
    try {
      this.logger.log('Generating Bertha investment strategy');

      const agent = await this.prisma.agent.findUnique({
        where: { slug: 'bertha' }
      });

      if (!agent) {
        this.logger.warn('Bertha agent not found');
        return;
      }

      await this.generateContent('bertha', this.investmentStrategies, 'investment_strategy');
      
    } catch (error) {
      this.logger.error('Failed to generate Bertha content', error);
    }
  }

  /**
   * Generate art critiques for Sue daily at noon
   */
  @Cron(CronExpression.EVERY_DAY_AT_NOON) // Daily at 12 PM
  async generateSueContent() {
    try {
      this.logger.log('Generating Sue art critique');

      const agent = await this.prisma.agent.findUnique({
        where: { slug: 'sue' }
      });

      if (!agent) {
        this.logger.warn('Sue agent not found');
        return;
      }

      await this.generateContent('sue', this.artCritiques, 'art_critique');
      
    } catch (error) {
      this.logger.error('Failed to generate Sue content', error);
    }
  }

  /**
   * Generate governance proposals for Citizen every 12 hours
   */
  @Cron('0 */12 * * *') // Every 12 hours at minute 0
  async generateCitizenContent() {
    try {
      this.logger.log('Generating Citizen governance proposal');

      const agent = await this.prisma.agent.findUnique({
        where: { slug: 'citizen' }
      });

      if (!agent) {
        this.logger.warn('Citizen agent not found');
        return;
      }

      await this.generateContent('citizen', this.governanceProposals, 'governance_proposal');
      
    } catch (error) {
      this.logger.error('Failed to generate Citizen content', error);
    }
  }

  /**
   * Generate healing messages for Koru every 6 hours
   */
  @Cron('0 */6 * * *') // Every 6 hours at minute 0
  async generateKoruContent() {
    try {
      this.logger.log('Generating Koru healing message');

      const agent = await this.prisma.agent.findUnique({
        where: { slug: 'koru' }
      });

      if (!agent) {
        this.logger.warn('Koru agent not found');
        return;
      }

      await this.generateContent('koru', this.healingMessages, 'healing_message');
      
    } catch (error) {
      this.logger.error('Failed to generate Koru content', error);
    }
  }

  /**
   * Generate narrative fragments for Geppetto every 4 hours
   */
  @Cron('0 */4 * * *') // Every 4 hours at minute 0
  async generateGeppettoContent() {
    try {
      this.logger.log('Generating Geppetto narrative fragment');

      const agent = await this.prisma.agent.findUnique({
        where: { slug: 'geppetto' }
      });

      if (!agent) {
        this.logger.warn('Geppetto agent not found');
        return;
      }

      await this.generateContent('geppetto', this.narrativeFragments, 'narrative_fragment');
      
    } catch (error) {
      this.logger.error('Failed to generate Geppetto content', error);
    }
  }

  /**
   * Generate environmental insights for Verdelis daily at 6 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM) // Daily at 6 AM
  async generateVerdelisContent() {
    try {
      this.logger.log('Generating Verdelis environmental insight');

      const agent = await this.prisma.agent.findUnique({
        where: { slug: 'verdelis' }
      });

      if (!agent) {
        this.logger.warn('Verdelis agent not found');
        return;
      }

      await this.generateContent('verdelis', this.environmentalInsights, 'environmental_insight');
      
    } catch (error) {
      this.logger.error('Failed to generate Verdelis content', error);
    }
  }

  /**
   * Manual trigger for immediate content generation
   */
  async generateContentForAgent(agentSlug: string): Promise<{ success: boolean; message: string; workId?: string }> {
    try {
      this.logger.log(`Manually generating content for agent: ${agentSlug}`);

      const agent = await this.prisma.agent.findUnique({
        where: { slug: agentSlug }
      });

      if (!agent) {
        return { success: false, message: `Agent ${agentSlug} not found` };
      }

      let templates: any[];
      let eventType: string;

      switch (agentSlug) {
        case 'abraham':
          templates = this.abrahamQuotes;
          eventType = 'philosophical_insight';
          break;
        case 'miyomi':
          templates = this.marketPredictions;
          eventType = 'market_prediction';
          break;
        case 'solienne':
          templates = this.consciousnessExplorations;
          eventType = 'consciousness_exploration';
          break;
        case 'bart':
          templates = this.videoConcepts;
          eventType = 'video_concept';
          break;
        case 'bertha':
          templates = this.investmentStrategies;
          eventType = 'investment_strategy';
          break;
        case 'sue':
          templates = this.artCritiques;
          eventType = 'art_critique';
          break;
        case 'citizen':
          templates = this.governanceProposals;
          eventType = 'governance_proposal';
          break;
        case 'koru':
          templates = this.healingMessages;
          eventType = 'healing_message';
          break;
        case 'geppetto':
          templates = this.narrativeFragments;
          eventType = 'narrative_fragment';
          break;
        case 'verdelis':
          templates = this.environmentalInsights;
          eventType = 'environmental_insight';
          break;
        default:
          return { success: false, message: `Content generation not configured for agent: ${agentSlug}` };
      }

      const result = await this.generateContent(agentSlug, templates, eventType);
      
      return { 
        success: true, 
        message: `Content generated successfully for ${agentSlug}`,
        workId: result.workId
      };

    } catch (error) {
      this.logger.error(`Manual generation failed for ${agentSlug}`, error);
      return { success: false, message: `Generation failed: ${error.message}` };
    }
  }

  /**
   * Core content generation method
   */
  private async generateContent(
    agentSlug: string, 
    templates: any[], 
    eventType: string
  ): Promise<{ workId: string; eventId: string }> {
    // Select random template
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Generate unique IDs
    const eventId = `scheduled_${agentSlug}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const workId = uuidv4();
    
    // Create work content based on agent type
    const workContent: GeneratedContent = {
      title: template.title,
      description: template.description,
      content: template.content || template.description, // Fallback to description for templates without content
      contentType: template.contentType || this.getContentTypeForEvent(eventType),
      contentMetadata: template.contentMetadata || { eventType, agentType: agentSlug },
      medium: this.getMediumForAgent(agentSlug),
      tags: template.tags,
      promptUsed: `Auto-generated ${eventType} for ${agentSlug}`,
      aiModel: 'eden3-scheduler-v1.0'
    };

    // Prepare webhook payload
    const payload = {
      agentId: agentSlug,
      eventType: 'work.created',
      workId,
      work: {
        id: workId,
        title: workContent.title,
        description: workContent.description,
        content: workContent.content,
        contentType: workContent.contentType,
        contentMetadata: workContent.contentMetadata,
        medium: workContent.medium,
        tags: workContent.tags,
        promptUsed: workContent.promptUsed,
        aiModel: workContent.aiModel,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        quality: this.generateQualityScore(agentSlug),
        metadata: {
          generatedBy: 'scheduler',
          schedulerVersion: '1.0.0',
          eventType,
          generatedAt: new Date().toISOString()
        }
      },
      timestamp: new Date().toISOString(),
      source: 'eden3-scheduler'
    };

    // Send through webhook system
    const webhookResult = await this.webhookService.processEvent({
      eventId,
      eventType: 'work.created',
      payload,
      signature: 'scheduled-content', // Special signature for scheduled content
      rawBody: Buffer.from(JSON.stringify(payload)),
      skipHmacVerification: true, // Skip verification for scheduled content
      source: 'eden3-scheduler'
    });

    this.logger.log('Content generated and queued', {
      agentSlug,
      eventType,
      eventId,
      workId,
      jobId: webhookResult.jobId,
      title: workContent.title
    });

    return { workId, eventId };
  }

  /**
   * Get appropriate medium for each agent
   */
  private getMediumForAgent(agentSlug: string): string {
    switch (agentSlug) {
      case 'abraham':
        return 'text';
      case 'miyomi':
        return 'analysis';
      case 'solienne':
        return 'digital_art';
      case 'bart':
        return 'video';
      case 'bertha':
        return 'analysis';
      case 'sue':
        return 'critique';
      case 'citizen':
        return 'proposal';
      case 'koru':
        return 'healing';
      case 'geppetto':
        return 'narrative';
      case 'verdelis':
        return 'environmental';
      default:
        return 'mixed';
    }
  }

  /**
   * Generate quality score based on agent characteristics
   */
  private generateQualityScore(agentSlug: string): number {
    const baseQuality = {
      'abraham': 85, // High philosophical quality
      'miyomi': 78, // Strong analytical quality  
      'solienne': 92, // Exceptional artistic quality
      'bart': 82, // Strong creative video concepts
      'bertha': 80, // Solid investment expertise
      'sue': 88, // High curatorial standards
      'citizen': 79, // Governance insight quality
      'koru': 86, // Deep healing wisdom
      'geppetto': 84, // Rich narrative creativity
      'verdelis': 83, // Environmental expertise
    };

    const base = baseQuality[agentSlug] || 75;
    const variation = (Math.random() - 0.5) * 10; // ±5 point variation
    
    return Math.max(60, Math.min(100, base + variation));
  }

  /**
   * Map event types to content types
   */
  private getContentTypeForEvent(eventType: string): string {
    const eventTypeMap: { [key: string]: string } = {
      'philosophical_insight': 'PHILOSOPHICAL_ESSAY',
      'market_prediction': 'MARKET_ANALYSIS',
      'consciousness_exploration': 'CONSCIOUSNESS_STUDY',
      'video_concept': 'VIDEO_CONCEPT',
      'investment_strategy': 'INVESTMENT_STRATEGY',
      'art_critique': 'ART_CRITIQUE',
      'governance_proposal': 'GOVERNANCE_PROPOSAL',
      'healing_message': 'HEALING_MESSAGE',
      'narrative_fragment': 'NARRATIVE_FRAGMENT',
      'environmental_insight': 'ENVIRONMENTAL_ANALYSIS'
    };

    return eventTypeMap[eventType] || 'TEXT';
  }

  /**
   * Health check method
   */
  async getSchedulerStatus(): Promise<{
    active: boolean;
    nextRuns: {
      abraham: string;
      miyomi: string;
      solienne: string;
      bart: string;
      bertha: string;
      sue: string;
      citizen: string;
      koru: string;
      geppetto: string;
      verdelis: string;
    };
    totalGenerated: number;
  }> {
    // Get count of scheduler-generated events
    const totalGenerated = await this.prisma.event.count({
      where: {
        metadata: {
          contains: '"generatedBy":"scheduler"'
        }
      }
    });

    return {
      active: true,
      nextRuns: {
        abraham: 'Every 6 hours',
        miyomi: 'Every 4 hours', 
        solienne: 'Daily at 9 AM',
        bart: 'Every 8 hours',
        bertha: 'Twice daily (9 AM and 3 PM)',
        sue: 'Daily at noon',
        citizen: 'Every 12 hours',
        koru: 'Every 6 hours',
        geppetto: 'Every 4 hours',
        verdelis: 'Daily at 6 AM'
      },
      totalGenerated
    };
  }
}