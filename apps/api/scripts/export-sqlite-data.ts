#!/usr/bin/env ts-node

/**
 * SQLite to PostgreSQL Migration - Data Export Script
 * 
 * This script exports all data from the SQLite database to JSON files
 * for migration to PostgreSQL. It preserves all relationships and timestamps.
 * 
 * Usage: npm run db:export-sqlite
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface ExportStats {
  table: string;
  count: number;
  filePath: string;
}

class SQLiteDataExporter {
  private prisma: PrismaClient;
  private exportDir: string;
  private stats: ExportStats[] = [];

  constructor() {
    // Initialize Prisma client with SQLite database
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: `file:${path.resolve(__dirname, '../prisma/dev.db')}`
        }
      }
    });
    
    this.exportDir = path.resolve(__dirname, '../../../data-export');
  }

  private async ensureExportDirectory(): Promise<void> {
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
      console.log(`✅ Created export directory: ${this.exportDir}`);
    }
  }

  private async exportTable<T>(
    tableName: string,
    queryFn: () => Promise<T[]>
  ): Promise<void> {
    console.log(`📤 Exporting ${tableName}...`);
    
    try {
      const data = await queryFn();
      const filePath = path.join(this.exportDir, `${tableName}.json`);
      
      // Convert Date objects to ISO strings for JSON serialization
      const serializedData = JSON.stringify(data, (key, value) => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      }, 2);
      
      fs.writeFileSync(filePath, serializedData);
      
      this.stats.push({
        table: tableName,
        count: data.length,
        filePath
      });
      
      console.log(`   ✅ ${data.length} records exported to ${filePath}`);
    } catch (error) {
      console.error(`   ❌ Error exporting ${tableName}:`, error);
      throw error;
    }
  }

  async exportAllData(): Promise<void> {
    console.log('🚀 Starting SQLite data export...\n');
    
    await this.ensureExportDirectory();

    // Export in dependency order (parents before children)
    
    // 1. Independent tables first
    await this.exportTable('agents', () => this.prisma.agent.findMany({
      orderBy: { createdAt: 'asc' }
    }));

    // 2. Agent-dependent tables
    await this.exportTable('agent_kpis', () => this.prisma.agentKPIs.findMany({
      orderBy: { createdAt: 'asc' }
    }));

    await this.exportTable('events', () => this.prisma.event.findMany({
      orderBy: { createdAt: 'asc' }
    }));

    await this.exportTable('works', () => this.prisma.work.findMany({
      orderBy: { createdAt: 'asc' }
    }));

    await this.exportTable('training_sessions', () => this.prisma.trainingSession.findMany({
      orderBy: { createdAt: 'asc' }
    }));

    await this.exportTable('mentions', () => this.prisma.mention.findMany({
      orderBy: { createdAt: 'asc' }
    }));

    await this.exportTable('collaborations', () => this.prisma.collaboration.findMany({
      orderBy: { createdAt: 'asc' }
    }));

    await this.exportTable('quality_evaluations', () => this.prisma.qualityEvaluation.findMany({
      orderBy: { createdAt: 'asc' }
    }));

    await this.exportTable('daily_metrics', () => this.prisma.dailyMetrics.findMany({
      orderBy: { date: 'asc' }
    }));

    await this.exportTable('agent_metrics', () => this.prisma.agentMetrics.findMany({
      orderBy: { date: 'asc' }
    }));

    // 3. Work-dependent tables
    await this.exportTable('transactions', () => this.prisma.transaction.findMany({
      orderBy: { createdAt: 'asc' }
    }));

    // Create export metadata
    const metadata = {
      exportDate: new Date().toISOString(),
      sourceDatabase: 'sqlite',
      targetDatabase: 'postgresql',
      tables: this.stats,
      totalRecords: this.stats.reduce((sum, stat) => sum + stat.count, 0)
    };

    const metadataPath = path.join(this.exportDir, 'export-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log('\n📊 Export Summary:');
    console.log('==================');
    this.stats.forEach(stat => {
      console.log(`${stat.table.padEnd(20)} ${stat.count.toString().padStart(6)} records`);
    });
    console.log(`${'TOTAL'.padEnd(20)} ${metadata.totalRecords.toString().padStart(6)} records\n`);
    
    console.log(`✅ Export completed successfully!`);
    console.log(`📂 Export directory: ${this.exportDir}`);
    console.log(`📄 Metadata file: ${metadataPath}`);
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const exporter = new SQLiteDataExporter();
  
  try {
    await exporter.exportAllData();
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    await exporter.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}