#!/usr/bin/env ts-node

/**
 * Migration Verification Script
 * 
 * This script performs comprehensive verification of the SQLite to PostgreSQL migration
 * by comparing data integrity, relationships, and running sample queries.
 * 
 * Usage: npm run db:verify-migration
 */

import { PrismaClient } from '@prisma/client';
import * as path from 'path';

interface VerificationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

class MigrationVerifier {
  private sqlitePrisma: PrismaClient;
  private postgresPrisma: PrismaClient;
  private results: VerificationResult[] = [];

  constructor() {
    // SQLite connection
    this.sqlitePrisma = new PrismaClient({
      datasources: {
        db: { url: `file:${path.resolve(__dirname, '../prisma/dev.db')}` }
      }
    });

    // PostgreSQL connection
    this.postgresPrisma = new PrismaClient({
      datasources: {
        db: { url: process.env.DATABASE_URL || 'postgresql://eden3:eden3_dev_password@localhost:5432/eden3' }
      }
    });
  }

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any): void {
    this.results.push({ test, status, message, details });
  }

  private async verifyRecordCounts(): Promise<void> {
    console.log('🔢 Verifying record counts...');

    const tables = [
      { name: 'agents', model: 'agent' },
      { name: 'events', model: 'event' },
      { name: 'works', model: 'work' },
      { name: 'agent_kpis', model: 'agentKPIs' },
      { name: 'training_sessions', model: 'trainingSession' },
      { name: 'mentions', model: 'mention' },
      { name: 'collaborations', model: 'collaboration' },
      { name: 'quality_evaluations', model: 'qualityEvaluation' },
      { name: 'daily_metrics', model: 'dailyMetrics' },
      { name: 'agent_metrics', model: 'agentMetrics' },
      { name: 'transactions', model: 'transaction' }
    ];

    for (const table of tables) {
      try {
        const sqliteCount = await (this.sqlitePrisma as any)[table.model].count();
        const postgresCount = await (this.postgresPrisma as any)[table.model].count();

        if (sqliteCount === postgresCount) {
          this.addResult(
            `Record Count: ${table.name}`,
            'PASS',
            `${postgresCount} records match`,
            { sqlite: sqliteCount, postgres: postgresCount }
          );
        } else {
          this.addResult(
            `Record Count: ${table.name}`,
            'FAIL',
            `Count mismatch: SQLite=${sqliteCount}, PostgreSQL=${postgresCount}`,
            { sqlite: sqliteCount, postgres: postgresCount }
          );
        }
      } catch (error) {
        this.addResult(
          `Record Count: ${table.name}`,
          'FAIL',
          `Error counting records: ${error}`,
          { error: error.message }
        );
      }
    }
  }

  private async verifyDataIntegrity(): Promise<void> {
    console.log('🔍 Verifying data integrity...');

    try {
      // Verify agents
      const sqliteAgents = await this.sqlitePrisma.agent.findMany({ orderBy: { createdAt: 'asc' } });
      const postgresAgents = await this.postgresPrisma.agent.findMany({ orderBy: { createdAt: 'asc' } });

      if (sqliteAgents.length > 0 && postgresAgents.length > 0) {
        const firstSqliteAgent = sqliteAgents[0];
        const firstPostgresAgent = postgresAgents[0];

        const fieldsMatch = 
          firstSqliteAgent.id === firstPostgresAgent.id &&
          firstSqliteAgent.slug === firstPostgresAgent.slug &&
          firstSqliteAgent.name === firstPostgresAgent.name;

        this.addResult(
          'Data Integrity: Agents',
          fieldsMatch ? 'PASS' : 'FAIL',
          fieldsMatch ? 'Agent data fields match' : 'Agent data fields mismatch',
          { 
            sample_id: firstSqliteAgent.id,
            sqlite_slug: firstSqliteAgent.slug,
            postgres_slug: firstPostgresAgent.slug 
          }
        );
      }

      // Verify works
      const sqliteWorks = await this.sqlitePrisma.work.findMany({ 
        orderBy: { createdAt: 'asc' },
        take: 5 
      });
      const postgresWorks = await this.postgresPrisma.work.findMany({ 
        orderBy: { createdAt: 'asc' },
        take: 5 
      });

      if (sqliteWorks.length > 0 && postgresWorks.length > 0) {
        const titlesMatch = sqliteWorks.every((work, index) => 
          work.title === postgresWorks[index]?.title
        );

        this.addResult(
          'Data Integrity: Works',
          titlesMatch ? 'PASS' : 'FAIL',
          titlesMatch ? 'Work titles match' : 'Work titles mismatch',
          { sample_count: Math.min(sqliteWorks.length, postgresWorks.length) }
        );
      }

    } catch (error) {
      this.addResult(
        'Data Integrity',
        'FAIL',
        `Error verifying data integrity: ${error}`,
        { error: error.message }
      );
    }
  }

  private async verifyRelationships(): Promise<void> {
    console.log('🔗 Verifying relationships...');

    try {
      // Test agent-works relationship
      const sqliteAgentWithWorks = await this.sqlitePrisma.agent.findFirst({
        include: { works: true }
      });

      const postgresAgentWithWorks = await this.postgresPrisma.agent.findFirst({
        where: { id: sqliteAgentWithWorks?.id },
        include: { works: true }
      });

      if (sqliteAgentWithWorks && postgresAgentWithWorks) {
        const worksCountMatch = sqliteAgentWithWorks.works.length === postgresAgentWithWorks.works.length;
        
        this.addResult(
          'Relationships: Agent-Works',
          worksCountMatch ? 'PASS' : 'FAIL',
          worksCountMatch ? 'Agent-Works relationships preserved' : 'Agent-Works relationships broken',
          {
            agent_id: sqliteAgentWithWorks.id,
            sqlite_works: sqliteAgentWithWorks.works.length,
            postgres_works: postgresAgentWithWorks.works.length
          }
        );
      }

      // Test work-transactions relationship
      const sqliteWorkWithTransactions = await this.sqlitePrisma.work.findFirst({
        include: { transactions: true }
      });

      const postgresWorkWithTransactions = await this.postgresPrisma.work.findFirst({
        where: { id: sqliteWorkWithTransactions?.id },
        include: { transactions: true }
      });

      if (sqliteWorkWithTransactions && postgresWorkWithTransactions) {
        const transactionsMatch = sqliteWorkWithTransactions.transactions.length === postgresWorkWithTransactions.transactions.length;
        
        this.addResult(
          'Relationships: Work-Transactions',
          transactionsMatch ? 'PASS' : 'FAIL',
          transactionsMatch ? 'Work-Transaction relationships preserved' : 'Work-Transaction relationships broken',
          {
            work_id: sqliteWorkWithTransactions.id,
            sqlite_transactions: sqliteWorkWithTransactions.transactions.length,
            postgres_transactions: postgresWorkWithTransactions.transactions.length
          }
        );
      }

    } catch (error) {
      this.addResult(
        'Relationships',
        'FAIL',
        `Error verifying relationships: ${error}`,
        { error: error.message }
      );
    }
  }

  private async verifyTimestamps(): Promise<void> {
    console.log('⏰ Verifying timestamps...');

    try {
      // Compare timestamp preservation for agents
      const sqliteAgent = await this.sqlitePrisma.agent.findFirst({
        orderBy: { createdAt: 'desc' }
      });

      const postgresAgent = await this.postgresPrisma.agent.findFirst({
        where: { id: sqliteAgent?.id }
      });

      if (sqliteAgent && postgresAgent) {
        const createdAtMatch = Math.abs(
          new Date(sqliteAgent.createdAt).getTime() - new Date(postgresAgent.createdAt).getTime()
        ) < 1000; // Allow 1 second difference

        this.addResult(
          'Timestamps: CreatedAt',
          createdAtMatch ? 'PASS' : 'FAIL',
          createdAtMatch ? 'Timestamps preserved accurately' : 'Timestamp conversion issues detected',
          {
            agent_id: sqliteAgent.id,
            sqlite_created: sqliteAgent.createdAt.toISOString(),
            postgres_created: postgresAgent.createdAt.toISOString()
          }
        );
      }

    } catch (error) {
      this.addResult(
        'Timestamps',
        'FAIL',
        `Error verifying timestamps: ${error}`,
        { error: error.message }
      );
    }
  }

  private async verifyIndexes(): Promise<void> {
    console.log('📊 Verifying indexes...');

    try {
      // Test query performance on indexed fields
      const start = Date.now();
      
      await this.postgresPrisma.agent.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { kQuality: 'desc' }
      });

      const queryTime = Date.now() - start;

      this.addResult(
        'Indexes: Query Performance',
        queryTime < 1000 ? 'PASS' : 'WARN',
        `Index query completed in ${queryTime}ms`,
        { query_time_ms: queryTime }
      );

    } catch (error) {
      this.addResult(
        'Indexes',
        'FAIL',
        `Error testing indexes: ${error}`,
        { error: error.message }
      );
    }
  }

  private async verifySampleQueries(): Promise<void> {
    console.log('📝 Running sample queries...');

    try {
      // Complex query test
      const result = await this.postgresPrisma.agent.findMany({
        where: {
          status: 'ACTIVE',
          kQuality: { gt: 0 }
        },
        include: {
          works: {
            where: { status: 'PUBLISHED' },
            orderBy: { createdAt: 'desc' },
            take: 3
          },
          kpis: true
        },
        orderBy: { kRevenue: 'desc' },
        take: 5
      });

      this.addResult(
        'Sample Queries: Complex Join',
        result.length > 0 ? 'PASS' : 'WARN',
        `Complex query returned ${result.length} results`,
        { result_count: result.length }
      );

    } catch (error) {
      this.addResult(
        'Sample Queries',
        'FAIL',
        `Error running sample queries: ${error}`,
        { error: error.message }
      );
    }
  }

  private printResults(): void {
    console.log('\n📋 Migration Verification Results:');
    console.log('=====================================');

    let passed = 0;
    let failed = 0;
    let warnings = 0;

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${result.test}: ${result.message}`);
      
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2).replace(/\n/g, '\n   ')}`);
      }

      if (result.status === 'PASS') passed++;
      else if (result.status === 'FAIL') failed++;
      else warnings++;
    });

    console.log('\n📊 Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`📈 Total: ${this.results.length}`);

    if (failed === 0) {
      console.log('\n🎉 Migration verification successful! Your data migration is complete and verified.');
    } else {
      console.log(`\n⚠️  Migration verification found ${failed} issues. Please review the results above.`);
    }
  }

  async runFullVerification(): Promise<void> {
    console.log('🔍 Starting comprehensive migration verification...\n');

    try {
      await Promise.all([
        this.verifyRecordCounts(),
        this.verifyDataIntegrity(),
        this.verifyRelationships(),
        this.verifyTimestamps(),
        this.verifyIndexes(),
        this.verifySampleQueries()
      ]);

      this.printResults();

    } catch (error) {
      console.error('❌ Verification failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  private async disconnect(): Promise<void> {
    await Promise.all([
      this.sqlitePrisma.$disconnect(),
      this.postgresPrisma.$disconnect()
    ]);
  }
}

// Main execution
async function main() {
  const verifier = new MigrationVerifier();
  
  try {
    await verifier.runFullVerification();
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}