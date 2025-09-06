# SQLite to PostgreSQL Migration Guide

This guide walks you through migrating the Eden3 system from SQLite to PostgreSQL while preserving all data, relationships, and timestamps.

## Overview

The migration system includes:
- **Export Script**: Exports all SQLite data to JSON files
- **Schema Update**: Updates Prisma schema to use PostgreSQL
- **Import Script**: Imports JSON data into PostgreSQL
- **Docker Setup**: PostgreSQL database with Adminer for management
- **Validation**: Verifies data integrity after migration

## Quick Start (Automated Migration)

For a fully automated migration:

```bash
# 1. Start PostgreSQL with Docker
cd /Users/seth/eden3
docker-compose up -d postgres

# 2. Wait for PostgreSQL to be ready
docker-compose logs -f postgres
# Wait until you see "database system is ready to accept connections"

# 3. Run complete migration
cd apps/api
npm run db:migrate-to-postgres
```

## Manual Step-by-Step Migration

If you prefer to run each step manually:

### Step 1: Setup PostgreSQL

Start PostgreSQL using Docker:
```bash
cd /Users/seth/eden3
docker-compose up -d postgres
```

This will:
- Start PostgreSQL on port 5432
- Create database `eden3` with user `eden3`
- Start Adminer on port 8080 for database management

### Step 2: Export SQLite Data

Export all data from the current SQLite database:
```bash
cd apps/api
npm run db:export-sqlite
```

This creates JSON files in `/Users/seth/eden3/data-export/` containing:
- `agents.json` (10 records)
- `events.json` (28 records) 
- `works.json` (34 records)
- All related tables (agent_kpis, training_sessions, etc.)
- `export-metadata.json` with migration details

### Step 3: Update Environment

Update your `.env` file to use PostgreSQL:
```env
# Old SQLite URL
# DATABASE_URL="file:./prisma/dev.db"

# New PostgreSQL URL
DATABASE_URL="postgresql://eden3:eden3_dev_password@localhost:5432/eden3"
```

### Step 4: Run Prisma Migrations

Create the PostgreSQL schema:
```bash
npx prisma migrate deploy
npx prisma generate
```

### Step 5: Import Data

Import the exported data into PostgreSQL:
```bash
npm run db:import-postgres
```

### Step 6: Validate Migration

The import script automatically validates that record counts match between SQLite and PostgreSQL. You can also manually verify using Prisma Studio:

```bash
npx prisma studio
```

## Database Connections

### PostgreSQL (Primary)
- **Host**: localhost
- **Port**: 5432
- **Database**: eden3
- **Username**: eden3
- **Password**: eden3_dev_password

### Adminer (Database Management)
- **URL**: http://localhost:8080
- **System**: PostgreSQL
- **Server**: postgres
- **Username**: eden3
- **Password**: eden3_dev_password
- **Database**: eden3

## Data Export Structure

The migration exports data to `/Users/seth/eden3/data-export/` with these files:

```
data-export/
├── agents.json              # 10 agent records
├── agent_kpis.json          # Agent KPI data
├── events.json              # 28 event records
├── works.json               # 34 work records
├── training_sessions.json   # Training session data
├── mentions.json            # Social mentions
├── collaborations.json      # Agent collaborations
├── quality_evaluations.json # Quality assessments
├── daily_metrics.json       # Daily analytics
├── agent_metrics.json       # Agent performance metrics
├── transactions.json        # Financial transactions
└── export-metadata.json     # Migration metadata
```

## Rollback Plan

If you need to rollback to SQLite:

1. **Stop the application**
2. **Restore original .env file**:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   ```
3. **Regenerate Prisma client**:
   ```bash
   npx prisma generate
   ```
4. **Use SQLite backup if needed**: 
   The migration automatically creates a backup at `prisma/dev.db.backup-[timestamp]`

## Troubleshooting

### PostgreSQL Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Data Import Errors
- Check the import logs for specific table errors
- Verify all foreign key relationships in the source data
- Ensure PostgreSQL has sufficient permissions

### Schema Issues
```bash
# Reset PostgreSQL database
docker-compose down
docker volume rm eden3_postgres_data
docker-compose up -d postgres

# Re-run migrations
npx prisma migrate deploy
```

## Performance Considerations

### PostgreSQL Configuration
The Docker setup uses optimized settings for development. For production:
- Adjust memory settings in `docker-compose.yml`
- Configure connection pooling
- Set up regular backups

### Index Optimization
The Prisma schema includes indexes for:
- Primary lookups (slug, status, type)
- Performance queries (kStreak, kQuality, kRevenue)
- Time-based queries (createdAt, lastSyncAt)

## Migration Validation

The system validates migration success by:
1. **Record Count Verification**: Ensures all records are migrated
2. **Relationship Integrity**: Validates foreign key relationships
3. **Data Type Consistency**: Confirms proper timestamp conversion
4. **Index Creation**: Verifies all indexes are created correctly

## Next Steps After Migration

1. **Test Application**: Verify all endpoints work with PostgreSQL
2. **Update CI/CD**: Update deployment scripts to use PostgreSQL
3. **Monitor Performance**: Check query performance vs SQLite
4. **Setup Backups**: Implement PostgreSQL backup strategy
5. **Clean Up**: Remove SQLite files once migration is confirmed successful

## Support

If you encounter issues during migration:
1. Check the logs in each migration step
2. Verify PostgreSQL is running and accessible
3. Ensure all foreign key relationships exist in the source data
4. Use the rollback plan if needed

The migration system is designed to be safe and reversible. All original data is preserved, and backups are created automatically.