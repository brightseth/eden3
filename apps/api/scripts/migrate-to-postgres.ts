#!/usr/bin/env ts-node

/**
 * Complete SQLite to PostgreSQL Migration Script
 * 
 * This script orchestrates the complete migration process:
 * 1. Exports data from SQLite
 * 2. Sets up PostgreSQL (via Docker if needed)
 * 3. Runs Prisma migrations
 * 4. Imports data into PostgreSQL
 * 5. Validates the migration
 * 
 * Usage: npm run db:migrate-to-postgres
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const execAsync = promisify(exec);

interface MigrationConfig {
  sqliteDbPath: string;
  postgresUrl: string;
  exportDir: string;
  backupSqliteDb: boolean;
  validateMigration: boolean;
}

class PostgreSQLMigrator {
  private config: MigrationConfig;

  constructor() {
    this.config = {
      sqliteDbPath: path.resolve(__dirname, '../prisma/dev.db'),
      postgresUrl: process.env.DATABASE_URL || 'postgresql://eden3:eden3_dev_password@localhost:5432/eden3',
      exportDir: path.resolve(__dirname, '../../../data-export'),
      backupSqliteDb: true,
      validateMigration: true
    };
  }

  private async executeCommand(command: string, description: string): Promise<void> {
    console.log(`🔄 ${description}...`);
    
    try {
      const { stdout, stderr } = await execAsync(command, { 
        cwd: path.resolve(__dirname, '..'),
        env: { 
          ...process.env, 
          DATABASE_URL: this.config.postgresUrl 
        }
      });
      
      if (stdout) console.log(stdout);
      if (stderr && !stderr.includes('warning')) console.warn(stderr);
      
      console.log(`✅ ${description} completed\n`);
    } catch (error) {
      console.error(`❌ ${description} failed:`, error);
      throw error;
    }
  }

  private async checkPrerequisites(): Promise<void> {
    console.log('🔍 Checking prerequisites...\n');

    // Check if SQLite database exists
    if (!fs.existsSync(this.config.sqliteDbPath)) {
      throw new Error(`SQLite database not found at ${this.config.sqliteDbPath}`);
    }

    console.log(`✅ SQLite database found: ${this.config.sqliteDbPath}`);

    // Check if Docker is running (for PostgreSQL)
    try {
      await execAsync('docker ps');
      console.log('✅ Docker is running');
    } catch (error) {
      console.warn('⚠️  Docker not running. Please ensure PostgreSQL is available at the configured URL.');
    }

    // Check PostgreSQL connection
    try {
      const testPrisma = new PrismaClient({
        datasources: { db: { url: this.config.postgresUrl } }
      });
      await testPrisma.$connect();
      await testPrisma.$disconnect();
      console.log('✅ PostgreSQL connection successful');
    } catch (error) {
      throw new Error(`Cannot connect to PostgreSQL at ${this.config.postgresUrl}. Please ensure PostgreSQL is running.`);
    }

    console.log('');
  }

  private async backupSqliteDatabase(): Promise<void> {
    if (!this.config.backupSqliteDb) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${this.config.sqliteDbPath}.backup-${timestamp}`;
    
    console.log('💾 Creating SQLite backup...');
    
    try {
      fs.copyFileSync(this.config.sqliteDbPath, backupPath);
      console.log(`✅ SQLite backup created: ${backupPath}\n`);
    } catch (error) {
      console.error('❌ Failed to create SQLite backup:', error);
      throw error;
    }
  }

  private async validateMigration(): Promise<void> {
    if (!this.config.validateMigration) return;

    console.log('🔍 Validating migration...');

    try {
      // Connect to both databases
      const sqlitePrisma = new PrismaClient({
        datasources: {
          db: { url: `file:${this.config.sqliteDbPath}` }
        }
      });

      const postgresPrisma = new PrismaClient({
        datasources: {
          db: { url: this.config.postgresUrl }
        }
      });

      // Count records in key tables
      const tables = ['agent', 'event', 'work', 'agentKPIs', 'trainingSession'];
      const validationResults: Array<{ table: string; sqlite: number; postgres: number; match: boolean }> = [];

      for (const table of tables) {
        const sqliteCount = await (sqlitePrisma as any)[table].count();
        const postgresCount = await (postgresPrisma as any)[table].count();
        const match = sqliteCount === postgresCount;

        validationResults.push({
          table,
          sqlite: sqliteCount,
          postgres: postgresCount,
          match
        });
      }

      await sqlitePrisma.$disconnect();
      await postgresPrisma.$disconnect();

      // Print validation results
      console.log('\n📊 Migration Validation Results:');
      console.log('==================================');
      console.log('Table'.padEnd(20) + 'SQLite'.padStart(8) + 'PostgreSQL'.padStart(12) + 'Status'.padStart(10));
      console.log('-'.repeat(50));

      let allValid = true;
      validationResults.forEach(result => {
        const status = result.match ? '✅ MATCH' : '❌ MISMATCH';
        console.log(
          result.table.padEnd(20) +
          result.sqlite.toString().padStart(8) +
          result.postgres.toString().padStart(12) +
          status.padStart(10)
        );
        if (!result.match) allValid = false;
      });

      console.log('');

      if (allValid) {
        console.log('✅ Migration validation passed! All record counts match.\n');
      } else {
        console.warn('⚠️  Migration validation found mismatches. Please review the data.\n');
      }

    } catch (error) {
      console.error('❌ Migration validation failed:', error);
      throw error;
    }
  }

  async runFullMigration(): Promise<void> {
    console.log('🚀 Starting complete SQLite to PostgreSQL migration...\n');

    try {
      // Step 1: Prerequisites check
      await this.checkPrerequisites();

      // Step 2: Backup SQLite database
      await this.backupSqliteDatabase();

      // Step 3: Export data from SQLite
      await this.executeCommand(
        'npx ts-node scripts/export-sqlite-data.ts',
        'Exporting data from SQLite'
      );

      // Step 4: Generate Prisma client for PostgreSQL
      await this.executeCommand(
        'npx prisma generate',
        'Generating Prisma client for PostgreSQL'
      );

      // Step 5: Run Prisma migrations to create PostgreSQL schema
      await this.executeCommand(
        'npx prisma migrate deploy',
        'Running Prisma migrations for PostgreSQL'
      );

      // Step 6: Import data into PostgreSQL
      await this.executeCommand(
        'npx ts-node scripts/import-to-postgres.ts',
        'Importing data into PostgreSQL'
      );

      // Step 7: Validate migration
      await this.validateMigration();

      console.log('🎉 Migration completed successfully!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Update your .env file to use the PostgreSQL DATABASE_URL');
      console.log('2. Test your application with the new database');
      console.log('3. Consider removing the SQLite database file if everything works correctly');
      console.log(`4. Access Adminer at http://localhost:8080 to manage your PostgreSQL database`);
      console.log('');

    } catch (error) {
      console.error('\n❌ Migration failed:', error);
      console.log('\n🔄 Rollback instructions:');
      console.log('1. Restore your original .env file');
      console.log('2. Use the SQLite backup if needed');
      console.log('3. Run: npm run prisma:generate');
      
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const migrator = new PostgreSQLMigrator();
  await migrator.runFullMigration();
}

// Run if called directly
if (require.main === module) {
  main();
}