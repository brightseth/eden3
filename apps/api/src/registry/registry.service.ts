import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RegistryService {
  private readonly logger = new Logger(RegistryService.name);

  constructor() {
    // Placeholder service for future Registry integration
  }

  async getAgents() {
    this.logger.log('Registry service called - placeholder implementation');
    return [];
  }
}