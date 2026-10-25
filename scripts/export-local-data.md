# PlayArena: Moving Local Data to Production Guide

This guide details the two safe approaches for synchronizing your local PlayArena database data to your cloud PostgreSQL database (e.g. on Neon).

> [!CAUTION]
> **Credential Security:** Never hardcode database passwords or connection strings in committed files or scripts. Always provide connection strings at runtime via session environment variables (`$env:DATABASE_URL` in PowerShell or `DATABASE_URL` in Bash).

---

## Option A: Re-Run Idempotent Seed Against Production (Recommended)

This is the safest and cleanest method for an academic micro-project. It populates the 6 standard sports grounds, demo accounts, and future 14-day booking slots without risking primary key sequence collisions or schema mismatches.

### Execution Command:
```powershell
# Navigate to the server directory
cd server

# Set production Neon connection string for the current session only
$env:DATABASE_URL = "postgresql://<user>:<password>@<host>/<database>?sslmode=require"

# Run the idempotent seed script
npm run seed

# Clean up session variable
Remove-Item Env:\DATABASE_URL
```

**Why Option A is recommended:**
- 100% idempotent: Safe to execute repeatedly without duplicating rows.
- Sets up fresh, valid upcoming booking slots for the next 14 days in `Asia/Kolkata`.
- Preserves any pre-existing user accounts or bookings already on production.

---

## Option B: Full Local Data Migration via `pg_dump` & `psql`

Use this option if you want to export your custom local grounds, historical bookings, and player accounts from your local PostgreSQL database (`localhost:5432/playarena_db`) into the cloud database.

> [!WARNING]
> **Collision Risk:** Option B carries over hardcoded primary key integer IDs (`id: 1, 2, 3...`). If run on a database that already has seeded rows, foreign keys and unique constraints will conflict.
> **Requirement:** Option B should be executed only against a clean, freshly migrated database (`npm run prisma:deploy` on an empty database).

### Step 1: Dump Local Data to SQL File
Export data only (using explicit column inserts) in reverse dependency order:
```powershell
# Export local tables to a secure temporary SQL file
$env:PGPASSWORD = "<LOCAL_DB_PASSWORD>"

& "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" `
  -h localhost `
  -p 5432 `
  -U postgres `
  -d playarena_db `
  --data-only `
  --inserts `
  --column-inserts `
  -t users `
  -t grounds `
  -t slots `
  -t bookings `
  -f local_backup_data.sql

Remove-Item Env:\PGPASSWORD
```

### Step 2: Import into Production Database
Import the SQL file into production using the required foreign-key dependency order (`users` -> `grounds` -> `slots` -> `bookings`):
```powershell
$env:PGPASSWORD = "<PRODUCTION_NEON_PASSWORD>"

& "C:\Program Files\PostgreSQL\18\bin\psql.exe" `
  -h <NEON_HOST> `
  -p 5432 `
  -U <NEON_USER> `
  -d <NEON_DATABASE> `
  -f local_backup_data.sql

Remove-Item Env:\PGPASSWORD
```

### Step 3: Synchronize PostgreSQL Primary Key Sequences (Crucial)
Because explicit IDs were inserted, PostgreSQL's auto-incrementing `SERIAL` sequences must be synchronized to the maximum existing ID for each table. Run these statements against production:

```sql
SELECT setval(pg_get_serial_sequence('"users"', 'id'), COALESCE((SELECT MAX(id) FROM "users"), 1));
SELECT setval(pg_get_serial_sequence('"grounds"', 'id'), COALESCE((SELECT MAX(id) FROM "grounds"), 1));
SELECT setval(pg_get_serial_sequence('"slots"', 'id'), COALESCE((SELECT MAX(id) FROM "slots"), 1));
SELECT setval(pg_get_serial_sequence('"bookings"', 'id'), COALESCE((SELECT MAX(id) FROM "bookings"), 1));
```

### Step 4: Secure Clean Up
Permanently delete the local dump file containing data:
```powershell
Remove-Item local_backup_data.sql
```
