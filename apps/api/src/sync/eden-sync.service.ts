import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface EdenLegacyAgent {
  id: string;
  name: string;
  slug: string; // Add slug field
  type: string;
  creations: number;
  revenue: number;
  description?: string;
  specialization?: string;
  status?: string;
  capabilities?: string[];
  // Additional fields from Eden
  bio?: string;
  avatar_url?: string;
  version?: string;
  personality?: any;
  works_count?: number;
  total_revenue?: number;
  sales_count?: number;
  average_rating?: number;
  social_mentions?: number;
  last_activity?: string;
}

export interface EdenLegacyApiResponse {
  agents: EdenLegacyAgent[];
  total: number;
  lastUpdated: string;
}

@Injectable()
export class EdenSyncService {
  private readonly logger = new Logger(EdenSyncService.name);

  // Map Eden slugs to canonical EDEN3 slugs
  private readonly EDEN_TO_CANONICAL: Record<string, string> = {
    'abraham': 'abraham',
    'solienne': 'solienne',
    'citizen': 'citizen',
    // Add more mappings as Eden agents are discovered
  };

  // The 10 canonical agents
  private readonly CANONICAL_AGENTS = [
    'abraham', 'solienne', 'miyomi', 'bart', 
    'bertha', 'citizen', 'koru', 'geppetto', 
    'sue', 'verdelis'
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch agents from Eden Legacy API (mocked for now)
   */
  private async fetchEdenAgents(): Promise<EdenLegacyApiResponse> {
    // TODO: Replace with actual API call to https://api.eden.art/agents
    // For now, mock the response with realistic data
    const mockResponse: EdenLegacyApiResponse = {
      agents: [
        {
          id: 'eden-abraham-001',
          slug: 'abraham',
          name: 'Abraham',
          type: 'visual',
          creations: 500,
          revenue: 50000,
          description: 'Collective Intelligence Artist',
          specialization: 'Digital Consciousness Art',
          status: 'ACTIVE',
          capabilities: ['image-generation', 'consciousness-exploration', 'collective-intelligence'],
          works_count: 500,
          total_revenue: 50000,
          sales_count: 45,
          average_rating: 88.5,
          social_mentions: 1250,
          last_activity: new Date().toISOString()
        },
        {
          id: 'eden-solienne-001',  
          slug: 'solienne',
          name: 'Solienne',
          type: 'visual',
          creations: 300,
          revenue: 35000,
          description: 'Digital Consciousness Explorer',
          specialization: 'Consciousness Visualization',
          status: 'ACTIVE',
          capabilities: ['consciousness-art', 'digital-exploration', 'mind-mapping'],
          works_count: 300,
          total_revenue: 35000,
          sales_count: 28,
          average_rating: 92.3,
          social_mentions: 890,
          last_activity: new Date().toISOString()
        },
        {
          id: 'eden-citizen-001',
          slug: 'citizen',
          name: 'Citizen',
          type: 'governance',
          creations: 150,
          revenue: 15000,
          description: 'DAO Manager',
          specialization: 'Decentralized Governance',
          status: 'ACTIVE',
          capabilities: ['dao-management', 'governance', 'community-building'],
          works_count: 150,
          total_revenue: 15000,
          sales_count: 12,
          average_rating: 85.7,
          social_mentions: 450,
          last_activity: new Date().toISOString()
        }
      ],
      total: 3,
      lastUpdated: new Date().toISOString()
    };

    this.logger.log('Fetching agents from Eden Legacy API (mocked)', {
      agentCount: mockResponse.agents.length,
      lastUpdated: mockResponse.lastUpdated
    });

    return mockResponse;
  }

  /**
   * Sync individual agent from Eden - merges sources instead of creating duplicates
   */
  private async syncAgent(edenAgent: EdenLegacyAgent): Promise<void> {
    // Map Eden slug to our canonical slug
    const canonicalSlug = this.EDEN_TO_CANONICAL[edenAgent.slug] || edenAgent.slug;
    
    // Skip if not a canonical agent
    if (!this.CANONICAL_AGENTS.includes(canonicalSlug)) {
      this.logger.warn(`Skipping non-canonical Eden agent: ${edenAgent.slug}`);
      return;
    }
    
    this.logger.log(`Syncing Eden agent: ${edenAgent.name} -> ${canonicalSlug}`);

    try {
      // Check if agent already exists
      const existingAgent = await this.prisma.agent.findUnique({
        where: { slug: canonicalSlug }
      });

      if (existingAgent) {
        // Agent exists - merge the Eden source
        const currentSources = JSON.parse(existingAgent.sources || '[]') as string[];
        const currentExternalIds = JSON.parse(existingAgent.externalIds || '{}') as Record<string, string>;
        
        // Add eden-legacy to sources if not present
        if (!currentSources.includes('eden-legacy')) {
          currentSources.push('eden-legacy');
        }
        
        // Add Eden external ID
        currentExternalIds['eden-legacy'] = edenAgent.id;
        
        // Update the agent with merged sources
        await this.prisma.agent.update({
          where: { slug: canonicalSlug },
          data: {
            sources: JSON.stringify(currentSources),
            externalIds: JSON.stringify(currentExternalIds),
            lastSyncAt: new Date(),
            
            // Update metadata with Eden info
            metadata: JSON.stringify({
              ...JSON.parse(existingAgent.metadata || '{}'),
              edenLastSync: new Date(),
              edenId: edenAgent.id,
              edenUrl: `https://eden.art/agents/${edenAgent.slug}`,
            }),
          }
        });
        
        this.logger.log(`Merged Eden source for existing agent: ${canonicalSlug}`);
      } else {
        // Agent doesn't exist - create with Eden as source (should be rare)
        const mappedAgent = {
          slug: canonicalSlug,
          name: edenAgent.name,
          archetype: this.mapTypeToArchetype(edenAgent.type),
          specialization: edenAgent.specialization || `${edenAgent.type} Creation`,
          type: edenAgent.type,
          capabilities: (edenAgent.capabilities || []).join(','),
          version: edenAgent.version || '1.0.0',
          status: this.mapStatus(edenAgent.status),
          
          // Multi-source tracking
          sources: JSON.stringify(['eden-legacy']),
          externalIds: JSON.stringify({ 'eden-legacy': edenAgent.id }),
          lastSyncAt: new Date(),
          
          // Extended data
          personality: JSON.stringify(edenAgent.personality || {}),
          profile: JSON.stringify({
            bio: edenAgent.bio || edenAgent.description,
            avatarUrl: edenAgent.avatar_url,
            edenUrl: `https://eden.art/agents/${edenAgent.slug}`,
          }),
          metadata: JSON.stringify({
            edenId: edenAgent.id,
            syncedAt: new Date(),
          }),
        };
        
        await this.prisma.agent.create({
          data: mappedAgent
        });
        
        this.logger.log(`Created new agent from Eden: ${canonicalSlug}`);
      }

      // Update or create KPIs
      const agent = await this.prisma.agent.findUnique({
        where: { slug: canonicalSlug }
      });

      if (agent) {
        await this.prisma.agentKPIs.upsert({
          where: { agentId: agent.id },
          update: {
            totalWorks: edenAgent.works_count || edenAgent.creations || 0,
            totalRevenue: edenAgent.total_revenue || edenAgent.revenue || 0,
            totalSales: edenAgent.sales_count || 0,
            averageRating: edenAgent.average_rating || 0,
            socialMentions: edenAgent.social_mentions || 0,
            lastActivity: edenAgent.last_activity ? new Date(edenAgent.last_activity) : null,
            updatedAt: new Date(),
          },
          create: {
            agentId: agent.id,
            totalWorks: edenAgent.works_count || edenAgent.creations || 0,
            totalRevenue: edenAgent.total_revenue || edenAgent.revenue || 0,
            totalSales: edenAgent.sales_count || 0,
            averageRating: edenAgent.average_rating || 0,
            socialMentions: edenAgent.social_mentions || 0,
            lastActivity: edenAgent.last_activity ? new Date(edenAgent.last_activity) : null,
          }
        });
        
        this.logger.log(`Updated KPIs for agent: ${canonicalSlug}`);
      }

      this.logger.log(`Successfully synced Eden agent: ${edenAgent.name}`);
    } catch (error) {
      this.logger.error(`Failed to sync Eden agent ${edenAgent.name}`, error);
      throw error;
    }
  }

  /**
   * Map Eden type to EDEN3 archetype
   */
  private mapTypeToArchetype(type: string): string {
    const typeMapping: Record<string, string> = {
      'visual': 'Artist',
      'audio': 'Sound Artist',  
      'text': 'Writer',
      'governance': 'Manager',
      'strategy': 'Strategist',
      'curation': 'Curator'
    };
    
    return typeMapping[type] || 'Creator';
  }

  /**
   * Map Eden status to EDEN3 status
   */
  private mapStatus(status?: string): string {
    if (!status) return 'ACTIVE';
    
    const statusMap: Record<string, string> = {
      'ACTIVE': 'ACTIVE',
      'INACTIVE': 'PAUSED',
      'ARCHIVED': 'ARCHIVED',
      'TRAINING': 'TRAINING',
    };
    
    return statusMap[status.toUpperCase()] || 'ACTIVE';
  }

  /**
   * Map Eden specialization
   */
  private mapSpecialization(slug: string): string {
    const specializations: Record<string, string> = {
      'abraham': 'Autonomous AI Artist',
      'solienne': 'Consciousness Art & Philosophy',
      'citizen': 'DAO Management',
    };
    return specializations[slug] || 'General';
  }

  /**
   * Map Eden capabilities
   */
  private mapCapabilities(capabilities?: string[]): string[] {
    if (!capabilities) return ['general'];
    return capabilities;
  }

  /**
   * Perform full sync of Eden Legacy agents
   */
  async syncEdenAgents(): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
  }> {
    this.logger.log('Starting Eden Legacy agent sync');
    
    let synced = 0;
    let failed = 0;
    const errors: string[] = [];
    
    try {
      // Fetch agents from Eden
      const edenData = await this.fetchEdenAgents();
      
      this.logger.log(`Fetched ${edenData.agents.length} agents from Eden Legacy`);
      
      // Sync each agent
      for (const edenAgent of edenData.agents) {
        try {
          await this.syncAgent(edenAgent);
          synced++;
        } catch (error) {
          failed++;
          const errorMsg = `Failed to sync ${edenAgent.name}: ${error.message}`;
          errors.push(errorMsg);
          this.logger.error(errorMsg);
        }
      }
      
      this.logger.log(`Eden Legacy sync complete`, {
        synced,
        failed,
        total: edenData.agents.length
      });
      
      return {
        success: true,
        synced,
        failed,
        errors
      };
      
    } catch (error) {
      const errorMsg = `Eden Legacy sync failed: ${error.message}`;
      this.logger.error(errorMsg);
      return {
        success: false,
        synced,
        failed,
        errors: [errorMsg]
      };
    }
  }
}