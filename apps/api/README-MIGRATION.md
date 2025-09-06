# Eden3 SQLite to PostgreSQL Migration

A complete, production-ready migration system for transitioning Eden3 from SQLite to PostgreSQL while preserving all data, relationships, and timestamps.

## Quick Start

### Automated Migration (Recommended)
```bash
# 1. Start PostgreSQL
cd /Users/seth/eden3
docker-compose up -d postgres

# 2. Run complete migration
cd apps/api
npm run db:migrate-to-postgres
```

## Migration Scripts

### Core Scripts
- `npm run db:export-sqlite` - Export all SQLite data to JSON files
- `npm run db:import-postgres` - Import JSON files into PostgreSQL
- `npm run db:migrate-to-postgres` - Complete automated migration
- `npm run db:verify-migration` - Comprehensive migration verification

### Docker Management
- `npm run docker:postgres:up` - Start PostgreSQL container
- `npm run docker:postgres:down` - Stop PostgreSQL container
- `npm run docker:postgres:logs` - View PostgreSQL logs

## Migration Architecture

### Data Flow
```
SQLite Database
    ↓ (Export)
JSON Files (/data-export/)
    ↓ (Schema Update)
PostgreSQL Schema
    ↓ (Import)
PostgreSQL Database
    ↓ (Verify)
Migration Complete
```

### Files Created

#### Scripts
- `/scripts/export-sqlite-data.ts` - SQLite export logic
- `/scripts/import-to-postgres.ts` - PostgreSQL import logic  
- `/scripts/migrate-to-postgres.ts` - Full migration orchestration
- `/scripts/verify-migration.ts` - Comprehensive verification

#### Configuration
- `/docker-compose.yml` - PostgreSQL + Adminer setup
- `/scripts/init-postgres.sql` - PostgreSQL initialization
- `/.env.postgres.example` - PostgreSQL environment template
- `/MIGRATION-GUIDE.md` - Detailed migration guide

#### Data Export
- `/data-export/agents.json` - 10 agent records
- `/data-export/events.json` - 28 event records
- `/data-export/works.json` - 34 work records
- `/data-export/agent_kpis.json` - Agent KPI data
- `/data-export/export-metadata.json` - Migration metadata

## Database Configuration

### PostgreSQL (Docker)
- **Host**: localhost:5432
- **Database**: eden3
- **User**: eden3
- **Password**: eden3_dev_password

### Adminer (Web Interface)
- **URL**: http://localhost:8080
- **System**: PostgreSQL
- **Server**: postgres
- **Username**: eden3
- **Password**: eden3_dev_password

## Migration Features

### Data Integrity
- **Complete Export**: All tables, relationships, and data
- **Timestamp Preservation**: Exact datetime conversion
- **Foreign Key Integrity**: All relationships maintained
- **Data Validation**: Pre and post-migration verification

### Error Handling
- **Atomic Operations**: All-or-nothing import transactions
- **Rollback Support**: Automatic SQLite backup creation
- **Comprehensive Logging**: Detailed progress and error reporting
- **Retry Logic**: Handles temporary connection issues

### Performance
- **Batch Processing**: Efficient bulk data operations
- **Index Optimization**: All Prisma indexes maintained
- **Connection Pooling**: Optimized database connections
- **Memory Management**: Handles large datasets efficiently

## Data Migration Summary

Based on current SQLite database:
- **Agents**: 10 records (Abraham, Solienne, Citizen, Miyomi, Bertha, Geppetto, Koru, Sue, Verdelis, Bart)
- **Events**: 28 event records
- **Works**: 34 creative works
- **Agent KPIs**: 10 performance records
- **Total Records**: 82 core records

## Verification Tests

The verification system tests:
1. **Record Counts** - Ensures all records migrated
2. **Data Integrity** - Validates field values match
3. **Relationships** - Confirms foreign keys work
4. **Timestamps** - Verifies datetime accuracy
5. **Indexes** - Tests query performance
6. **Sample Queries** - Complex joins and filters

## Rollback Plan

If migration fails or issues arise:
1. Stop application services
2. Restore original `.env` file with SQLite URL
3. Use SQLite backup: `prisma/dev.db.backup-[timestamp]`
4. Run `npx prisma generate` to restore SQLite client
5. Restart services

## Environment Setup

### Before Migration (SQLite)
```env
DATABASE_URL="file:./prisma/dev.db"
```

### After Migration (PostgreSQL) 
```env
DATABASE_URL="postgresql://eden3:eden3_dev_password@localhost:5432/eden3"
```

## Production Considerations

### PostgreSQL Optimization
- Configure connection pooling
- Set up automated backups
- Monitor query performance
- Adjust memory settings

### Monitoring
- Track migration metrics
- Set up alerting for failures
- Monitor database health
- Performance baseline comparison

## Troubleshooting

### Common Issues
1. **Connection Errors**: Check Docker container status
2. **Permission Issues**: Verify PostgreSQL user privileges  
3. **Data Conflicts**: Review foreign key constraints
4. **Memory Issues**: Increase Docker memory allocation

### Debug Commands
```bash
# Check PostgreSQL status
docker-compose ps postgres

# View detailed logs
docker-compose logs -f postgres

# Connect to database
docker-compose exec postgres psql -U eden3 -d eden3

# Reset everything
docker-compose down
docker volume rm eden3_postgres_data
docker-compose up -d postgres
```

## Success Metrics

Migration is successful when:
- ✅ All record counts match between databases
- ✅ Data integrity verification passes
- ✅ All foreign key relationships work
- ✅ Application connects and functions normally
- ✅ Query performance meets expectations

## Support

For migration issues:
1. Check migration logs for specific errors
2. Verify PostgreSQL container is healthy
3. Ensure all dependencies are installed
4. Use rollback procedure if needed
5. Review troubleshooting section

The migration system is designed for safety and reliability with comprehensive backup and rollback capabilities.